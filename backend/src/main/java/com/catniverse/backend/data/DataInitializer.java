package com.catniverse.backend.data;

import com.catniverse.backend.exceptions.ResourceNotFoundException;
import com.catniverse.backend.model.Role;
import com.catniverse.backend.model.User;
import com.catniverse.backend.repo.UserRepo;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.NoSuchElementException;
import java.util.Set;

@Transactional
@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationListener<ApplicationReadyEvent> {
    private final UserRepo userRepo;
    private final RoleRepo roleRepo;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        Set<String> defaultRoles = Set.of("ROLE_ADMIN", "ROLE_USER");
        createDefaultRoleIfNotExists(defaultRoles);
        createDefaultUserIfNotExists();
        createDefaultAdminIfNotExists();
    }

    private void createDefaultUserIfNotExists(){
        Role userRole = roleRepo.findByName("ROLE_USER")
                .orElseThrow(() -> new NoSuchElementException("Role 'ROLE_USER' not found"));
        for(int i = 1; i <= 5; ++i){
            String defaultEmail = "user" + i + "@gmail.com";
            if(userRepo.existsByEmail(defaultEmail)){continue;}
            User user = new User();
            user.setUsername("User" + i);
            user.setEmail(defaultEmail);
            user.setPassword(passwordEncoder.encode("123456"));
            user.setRoles(Set.of(userRole));
            userRepo.save(user);
            System.out.println("Default User " + i + " created");
        }
    }
    private void createDefaultAdminIfNotExists(){
        Role adminRole = roleRepo.findByName("ROLE_ADMIN")
                .orElseThrow(() -> new NoSuchElementException("Role 'ROLE_ADMIN' not found"));
        for (int i = 1; i<=2; i++){
            String defaultEmail = "admin"+i+"@email.com";
            if (userRepo.existsByEmail(defaultEmail)){
                continue;
            }
            User user = new User();
            user.setUsername("Admin" + i);
            user.setEmail(defaultEmail);
            user.setPassword(passwordEncoder.encode("123456"));
            user.setRoles(Set.of(adminRole));
            userRepo.save(user);
            System.out.println("Default admin user " + i + " created successfully.");
        }
    }
    private void createDefaultRoleIfNotExists(Set<String> roles){
        roles.stream()
                .filter(role -> roleRepo.findByName(role).isEmpty())
                .map(Role:: new).forEach(roleRepo::save);

    }

}
