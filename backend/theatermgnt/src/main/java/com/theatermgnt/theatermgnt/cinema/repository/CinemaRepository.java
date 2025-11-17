package com.theatermgnt.theatermgnt.cinema.repository;

import com.theatermgnt.theatermgnt.cinema.entity.Cinema;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CinemaRepository extends JpaRepository<Cinema,String> {
    boolean existsByName(String name);
}
