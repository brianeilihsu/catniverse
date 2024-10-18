package com.catniverse.backend.dto;

import lombok.Data;

@Data
public class ChartCityDto {

    private String city;
    private int total_cat;
    private int total_tipped;
    private int total_stray;
    private int total_tipped_stray;
    public ChartCityDto(String city){
        this.city = city;
        this.total_cat = 0;
        this.total_tipped = 0;
        this.total_stray = 0;
        this.total_tipped_stray = 0;
    }
}
