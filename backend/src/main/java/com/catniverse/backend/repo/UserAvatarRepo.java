package com.catniverse.backend.repo;

import com.catniverse.backend.model.UserAvatar;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserAvatarRepo extends JpaRepository<UserAvatar, Long> {
}
