package com.theatermgnt.theatermgnt.room.dto.response;

import com.theatermgnt.theatermgnt.common.enums.RoomType;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoomResponse {
     String id;
     String name;
     RoomType roomType;
     Integer totalSeats;
     String cinemaName;
}
