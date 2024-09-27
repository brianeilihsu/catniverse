package com.catniverse.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.sql.Blob;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "user_avatar")
public class UserAvatar {

    @Id
    private Long id;  // 主鍵欄位，將與 User 的主鍵一致
    private String fileName;
    private String fileType;
    private String downloadUrl;

    @Lob
    private Blob image;

    @OneToOne
    @MapsId  // 表示使用 User 的主鍵作為自己的主鍵
    @JoinColumn(name = "user_id")  // 外鍵名
    private User user;
}

