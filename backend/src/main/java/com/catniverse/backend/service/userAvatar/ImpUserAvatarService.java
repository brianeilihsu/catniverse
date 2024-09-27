package com.catniverse.backend.service.userAvatar;

import com.catniverse.backend.model.UserAvatar;
import org.springframework.web.multipart.MultipartFile;

public interface ImpUserAvatarService {
    UserAvatar getUserAvatarById(Long id);
    void clearUserAvatarById(Long id);
    void updateUserAvatarById(MultipartFile file, Long id);
}
