package com.theatermgnt.theatermgnt.room.entity;

import jakarta.persistence.*;

import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;

import com.theatermgnt.theatermgnt.cinema.entity.Cinema;
import com.theatermgnt.theatermgnt.common.entity.BaseEntity;
import com.theatermgnt.theatermgnt.common.enums.RoomType;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "rooms")
@SQLDelete(sql = "UPDATE rooms SET deleted = true WHERE id = ?")
@Where(clause = "deleted = false")
public class Room extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cinemaId", nullable = false)
    Cinema cinema;

    String name;

    @Enumerated(EnumType.STRING)
    RoomType roomType;

    Integer totalSeats;
}
