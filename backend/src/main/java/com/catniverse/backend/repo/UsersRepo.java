package com.catniverse.backend.repo;
import com.catniverse.backend.model.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UsersRepo extends JpaRepository<Users, Long>{
    Users findByUsername(String username);
}
