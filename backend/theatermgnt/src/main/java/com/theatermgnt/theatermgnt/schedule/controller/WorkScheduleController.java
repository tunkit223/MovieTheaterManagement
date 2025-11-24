package com.theatermgnt.theatermgnt.schedule.controller;

import com.theatermgnt.theatermgnt.common.dto.response.ApiResponse;
import com.theatermgnt.theatermgnt.schedule.dto.request.CreateWorkScheduleRequest;
import com.theatermgnt.theatermgnt.schedule.dto.response.WorkScheduleResponse;
import com.theatermgnt.theatermgnt.schedule.service.WorkScheduleService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/schedules")
@RequiredArgsConstructor
@Builder
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class WorkScheduleController {

    WorkScheduleService scheduleService;

    @GetMapping
    public ApiResponse<List<WorkScheduleResponse>> getSchedules(
            @RequestParam String cinemaId,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate from,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate to) {

        return ApiResponse.<List<WorkScheduleResponse>>builder()
                .result(scheduleService.getSchedules(cinemaId, from, to))
                .build();
    }

    @PostMapping("/public")
    public ApiResponse<List<WorkScheduleResponse>> publicSchedules(
            @RequestParam String cinemaId,
            @Valid @RequestBody List<CreateWorkScheduleRequest> request) {

        return ApiResponse.<List<WorkScheduleResponse>>builder()
                .result(scheduleService.createSchedules(cinemaId, request))
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteSchedule(@PathVariable String id) {
        scheduleService.deleteSchedule(id);
        return ApiResponse.<String>builder()
                .result(STR."Delete schedule id: \{id} successfully")
                .build();
    }
}


