package com.catniverse.backend.controller;

import com.catniverse.backend.dto.ChartDto;
import com.catniverse.backend.dto.MapDto;
import com.catniverse.backend.model.Chart;
import com.catniverse.backend.model.Post;
import com.catniverse.backend.response.ApiResponse;
import com.catniverse.backend.service.chart.ImpChartService;
import com.catniverse.backend.service.map.ImpMapService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin
@RequiredArgsConstructor
@RestController
@RequestMapping("${api.prefix}/map")
public class MapController {
    private final ImpMapService mapService;
    private final ImpChartService chartService;

    @GetMapping("/region")
    public ResponseEntity<ApiResponse> getMapPosts(@RequestParam String city) {
        try {
            List<Post> posts = mapService.findByCity(city);
            List<MapDto> mapDtos = mapService.getConvertedMaps(posts);

            return ResponseEntity.ok(new ApiResponse("get map posts success", mapDtos));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ApiResponse("get map posts error", null));
        }
    }

    @GetMapping("/density")
    public ResponseEntity<ApiResponse> getDensity(){
        try {
            List<Chart> charts = chartService.findAll();
            return ResponseEntity.ok(new ApiResponse("Success", charts));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ApiResponse("get density data error", null));

        }
    }
}
