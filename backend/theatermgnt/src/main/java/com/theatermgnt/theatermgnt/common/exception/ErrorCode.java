package com.theatermgnt.theatermgnt.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR), // Code: 500
    INVALID_KEY(1001, "Invalid message key", HttpStatus.BAD_REQUEST), // 404
    UNAUTHORIZED(1002, "You do not have permissions", HttpStatus.FORBIDDEN), // 403
    USER_EXISTED(1003, "User existed", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(1004, "User not existed", HttpStatus.NOT_FOUND),
    PHONE_NUMBER_EXISTED(1005, "Phone number has existed", HttpStatus.BAD_REQUEST),
    UNAUTHENTICATED(1006, "Unauthenticated", HttpStatus.UNAUTHORIZED), // 401
    ROLE_NOT_FOUND(1007, "Role not found", HttpStatus.NOT_FOUND), // 401
    INVALID_TYPING(1008, "WRONG IN YOUR CODE", HttpStatus.BAD_REQUEST),
    INVALID_USERNAME(1009, "Username must be at least {min} characters", HttpStatus.BAD_REQUEST),
    INVALID_PASSWORD(1010, "Password must be at least {min} characters", HttpStatus.BAD_REQUEST),
    UNAUTHORIZE(1011, "You do not have permission", HttpStatus.FORBIDDEN),
    INVALID_DOB(1012, "Your age must be at least {min}", HttpStatus.BAD_REQUEST),
    EMAIL_IS_REQUIRED(1013, "Email is required", HttpStatus.BAD_REQUEST),
    INVALID_EMAIL(1014, "Invalid email address", HttpStatus.BAD_REQUEST),
    PHONE_NUMBER_REQUIRED(1015, "Phone number is required", HttpStatus.BAD_REQUEST),
    INVALID_PHONE_NUMBER_FORMAT(1016, "Invalid phone number format", HttpStatus.BAD_REQUEST),
    EMAIL_EXISTED(1017, "Email has existed", HttpStatus.BAD_REQUEST),
    OTP_EXPIRED(1018, "OTP has expired", HttpStatus.BAD_REQUEST),
    INVALID_OTP(1019, "Invalid OTP", HttpStatus.BAD_REQUEST),
    FAILED_TO_REGISTER_USER(1020, "Failed to register customer by Google", HttpStatus.BAD_REQUEST),
    PASSWORD_EXISTED(1021, "Password has existed", HttpStatus.BAD_REQUEST),
    ACCOUNT_NOT_FOUND(1022, "Account not found", HttpStatus.NOT_FOUND),
    PASSWORDS_DO_NOT_MATCH(1023, "Password and Confirm password do not match", HttpStatus.BAD_REQUEST),
    CONFIRM_PASSWORD_REQUIRED(1024, "Confirm password is required", HttpStatus.BAD_REQUEST),
    //----
    CINEMA_EXISTED(2001, "Cinema existed", HttpStatus.BAD_REQUEST),
    CINEMA_NOT_EXISTED(2002, "Cinema not existed", HttpStatus.BAD_REQUEST),
    ROOM_EXISTED(2003, "Room existed", HttpStatus.BAD_REQUEST),
    ROOM_NOT_EXISTED(2004, "Room not existed", HttpStatus.BAD_REQUEST),
    SEATTYPE_EXISTED(2005, "Seat type existed", HttpStatus.BAD_REQUEST),
    SEATTYPE_NOT_EXISTED(2006, "Seat type not existed", HttpStatus.BAD_REQUEST),
    PRICECONFIG_NOT_EXISTED(2007, "Price config not existed", HttpStatus.BAD_REQUEST),
    PRICECONFIG_EXISTED(2008, "Price config existed", HttpStatus.BAD_REQUEST),
    SEAT_NOT_EXISTED(2009, "Seat not existed", HttpStatus.BAD_REQUEST),
    SEAT_EXISTED(2010, "Seat existed", HttpStatus.BAD_REQUEST),
    COMBO_EXISTED(2011, "Seat existed", HttpStatus.BAD_REQUEST),
    COMBO_NOT_EXISTED(2012, "Seat not existed", HttpStatus.BAD_REQUEST),
    COMBO_ITEM_EXISTED(2011, "Seat existed", HttpStatus.BAD_REQUEST),
    COMBO_ITEM_NOT_EXISTED(2012, "Seat not existed", HttpStatus.BAD_REQUEST),

    //----
    CANNOT_SEND_EMAIL(3001, "Cannot send email", HttpStatus.BAD_REQUEST),
    ;
    private int code;
    private String message;
    private HttpStatusCode statusCode;

    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.message = message;
        this.code = code;
        this.statusCode = statusCode;
    }
}
