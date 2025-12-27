package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.repository;

import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities.Adresa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AdresaRepository extends JpaRepository<Adresa, Integer> {

    // NOU: Căutare SQL optimizată ("Starts With")
    @Query("SELECT a FROM Adresa a WHERE " +
            "LOWER(a.strada) LIKE LOWER(CONCAT(:termen, '%')) OR " +
            "LOWER(a.localitate) LIKE LOWER(CONCAT(:termen, '%')) OR " +
            "LOWER(a.judetSauSector) LIKE LOWER(CONCAT(:termen, '%'))")
    List<Adresa> cautaDupaInceput(@Param("termen") String termen);
}