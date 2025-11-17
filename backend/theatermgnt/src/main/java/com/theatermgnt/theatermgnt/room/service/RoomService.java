package com.theatermgnt.theatermgnt.room.service;

import com.theatermgnt.theatermgnt.cinema.entity.Cinema;
import com.theatermgnt.theatermgnt.cinema.repository.CinemaRepository;
import com.theatermgnt.theatermgnt.common.exception.AppException;
import com.theatermgnt.theatermgnt.common.exception.ErrorCode;
import com.theatermgnt.theatermgnt.room.dto.request.RoomCreationRequest;
import com.theatermgnt.theatermgnt.room.dto.request.RoomUpdateRequest;
import com.theatermgnt.theatermgnt.room.dto.response.RoomResponse;
import com.theatermgnt.theatermgnt.room.entity.Room;
import com.theatermgnt.theatermgnt.room.mapper.RoomMapper;
import com.theatermgnt.theatermgnt.room.repository.RoomRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RoomService {
    RoomRepository roomRepository;
    CinemaRepository cinemasRepository;
    RoomMapper roomMapper;

    public RoomResponse createRoom(RoomCreationRequest request) {
        Cinema cinema = cinemasRepository.findById(request.getCinemaId())
                .orElseThrow(() -> new AppException(ErrorCode.CINEMA_NOT_EXISTED));

        if (roomRepository.existsByNameAndCinemaId(request.getName(), request.getCinemaId()))
            throw new AppException(ErrorCode.ROOM_EXISTED);

        Room room = roomMapper.toRoom(request);
        room.setCinema(cinema);
        room.setTotalSeats(0);

        return roomMapper.toRoomResponse(roomRepository.save(room));
    }

    public List<RoomResponse> getRoomsByCinema(String cinemaId) {
        return roomRepository.findByCinemaId(cinemaId).stream()
                .map(roomMapper::toRoomResponse)
                .toList();
    }

    public List<RoomResponse> getRooms() {
        return roomRepository.findAll().stream()
                .map(roomMapper::toRoomResponse)
                .toList();
    }

    public RoomResponse getRoom(String roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_EXISTED));
        return roomMapper.toRoomResponse(room);
    }

    public RoomResponse updateRoom(String roomId, RoomUpdateRequest request) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_EXISTED));

        roomMapper.updateRoom(room, request);
        return roomMapper.toRoomResponse(roomRepository.save(room));
    }

    public void deleteRoom(String roomId) {
        if (!roomRepository.existsById(roomId))
            throw new AppException(ErrorCode.ROOM_NOT_EXISTED);
        roomRepository.deleteById(roomId);
    }
}
