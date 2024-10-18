package com.catniverse.backend.repo;

import com.catniverse.backend.model.Chart;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChartRepo extends JpaRepository<Chart, Long> {
    Chart findByCityAndDistrict(String city, String district);
    List<Chart> findByCity(String city);
}
