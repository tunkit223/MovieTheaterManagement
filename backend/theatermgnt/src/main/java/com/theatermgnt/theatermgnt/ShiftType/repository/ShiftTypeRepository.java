package com.theatermgnt.theatermgnt.ShiftType.repository;

import com.theatermgnt.theatermgnt.ShiftType.entity.ShiftType;
import feign.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface ShiftTypeRepository extends JpaRepository<ShiftType, String> {

    List<ShiftType> findByCinemaId(String cinemaId);

    Optional<ShiftType> findByIdAndCinemaId(String id, String cinemaId);

    boolean existsByCinemaIdAndNameIgnoreCase(String cinemaId, String name);
    @Query("""
    SELECT s FROM ShiftType s
    WHERE s.cinemaId = :cinemaId
      AND s.isActive = true
      AND (
            (:start < s.endTime AND :end > s.startTime)
          )
""")
    List<ShiftType> findOverlappingShifts(
            @Param("cinemaId") String cinemaId,
            @Param("start") LocalTime start,
            @Param("end") LocalTime end
    );

}
