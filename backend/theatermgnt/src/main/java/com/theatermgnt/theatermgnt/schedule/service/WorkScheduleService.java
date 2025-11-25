package com.theatermgnt.theatermgnt.schedule.service;

import com.theatermgnt.theatermgnt.schedule.dto.request.CreateWorkScheduleRequest;
import com.theatermgnt.theatermgnt.schedule.dto.response.WorkScheduleResponse;


import java.time.LocalDate;
import java.util.List;

public interface WorkScheduleService {

    List<WorkScheduleResponse> createSchedules(String cinemaId, List<CreateWorkScheduleRequest> req);

    List<WorkScheduleResponse> getSchedules(String cinemaId, LocalDate from, LocalDate to);

    void deleteSchedule(String cinemaId, String id);
}


