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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Repository for accessing location data (Addresses).
 * Structured by category: Native CRUD, Search, Utilities.
 * @author Ivan Vlad-Daniel
 * @version January 11, 2026
 */
@Repository
public interface AdresaRepository extends JpaRepository<Adresa, Integer> {

    // =================================================================================
    // 1. NATIVE CRUD OPERATIONS (Insert, Update, Delete)
    // =================================================================================

    // INSERT (Variable Parameters: Address Details)
    // I use native SQL to have full control over the insertion process.
    @Modifying
    @Transactional
    @Query(value = "" +
            "INSERT INTO Adrese (judet_sau_sector, localitate, strada, numar, bloc, apartament) " +
            "VALUES (:judet, :localitate, :strada, :numar, :bloc, :ap)",
            nativeQuery = true)
    void insertAdresa(
            @Param("judet") String judet,
            @Param("localitate") String localitate,
            @Param("strada") String strada,
            @Param("numar") String numar,
            @Param("bloc") String bloc,
            @Param("ap") Integer ap
    );

    // UPDATE (Variable Parameters: ID + New Data)
    @Modifying
    @Transactional
    @Query(value = "" +
            "UPDATE Adrese " +
            "SET judet_sau_sector = :judet, " +
            "    localitate = :localitate, " +
            "    strada = :strada, " +
            "    numar = :numar, " +
            "    bloc = :bloc, " +
            "    apartament = :ap " +
            "WHERE id_adresa = :id",
            nativeQuery = true)
    void updateAdresa(
            @Param("id") Integer id,
            @Param("judet") String judet,
            @Param("localitate") String localitate,
            @Param("strada") String strada,
            @Param("numar") String numar,
            @Param("bloc") String bloc,
            @Param("ap") Integer ap
    );

    // DELETE (Variable Parameter: ID)
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM Adrese WHERE id_adresa = :id", nativeQuery = true)
    void deleteAdresaNative(@Param("id") Integer id);


    // =================================================================================
    // 2. LIVE SEARCH (String Manipulation & Filtering)
    // =================================================================================

    // Smart Search: Searches across all address fields simultaneously.
    // I use COALESCE to handle NULL fields (like block/ap) preventing null pointer issues in SQL concatenation.
    @Query(value = "" +
            "SELECT * FROM Adrese WHERE " +
            "CONCAT(COALESCE(strada, ''), ' ', COALESCE(numar, ''), ' ', " +
            "       COALESCE(bloc, ''), ' ', COALESCE(localitate, ''), ' ', " +
            "       COALESCE(judet_sau_sector, '')) " +
            "COLLATE Latin1_General_100_CI_AI " +
            "LIKE CONCAT(:termen, '%')",
            nativeQuery = true)
    List<Adresa> cautaDupaInceput(@Param("termen") String termen);


    // =================================================================================
    // 3. STANDARD SELECTS AND UTILITIES
    // =================================================================================

    // Native Pagination
    // I optimized fetching large datasets by implementing native pagination support.
    @Query(value = "SELECT * FROM Adrese", countQuery = "SELECT count(*) FROM Adrese", nativeQuery = true)
    Page<Adresa> findAllNativePaginat(Pageable pageable);

    @Query(value = "SELECT * FROM Adrese", nativeQuery = true)
    List<Adresa> getAllAdreseNative();

    @Query(value = "SELECT * FROM Adrese WHERE id_adresa = :id", nativeQuery = true)
    Optional<Adresa> getAdresaByIdNative(@Param("id") Integer id);

    @Query(value = "SELECT MAX(id_adresa) FROM Adrese", nativeQuery = true)
    Integer getLastInsertedId();
}