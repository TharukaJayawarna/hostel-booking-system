package com.hostel.hostel_backend.service.impl;

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

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
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

    @Value("${payhere.merchant.id}")
    private String merchantId;

    @Value("${payhere.merchant.secret}")
    private String merchantSecret;

    @Value("${payhere.currency}")
    private String currency;

    @Transactional(rollbackFor = Exception.class)
    public PayHereInitResponseDTO initiateReservation(CreateReservationRequestDTO dto) {

       try {
           // 1. Bed Availability Check
           Bed bed = bedRepository.findById(dto.getBedId())
                   .orElseThrow(() -> new ResourceNotFoundException("Bed not found with id: " + dto.getBedId()));

           if (Boolean.TRUE.equals(bed.getIsBooked())) {
               throw new AppException("This bed is already booked!", HttpStatus.CONFLICT);
           }

           Double calculatedAmount = calculateTotalAmount(dto.getBedId(), dto.getFromDate(), dto.getToDate());

           // 2. Generate Order ID
           String orderId = UUID.randomUUID().toString().substring(0, 8).toUpperCase();

           // 3. Create Payment Record (PENDING)
           Payment payment = new Payment();
           payment.setPaymentId(orderId);
           payment.setPaymentDate(LocalDate.now());
           payment.setPaymentTime(LocalTime.now());
           payment.setPaymentStatus(PaymentStatus.PENDING);
           payment.setPaymentAmount(calculatedAmount);

           // 4. Create Reservation Record (PENDING)
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
        String subject = "Reservation Confirmed: " + res.getReservationNumber();
        String body = "Dear " + res.getStudentName() + ",\n\n" +
                "Your payment was successful and bed reservation is confirmed.\n" +
                "Bed No: " + res.getBed().getBedNumber() + "\n\n" +
                "Thank You!";
        emailProducer.sendEmail(res.getStudentEmail(), subject, body);
    }

    public void sendFailureEmail(Reservation res) {
        String subject = "Reservation Failed: " + res.getReservationNumber();
        String body = "Dear " + res.getStudentName() + ",\n\n" +
                "We regret to inform you that your payment was unsuccessful (Declined/Failed).\n" +
                "Consequently, your reservation for Bed No: " + res.getBed().getBedNumber() + " has been CANCELLED.\n\n" +
                "Please try again with a valid payment method.\n\n" +
                "Thank You!";

        emailProducer.sendEmail(res.getStudentEmail(), subject, body);
    }

    // 1. තිබුණු ඇඳම නැවත ලබා දීම (Reactivate)
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
        reservation.setReservationStatus(ReservationStatus.COMPLETED);
        reservationRepository.save(reservation);

        // Student ට Email යැවීම (RabbitMQ)
        String subject = "Booking Reactivated - " + reservation.getReservationNumber();
        String body = "Dear " + reservation.getStudentName() + ",\n\n" +
                "Your booking has been manually reactivated by the administration.\n" +
                "Bed No: " + bed.getBedNumber() + "\n" +
                "Room No: " +bed.getRoom().getRoomNumber() + "\n" +
                "Status: CONFIRMED\n\n" +
                "Thank you!";

        emailProducer.sendEmail(reservation.getStudentEmail(), subject, body);
    }

    // 2. අලුත් ඇඳක් ලබා දීම (Assign New Bed)
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
        reservation.setReservationStatus(ReservationStatus.COMPLETED);
        reservationRepository.save(reservation);

        // Student ට Email යැවීම (RabbitMQ)
        String subject = "New Bed Assigned - " + reservation.getReservationNumber();
        String body = "Dear " + reservation.getStudentName() + ",\n\n" +
                "Since your original bed was unavailable (booked by another student due to late payment), " +
                "we have assigned you a new bed.\n" +
                "New Bed No: " + newBed.getBedNumber() + "\n" +
                "Room Number: "+newBed.getRoom().getRoomNumber()+"\n" +
                "Status: CONFIRMED\n\n" +
                "Thank you!";

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
                        .price(bed.getRoom().getPrice()) // Price from Room
                        .build())
                .collect(Collectors.toList());
    }

    // Cancel Reservation (No Refund Rule) ---
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

        // 3. Email යැවීම (No Refund ගැන මතක් කිරීම)
        String subject = "Reservation Cancelled - " + reservation.getReservationNumber();
        String body = "Dear " + reservation.getStudentName() + ",\n\n" +
                "Your reservation has been cancelled as per your request.\n" +
                "Please note: According to our policy, NO REFUNDS are issued for cancellations.\n\n" +
                "Thank you.";
        emailProducer.sendEmail(reservation.getStudentEmail(), subject, body);
    }

    // Change Dates (Same Duration Only) ---
    @Transactional
    public void updateReservationDates(Long reservationId, DateChangeRequestDTO dto) throws ResourceNotFoundException {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id "+reservationId));

        // A. පරණ දින ගණන (Duration) ගණනය කිරීම
        long oldDays = ChronoUnit.DAYS.between(reservation.getFromDate(), reservation.getToDate());

        // B. අලුත් දින ගණන ගණනය කිරීම
        long newDays = ChronoUnit.DAYS.between(dto.getNewCheckInDate(), dto.getNewCheckOutDate());

        // C. දින ගණන සමානද බැලීම (Rule Check)
        if (oldDays != newDays) {
            throw new AppException("Invalid Date Change! The duration (" + oldDays + " days) must remain the same.", HttpStatus.CONFLICT);
        }

        // D. Dates Update කිරීම
        reservation.setFromDate(dto.getNewCheckInDate());
        reservation.setToDate(dto.getNewCheckOutDate());
        reservationRepository.save(reservation);

        // E. Email යැවීම
        String subject = "Reservation Dates Updated - " + reservation.getReservationNumber();
        String body = "Dear " + reservation.getStudentName() + ",\n\n" +
                "Your reservation dates have been successfully updated.\n" +
                "New Check-in: " + dto.getNewCheckInDate() + "\n" +
                "New Check-out: " + dto.getNewCheckOutDate() + "\n\n" +
                "Thank you.";
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
                .studentEmail(res.getStudentEmail())
                .studentContact(res.getStudentContactNumber())
                .gender(res.getStudentGender())
                .bedNumber(res.getBed() != null ? res.getBed().getBedNumber() : "N/A")
                .roomNumber(res.getBed() != null && res.getBed().getRoom() != null ? res.getBed().getRoom().getRoomNumber() : "N/A")
                .checkIn(res.getFromDate())
                .checkOut(res.getToDate())
                .status(res.getReservationStatus())
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
}