package com.theatermgnt.theatermgnt.room.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.theatermgnt.theatermgnt.room.dto.request.RoomCreationRequest;
import com.theatermgnt.theatermgnt.room.dto.request.RoomUpdateRequest;
import com.theatermgnt.theatermgnt.room.dto.response.RoomResponse;
import com.theatermgnt.theatermgnt.room.entity.Room;

@Mapper(componentModel = "spring")
public interface RoomMapper {
    Room toRoom(RoomCreationRequest request);

    @Mapping(target = "cinemaName", source = "cinema.name")
    RoomResponse toRoomResponse(Room room);

    void updateRoom(@MappingTarget Room room, RoomUpdateRequest request);
}
