package com.catniverse.backend.repo;
import com.catniverse.backend.model.Test;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TestRepo  extends JpaRepository<Test,Long> {
}
