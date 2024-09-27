package com.catniverse.backend.service.userAvatar;

import com.catniverse.backend.model.UserAvatar;
import com.catniverse.backend.repo.UserAvatarRepo;
import com.catniverse.backend.service.user.ImpUserService;
import com.catniverse.backend.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

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
        UserAvatar userAvatar = userAvatarRepo.findById(id).orElse(null);
        if (userAvatar != null) {
            userAvatar.setFileName(file.getOriginalFilename());
            userAvatar.setFileType(file.getContentType());
            String buildDownloadUrl = "/api/v1/user-avatar/download/";
            String downloadUrl = buildDownloadUrl + id;
            userAvatar.setDownloadUrl(downloadUrl);
            userAvatarRepo.save(userAvatar);
        }
    }
}
