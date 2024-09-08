package com.catniverse.backend.controller;

import com.catniverse.backend.model.Test;
import com.catniverse.backend.service.TestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/test")
@CrossOrigin
public class TestController {
    @Autowired
    private TestService service;
    @RequestMapping("/")
    public String greet(){
        return "TestController working well...";
    }
    @GetMapping("/{id}")
    public ResponseEntity<Test> getPostById(@PathVariable long id) {
        Test test = service.findTestById(id);
        if (test == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(test, HttpStatus.OK);
    }

    @GetMapping("/all")
    public ResponseEntity<List<Test>> getAllTests(){
        return new ResponseEntity<>(service.getAllTests(), HttpStatus.FOUND);
    }

    @GetMapping("/{imageId}/image")
    public ResponseEntity<byte[]> getImageByImageId(@PathVariable long imageId){
        Test test = service.findTestById(imageId);
        byte[] imageFile = test.getImageDate();
        return ResponseEntity.ok().contentType(MediaType.valueOf(test.getImageType())).body(imageFile);

    }

    @PostMapping("/addTest") //@RequestBody處理一般資料 not image
    public ResponseEntity<?> addTest(@RequestPart Test test, @RequestPart MultipartFile imageFile){
        try{
            Test saveTest = service.addTest(test, imageFile);
            return new ResponseEntity<>(saveTest, HttpStatus.CREATED);
        }
        catch (Exception e){
            return new ResponseEntity<>(e.getMessage(),HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

}
