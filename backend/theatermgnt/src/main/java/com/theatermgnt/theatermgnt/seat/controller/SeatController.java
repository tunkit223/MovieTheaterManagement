package com.theatermgnt.theatermgnt.seat.controller;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;

import com.theatermgnt.theatermgnt.common.dto.response.ApiResponse;
import com.theatermgnt.theatermgnt.seat.dto.request.SeatCreationRequest;
import com.theatermgnt.theatermgnt.seat.dto.request.SeatUpdateRequest;
import com.theatermgnt.theatermgnt.seat.dto.response.SeatResponse;
import com.theatermgnt.theatermgnt.seat.service.SeatService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/seats")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SeatController {
    SeatService seatService;

    @PostMapping
    ApiResponse<SeatResponse> createSeat(@RequestBody @Valid SeatCreationRequest request) {
        return ApiResponse.<SeatResponse>builder()
                .result(seatService.createSeat(request))
                .build();
    }

    @GetMapping("/room/{roomId}")
    ApiResponse<List<SeatResponse>> getSeatsByRoom(@PathVariable String roomId) {
        return ApiResponse.<List<SeatResponse>>builder()
                .result(seatService.getSeatsByRoom(roomId))
                .build();
    }

    @GetMapping("/{seatId}")
    ApiResponse<SeatResponse> getSeat(@PathVariable String seatId) {
        return ApiResponse.<SeatResponse>builder()
                .result(seatService.getSeat(seatId))
                .build();
    }

    @GetMapping
    ApiResponse<List<SeatResponse>> getSeats() {
        return ApiResponse.<List<SeatResponse>>builder()
                .result(seatService.getSeats())
                .build();
    }

    @PutMapping("/{seatId}")
    ApiResponse<SeatResponse> updateSeat(@PathVariable String seatId, @RequestBody @Valid SeatUpdateRequest request) {
        return ApiResponse.<SeatResponse>builder()
                .result(seatService.updateSeat(seatId, request))
                .build();
    }

    @DeleteMapping("/{seatId}")
    ApiResponse<String> deleteSeat(@PathVariable String seatId) {
        seatService.deleteSeat(seatId);
        return ApiResponse.<String>builder().result("Delete seat successfully").build();
    }
}
