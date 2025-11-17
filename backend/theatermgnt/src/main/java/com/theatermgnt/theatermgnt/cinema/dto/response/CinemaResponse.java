package com.theatermgnt.theatermgnt.cinema.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CinemaResponse {
     String id;
     String name;
     String address;
     String city;
     String phoneNumber;
     String managerId;
     LocalDateTime createdAt;
}
