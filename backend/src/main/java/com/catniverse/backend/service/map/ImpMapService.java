package com.catniverse.backend.service.map;

import com.catniverse.backend.dto.MapDto;
import com.catniverse.backend.model.Post;

import java.util.List;

public interface ImpMapService {
    List<Post> findByCity(String city);

    List<MapDto> getConvertedMaps(List<Post> posts);

    MapDto convertToMapDto(Post post);
}
