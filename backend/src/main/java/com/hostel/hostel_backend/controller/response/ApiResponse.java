package com.hostel.hostel_backend.controller.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ApiResponse<T> {
    private String status; // "SUCCESS" or "ERROR"
    private String message;
    private T data;

    // Data සමඟ සාර්ථක Response එකක් යවන්න
    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>("SUCCESS", message, data);
    }

    // Data නැතුව Message එක විතරක් යවන්න (උදා: Delete/Update)
    public static <T> ApiResponse<T> success(String message) {
        return new ApiResponse<>("SUCCESS", message, null);
    }

    // Error එකක් යවන්න
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>("ERROR", message, null);
    }
}