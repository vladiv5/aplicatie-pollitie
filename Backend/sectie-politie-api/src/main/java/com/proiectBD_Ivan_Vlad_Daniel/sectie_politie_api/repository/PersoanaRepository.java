package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.repository;

import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities.Persoana;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PersoanaRepository extends JpaRepository<Persoana, Integer> {

    // SQL Custom (JPQL) pentru "Starts With"
    // LOWER() asigură că nu contează dacă scrii cu litere mari sau mici
    @Query("SELECT p FROM Persoana p WHERE " +
            "LOWER(p.nume) LIKE LOWER(CONCAT(:termen, '%')) OR " +
            "LOWER(p.prenume) LIKE LOWER(CONCAT(:termen, '%')) OR " +
            "p.cnp LIKE CONCAT(:termen, '%')")
    List<Persoana> cautaDupaInceput(@Param("termen") String termen);
}