package com.hostel.hostel_backend.model;

public enum RoomType {
    SHARING_2(2),
    SHARING_4(4),
    SHARING_6(6);

    private final int capacity;

    RoomType(int capacity) {
        this.capacity = capacity;
    }

    public int getCapacity() {
        return capacity;
    }
}