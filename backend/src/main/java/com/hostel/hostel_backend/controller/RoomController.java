package com.hostel.hostel_backend.controller;

import com.hostel.hostel_backend.controller.request.CreateRoomRequestDTO;
import com.hostel.hostel_backend.exception.ResourceNotFoundException;
import com.hostel.hostel_backend.model.ReservationPeriod;
import com.hostel.hostel_backend.model.ReservedFor;
import com.hostel.hostel_backend.model.Room;
import com.hostel.hostel_backend.service.RoomService;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@AllArgsConstructor
@CrossOrigin(origins = "*")
public class RoomController {

    private RoomService roomService;

    @PostMapping(value = "/floors/{floor-id}/rooms", headers = "X-Api-Version=v1")
    public void createRoom(@PathVariable("floor-id") Long floorId,@RequestBody CreateRoomRequestDTO dto) throws ResourceNotFoundException {
        System.out.println("DTO: " + dto);
        roomService.createRoom(floorId, dto);
    }

    @GetMapping(value = "/rooms", headers = "X-Api-Version=v1")
    public List<Room> getAllRooms(){
        return roomService.getAllRooms();
    }

    @GetMapping(value = "/rooms/public", headers = "X-Api-Version=v1")
    public List<Room> getPublicRooms() {
        return roomService.getPublicRooms();
    }

    @GetMapping(value = "/floors/{floor-id}/rooms/public", headers = "X-Api-Version=v1")
    public List<Room> getPublicRoomsByFloor(@PathVariable("floor-id") Long floorId) {
        return roomService.getPublicRoomsByFloor(floorId);
    }

    @GetMapping(value = "/floors/{floor-id}/rooms", headers = "X-Api-Version=v1")
    public List<Room> getAllRoomsByFloor(@PathVariable("floor-id") Long floorId) {
        return roomService.getAllRoomsByFloor(floorId);
    }

    @GetMapping(value = "/rooms/{room-id}", headers = "X-Api-Version=v1")
    public Room getRoomById(@PathVariable("room-id") Long roomId) throws ResourceNotFoundException {
        return roomService.getRoomById(roomId);
    }

    @DeleteMapping(value = "/rooms/{room-id}", headers = "X-Api-Version=v1")
    public void deleteRoom(@PathVariable("room-id") Long roomId) throws ResourceNotFoundException {
        roomService.deleteRoom(roomId);
    }

    @PatchMapping(value = "/rooms/{room-id}/reserved-for", headers = "X-Api-Version=v1")
    public void updateReservedFor(@PathVariable("room-id") Long roomId, @RequestParam ReservedFor reservedFor) throws ResourceNotFoundException {
        roomService.updateReservedFor(roomId, reservedFor);
    }

    @PatchMapping(value = "/rooms/{room-id}/is-private", headers = "X-Api-Version=v1")
    public void updateIsPrivate(@PathVariable("room-id") Long roomId, @RequestParam Boolean isPrivate) throws ResourceNotFoundException {
        roomService.updateIsPrivate(roomId, isPrivate);
    }

    @PatchMapping(value = "/rooms/{room-id}/period", headers = "X-Api-Version=v1")
    public void updatePeriod(@PathVariable("room-id") Long roomId, @RequestParam ReservationPeriod period) throws ResourceNotFoundException {
        roomService.updateReservationPeriod(roomId, period);
    }

    @GetMapping(value = "/rooms/filterByPrivacy", headers = "X-Api-Version=v1")
    public List<Room> getRoomsByPrivacy(@RequestParam Boolean isPrivate) {
        return roomService.getRoomsByPrivacy(isPrivate);
    }

    @GetMapping(value = "/rooms/filterByReservationPeriod", headers = "X-Api-Version=v1")
    public List<Room> getRoomsByReservationPeriod(@RequestParam ReservationPeriod reservationPeriod) {
        return roomService.getRoomsByReservationPeriod(reservationPeriod);
    }

    @GetMapping(value = "/rooms/filterByReservedFor", headers = "X-Api_version=v1")
    public List<Room> getRoomsByReservedFor(@RequestParam ReservedFor reservedFor) {
        return roomService.getRoomsByReservedFor(reservedFor);
    }
}
