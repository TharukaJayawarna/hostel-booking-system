package com.hostel.hostel_backend.service.impl;

import com.hostel.hostel_backend.controller.request.AdminReservationRequestDTO;
import com.hostel.hostel_backend.controller.request.AvailableBedDTO;
import com.hostel.hostel_backend.controller.request.CreateReservationRequestDTO;
import com.hostel.hostel_backend.controller.request.DateChangeRequestDTO;
import com.hostel.hostel_backend.controller.response.PayHereInitResponseDTO;
import com.hostel.hostel_backend.controller.response.ReservationDetailResponseDTO;
import com.hostel.hostel_backend.controller.response.ReservationListResponseDTO;
import com.hostel.hostel_backend.exception.AppException;
import com.hostel.hostel_backend.exception.ResourceNotFoundException;
import com.hostel.hostel_backend.model.*;
import com.hostel.hostel_backend.repository.*;
import com.hostel.hostel_backend.service.EmailService;
import com.hostel.hostel_backend.service.NotificationService;
import com.hostel.hostel_backend.service.ReservationService;
import com.hostel.hostel_backend.util.PayHereUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReservationServiceImpl implements ReservationService {

    private final ReservationRepository reservationRepository;
    private final BedRepository bedRepository;
    private final PaymentRepository paymentRepository;
    private final PayHereUtil payHereUtil;
    private final NotificationService notificationService;
    private final UserRepository userRepository;
    private final BlockedDateRepository blockedDateRepository;
    private final EmailService emailService;

    @Value("${payhere.merchant.id}")
    private String merchantId;

    @Value("${payhere.merchant.secret}")
    private String merchantSecret;

    @Value("${payhere.currency}")
    private String currency;

    private void validateDatesNotBlocked(LocalDate startDate, LocalDate endDate) {
        boolean isBlocked = blockedDateRepository.existsOverlappingDate(startDate, endDate);
        if (isBlocked) {
            throw new AppException("Booking failed: Selected dates are blocked by administration (e.g., Maintenance/Holidays).", HttpStatus.BAD_REQUEST);
        }
    }

    @Override
    @Transactional
    public void createManualReservation(AdminReservationRequestDTO dto) {
        validateDatesNotBlocked(dto.getFromDate(), dto.getToDate());

        Bed bed = bedRepository.findById(dto.getBedId())
                .orElseThrow(() -> new AppException("Bed not found", HttpStatus.NOT_FOUND));

        if (Boolean.TRUE.equals(bed.getIsBooked())) {
            throw new AppException("This bed is already booked!", HttpStatus.CONFLICT);
        }

        Payment payment = paymentRepository.findByPaymentId(dto.getPaymentReference())
                .orElseThrow(() -> new AppException("Invalid Payment Reference: Payment ID not found.", HttpStatus.NOT_FOUND));

        if (payment.getPaymentStatus() != PaymentStatus.APPROVED) {
            throw new AppException("Payment is not in APPROVED status.", HttpStatus.BAD_REQUEST);
        }

        if (payment.getReservation() != null) {
            throw new AppException("This Payment ID is already assigned.", HttpStatus.CONFLICT);
        }

        User linkedUser = null;
        Optional<User> userOpt = userRepository.findByUsername(dto.getRegistrationNumber());
        if (userOpt.isPresent()) {
            linkedUser = userOpt.get();
        } else {
            Optional<User> userByEmail = userRepository.findAll().stream()
                    .filter(u -> u.getEmail().equalsIgnoreCase(dto.getEmail()))
                    .findFirst();
            if (userByEmail.isPresent()) linkedUser = userByEmail.get();
        }

        Reservation reservation = new Reservation();
        reservation.setReservationNumber(dto.getPaymentReference());
        reservation.setStudentName(dto.getStudentName());
        reservation.setStudentRegistrationNumber(dto.getRegistrationNumber());
        reservation.setStudentEmail(dto.getEmail());
        reservation.setStudentContactNumber(dto.getContactNumber());
        reservation.setStudentAddress(dto.getAddress());
        reservation.setStudentGender(dto.getGender());
        reservation.setFromDate(dto.getFromDate());
        reservation.setToDate(dto.getToDate());
        reservation.setReservationStatus(ReservationStatus.APPROVED);

        reservation.setBed(bed);
        reservation.setPayment(payment);
        reservation.setUser(linkedUser);
        payment.setReservation(reservation);

        bed.setIsBooked(true);
        bedRepository.save(bed);
        paymentRepository.save(payment);
        reservationRepository.save(reservation);

        if (linkedUser != null) {
            String message = generateBillHtml(reservation, "Your reservation has been successfully created manually by the administration.");
            notificationService.createNotification(linkedUser, "Reservation Confirmed ✅", message);
        }
    }

    @Override
    @Transactional
    public void updateReservationDates(Long reservationId, DateChangeRequestDTO dto) throws ResourceNotFoundException {

        validateDatesNotBlocked(dto.getNewCheckInDate(), dto.getNewCheckOutDate());

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));

        if (reservation.getPayment() == null || reservation.getPayment().getPaymentStatus() != PaymentStatus.APPROVED) {
            throw new AppException("Cannot change dates! Payment not verified.", HttpStatus.BAD_REQUEST);
        }

        long oldDays = ChronoUnit.DAYS.between(reservation.getFromDate(), reservation.getToDate());
        long newDays = ChronoUnit.DAYS.between(dto.getNewCheckInDate(), dto.getNewCheckOutDate());

        if (oldDays != newDays) {
            throw new AppException("Invalid Duration! Please select exactly " + oldDays + " days.", HttpStatus.CONFLICT);
        }

        List<ReservationStatus> blockingStatuses = Arrays.asList(ReservationStatus.APPROVED, ReservationStatus.PENDING);
        boolean isOccupied = reservationRepository.existsOverlappingReservation(
                reservation.getBed().getId(), reservationId, dto.getNewCheckInDate(), dto.getNewCheckOutDate(), blockingStatuses
        );

        if (isOccupied) {
            throw new AppException("Selected dates are not available.", HttpStatus.CONFLICT);
        }

        reservation.setFromDate(dto.getNewCheckInDate());
        reservation.setToDate(dto.getNewCheckOutDate());
        reservationRepository.save(reservation);

        if (reservation.getUser() != null) {
            String message = generateBillHtml(reservation, "Your reservation dates have been updated. Please find the revised details below.");
            notificationService.createNotification(reservation.getUser(), "Dates Updated Successfully 📅", message);
        }
    }

    @Override
    @Transactional
    public void cancelReservation(Long reservationId) throws ResourceNotFoundException {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));

        if (reservation.getReservationStatus() == ReservationStatus.CANCELLED) {
            throw new AppException("Already cancelled.", HttpStatus.CONFLICT);
        }

        Bed bed = reservation.getBed();
        if (bed != null) {
            bed.setIsBooked(false);
            bedRepository.save(bed);
        }

        reservation.setReservationStatus(ReservationStatus.CANCELLED);
        reservationRepository.save(reservation);

        if (reservation.getUser() != null) {
            Map<String, Object> vars = getCommonVariables(reservation, "Your reservation has been cancelled as per your request.");
            vars.put("showCancellationWarning", true);
            String message = emailService.getHtmlContent("reservation-bill", vars);
            notificationService.createNotification(reservation.getUser(), "Reservation Cancelled 🚫", message);
        }
    }

    public void sendSuccessEmail(Reservation res) {
        if (res.getUser() != null) {
            String message = generateBillHtml(res, "Thank you for your reservation! Your payment has been received and booking confirmed.");
            notificationService.createNotification(res.getUser(), "Booking Confirmed ✅", message);
        }
    }

    public void sendFailureEmail(Reservation res) {
        if (res.getUser() != null) {
            Map<String, Object> vars = new HashMap<>();
            vars.put("studentName", res.getStudentName());
            vars.put("reservationNumber", res.getReservationNumber());
            String message = emailService.getHtmlContent("reservation-failure", vars);
            notificationService.createNotification(res.getUser(), "Reservation Failed ❌", message);
        }
    }


    @Override
    @Transactional(rollbackFor = Exception.class)
    public PayHereInitResponseDTO initiateReservation(CreateReservationRequestDTO dto) {
        validateDatesNotBlocked(dto.getFromDate(), dto.getToDate());

        try {
            Bed bed = bedRepository.findById(dto.getBedId())
                    .orElseThrow(() -> new ResourceNotFoundException("Bed not found with id: " + dto.getBedId()));

//            if (Boolean.TRUE.equals(bed.getIsBooked())) {
//                throw new AppException("This bed is already booked!", HttpStatus.CONFLICT);
//            }
            List<ReservationStatus> blockingStatuses = Arrays.asList(
                    ReservationStatus.APPROVED,
                    ReservationStatus.PENDING
            );
            boolean isOccupied = reservationRepository.existsOverlappingReservation(
                    bed.getId(),
                    null,
                    dto.getFromDate(),
                    dto.getToDate(),
                    blockingStatuses
            );

            if (isOccupied) {
                throw new AppException("Selected dates are not available for this bed.", HttpStatus.CONFLICT);
            }

            Double calculatedAmount = calculateTotalAmount(dto.getBedId(), dto.getFromDate(), dto.getToDate());

            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            User currentUser = userRepository.findByUsername(username)
                    .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

            String orderId = UUID.randomUUID().toString().substring(0, 8).toUpperCase();

            Payment payment = new Payment();
            payment.setPaymentId(orderId);
            payment.setPaymentDate(LocalDate.now());
            payment.setPaymentTime(LocalTime.now());
            payment.setPaymentStatus(PaymentStatus.PENDING);
            payment.setPaymentAmount(calculatedAmount);

            Reservation reservation = new Reservation();
            reservation.setReservationNumber(orderId);
            reservation.setStudentName(dto.getStudentName());
            reservation.setStudentRegistrationNumber(dto.getRegistrationNumber());
            reservation.setStudentEmail(dto.getEmail());
            reservation.setStudentContactNumber(dto.getContactNumber());
            reservation.setStudentAddress(dto.getAddress());
            reservation.setStudentGender(dto.getGender());
            reservation.setFromDate(dto.getFromDate());
            reservation.setToDate(dto.getToDate());
            reservation.setReservationStatus(ReservationStatus.PENDING);

            reservation.setBed(bed);
            reservation.setPayment(payment);
            reservation.setUser(currentUser);
            payment.setReservation(reservation);

//            bed.setIsBooked(true);

            paymentRepository.save(payment);
            bedRepository.save(bed);
            reservationRepository.save(reservation);

            String hash = payHereUtil.generateHash(merchantId, orderId, calculatedAmount, currency, merchantSecret);

            return PayHereInitResponseDTO.builder()
                    .merchantId(merchantId)
                    .orderId(orderId)
                    .amount(calculatedAmount)
                    .currency(currency)
                    .hash(hash)
                    .items("Hostel Bed Reservation - " + bed.getBedNumber())
                    .firstName(dto.getStudentName())
                    .lastName("")
                    .email(dto.getEmail())
                    .phone(dto.getContactNumber())
                    .address(dto.getAddress())
                    .city("Colombo")
                    .country("Sri Lanka")
                    .build();
        }catch (ObjectOptimisticLockingFailureException e) {
            throw new AppException("This bed was just booked by someone else. Please try another.", HttpStatus.CONFLICT);
        } catch (Exception e) {
            throw new AppException(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private Double calculateTotalAmount(Long bedId, LocalDate checkIn, LocalDate checkOut) throws ResourceNotFoundException {
        Bed bed = bedRepository.findById(bedId)
                .orElseThrow(() -> new ResourceNotFoundException("Bed not found with id " + bedId));

        Room room = bed.getRoom();

        if (room.getMonthlyPrice() == null) {
            throw new AppException("Room monthly price is not set!", HttpStatus.CONFLICT);
        }

        long totalDays = java.time.temporal.ChronoUnit.DAYS.between(checkIn, checkOut);
        if (totalDays <= 0) {
            throw new AppException("Invalid date range selected.", HttpStatus.BAD_REQUEST);
        }

        double totalAmount = 0.0;

        if (room.getReservationPeriod() == com.hostel.hostel_backend.model.ReservationPeriod.MONTHLY) {
            long months = totalDays / 30;
            totalAmount = months * room.getMonthlyPrice();
        } else {
            long months = totalDays / 30;
            long remainingDaysAfterMonths = totalDays % 30;
            long weeks = remainingDaysAfterMonths / 7;
            long finalDays = remainingDaysAfterMonths % 7;

            double mPrice = room.getMonthlyPrice();
            double wPrice = room.getWeeklyPrice() != null ? room.getWeeklyPrice() : 0.0;
            double dPrice = room.getDailyPrice() != null ? room.getDailyPrice() : 0.0;

            totalAmount = (months * mPrice) + (weeks * wPrice) + (finalDays * dPrice);
        }

        return Math.round(totalAmount * 100.0) / 100.0;
    }

    @Override
    public List<ReservationListResponseDTO> getMyReservations() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        List<Reservation> myReservations = reservationRepository.findByUserUsernameAndToDateGreaterThanEqual(username, LocalDate.now());
        return myReservations.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void reactivateReservation(Long reservationId) throws ResourceNotFoundException {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id "+reservationId));

        if (reservation.getPayment() == null || reservation.getPayment().getPaymentStatus() != PaymentStatus.APPROVED) {
            throw new AppException("Cannot reactivate! Payment is not verified.", HttpStatus.CONFLICT);
        }

        Bed bed = reservation.getBed();
        if (Boolean.TRUE.equals(bed.getIsBooked())) {
            throw new AppException("Original Bed (" + bed.getBedNumber() + ") is now occupied. Please assign a new bed.", HttpStatus.CONFLICT);
        }

        bed.setIsBooked(true);
        bedRepository.save(bed);

        reservation.setReservationStatus(ReservationStatus.APPROVED);
        reservationRepository.save(reservation);

        if (reservation.getUser() != null) {
            String message = generateBillHtml(reservation, "Your booking has been manually reactivated by the administration.");
            notificationService.createNotification(reservation.getUser(), "Booking Reactivated 🔄", message);
        }
    }

    @Override
    @Transactional
    public void assignNewBed(Long reservationId, Long newBedId) throws ResourceNotFoundException {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id "+reservationId));

        if (reservation.getPayment() == null || reservation.getPayment().getPaymentStatus() != PaymentStatus.APPROVED) {
            throw new AppException("Cannot assign new bed! Payment is not verified or approved.", HttpStatus.BAD_REQUEST);
        }

        Bed newBed = bedRepository.findById(newBedId)
                .orElseThrow(() -> new ResourceNotFoundException("New Bed not found with id "+newBedId));

        if (Boolean.TRUE.equals(newBed.getIsBooked())) {
            throw new AppException("The selected new bed is already occupied!", HttpStatus.CONFLICT);
        }

        if (reservation.getBed() != null) {
            Bed oldBed = reservation.getBed();
            oldBed.setIsBooked(false);
        }

        newBed.setIsBooked(true);
        bedRepository.save(newBed);

        reservation.setBed(newBed);
        reservation.setReservationStatus(ReservationStatus.APPROVED);
        reservationRepository.save(reservation);

        if (reservation.getUser() != null) {
            String message = generateBillHtml(reservation, "Since your original bed was unavailable, we have assigned you a new matching bed.");
            notificationService.createNotification(reservation.getUser(), "New Bed Assigned 🛏️", message);
        }
    }

    @Override
    public List<ReservationListResponseDTO> getAllActiveReservations() {
        List<Reservation> activeList = reservationRepository.findByReservationStatusNot(ReservationStatus.TRASH);
        return activeList.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public List<ReservationListResponseDTO> getTrashReservations() {
        List<Reservation> trashList = reservationRepository.findByReservationStatus(ReservationStatus.TRASH);
        return trashList.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    private ReservationListResponseDTO mapToDTO(Reservation res) {
        return ReservationListResponseDTO.builder()
                .id(res.getId())
                .reservationNumber(res.getReservationNumber())
                .studentName(res.getStudentName())
                .studentRegNo(res.getStudentRegistrationNumber())
                .bedNumber(res.getBed() != null ? res.getBed().getBedNumber() : "N/A")
                .paymentId(res.getPayment() != null ? res.getPayment().getPaymentId() : "N/A")
                .checkIn(res.getFromDate())
                .checkOut(res.getToDate())
                .status(res.getReservationStatus())
                .paymentDate(res.getPayment() != null ? res.getPayment().getPaymentDate() : null)
                .paymentTime(res.getPayment() != null ? res.getPayment().getPaymentTime() : null)
                .build();
    }

    @Override
    public List<AvailableBedDTO> getMatchingBedsForRes(Long reservationId) throws ResourceNotFoundException {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id " + reservationId));

        if (reservation.getBed() == null || reservation.getBed().getRoom() == null) {
            throw new AppException("Original room details not found.", HttpStatus.CONFLICT);
        }

        Room originalRoom = reservation.getBed().getRoom();
        Double originalMonthlyPrice = originalRoom.getMonthlyPrice();
        var originalPeriod = originalRoom.getReservationPeriod();

        List<Bed> matchingBeds = bedRepository.findByIsBookedFalseAndRoomMonthlyPrice(originalMonthlyPrice);

        return matchingBeds.stream()
                .filter(bed -> bed.getRoom().getReservationPeriod() == originalPeriod)
                .map(bed -> AvailableBedDTO.builder()
                        .id(bed.getId())
                        .bedNumber(bed.getBedNumber())
                        .price(bed.getRoom().getMonthlyPrice())
                        .floorNumber(bed.getRoom().getFloor().getFloorNumber())
                        .hubNumber(bed.getRoom().getFloor().getHub().getHubNumber())
                        .roomNumber(bed.getRoom().getRoomNumber())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public ReservationDetailResponseDTO getReservationById(Long id) throws ResourceNotFoundException {
        Reservation res =  reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with ID: " + id));

        return ReservationDetailResponseDTO.builder()
                .id(res.getId())
                .reservationNumber(res.getReservationNumber())
                .studentName(res.getStudentName())
                .studentRegistrationNumber(res.getStudentRegistrationNumber())
                .studentEmail(res.getStudentEmail())
                .studentContact(res.getStudentContactNumber())
                .gender(res.getStudentGender())
                .bedNumber(res.getBed() != null ? res.getBed().getBedNumber() : "N/A")
                .roomNumber(res.getBed() != null && res.getBed().getRoom() != null ? res.getBed().getRoom().getRoomNumber() : "N/A")
                .checkIn(res.getFromDate())
                .checkOut(res.getToDate())
                .status(res.getReservationStatus())
                .paymentId(res.getPayment() != null ? res.getPayment().getPaymentId() : "N/A")
                .paymentDate(res.getPayment() != null ? res.getPayment().getPaymentDate() : null)
                .paymentTime(res.getPayment() != null ? res.getPayment().getPaymentTime() : null)
                .paymentStatus(res.getPayment() != null ? res.getPayment().getPaymentStatus() : null)
                .amountPaid(res.getPayment() != null ? res.getPayment().getPaymentAmount() : 0.0)
                .build();
    }

    private String generateBillHtml(Reservation res, String introMessage) {
        Map<String, Object> variables = getCommonVariables(res, introMessage);
        return emailService.getHtmlContent("reservation-bill", variables);
    }

    private Map<String, Object> getCommonVariables(Reservation res, String introMessage) {
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("MMMM dd, yyyy");
        long nights = ChronoUnit.DAYS.between(res.getFromDate(), res.getToDate());
        Double amount = res.getPayment() != null ? res.getPayment().getPaymentAmount() : 0.00;

        Map<String, Object> vars = new HashMap<>();
        vars.put("studentName", res.getStudentName());
        vars.put("introMessage", introMessage);
        vars.put("reservationNumber", res.getReservationNumber());
        vars.put("roomNumber", res.getBed().getRoom().getRoomNumber());
        vars.put("bedNumber", res.getBed().getBedNumber());
        vars.put("checkIn", res.getFromDate().format(dateFormatter));
        vars.put("checkOut", res.getToDate().format(dateFormatter));
        vars.put("nights", nights);
        vars.put("studentRegNo", res.getStudentRegistrationNumber() != null ? res.getStudentRegistrationNumber() : "N/A");
        vars.put("studentEmail", res.getStudentEmail() != null ? res.getStudentEmail() : "N/A");
        vars.put("studentPhone", res.getStudentContactNumber() != null ? res.getStudentContactNumber() : "N/A");
        vars.put("status", res.getReservationStatus());
        vars.put("amount", String.format("LKR %,.2f", amount));
        vars.put("generatedDate", LocalDate.now().format(dateFormatter));
        return vars;
    }

    @Override
    public Double getEstimatedPrice(Long bedId, LocalDate checkIn, LocalDate checkOut) throws ResourceNotFoundException {
        return calculateTotalAmount(bedId, checkIn, checkOut);
    }
}