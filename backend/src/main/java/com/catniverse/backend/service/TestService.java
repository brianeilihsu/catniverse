package com.catniverse.backend.service;

import com.catniverse.backend.model.Test;
import com.catniverse.backend.repo.TestRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Service
public class TestService {
    @Autowired
    private TestRepo repo;

    public Test findTestById(long id) { return repo.findById(id).orElse(null);
    }

    public List<Test> getAllTests() {
        return repo.findAll();
    }

    public void save(Test test) {
        repo.save(test);
    }

    public Test addTest(Test test, MultipartFile imageFile) throws IOException {
        //防止有人throw shit
        List<String> allowedContentTypes = Arrays.asList("image/png", "image/jpeg", "image/jpg");

        test.setImageName(imageFile.getOriginalFilename());

        if(allowedContentTypes.contains(imageFile.getContentType())){
            test.setImageType(imageFile.getContentType());
        }
        else
            throw new IllegalArgumentException("Invalid file type. Only PNG and JPG images are allowed.");



        test.setImageDate(imageFile.getBytes());
        return repo.save(test);
    }

}
