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

    // --- 1. SELECT (Păstrat din codul tău) ---
    @Query(value = "SELECT * FROM Politisti", nativeQuery = true)
    List<Politist> toataListaPolitisti();

    // --- 2. INSERT (Păstrat din codul tău - Excelent pentru punctaj) ---
    @Modifying
    @Transactional
    @Query(value = "INSERT INTO Politisti (nume, prenume, grad, functie, telefon_serviciu) " +
            "VALUES (:nume, :prenume, :grad, :functie, :telefon)", nativeQuery = true)
    void adaugaPolitistManual(@Param("nume") String nume,
                              @Param("prenume") String prenume,
                              @Param("grad") String grad,
                              @Param("functie") String functie,
                              @Param("telefon") String telefon);

    // --- 3. DELETE (Păstrat din codul tău) ---
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM Politisti WHERE id_politist = :id", nativeQuery = true)
    void stergePolitistManual(@Param("id") Integer id);

    java.util.Optional<Politist> findByNume(String nume);

    // --- 4. UPDATE (Păstrat din codul tău) ---
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

    // --- 5. SEARCH (SQL NATIV - FĂRĂ JPQL) ---
    @Query(value = "SELECT * FROM Politisti WHERE " +
            "LOWER(nume) LIKE LOWER(CONCAT(:termen, '%')) OR " +
            "LOWER(prenume) LIKE LOWER(CONCAT(:termen, '%')) OR " +
            "LOWER(grad) LIKE LOWER(CONCAT(:termen, '%'))", nativeQuery = true)
    List<Politist> cautaDupaInceput(@Param("termen") String termen);

    @Query(value = "SELECT * FROM Politisti WHERE id_politist = :id", nativeQuery = true)
    java.util.Optional<Politist> findByIdNative(@Param("id") Integer id);

}