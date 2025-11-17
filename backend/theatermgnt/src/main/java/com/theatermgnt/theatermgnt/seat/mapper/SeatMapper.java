package com.theatermgnt.theatermgnt.seat.mapper;


import com.theatermgnt.theatermgnt.seat.dto.request.SeatCreationRequest;
import com.theatermgnt.theatermgnt.seat.dto.request.SeatUpdateRequest;
import com.theatermgnt.theatermgnt.seat.dto.response.SeatResponse;
import com.theatermgnt.theatermgnt.seat.entity.Seat;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface SeatMapper {
    Seat toSeat(SeatCreationRequest request);

    @Mapping(source = "seatType.typeName", target = "seatTypeName")
    @Mapping(source = "room.name", target = "roomName")
    SeatResponse toSeatResponse(Seat seat);

    void updateSeat(@MappingTarget Seat seat, SeatUpdateRequest request);
}
