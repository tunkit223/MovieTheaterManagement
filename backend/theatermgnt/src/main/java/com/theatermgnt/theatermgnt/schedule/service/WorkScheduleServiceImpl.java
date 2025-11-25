package com.theatermgnt.theatermgnt.schedule.service;

import com.theatermgnt.theatermgnt.ShiftType.repository.ShiftTypeRepository;
import com.theatermgnt.theatermgnt.common.exception.AppException;
import com.theatermgnt.theatermgnt.common.exception.ErrorCode;
import com.theatermgnt.theatermgnt.schedule.dto.request.CreateWorkScheduleRequest;
import com.theatermgnt.theatermgnt.schedule.dto.response.WorkScheduleResponse;
import com.theatermgnt.theatermgnt.ShiftType.entity.ShiftType;
import com.theatermgnt.theatermgnt.schedule.entity.WorkSchedule;
import com.theatermgnt.theatermgnt.schedule.mapper.WorkScheduleMapper;
import com.theatermgnt.theatermgnt.schedule.repository.WorkScheduleRepository;
import com.theatermgnt.theatermgnt.staff.repository.StaffRepository;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Builder
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class WorkScheduleServiceImpl implements WorkScheduleService {

    WorkScheduleRepository workScheduleRepository;
    ShiftTypeRepository shiftTypeRepository;
    StaffRepository staffRepository;
    WorkScheduleMapper mapper;

    @Override
    @Transactional
    public List<WorkScheduleResponse> createSchedules(
            String cinemaId,
            List<CreateWorkScheduleRequest> list) {

        List<WorkScheduleResponse> result = new ArrayList<>();

        for (CreateWorkScheduleRequest req : list) {

            var staff = staffRepository.findById(req.getUserId())
                    .orElseThrow(() -> new AppException(ErrorCode.STAFF_NOT_FOUND));

            if (!staff.getCinemaId().equals(cinemaId)) {
                throw new AppException(ErrorCode.UNAUTHORIZED_CINEMA_STAFF);
            }

            boolean exists = workScheduleRepository
                    .existsByUserIdAndWorkDateAndShiftType_Id(
                            req.getUserId(),
                            req.getWorkDate(),
                            req.getShiftTypeId()
                    );

            if (exists) {
                throw new AppException(ErrorCode.WORK_SCHEDULE_EXISTS);
            }

            ShiftType shift = shiftTypeRepository.findById(req.getShiftTypeId())
                    .orElseThrow(() -> new AppException(ErrorCode.SHIFT_NOT_FOUND));

            WorkSchedule ws = new WorkSchedule(
                    req.getUserId(),
                    cinemaId,
                    shift,
                    req.getWorkDate()
            );

            WorkSchedule saved = workScheduleRepository.save(ws);
            result.add(mapper.toResponse(saved));
        }
        return result;
    }

    @Override
    public List<WorkScheduleResponse> getSchedules(String cinemaId, LocalDate from, LocalDate to) {
        return workScheduleRepository.findByCinemaIdAndWorkDateBetween(cinemaId, from, to)
                .stream().map(mapper::toResponse).toList();
    }

    @Override
    @Transactional
    public void deleteSchedule(String cinemaId, String id) {
        WorkSchedule ws = workScheduleRepository.findByIdAndCinemaId(id, cinemaId)
                .orElseThrow(() -> new AppException(ErrorCode.WORK_SCHEDULE_NOT_FOUND));

        workScheduleRepository.delete(ws);
    }
}


