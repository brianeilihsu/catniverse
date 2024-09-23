package com.catniverse.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Collection;
import java.util.HashSet;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String roleName;

    public Role(String roleName) {
        this.roleName = roleName;
    }

    @ManyToMany(mappedBy = "roles")
    private Collection<User> users = new HashSet<>();
}
