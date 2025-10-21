package org.example.model;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;

@JsonIgnoreProperties(ignoreUnknown = true)
@Data
@Entity
@Table(name="stop")
public class BusStop {
    @Id
    @JsonProperty("id")
    private Long id;

    @JsonProperty("lat")
    private double lat;

    @JsonProperty("lon")
    private double lon;

//  Done with the data so no need @Embedded tag
    @Embedded
    @JsonProperty("tags")
    private Tag tag;
    @Column(insertable=false, updatable=false)
    private String name;

    @Column(insertable=false, updatable=false)
    private String bench;

    @Column(insertable=false, updatable=false)
    private String shelter;
}
