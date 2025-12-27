package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.repository;

import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities.Amenda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Map;
import org.springframework.data.repository.query.Param;

@Repository
public interface AmendaRepository extends JpaRepository<Amenda, Integer> {
    @Query(value = "SELECT " +
            "P.nume AS numePolitist, " +
            "P.prenume AS prenumePolitist,  " +
            "Pers.nume AS numePersoana, " +
            "Pers.prenume AS prenumePersoana, " +
            "Amenzi.suma, " +
            "Amenzi.data_emitere " +
            "FROM " +
            "Amenzi " +
            "JOIN Politisti P ON Amenzi.id_politist = P.id_politist " +
            "JOIN Persoane Pers ON Amenzi.id_persoana = Pers.id_persoana ", nativeQuery = true)
    List<Map<String, Object>> raportAmenzi();

    @Query("SELECT a FROM Amenda a WHERE " +
            "LOWER(a.motiv) LIKE LOWER(CONCAT(:termen, '%')) OR " +
            "LOWER(a.politist.nume) LIKE LOWER(CONCAT(:termen, '%')) OR " +
            "LOWER(a.persoana.nume) LIKE LOWER(CONCAT(:termen, '%'))")
    List<Amenda> cautaDupaInceput(@Param("termen") String termen);
}