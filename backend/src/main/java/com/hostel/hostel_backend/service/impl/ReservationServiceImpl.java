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
import com.hostel.hostel_backend.service.NotificationService; // Notification Service Import
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
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReservationServiceImpl implements ReservationService {

    private final ReservationRepository reservationRepository;
    private final BedRepository bedRepository;
    private final PaymentRepository paymentRepository;
    private final PayHereUtil payHereUtil;
    private final NotificationService notificationService; // Notification Service
    private final UserRepository userRepository;

    @Value("${payhere.merchant.id}")
    private String merchantId;

    @Value("${payhere.merchant.secret}")
    private String merchantSecret;

    @Value("${payhere.currency}")
    private String currency;

    // --- 1. Manual Reservation Create ---
    @Override
    @Transactional
    public void createManualReservation(AdminReservationRequestDTO dto) {
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

        // SEND DETAILED NOTIFICATION
        if (linkedUser != null) {
            String title = "Reservation Confirmed ✅";
            String message = generateDetailedBillHtml(reservation, "Your reservation has been successfully created manually by the administration.");
            notificationService.createNotification(linkedUser, title, message);
        }
    }

    // --- 2. Update Reservation Dates ---
    @Override
    @Transactional
    public void updateReservationDates(Long reservationId, DateChangeRequestDTO dto) throws ResourceNotFoundException {
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

        // SEND DETAILED NOTIFICATION
        if (reservation.getUser() != null) {
            String title = "Dates Updated Successfully 📅";
            String message = generateDetailedBillHtml(reservation, "Your reservation dates have been updated. Please find the revised details below.");
            notificationService.createNotification(reservation.getUser(), title, message);
        }
    }

    // --- 3. Cancel Reservation ---
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

        // SEND DETAILED NOTIFICATION
        if (reservation.getUser() != null) {
            String title = "Reservation Cancelled 🚫";
            String warningMsg = "<span style='color:red; font-weight:bold;'>IMPORTANT: This reservation includes a non-refundable room policy. Cancellation does not guarantee a refund.</span>";
            String message = generateDetailedBillHtml(reservation, "Your reservation has been cancelled as per your request.<br/><br/>" + warningMsg);
            notificationService.createNotification(reservation.getUser(), title, message);
        }
    }

    // --- 4. Success Email (Online Booking) -> Notification ---
    public void sendSuccessEmail(Reservation res) {
        if (res.getUser() != null) {
            String title = "Booking Confirmed ✅";
            String message = generateDetailedBillHtml(res, "Thank you for your reservation! Your payment has been received and booking confirmed.");
            notificationService.createNotification(res.getUser(), title, message);
        }
    }

    public void sendFailureEmail(Reservation res) {
        if (res.getUser() != null) {
            String title = "Reservation Failed ❌";
            String message = "<p>Dear " + res.getStudentName() + ",</p><p>We regret to inform you that your payment was unsuccessful. Please try again.</p>";
            notificationService.createNotification(res.getUser(), title, message);
        }
    }

    // --- HELPER: GENERATE DETAILED BILL HTML (Updated with Student Details) ---
    private String generateDetailedBillHtml(Reservation res, String introMessage) {
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("MMMM dd, yyyy");
        long nights = ChronoUnit.DAYS.between(res.getFromDate(), res.getToDate());
        Double amount = res.getPayment() != null ? res.getPayment().getPaymentAmount() : 0.00;
        String formattedAmount = String.format("LKR %,.2f", amount);

        // Hostel/Company Info
        String companyInfo =
                "<div style='font-size:12px; color:#6b7280; line-height:1.4;'>" +
                        "  <strong>NSBM Green University Hostel</strong><br/>" +
                        "  Mahenwatta, Pitipana, Homagama<br/>" +
                        "  Telephone: +94 11 544 5000<br/>" +
                        "  Email: support@hostel.nsbm.ac.lk" +
                        "</div>";

        // Reservation Summary Table
        String bookingTable =
                "<div style='margin-top:20px; font-size:14px; font-weight:700; color:#111827; border-bottom:1px solid #e5e7eb; padding-bottom:5px;'>Reservation Details</div>" +
                        "<table style='width:100%; margin-top:10px; border-collapse:collapse; font-size:14px; border:1px solid #e5e7eb;'>" +
                        "  <tr style='background-color:#f9fafb; text-align:left;'>" +
                        "    <th style='padding:10px; border-bottom:1px solid #e5e7eb;'>Description</th>" +
                        "    <th style='padding:10px; border-bottom:1px solid #e5e7eb;'>Details</th>" +
                        "  </tr>" +
                        "  <tr>" +
                        "    <td style='padding:10px; border-bottom:1px solid #e5e7eb; color:#4b5563;'>Booking Ref</td>" +
                        "    <td style='padding:10px; border-bottom:1px solid #e5e7eb; font-weight:bold; font-family:monospace;'>" + res.getReservationNumber() + "</td>" +
                        "  </tr>" +
                        "  <tr>" +
                        "    <td style='padding:10px; border-bottom:1px solid #e5e7eb; color:#4b5563;'>Room / Bed</td>" +
                        "    <td style='padding:10px; border-bottom:1px solid #e5e7eb;'>" + res.getBed().getRoom().getRoomNumber() + " / Bed " + res.getBed().getBedNumber() + "</td>" +
                        "  </tr>" +
                        "  <tr>" +
                        "    <td style='padding:10px; border-bottom:1px solid #e5e7eb; color:#4b5563;'>Check-in</td>" +
                        "    <td style='padding:10px; border-bottom:1px solid #e5e7eb;'>" + res.getFromDate().format(dateFormatter) + " <span style='color:#9ca3af; font-size:11px;'>(2:00 PM)</span></td>" +
                        "  </tr>" +
                        "  <tr>" +
                        "    <td style='padding:10px; border-bottom:1px solid #e5e7eb; color:#4b5563;'>Check-out</td>" +
                        "    <td style='padding:10px; border-bottom:1px solid #e5e7eb;'>" + res.getToDate().format(dateFormatter) + " <span style='color:#9ca3af; font-size:11px;'>(12:00 PM)</span></td>" +
                        "  </tr>" +
                        "  <tr>" +
                        "    <td style='padding:10px; border-bottom:1px solid #e5e7eb; color:#4b5563;'>Duration</td>" +
                        "    <td style='padding:10px; border-bottom:1px solid #e5e7eb;'>" + nights + " Nights</td>" +
                        "  </tr>" +
                        "</table>";

        // --- NEW: Student Details Table ---
        String studentTable =
                "<div style='margin-top:25px; font-size:14px; font-weight:700; color:#111827; border-bottom:1px solid #e5e7eb; padding-bottom:5px;'>Student Information</div>" +
                        "<table style='width:100%; margin-top:10px; border-collapse:collapse; font-size:14px; border:1px solid #e5e7eb;'>" +
                        "  <tr>" +
                        "    <td style='padding:10px; border-bottom:1px solid #e5e7eb; background-color:#f9fafb; width:35%; color:#4b5563;'>Full Name</td>" +
                        "    <td style='padding:10px; border-bottom:1px solid #e5e7eb;'>" + res.getStudentName() + "</td>" +
                        "  </tr>" +
                        "  <tr>" +
                        "    <td style='padding:10px; border-bottom:1px solid #e5e7eb; background-color:#f9fafb; color:#4b5563;'>Registration No</td>" +
                        "    <td style='padding:10px; border-bottom:1px solid #e5e7eb;'>" + (res.getStudentRegistrationNumber() != null ? res.getStudentRegistrationNumber() : "N/A") + "</td>" +
                        "  </tr>" +
                        "  <tr>" +
                        "    <td style='padding:10px; border-bottom:1px solid #e5e7eb; background-color:#f9fafb; color:#4b5563;'>Email Address</td>" +
                        "    <td style='padding:10px; border-bottom:1px solid #e5e7eb;'>" + (res.getStudentEmail() != null ? res.getStudentEmail() : "N/A") + "</td>" +
                        "  </tr>" +
                        "  <tr>" +
                        "    <td style='padding:10px; border-bottom:1px solid #e5e7eb; background-color:#f9fafb; color:#4b5563;'>Phone Number</td>" +
                        "    <td style='padding:10px; border-bottom:1px solid #e5e7eb;'>" + (res.getStudentContactNumber() != null ? res.getStudentContactNumber() : "N/A") + "</td>" +
                        "  </tr>" +
                        "</table>";

        // Cost Breakdown Section
        String costSection =
                "<div style='margin-top:20px; background-color:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:15px;'>" +
                        "  <div style='display:flex; justify-content:space-between; margin-bottom:5px; font-size:14px; color:#166534;'>" +
                        "    <span>Status</span>" +
                        "    <span style='font-weight:bold;'>" + res.getReservationStatus() + "</span>" +
                        "  </div>" +
                        "  <div style='display:flex; justify-content:space-between; font-size:16px; font-weight:bold; color:#15803d; border-top:1px dashed #86efac; paddingTop:10px; marginTop:5px;'>" +
                        "    <span>Total Paid</span>" +
                        "    <span>" + formattedAmount + "</span>" +
                        "  </div>" +
                        "</div>";

        // Footer Policy
        String policy =
                "<div style='margin-top:20px; font-size:11px; color:#9ca3af; text-align:center;'>" +
                        "  * This reservation includes a non-cancellable and non-refundable room policy.<br/>" +
                        "  Generated on " + LocalDate.now().format(dateFormatter) +
                        "</div>";

        // Combine All
        return "<div style='font-family: sans-serif; color:#1f2937;'>" +
                "  <p style='font-size:15px;'>Hello <strong>" + res.getStudentName() + "</strong>,</p>" +
                "  <p style='font-size:14px; color:#4b5563;'>" + introMessage + "</p>" +
                "  <hr style='border:none; border-top:1px solid #e5e7eb; margin:20px 0;'/>" +
                companyInfo +
                bookingTable +
                studentTable + // Student Table එක Reservation Table එකට යටින් එක් කරන ලදී
                costSection +
                policy +
                "</div>";
    }

    @Transactional(rollbackFor = Exception.class)
    public PayHereInitResponseDTO initiateReservation(CreateReservationRequestDTO dto) {
        // ... (පරණ කේතයම) ...
        try {
            Bed bed = bedRepository.findById(dto.getBedId())
                    .orElseThrow(() -> new ResourceNotFoundException("Bed not found with id: " + dto.getBedId()));

            if (Boolean.TRUE.equals(bed.getIsBooked())) {
                throw new AppException("This bed is already booked!", HttpStatus.CONFLICT);
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

            bed.setIsBooked(true);

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

        // මිල ගණන් set කර ඇත්දැයි පරීක්ෂා කිරීම
        if (room.getMonthlyPrice() == null) {
            throw new AppException("Room monthly price is not set!", HttpStatus.CONFLICT);
        }

        long totalDays = java.time.temporal.ChronoUnit.DAYS.between(checkIn, checkOut);
        if (totalDays <= 0) {
            throw new AppException("Invalid date range selected.", HttpStatus.BAD_REQUEST);
        }

        double totalAmount = 0.0;

        if (room.getReservationPeriod() == com.hostel.hostel_backend.model.ReservationPeriod.MONTHLY) {
            // --- MONTHLY Logic ---
            // මාසික කාමර සඳහා දින 30, 60, හෝ 90 විය යුතුය.
            // මාස ගණන ගණනය කිරීම (පූර්ණ මාස ලෙස සලකයි)
            long months = totalDays / 30;

            // Monthly Price එකෙන් ගුණ කිරීම
            totalAmount = months * room.getMonthlyPrice();

        } else {
            // --- DEFAULT Logic (Tiered Pricing) ---
            // මුලින්ම මාස ගණන (30 days blocks)
            long months = totalDays / 30;
            long remainingDaysAfterMonths = totalDays % 30;

            // ඉතිරි දින වලින් සති ගණන (7 days blocks)
            long weeks = remainingDaysAfterMonths / 7;
            long finalDays = remainingDaysAfterMonths % 7; // ඉතිරි දින

            // මිල ගණන් ලබා ගැනීම (null නම් 0 ලෙස සලකයි)
            double mPrice = room.getMonthlyPrice();
            double wPrice = room.getWeeklyPrice() != null ? room.getWeeklyPrice() : 0.0;
            double dPrice = room.getDailyPrice() != null ? room.getDailyPrice() : 0.0;

            // එකතුව ගණනය කිරීම
            totalAmount = (months * mPrice) + (weeks * wPrice) + (finalDays * dPrice);
        }

        // දශම ස්ථාන දෙකකට වටයන්න (Round to 2 decimal places)
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

        // SEND NOTIFICATION
        if (reservation.getUser() != null) {
            String title = "Booking Reactivated 🔄";
            String message = generateDetailedBillHtml(reservation, "Your booking has been manually reactivated by the administration.");
            notificationService.createNotification(reservation.getUser(), title, message);
        }
    }

    @Override
    @Transactional
    public void assignNewBed(Long reservationId, Long newBedId) throws ResourceNotFoundException {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id "+reservationId));

        Bed newBed = bedRepository.findById(newBedId)
                .orElseThrow(() -> new ResourceNotFoundException("New Bed not found with id "+newBedId));

        newBed.setIsBooked(true);
        bedRepository.save(newBed);

        reservation.setBed(newBed);
        reservation.setReservationStatus(ReservationStatus.APPROVED);
        reservationRepository.save(reservation);

        // SEND NOTIFICATION
        if (reservation.getUser() != null) {
            String title = "New Bed Assigned 🛏️";
            String message = generateDetailedBillHtml(reservation, "Since your original bed was unavailable, we have assigned you a new bed.");
            notificationService.createNotification(reservation.getUser(), title, message);
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

        // 1. මුලින්ම Monthly Price එක සමාන, Book නොවූ ඇඳන් සොයන්න (Repository method එක එලෙසම පාවිච්චි කළ හැක)
        List<Bed> matchingBeds = bedRepository.findByIsBookedFalseAndRoomMonthlyPrice(originalMonthlyPrice);

        // 2. ඉන්පසු Reservation Period එක (DEFAULT ද MONTHLY ද යන්න) ගැලපෙන ඒවා පමණක් ෆිල්ටර් කරන්න
        return matchingBeds.stream()
                .filter(bed -> bed.getRoom().getReservationPeriod() == originalPeriod)
                .map(bed -> AvailableBedDTO.builder()
                        .id(bed.getId())
                        .bedNumber(bed.getBedNumber())
                        // මෙතැන අවශ්‍ය නම් weekly/daily price යැවීමට DTO එක update කළ හැක
                        .price(bed.getRoom().getMonthlyPrice()) // Monthly Price
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

    @Override
    public Double getEstimatedPrice(Long bedId, LocalDate checkIn, LocalDate checkOut) throws ResourceNotFoundException {
        return calculateTotalAmount(bedId, checkIn, checkOut);
    }
}