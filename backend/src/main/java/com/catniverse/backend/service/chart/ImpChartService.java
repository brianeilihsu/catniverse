package com.catniverse.backend.service.chart;

import com.catniverse.backend.dto.ChartCityDto;
import com.catniverse.backend.model.Chart;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public interface ImpChartService {
    public void update(String city, String district, boolean tipped, boolean stray);
    public List<Chart> getCityData(String city);
    public List<ChartCityDto> getAllData();
}
