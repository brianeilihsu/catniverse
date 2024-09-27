package com.catniverse.backend.controller;

import com.catniverse.backend.exceptions.ResourceNotFoundException;
import com.catniverse.backend.model.PostImage;
import com.catniverse.backend.model.UserAvatar;
import com.catniverse.backend.response.ApiResponse;
import com.catniverse.backend.service.userAvatar.ImpUserAvatarService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.sql.SQLException;

import static org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@CrossOrigin
@RequiredArgsConstructor
@RestController
@RequestMapping("${api.prefix}/user-avatar")
public class UserAvatarController {
    private final ImpUserAvatarService userAvatarService;

    @Transactional
    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadImage(@PathVariable Long id) throws SQLException {
        UserAvatar userAvatar = userAvatarService.getUserAvatarById(id);
        ByteArrayResource resource = new ByteArrayResource(userAvatar.getImage().getBytes(1, (int) userAvatar.getImage().length()));
        return  ResponseEntity.ok().contentType(MediaType.parseMediaType(userAvatar.getFileType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + userAvatar.getFileName() + "\"")
                .body(resource);
    }

    @PutMapping("/{id}/update")
    public ResponseEntity<ApiResponse> updateImage(@PathVariable Long id,
                                                   @RequestBody MultipartFile file){
        try {
            UserAvatar userAvatar = userAvatarService.getUserAvatarById(id);
            if(userAvatar != null){
                userAvatarService.updateUserAvatarById(file, id);
                return ResponseEntity.ok(new ApiResponse("Update success", null));
            }
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(NOT_FOUND).body(new ApiResponse(e.getMessage(), null));
        }
        return ResponseEntity.status(INTERNAL_SERVER_ERROR).body(new ApiResponse("Update failed", INTERNAL_SERVER_ERROR));
    }
}
