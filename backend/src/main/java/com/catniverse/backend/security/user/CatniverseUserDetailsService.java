package com.catniverse.backend.security.user;

import com.catniverse.backend.model.User;
import com.catniverse.backend.repo.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@RequiredArgsConstructor
@Service
public class CatniverseUserDetailsService implements UserDetailsService {
    private final UserRepo userRepo;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = Optional.ofNullable(userRepo.findByEmail(email))
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return CatniverseUserDetails.buildUserDetails(user);
    }
}
