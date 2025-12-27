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

    // --- 5. SEARCH (NOUL SEARCH STANDARDIZAT) ---
    // Am înlocuit vechea ta metodă cu aceasta care folosește JPQL
    // Avantaje:
    // 1. Folosește LOWER() -> găsește "Sabin" chiar dacă scrii "sa" sau "SA"
    // 2. Caută și după GRAD (ex: dacă scrii "Age" găsește "Agent")
    // 3. Folosește 'LIKE ... %' -> Găsește doar ce ÎNCEPE cu textul dat
    @Query("SELECT p FROM Politist p WHERE " +
            "LOWER(p.nume) LIKE LOWER(CONCAT(:termen, '%')) OR " +
            "LOWER(p.prenume) LIKE LOWER(CONCAT(:termen, '%')) OR " +
            "LOWER(p.grad) LIKE LOWER(CONCAT(:termen, '%'))")
    List<Politist> cautaDupaInceput(@Param("termen") String termen);

}