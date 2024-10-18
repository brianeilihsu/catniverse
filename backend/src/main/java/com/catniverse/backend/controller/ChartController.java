package com.catniverse.backend.controller;


import com.catniverse.backend.dto.ChartCityDto;
import com.catniverse.backend.model.Chart;
import com.catniverse.backend.response.ApiResponse;
import com.catniverse.backend.service.chart.ImpChartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@CrossOrigin
@RequiredArgsConstructor
@RestController
@RequestMapping("${api.prefix}/chart")
public class ChartController {
    private final ImpChartService chartService;
    //private ArrayList<String> default_city = new ArrayList<>();

    @GetMapping("/stray/all")
    public ResponseEntity<ApiResponse> getAll(){
        List<ChartCityDto> chartCityDtos = chartService.getAllData();

        return ResponseEntity.ok().body(new ApiResponse("success", chartCityDtos));
    }

    @GetMapping("/{city}")
    public ResponseEntity<ApiResponse> getCity(@PathVariable("city") String city) {
        List<Chart> charts = chartService.getCityData(city);
        return ResponseEntity.ok().body(new ApiResponse("success", charts));
    }
}
