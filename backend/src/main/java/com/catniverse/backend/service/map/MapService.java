package com.catniverse.backend.service.map;

import com.catniverse.backend.dto.MapDto;
import com.catniverse.backend.exceptions.ResourceNotFoundException;
import com.catniverse.backend.model.Post;
import com.catniverse.backend.model.PostImage;
import com.catniverse.backend.repo.PostImageRepo;
import com.catniverse.backend.repo.PostRepo;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class MapService implements ImpMapService{
    private final ModelMapper modelMapper;
    private final PostRepo postRepo;
    private final PostImageRepo postImageRepo;

    @Override
    public List<Post> findByCity(String city) {
        List<Post> posts = postRepo.findByCity(city);
        return postRepo.findByCity(city);
    }

    @Override
    public List<MapDto> getConvertedMaps(List<Post> posts) {
        return posts.stream().map(this::convertToMapDto).toList();
    }

    @Override
    public MapDto convertToMapDto(Post post) {
        MapDto mapDto = modelMapper.map(post, MapDto.class);
        List<PostImage> postImages = postImageRepo.findByPostId(post.getId());
        mapDto.setPostId(post.getId());
        mapDto.setDownloadUrl(postImages.getFirst().getDownloadUrl());
        return mapDto;
    }
}
