package com.catniverse.backend.service.post;

import com.catniverse.backend.dto.MapDto;
import com.catniverse.backend.dto.PostDto;
import com.catniverse.backend.dto.PostImageDto;
import com.catniverse.backend.exceptions.ResourceNotFoundException;
import com.catniverse.backend.exceptions.SpecitficNameException;
import com.catniverse.backend.model.Post;
import com.catniverse.backend.model.PostImage;
import com.catniverse.backend.repo.PostImageRepo;
import com.catniverse.backend.repo.PostRepo;
import com.catniverse.backend.request.AddPostRequest;
import com.catniverse.backend.service.chart.ImpChartService;
import com.catniverse.backend.service.forbidden.ImpForbiddenService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RequiredArgsConstructor
@Service
public class PostService implements ImpPostService{
    private final ImpChartService chartService;
    private final PostRepo postRepo;
    private final PostImageRepo postImageRepo;
    private final ModelMapper modelMapper;
    private final ImpForbiddenService forbiddenService;


    @Override
    public Post addPost(AddPostRequest addPostRequest) {
        if(forbiddenService.check(addPostRequest.getTitle())||
                forbiddenService.check(addPostRequest.getContent()))
            throw new SpecitficNameException("請不要使用帥哥的名字，你這個傻逼");
        else {
            Post post = new Post();
            post.setTitle(addPostRequest.getTitle());
            post.setContent(addPostRequest.getContent());
            post.setTipped(addPostRequest.isTipped());
            post.setStray(addPostRequest.isStray());
            post.setCity(addPostRequest.getCity());
            post.setDistrict(addPostRequest.getDistrict());
            post.setStreet(addPostRequest.getStreet());
            post.setLatitude(addPostRequest.getLatitude());
            post.setLongitude(addPostRequest.getLongitude());
            post.setUser(addPostRequest.getUser()); // 假設 AddPostRequest 中有 User 物件
            post.setCreatedAt(LocalDateTime.now());

            chartService.update(addPostRequest.getCity(), addPostRequest.getDistrict(), addPostRequest.isTipped(), addPostRequest.isStray());


            // 儲存到資料庫
            return postRepo.save(post);
        }

    }

    @Override
    public void deletePostById(Long id){
        postRepo.findById(id)
                .ifPresentOrElse(postRepo::delete,
                        () -> { throw new ResourceNotFoundException("Post with id " + id + " not found"); });
    }

    @Override
    public Post getPostById(Long id) {
        Optional<Post> postOptional = postRepo.findById(id);
        return postOptional.orElseThrow(()-> new ResourceNotFoundException("Post Not Found with ID: " + id)); // 若找不到則回傳 null
    }

    @Override
    public List<Post> getAllPosts() {
        return postRepo.findAll();
    }

    @Override
    public List<Post> getPostsByUserId(Long userId) {
        return postRepo.findPostsByUserId(userId);
    }

    @Override
    public List<Post> getPostsByTitle(String title) {
        return postRepo.findByTitleContainingIgnoreCase(title);
    }

    @Override
    public List<Post> findByCity(String city) {
        return postRepo.findByCity(city);
    }

    @Override
    public List<PostDto> getConvertedPosts(List<Post> posts) {
        return posts.stream().map(this::convertToDto).toList();
    }


    @Override
    public PostDto convertToDto(Post post) {
        PostDto postDto = modelMapper.map(post, PostDto.class);
        List<PostImage> postImages = postImageRepo.findByPostId(post.getId());
        List<PostImageDto> postImagesDto = postImages.stream()
                .map(postImage -> modelMapper.map(postImage, PostImageDto.class))
                .toList();
        postDto.setPostImages(postImagesDto);
        postDto.setUserId(post.getUser().getId());
        postDto.setTotal_likes(post.getLikes().size());
        postDto.setTotal_comments(post.getComments().size());
        return postDto;
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
