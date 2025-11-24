package com.theatermgnt.theatermgnt.schedule.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateWorkScheduleRequest {

    @NotBlank(message = "")
    String userId;

    @NotBlank
    String shiftTypeId;

    @NotNull
    LocalDate workDate;
}

