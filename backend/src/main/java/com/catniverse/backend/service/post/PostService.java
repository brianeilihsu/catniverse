package com.catniverse.backend.service.post;

import com.catniverse.backend.dto.MapDto;
import com.catniverse.backend.dto.PostDto;
import com.catniverse.backend.dto.PostImageDto;
import com.catniverse.backend.exceptions.ResourceNotFoundException;
import com.catniverse.backend.exceptions.SpecitficNameException;
import com.catniverse.backend.model.Post;
import com.catniverse.backend.model.PostImage;
import com.catniverse.backend.model.Post;
import com.catniverse.backend.repo.PostImageRepo;
import com.catniverse.backend.repo.PostRepo;
import com.catniverse.backend.request.AddPostRequest;
import com.catniverse.backend.service.chart.ImpChartService;
import com.catniverse.backend.service.forbidden.ImpForbiddenService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

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
                .ifPresentOrElse(post ->{
                            chartService.delete(post.getCity(), post.getDistrict(), post.isTipped(), post.isStray());
                            postRepo.deleteById(id);
                        },
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
    public List<PostDto> getPopularPosts(int page) {
        int pageSize = 5; // 每頁顯示的貼文數量
        Pageable pageable = PageRequest.of(page, pageSize);

        // 自定義查詢分頁後的熱門貼文，並按總受歡迎度 (total_likes + total_comments) 降序排序
        Page<Post> postPage = postRepo.findAll(pageable);

        // 將貼文按總受歡迎度排序後，轉換為 DTO 格式
        return postPage.stream()
                .map(this::convertToDto) // 先轉換為 DTO
                .sorted((dto1, dto2) -> Integer.compare(
                        (dto2.getTotal_likes() + dto2.getTotal_comments()), // 比較 DTO 的受歡迎度
                        (dto1.getTotal_likes() + dto1.getTotal_comments())))
                .collect(Collectors.toList());
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
