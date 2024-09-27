package com.catniverse.backend.service.userAvatar;

import com.catniverse.backend.exceptions.ResourceNotFoundException;
import com.catniverse.backend.model.UserAvatar;
import com.catniverse.backend.repo.UserAvatarRepo;
import com.catniverse.backend.service.user.ImpUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.sql.rowset.serial.SerialBlob;
import java.io.IOException;
import java.sql.SQLException;

@Service
@RequiredArgsConstructor
public class UserAvatarService implements ImpUserAvatarService{
    private final UserAvatarRepo userAvatarRepo;
    private final ImpUserService userService;

    @Override
    public UserAvatar getUserAvatarById(Long id) {
        return userAvatarRepo.findById(id).orElse(null);
    }

    @Override
    public void clearUserAvatarById(Long id) {
        UserAvatar userAvatar = userAvatarRepo.findById(id).orElse(null);
        if (userAvatar != null) {
            userAvatar.setFileName(null);
            userAvatar.setFileType(null);
            userAvatar.setDownloadUrl(null);
            userAvatar.setImage(null);
            userAvatarRepo.save(userAvatar);
        }
    }

    @Override
    public void updateUserAvatarById(MultipartFile file, Long id) {

        try {
            UserAvatar userAvatar = userAvatarRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("User Avatar Not Found"));
            userAvatar.setFileName(file.getOriginalFilename());
            userAvatar.setFileType(file.getContentType());
            userAvatar.setImage(new SerialBlob(file.getBytes()));
            String buildDownloadUrl = "/api/v1/user-avatar/download/";
            String downloadUrl = buildDownloadUrl + id;
            userAvatar.setDownloadUrl(downloadUrl);
            userAvatarRepo.save(userAvatar);
        } catch (IOException | SQLException e) {
            throw new RuntimeException(e.getMessage());
        }

    }
}
