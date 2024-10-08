package com.catniverse.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.Date;
import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CatInfo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long catId;
    private boolean isCaptured = false;
    private Date shelterEntryDate;
    private Date foundedDate;
    private String foundedCity;
    private String foundedTown;
    private String shelterLocation;
    private String breed;
    private String size;
    private String gender;
    private String description;

}
