package com.catniverse.backend.service.user;

import com.catniverse.backend.dto.UserDto;
import com.catniverse.backend.model.User;
import com.catniverse.backend.request.CreateUserRequest;
import com.catniverse.backend.request.UserUpdateRequest;

public interface ImpUserService {
    User getUserById(Long userId);
    User createUser(CreateUserRequest request);
    User updateUser(UserUpdateRequest request, Long userId);
    void deleteUser(Long userId);

    UserDto convertUserToDto(User user);

    User getAuthenticatedUser();
}
