package com.catniverse.backend.service.post;

import com.catniverse.backend.dto.PostDto;
import com.catniverse.backend.dto.PostImageDto;
import com.catniverse.backend.exceptions.ResourceNotFoundException;
import com.catniverse.backend.exceptions.SpecitficNameException;
import com.catniverse.backend.model.Post;
import com.catniverse.backend.model.PostImage;
import com.catniverse.backend.repo.PostImageRepo;
import com.catniverse.backend.repo.PostRepo;
import com.catniverse.backend.request.AddPostRequest;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RequiredArgsConstructor
@Service
public class PostService implements ImpPostService{
    private final PostRepo postRepo;
    private final PostImageRepo postImageRepo;
    private final ModelMapper modelMapper;


    @Override
    public Post addPost(AddPostRequest addPostRequest) {
        if(addPostRequest.getTitle().contains("許皓翔")||
            addPostRequest.getTitle().contains("許皓翔") )
            throw new SpecitficNameException("請不要使用帥哥的名字，你這個傻逼");
        Post post = new Post();
        post.setTitle(addPostRequest.getTitle());
        post.setContent(addPostRequest.getContent());
        post.setAddress(addPostRequest.getAddress());
        post.setUser(addPostRequest.getUser()); // 假設 AddPostRequest 中有 User 物件
        post.setCreatedAt(LocalDateTime.now());

        // 儲存到資料庫
        return postRepo.save(post);
    }

    @Override
    public Post getPostById(Long id) {
        Optional<Post> postOptional = postRepo.findById(id);
        return postOptional.orElseThrow(()-> new ResourceNotFoundException("Post Not Found")); // 若找不到則回傳 null
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
        return postDto;
    }
}
