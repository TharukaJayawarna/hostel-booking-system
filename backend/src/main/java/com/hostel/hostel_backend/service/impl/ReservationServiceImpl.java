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
import com.hostel.hostel_backend.service.EmailProducer;
import com.hostel.hostel_backend.service.ReservationService;
import com.hostel.hostel_backend.util.PayHereUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;
import com.hostel.hostel_backend.repository.UserRepository;
import com.hostel.hostel_backend.model.User;

import java.time.LocalDate;
import java.time.LocalTime;
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
    private final EmailProducer emailProducer;
    private final UserRepository userRepository;

    @Value("${payhere.merchant.id}")
    private String merchantId;

    @Value("${payhere.merchant.secret}")
    private String merchantSecret;

    @Value("${payhere.currency}")
    private String currency;

    @Transactional(rollbackFor = Exception.class)
    public PayHereInitResponseDTO initiateReservation(CreateReservationRequestDTO dto) {

       try {
           // Bed Availability Check
           Bed bed = bedRepository.findById(dto.getBedId())
                   .orElseThrow(() -> new ResourceNotFoundException("Bed not found with id: " + dto.getBedId()));

           if (Boolean.TRUE.equals(bed.getIsBooked())) {
               throw new AppException("This bed is already booked!", HttpStatus.CONFLICT);
           }

           Double calculatedAmount = calculateTotalAmount(dto.getBedId(), dto.getFromDate(), dto.getToDate());

           String username = SecurityContextHolder.getContext().getAuthentication().getName();
           User currentUser = userRepository.findByUsername(username)
                   .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

           //Generate Order ID
           String orderId = UUID.randomUUID().toString().substring(0, 8).toUpperCase();

           // Create Payment Record (PENDING)
           Payment payment = new Payment();
           payment.setPaymentId(orderId);
           payment.setPaymentDate(LocalDate.now());
           payment.setPaymentTime(LocalTime.now());
           payment.setPaymentStatus(PaymentStatus.PENDING);
           payment.setPaymentAmount(calculatedAmount);

           // Create Reservation Record (PENDING)
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

           // Link Objects
           reservation.setBed(bed);
           reservation.setPayment(payment);
           reservation.setUser(currentUser);
           payment.setReservation(reservation);

           // 5. Block the Bed (Optimistic Lock will handle concurrency here)
           bed.setIsBooked(true);

           paymentRepository.save(payment);
           bedRepository.save(bed);
           reservationRepository.save(reservation);

           // 6. Generate Hash
           String hash = payHereUtil.generateHash(merchantId, orderId, calculatedAmount, currency, merchantSecret);

           // 7. Return Data to Frontend
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
           // වෙන කෙනෙක් ඒ වෙලාවෙම බුක් කරලා නම්
           throw new AppException("This bed was just booked by someone else. Please try another.", HttpStatus.CONFLICT);
       } catch (Exception e) {
           throw new AppException(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
       }
    }

    // Email Notification Method
    public void sendSuccessEmail(Reservation res) {
        String subject = "Booking Confirmed - " + res.getReservationNumber();

        String content = "<p>Dear <strong>" + res.getStudentName() + "</strong>,</p>" +
                "<p>We are pleased to inform you that your payment was successful and your bed reservation has been <span style='color: #059669; font-weight: bold;'>CONFIRMED</span>.</p>" +
                "<div style='background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0; border-radius: 4px;'>" +
                "  <p style='margin: 5px 0;'><strong>Reservation ID:</strong> " + res.getReservationNumber() + "</p>" +
                "  <p style='margin: 5px 0;'><strong>Bed Number:</strong> " + res.getBed().getBedNumber() + "</p>" +
                "  <p style='margin: 5px 0;'><strong>Dates:</strong> " + res.getFromDate() + " to " + res.getToDate() + "</p>" +
                "</div>" +
                "<p>Thank you for choosing our hostel!</p>";

        String body = generateCommonEmailTemplate("Reservation Confirmed ✅", content);
        emailProducer.sendEmail(res.getStudentEmail(), subject, body);
    }

    public void sendFailureEmail(Reservation res) {
        String subject = "Reservation Failed - " + res.getReservationNumber();

        String content = "<p>Dear " + res.getStudentName() + ",</p>" +
                "<p>We regret to inform you that your payment was <span style='color: #dc2626; font-weight: bold;'>UNSUCCESSFUL</span>.</p>" +
                "<p>As a result, your reservation for <strong>Bed " + res.getBed().getBedNumber() + "</strong> has been cancelled.</p>" +
                "<div style='background-color: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; color: #b91c1c;'>" +
                "  Please try again with a valid payment method." +
                "</div>";

        String body = generateCommonEmailTemplate("Reservation Failed ❌", content);
        emailProducer.sendEmail(res.getStudentEmail(), subject, body);
    }

    @Override
    public List<ReservationListResponseDTO> getMyReservations() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        // වෙනස්කම: අද දිනය (LocalDate.now()) ලබා දී, ඊට සමාන හෝ වැඩි Checkout Date ඇති ඒවා පමණක් ගන්නවා.
        List<Reservation> myReservations = reservationRepository.findByUserUsernameAndToDateGreaterThanEqual(username, LocalDate.now());

        return myReservations.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // Reactivate
    @Transactional
    public void reactivateReservation(Long reservationId) throws ResourceNotFoundException {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id "+reservationId));

        // Payment එක Confirm වෙලාද කියලා නිකමට බලනවා (ආරක්ෂාවට)
        if (reservation.getPayment() == null || reservation.getPayment().getPaymentStatus() != PaymentStatus.APPROVED) {
            throw new AppException("Cannot reactivate! Payment is not verified.", HttpStatus.CONFLICT);
        }

        Bed bed = reservation.getBed();

        // ඇඳ දැනටමත් වෙන කෙනෙක් අරගෙනද බලනවා
        if (Boolean.TRUE.equals(bed.getIsBooked())) {
            throw new AppException("Original Bed (" + bed.getBedNumber() + ") is now occupied. Please assign a new bed.", HttpStatus.CONFLICT);
        }

        // ඇඳ Book කරනවා
        bed.setIsBooked(true);
        bedRepository.save(bed);

        // Reservation එක Active කරනවා
        reservation.setReservationStatus(ReservationStatus.APPROVED);
        reservationRepository.save(reservation);

        // --- EMAIL කොටස වෙනස් කරන්න ---
        String subject = "Booking Reactivated - " + reservation.getReservationNumber();
        String content = "<p>Dear <strong>" + reservation.getStudentName() + "</strong>,</p>" +
                "<p>Your booking has been manually <span style='color: #059669; font-weight: bold;'>REACTIVATED</span> by the administration.</p>" +
                "<div style='background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0; border-radius: 4px;'>" +
                "  <p style='margin: 5px 0;'><strong>Bed No:</strong> " + bed.getBedNumber() + "</p>" +
                "  <p style='margin: 5px 0;'><strong>Room No:</strong> " + bed.getRoom().getRoomNumber() + "</p>" +
                "  <p style='margin: 5px 0;'><strong>Status:</strong> <span style='color: #16a34a; font-weight:bold;'>CONFIRMED</span></p>" +
                "</div>" +
                "<p>Thank you!</p>";

        String body = generateCommonEmailTemplate("Booking Reactivated 🔄", content);
        emailProducer.sendEmail(reservation.getStudentEmail(), subject, body);
    }

    // Assign New Bed
    @Transactional
    public void assignNewBed(Long reservationId, Long newBedId) throws ResourceNotFoundException {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id "+reservationId));

        // අලුත් ඇඳ හොයාගැනීම
        Bed newBed = bedRepository.findById(newBedId)
                .orElseThrow(() -> new ResourceNotFoundException("New Bed not found with id "+newBedId));

        // අලුත් ඇඳ Book කරනවා
        newBed.setIsBooked(true);
        bedRepository.save(newBed);

        // Reservation එකට අලුත් ඇඳ සම්බන්ධ කරනවා
        reservation.setBed(newBed);
        reservation.setReservationStatus(ReservationStatus.APPROVED);
        reservationRepository.save(reservation);

        //Email
        String subject = "New Bed Assigned - " + reservation.getReservationNumber();

        String content = "<p>Dear <strong>" + reservation.getStudentName() + "</strong>,</p>" +
                "<p>Since your original bed was unavailable (booked by another student due to late payment), we have assigned you a <span style='color: #4f46e5; font-weight: bold;'>NEW BED</span>.</p>" +
                "<div style='background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px;'>" +
                "  <p style='margin: 5px 0;'><strong>New Bed No:</strong> " + newBed.getBedNumber() + "</p>" +
                "  <p style='margin: 5px 0;'><strong>Room Number:</strong> " + newBed.getRoom().getRoomNumber() + "</p>" +
                "  <p style='margin: 5px 0;'><strong>Status:</strong> <span style='color: #059669; font-weight:bold;'>CONFIRMED</span></p>" +
                "</div>" +
                "<p>We apologize for any inconvenience caused.</p>" +
                "<p>Thank you!</p>";

        String body = generateCommonEmailTemplate("New Bed Assigned 🛏️", content);
        emailProducer.sendEmail(reservation.getStudentEmail(), subject, body);
    }

    //Get All Reservations ---
    // 2. GET ALL ACTIVE RESERVATIONS (Hide Trash)
    public List<ReservationListResponseDTO> getAllActiveReservations() {
        // Status එක TRASH නොවන ඒවා පමණක් ගෙන එයි
        List<Reservation> activeList = reservationRepository.findByReservationStatusNot(ReservationStatus.TRASH);

        return activeList.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // 3. GET TRASH RESERVATIONS (Show Only Trash)
    public List<ReservationListResponseDTO> getTrashReservations() {
        // Status එක TRASH වන ඒවා පමණක් ගෙන එයි
        List<Reservation> trashList = reservationRepository.findByReservationStatus(ReservationStatus.TRASH);

        return trashList.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
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

    // Get Matching Available Beds for Re-assignment ---
    public List<AvailableBedDTO> getMatchingBedsForRes(Long reservationId) throws ResourceNotFoundException {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id "+reservationId));

        Double originalPrice = 0.0;

        // පරණ Reservation එකේ තිබුණු Room එකේ මිල ගන්නවා
        if (reservation.getBed() != null && reservation.getBed().getRoom() != null) {
            originalPrice = reservation.getBed().getRoom().getPrice();
        } else {
            // Bed එක නැත්නම්, අපිට Price එක හොයන්න අමාරුයි.
            // (Payment Amount එකෙන් ගන්නත් පුළුවන් අවශ්‍ය නම්)
            throw new AppException("Original room price not found.", HttpStatus.CONFLICT);
        }

        // අලුත් Repository Query එක පාවිච්චි කරනවා
        List<Bed> matchingBeds = bedRepository.findByIsBookedFalseAndRoomPrice(originalPrice);

        return matchingBeds.stream()
                .map(bed -> AvailableBedDTO.builder()
                        .id(bed.getId())
                        .bedNumber(bed.getBedNumber())
                        .price(bed.getRoom().getPrice())
                        .floorNumber(bed.getRoom().getFloor().getFloorNumber())
                        .hubNumber(bed.getRoom().getFloor().getHub().getHubNumber())
                        .roomNumber(bed.getRoom().getRoomNumber())
                        .build())
                .collect(Collectors.toList());
    }

    // Cancel Reservation
    @Transactional
    public void cancelReservation(Long reservationId) throws ResourceNotFoundException {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id "+reservationId));

        if (reservation.getReservationStatus() == ReservationStatus.CANCELLED) {
            throw new AppException("Reservation is already cancelled.", HttpStatus.CONFLICT);
        }

        // 1. Bed එක නිදහස් කිරීම
        Bed bed = reservation.getBed();
        if (bed != null) {
            bed.setIsBooked(false);
            bedRepository.save(bed);
        }

        // 2. Status එක CANCELLED කිරීම
        reservation.setReservationStatus(ReservationStatus.CANCELLED);
        reservationRepository.save(reservation);

        // --- EMAIL කොටස වෙනස් කරන්න ---
        String subject = "Reservation Cancelled - " + reservation.getReservationNumber();
        String content = "<p>Dear <strong>" + reservation.getStudentName() + "</strong>,</p>" +
                "<p>Your reservation has been <span style='color: #dc2626; font-weight: bold;'>CANCELLED</span> as per your request.</p>" +
                "<div style='background-color: #fff1f2; border-left: 4px solid #e11d48; padding: 15px; margin: 20px 0; border-radius: 4px;'>" +
                "  <p style='margin: 0; color: #be123c;'><strong>Please Note:</strong> According to our policy, <strong>NO REFUNDS</strong> are issued for cancellations.</p>" +
                "</div>" +
                "<p>If you have any questions, please contact the administration.</p>" +
                "<p>Thank you.</p>";

        String body = generateCommonEmailTemplate("Reservation Cancelled 🚫", content);
        emailProducer.sendEmail(reservation.getStudentEmail(), subject, body);
    }

    @Override
    @Transactional
    public void updateReservationDates(Long reservationId, DateChangeRequestDTO dto) throws ResourceNotFoundException {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id " + reservationId));

        // CHECK 1: Payment Success ද?
        if (reservation.getPayment() == null || reservation.getPayment().getPaymentStatus() != PaymentStatus.APPROVED) {
            throw new AppException("Cannot change dates! Payment is not verified or failed.", HttpStatus.BAD_REQUEST);
        }

        // CHECK 2: Duration එක සමානද?
        long oldDays = ChronoUnit.DAYS.between(reservation.getFromDate(), reservation.getToDate());
        long newDays = ChronoUnit.DAYS.between(dto.getNewCheckInDate(), dto.getNewCheckOutDate());

        if (oldDays != newDays) {
            throw new AppException("Invalid Date Change! You paid for " + oldDays + " days. Please select the same duration.", HttpStatus.CONFLICT);
        }

        // CHECK 3: New Dates Availability (අලුත් දිනවල කාමරය ෆ්‍රී ද?) - [NEW]
        List<ReservationStatus> blockingStatuses = Arrays.asList(ReservationStatus.APPROVED, ReservationStatus.PENDING);

        boolean isOccupied = reservationRepository.existsOverlappingReservation(
                reservation.getBed().getId(),
                reservationId, // මේ booking එක අතහැර අනිත් ඒවා බලන්න
                dto.getNewCheckInDate(),
                dto.getNewCheckOutDate(),
                blockingStatuses
        );

        if (isOccupied) {
            // කාමරය ෆ්‍රී නැත්නම් Student ට පණිවිඩයක් යවන්න
            throw new AppException(
                    "Selected dates are not available for this bed. Please submit an 'Issue Report' to notify administration.",
                    HttpStatus.CONFLICT
            );
        }

        // D. Dates Update කිරීම (OK නම් විතරයි මෙතනට එන්නේ)
        reservation.setFromDate(dto.getNewCheckInDate());
        reservation.setToDate(dto.getNewCheckOutDate());
        reservationRepository.save(reservation);

        // --- EMAIL Sending ---
        String subject = "Reservation Dates Updated - " + reservation.getReservationNumber();
        String content = "<p>Dear <strong>" + reservation.getStudentName() + "</strong>,</p>" +
                "<p>Your reservation dates have been successfully <span style='color: #2563eb; font-weight: bold;'>UPDATED</span>.</p>" +
                "<div style='background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;'>" +
                "  <p style='margin: 5px 0;'><strong>New Check-in:</strong> " + dto.getNewCheckInDate() + "</p>" +
                "  <p style='margin: 5px 0;'><strong>New Check-out:</strong> " + dto.getNewCheckOutDate() + "</p>" +
                "</div>" +
                "<p>Thank you.</p>";

        String body = generateCommonEmailTemplate("Dates Updated 📅", content);
        emailProducer.sendEmail(reservation.getStudentEmail(), subject, body);
    }

    // GET RESERVATION BY ID (Full Details)
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

    // ගාණ ගණනය කරන පොදු Method එක (Common Logic)
    private Double calculateTotalAmount(Long bedId, LocalDate checkIn, LocalDate checkOut) throws ResourceNotFoundException {
        Bed bed = bedRepository.findById(bedId)
                .orElseThrow(() -> new ResourceNotFoundException("Bed not found with id "+bedId));

        if (bed.getRoom() == null || bed.getRoom().getPrice() == null) {
            throw new AppException("Room price is not set!", HttpStatus.CONFLICT);
        }

        Double monthlyRate = bed.getRoom().getPrice();

        // දින ගණන සොයාගැනීම
        long days = ChronoUnit.DAYS.between(checkIn, checkOut);

        if (days <= 0) {
            throw new RuntimeException("Invalid date range selected.");
        }

        // දිනකට අදාල ගාස්තුව (මාසෙකට දින 30ක් ලෙස සලකා)
        Double dailyRate = monthlyRate / 30.0;

        // සම්පූර්ණ මුදල (දශමස්ථාන 2කට වටයනවා)
        double totalAmount = dailyRate * days;
        return Math.round(totalAmount * 100.0) / 100.0;
    }

    // Frontend එකට ගාණ පෙන්නන්න API එකට දෙන Method එක
    public Double getEstimatedPrice(Long bedId, LocalDate checkIn, LocalDate checkOut) throws ResourceNotFoundException {
        return calculateTotalAmount(bedId, checkIn, checkOut);
    }

    // --- EMAIL TEMPLATE GENERATOR ---
    private String generateCommonEmailTemplate(String title, String content) {
        return "<html>" +
                "<body style='font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0;'>" +
                "  <div style='max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);'>" +
                "    <div style='background-color: #4f46e5; padding: 30px; text-align: center;'>" +
                "      <h1 style='color: #ffffff; margin: 0; font-size: 24px; font-weight: 800;'>Hostel PMS</h1>" +
                "      <p style='color: #e0e7ff; margin: 5px 0 0; font-size: 14px;'>Student Accommodation System</p>" +
                "    </div>" +
                "    <div style='padding: 30px; color: #374151; line-height: 1.6;'>" +
                "      <h2 style='color: #1f2937; margin-top: 0; font-size: 20px; border-bottom: 2px solid #f3f4f6; padding-bottom: 10px;'>" + title + "</h2>" +
                "      <div style='font-size: 16px;'>" + content + "</div>" +
                "    </div>" +
                "    <div style='background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;'>" +
                "      <p style='margin: 0; color: #6b7280; font-size: 12px;'>&copy; 2025 Hostel Management System. All rights reserved.</p>" +
                "      <p style='margin: 5px 0 0; color: #9ca3af; font-size: 11px;'>This is an automated email. Please do not reply.</p>" +
                "    </div>" +
                "  </div>" +
                "</body>" +
                "</html>";
    }

    @Override
    @Transactional
    public void createManualReservation(AdminReservationRequestDTO dto) {
        // 1. Bed Availability Check
        Bed bed = bedRepository.findById(dto.getBedId())
                .orElseThrow(() -> new AppException("Bed not found", HttpStatus.NOT_FOUND));

        if (Boolean.TRUE.equals(bed.getIsBooked())) {
            throw new AppException("This bed is already booked!", HttpStatus.CONFLICT);
        }

        // 2. Payment Validation (අලුත් කොටස)
        // Admin ලබා දුන් Payment Reference එකෙන් Payment එකක් සොයයි
        Payment payment = paymentRepository.findByPaymentId(dto.getPaymentReference())
                .orElseThrow(() -> new AppException("Invalid Payment Reference: Payment ID not found.", HttpStatus.NOT_FOUND));

        // Payment එක APPROVED ද කියා පරීක්ෂා කරයි
        if (payment.getPaymentStatus() != PaymentStatus.APPROVED) {
            throw new AppException("Payment is not in APPROVED status. Please approve the payment first.", HttpStatus.BAD_REQUEST);
        }

        // Payment එක වෙනත් Reservation එකකට භාවිතා කර ඇත්දැයි බලයි (Double Booking වැළැක්වීමට)
        if (payment.getReservation() != null) {
            throw new AppException("This Payment ID is already assigned to another reservation.", HttpStatus.CONFLICT);
        }

        // 3. User Linking
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

        // 4. Create Reservation
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
        reservation.setReservationStatus(ReservationStatus.APPROVED); // කෙලින්ම Approve

        // Link Objects
        reservation.setBed(bed);
        reservation.setPayment(payment); // සොයාගත් Payment එක set කරයි
        reservation.setUser(linkedUser);

        // Payment එක පැත්තෙනුත් Reservation එක set කරනවා (Bi-directional update)
        payment.setReservation(reservation);

        // 5. Save Entities
        bed.setIsBooked(true);
        bedRepository.save(bed);

        // Payment එක update කරන්න (Reservation එක link වුන නිසා)
        paymentRepository.save(payment);

        // Reservation එක save කරන්න
        reservationRepository.save(reservation);

        // 6. Send Email
        String subject = "Booking Confirmation - " + reservation.getReservationNumber();
        String content = "<p>Dear <strong>" + dto.getStudentName() + "</strong>,</p>" +
                "<p>Your bed reservation has been created manually by the administration.</p>" +
                "<div style='background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px;'>" +
                "  <p><strong>Reservation ID:</strong> " + reservation.getReservationNumber() + "</p>" +
                "  <p><strong>Bed:</strong> " + bed.getBedNumber() + " (" + bed.getRoom().getRoomNumber() + ")</p>" +
                "  <p><strong>Dates:</strong> " + dto.getFromDate() + " to " + dto.getToDate() + "</p>" +
                "  <p><strong>Status:</strong> <span style='color: #059669; font-weight:bold;'>CONFIRMED</span></p>" +
                "</div>" +
                "<p>Thank you!</p>";

        String body = generateCommonEmailTemplate("Booking Confirmed ✅", content);
        emailProducer.sendEmail(dto.getEmail(), subject, body);
    }
}
