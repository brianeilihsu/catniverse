package com.catniverse.backend.service.user;

import com.catniverse.backend.dto.UserDto;
import com.catniverse.backend.exceptions.AlreadyExistsException;
import com.catniverse.backend.exceptions.ResourceNotFoundException;
import com.catniverse.backend.model.User;
import com.catniverse.backend.repo.UserRepo;
import com.catniverse.backend.request.CreateUserRequest;
import com.catniverse.backend.request.UserUpdateRequest;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService implements ImpUserService{
    private final UserRepo userRepo;
    private final ModelMapper modelMapper;
    private final PasswordEncoder passwordEncoder;


    @Override
    public User getUserById(Long userId) {
        return userRepo.findById(userId)
                .orElseThrow(()-> new ResourceNotFoundException("User not found"));
    }

    @Override
    public User getUserByEmail(String email) {
        return userRepo.findByEmail(email);
    }

    @Override
    public User createUser(CreateUserRequest request) {
        return Optional.of(request)
                .filter(user -> !userRepo.existsByEmail(request.getEmail()))
                .map(req ->{
                    User user = new User();
                    user.setUsername(req.getUsername());
                    user.setEmail(request.getEmail());
                    user.setPassword(passwordEncoder.encode(request.getPassword()));
                    return userRepo.save(user);
                }).orElseThrow(()-> new AlreadyExistsException("Oops! " + request.getEmail() + "User already exists"));
    }

    @Override
    public User updateUser(UserUpdateRequest request, Long userId) {
        return userRepo.findById(userId).map(existingUser -> {
            existingUser.setUsername(request.getUsername());
            return userRepo.save(existingUser);
        }).orElseThrow(()-> new ResourceNotFoundException("User not found"));
    }

    @Override
    public void deleteUser(Long userId) {
        userRepo.findById(userId).ifPresentOrElse(userRepo :: delete, ()-> {
            throw new ResourceNotFoundException("User not found");
        });
    }

    @Override
    public UserDto convertUserToDto(User user) {
        return modelMapper.map(user, UserDto.class);
    }

    @Override
    public User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepo.findByEmail(email);
    }
}
