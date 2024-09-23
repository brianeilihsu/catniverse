package com.catniverse.backend.data;

import com.catniverse.backend.model.User;
import com.catniverse.backend.repo.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationListener<ApplicationReadyEvent> {
    private final UserRepo userRepo;

    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        createDefaultUserIfNotExists();
    }

    private void createDefaultUserIfNotExists(){
        for(int i = 1; i <= 5; ++i){
            String defaultEmail = "user" + i + "@gmail.com";
            if(userRepo.existsByEmail(defaultEmail)){continue;}
            User user = new User();
            user.setUsername("User" + i);
            user.setEmail(defaultEmail);
            user.setPassword("123456");
            userRepo.save(user);
            System.out.println("Default User " + i + " created");
        }
    }


}
