package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.repository;

import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities.Incident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, Integer> {

    @Query("SELECT i FROM Incident i WHERE " +
            "LOWER(i.tipIncident) LIKE LOWER(CONCAT(:termen, '%')) OR " +
            "LOWER(i.descriereLocatie) LIKE LOWER(CONCAT(:termen, '%')) OR " +
            "LOWER(i.politistResponsabil.nume) LIKE LOWER(CONCAT(:termen, '%'))")
    List<Incident> cautaDupaInceput(@Param("termen") String termen);
}