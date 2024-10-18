package com.catniverse.backend.service.chart;

import com.catniverse.backend.dto.ChartCityDto;
import com.catniverse.backend.model.Chart;
import com.catniverse.backend.repo.ChartRepo;
import com.catniverse.backend.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.*;


@Service
@RequiredArgsConstructor
public class ChartService implements ImpChartService {
    private final ChartRepo chartRepo;
    private ArrayList<String> TaiwanCitys = new ArrayList<>(Arrays.asList(
            "臺北市", "新北市", "桃園市", "台中市", "臺南市", "高雄市", "基隆市", "新竹市", "嘉義市",
            "宜蘭縣", "新竹縣", "苗栗縣", "彰化縣", "南投縣", "雲林縣", "嘉義縣", "屏東縣",
            "臺東縣", "花蓮縣", "澎湖縣", "金門縣", "連江縣"
    ));

    @Override
    public void update(String city, String district, boolean tipped, boolean stray) {
        System.out.println("chart Service before chart");
        Chart chart = chartRepo.findByCityAndDistrict(city, district);
        System.out.println("chart Service after chart");
        System.out.println(city);
        System.out.println(district);
        if (chart == null) {
            throw new RuntimeException("Chart not found with name " + city + " and district " + district);
        }
        chart.setTotal_cat(chart.getTotal_cat() + 1);
        if(tipped){
            chart.setTotal_tipped(chart.getTotal_tipped() + 1);
        }
        if(stray){
            chart.setTotal_stray(chart.getTotal_stray() + 1);
            if(tipped){
                chart.setTotal_tipped_stray(chart.getTotal_tipped_stray() + 1);
            }
        }
        chartRepo.save(chart);
    }

    @Override
    public List<Chart> getCityData(String city) {
        return chartRepo.findByCity(city);
    }

    @Override
    public List<ChartCityDto> getAllData() {
        List<ChartCityDto> chartCityDtos = new ArrayList<>();
        for(String city : TaiwanCitys){
            List<Chart> charts = chartRepo.findByCity(city);
            ChartCityDto cityDto = new ChartCityDto(city);
            charts.stream().forEach(chart -> {
                cityDto.setTotal_cat(cityDto.getTotal_cat() + chart.getTotal_cat());
                cityDto.setTotal_tipped(cityDto.getTotal_tipped() + chart.getTotal_tipped());
                cityDto.setTotal_stray(cityDto.getTotal_stray() + chart.getTotal_stray());
                cityDto.setTotal_tipped_stray(cityDto.getTotal_tipped_stray() + chart.getTotal_tipped_stray());
            });
            chartCityDtos.add(cityDto);
        }
        return chartCityDtos;
    }
}
