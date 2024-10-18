package com.catniverse.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
public class Chart {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String city;
    private String district;

    private int total_cat;
    private int total_tipped;
    private int total_stray;
    private int total_tipped_stray;

    public Chart(String city, String district) {
        this.city = city;
        this.district = district;
        this.total_cat = 0;
        this.total_tipped = 0;
        this.total_stray = 0;
        this.total_tipped_stray = 0;
    }
}
