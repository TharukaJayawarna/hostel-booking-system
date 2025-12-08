package com.hostel.hostel_backend.controller;

import com.hostel.hostel_backend.controller.request.CreateRoomRequestDTO;
import com.hostel.hostel_backend.controller.response.ApiResponse;
import com.hostel.hostel_backend.controller.response.RoomResponseDTO;
import com.hostel.hostel_backend.exception.ResourceNotFoundException;
import com.hostel.hostel_backend.model.ReservationPeriod;
import com.hostel.hostel_backend.model.ReservedFor;
import com.hostel.hostel_backend.service.RoomService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@AllArgsConstructor
@CrossOrigin(origins = "*")
public class RoomController {

    private RoomService roomService;

    @PostMapping(value = "/floors/{floor-id}/rooms", headers = "X-Api-Version=v1")
    public ResponseEntity<ApiResponse<Void>> createRoom(@PathVariable("floor-id") Long floorId, @RequestBody CreateRoomRequestDTO dto) throws ResourceNotFoundException {
        roomService.createRoom(floorId, dto);
        return ResponseEntity.ok(ApiResponse.success("Room created successfully"));
    }

    @GetMapping(value = "/rooms", headers = "X-Api-Version=v1")
    public ResponseEntity<ApiResponse<List<RoomResponseDTO>>> getAllRooms(){
        return ResponseEntity.ok(ApiResponse.success("Rooms fetched", roomService.getAllRooms()));
    }

    @GetMapping(value = "/rooms/public", headers = "X-Api-Version=v1")
    public ResponseEntity<ApiResponse<List<RoomResponseDTO>>> getPublicRooms() {
        return ResponseEntity.ok(ApiResponse.success("Rooms fetched", roomService.getPublicRooms()));
    }

    @GetMapping(value = "/floors/{floor-id}/rooms/public", headers = "X-Api-Version=v1")
    public ResponseEntity<ApiResponse<List<RoomResponseDTO>>> getPublicRoomsByFloor(@PathVariable("floor-id") Long floorId) {
        return ResponseEntity.ok(ApiResponse.success("Rooms fetched",roomService.getPublicRoomsByFloor(floorId))) ;
    }

    @GetMapping(value = "/floors/{floor-id}/rooms", headers = "X-Api-Version=v1")
    public ResponseEntity<ApiResponse<List<RoomResponseDTO>>> getAllRoomsByFloor(@PathVariable("floor-id") Long floorId) {
        return ResponseEntity.ok(ApiResponse.success("Rooms fetched", roomService.getAllRoomsByFloor(floorId)));
    }

    @GetMapping(value = "/rooms/{room-id}", headers = "X-Api-Version=v1")
    public ResponseEntity<ApiResponse<RoomResponseDTO>> getRoomById(@PathVariable("room-id") Long roomId) throws ResourceNotFoundException {
        return ResponseEntity.ok(ApiResponse.success("Room fetched ",roomService.getRoomById(roomId))) ;
    }

    @DeleteMapping(value = "/rooms/{room-id}", headers = "X-Api-Version=v1")
    public ResponseEntity<ApiResponse<Void>> deleteRoom(@PathVariable("room-id") Long roomId) throws ResourceNotFoundException {
        roomService.deleteRoom(roomId);
        return ResponseEntity.ok(ApiResponse.success("Room deleted successfully"));
    }

    @PatchMapping(value = "/rooms/{room-id}/reserved-for", headers = "X-Api-Version=v1")
    public ResponseEntity<ApiResponse<Void>> updateReservedFor(@PathVariable("room-id") Long roomId, @RequestParam ReservedFor reservedFor) throws ResourceNotFoundException {
        roomService.updateReservedFor(roomId, reservedFor);
        return ResponseEntity.ok(ApiResponse.success("Room reserved for" +reservedFor+" successfully"));
    }

    @PatchMapping(value = "/rooms/{room-id}/is-private", headers = "X-Api-Version=v1")
    public ResponseEntity<ApiResponse<Void>> updateIsPrivate(@PathVariable("room-id") Long roomId, @RequestParam Boolean isPrivate) throws ResourceNotFoundException {
        roomService.updateIsPrivate(roomId, isPrivate);
        return ResponseEntity.ok(ApiResponse.success("Room updated successfully"));
    }

    @PatchMapping(value = "/rooms/{room-id}/period", headers = "X-Api-Version=v1")
    public ResponseEntity<ApiResponse<Void>> updatePeriod(@PathVariable("room-id") Long roomId, @RequestParam ReservationPeriod period) throws ResourceNotFoundException {
        roomService.updateReservationPeriod(roomId, period);
        return ResponseEntity.ok(ApiResponse.success("Room reservation period updated to"+period+" successfully"));
    }

    @GetMapping(value = "/rooms/filterByPrivacy", headers = "X-Api-Version=v1")
    public ResponseEntity<ApiResponse<List<RoomResponseDTO>>> getRoomsByPrivacy(@RequestParam Boolean isPrivate) {
        return ResponseEntity.ok(ApiResponse.success("Rooms fetched", roomService.getRoomsByPrivacy(isPrivate)));
    }

    @GetMapping(value = "/rooms/filterByReservationPeriod", headers = "X-Api-Version=v1")
    public ResponseEntity<ApiResponse<List<RoomResponseDTO>>> getRoomsByReservationPeriod(@RequestParam ReservationPeriod reservationPeriod) {
        return ResponseEntity.ok(ApiResponse.success("Rooms fetched", roomService.getRoomsByReservationPeriod(reservationPeriod)));
    }

    @GetMapping(value = "/rooms/filterByReservedFor", headers = "X-Api_version=v1")
    public ResponseEntity<ApiResponse<List<RoomResponseDTO>>> getRoomsByReservedFor(@RequestParam ReservedFor reservedFor) {
        return ResponseEntity.ok(ApiResponse.success("Rooms fetched", roomService.getRoomsByReservedFor(reservedFor)));
    }

    @GetMapping(value = "/rooms/available", headers = "X-Api-Version=v1")
    public ResponseEntity<ApiResponse<List<RoomResponseDTO>>> getAvailableRooms(
            @RequestParam Long hubId,
            @RequestParam LocalDate checkIn,
            @RequestParam LocalDate checkOut
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Available rooms fetched",
                roomService.getAvailableRooms(hubId, checkIn, checkOut)
        ));
    }

    // class eka athulata me PUT endpoint eka add karanna

    @PutMapping(value = "/rooms/{room-id}", headers = "X-Api-Version=v1")
    public ResponseEntity<ApiResponse<Void>> updateRoom(@PathVariable("room-id") Long roomId, @RequestBody CreateRoomRequestDTO dto) throws ResourceNotFoundException {
        roomService.updateRoom(roomId, dto);
        return ResponseEntity.ok(ApiResponse.success("Room updated successfully"));
    }
}
