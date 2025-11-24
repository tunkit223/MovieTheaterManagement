package com.theatermgnt.theatermgnt.schedule.mapper;

import com.theatermgnt.theatermgnt.schedule.dto.response.WorkScheduleResponse;
import com.theatermgnt.theatermgnt.schedule.entity.WorkSchedule;
import com.theatermgnt.theatermgnt.staff.repository.StaffRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;


@Component
@RequiredArgsConstructor
public class WorkScheduleMapperDecorator implements WorkScheduleMapper {

    private final WorkScheduleMapper delegate;
    private final StaffRepository staffRepository;

    @Override
    public WorkScheduleResponse toResponse(WorkSchedule ws) {

        WorkScheduleResponse response = delegate.toResponse(ws);

        staffRepository.findById(ws.getUserId())
                .ifPresent(user -> {
                    String fullName = user.getLastName() + " " + user.getFirstName();
                    response.setUserName(fullName);
                });

        return response;
    }
}

