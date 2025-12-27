package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.repository;

import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities.Politist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Repository
public interface PolitistRepository extends JpaRepository<Politist, Integer> {

    // --- 1. SELECT ---
    @Query(value = "SELECT * FROM Politisti", nativeQuery = true)
    List<Politist> toataListaPolitisti();

    // --- 2. INSERT ---
    @Modifying
    @Transactional
    @Query(value = "INSERT INTO Politisti (nume, prenume, grad, functie, telefon_serviciu) " +
            "VALUES (:nume, :prenume, :grad, :functie, :telefon)", nativeQuery = true)
    void adaugaPolitistManual(@Param("nume") String nume,
                              @Param("prenume") String prenume,
                              @Param("grad") String grad,
                              @Param("functie") String functie,
                              @Param("telefon") String telefon);

    // --- 3. DELETE ---
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM Politisti WHERE id_politist = :id", nativeQuery = true)
    void stergePolitistManual(@Param("id") Integer id);
    java.util.Optional<Politist> findByNume(String nume);

    // --- 4. UPDATE ---
    @Modifying
    @Transactional
    @Query(value = "UPDATE Politisti SET nume = :nume, prenume = :prenume, grad = :grad, functie = :functie, telefon_serviciu = :telefon_serviciu " +
            "WHERE id_politist = :id_politist", nativeQuery = true)
    void updatePolitist(@Param("id_politist") Integer id_politist,
                        @Param("nume") String nume,
                        @Param("prenume") String prenume,
                        @Param("grad") String grad,
                        @Param("functie") String functie,
                        @Param("telefon_serviciu") String telefon_serviciu);

    // --- 5. SEARCH  ---
    @Query(value = "SELECT * FROM Politisti WHERE nume LIKE :termen + '%' OR prenume LIKE :termen + '%'", nativeQuery = true)
    List<Politist> cautaPolitistiDupaNume(@Param("termen") String termen);

}