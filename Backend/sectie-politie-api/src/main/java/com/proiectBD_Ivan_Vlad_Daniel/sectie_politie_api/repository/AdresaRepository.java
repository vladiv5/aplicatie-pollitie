package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.repository;

import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities.Adresa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdresaRepository extends JpaRepository<Adresa, Integer> {

    // SELECT ALL
    @Query(value = "SELECT * FROM Adrese", nativeQuery = true)
    List<Adresa> getAllAdreseNative();

    // SELECT BY ID
    @Query(value = "SELECT * FROM Adrese WHERE id_adresa = :id", nativeQuery = true)
    Optional<Adresa> getAdresaByIdNative(@Param("id") Integer id);

    // --- INSERT (Corectat numele coloanei: judet_sau_sector) ---
    @Modifying
    @Transactional
    @Query(value = "INSERT INTO Adrese (judet_sau_sector, localitate, strada, numar, bloc, apartament) " +
            "VALUES (:judet, :localitate, :strada, :numar, :bloc, :ap)", nativeQuery = true)
    void insertAdresa(@Param("judet") String judet,
                      @Param("localitate") String localitate,
                      @Param("strada") String strada,
                      @Param("numar") String numar,
                      @Param("bloc") String bloc,
                      @Param("ap") Integer ap);

    // --- UPDATE (Corectat numele coloanei: judet_sau_sector) ---
    @Modifying
    @Transactional
    @Query(value = "UPDATE Adrese SET judet_sau_sector = :judet, localitate = :localitate, strada = :strada, " +
            "numar = :numar, bloc = :bloc, apartament = :ap WHERE id_adresa = :id", nativeQuery = true)
    void updateAdresa(@Param("id") Integer id,
                      @Param("judet") String judet,
                      @Param("localitate") String localitate,
                      @Param("strada") String strada,
                      @Param("numar") String numar,
                      @Param("bloc") String bloc,
                      @Param("ap") Integer ap);

    // DELETE
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM Adrese WHERE id_adresa = :id", nativeQuery = true)
    void deleteAdresaNative(@Param("id") Integer id);

    // --- SEARCH (Corectat numele coloanei: judet_sau_sector) ---
    @Query(value = "SELECT * FROM Adrese WHERE " +
            "LOWER(strada) LIKE LOWER(CONCAT(:termen, '%')) OR " +
            "LOWER(localitate) LIKE LOWER(CONCAT(:termen, '%')) OR " +
            "LOWER(judet_sau_sector) LIKE LOWER(CONCAT(:termen, '%'))", nativeQuery = true)
    List<Adresa> cautaDupaInceput(@Param("termen") String termen);
}