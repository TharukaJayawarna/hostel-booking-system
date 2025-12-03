package com.hostel.hostel_backend.exception;

import com.hostel.hostel_backend.controller.response.ErrorResponse;
import org.springframework.http.HttpStatus;

import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

public class AppControllerAdvisor {
    @RestControllerAdvice
    public class AppControllerAdviser{
        @ResponseStatus(value = HttpStatus.NOT_FOUND)
        @ExceptionHandler({ResourceNotFoundException.class})
        public ErrorResponse handleNotFoundException(Exception e) {
            ErrorResponse errorResponse = new ErrorResponse();
            errorResponse.setError(e.getMessage());
            return errorResponse;

        }

        @ResponseStatus(value = HttpStatus.CONFLICT)
        @ExceptionHandler({NotCreatedException.class})
        public ErrorResponse handleHotelNotCreatedException(Exception e) {
            ErrorResponse errorResponse = new ErrorResponse();
            errorResponse.setError(e.getMessage());
            return errorResponse;
        }
    }
}
