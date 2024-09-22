package com.catniverse.backend.request;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
public class CreateUserRequest {
    private String username;
    private String password;
    private String email;
}
