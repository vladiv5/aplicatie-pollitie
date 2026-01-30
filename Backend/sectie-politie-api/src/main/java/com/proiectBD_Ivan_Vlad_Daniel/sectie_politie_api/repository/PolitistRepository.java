package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.repository;

import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities.Politist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Map;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for accessing data about Police Officers.
 * Structured by category for presentation: CRUD, Reports, Search.
 * @author Ivan Vlad-Daniel
 * @version January 11, 2026
 */
@Repository
public interface PolitistRepository extends JpaRepository<Politist, Integer> {

    // =================================================================================
    // 1. NATIVE CRUD OPERATIONS (Insert, Update, Delete)
    // =================================================================================

    // INSERT (Variable Parameters)
    @Modifying
    @Transactional
    @Query(value = "" +
            "INSERT INTO Politisti (nume, prenume, grad, functie, telefon_serviciu) " +
            "VALUES (:nume, :prenume, :grad, :functie, :telefon)",
            nativeQuery = true)
    void adaugaPolitistManual(
            @Param("nume") String nume,
            @Param("prenume") String prenume,
            @Param("grad") String grad,
            @Param("functie") String functie,
            @Param("telefon") String telefon
    );

    // UPDATE (Variable Parameters)
    @Modifying
    @Transactional
    @Query(value = "" +
            "UPDATE Politisti " +
            "SET nume = :nume, " +
            "    prenume = :prenume, " +
            "    grad = :grad, " +
            "    functie = :functie, " +
            "    telefon_serviciu = :telefon_serviciu " +
            "WHERE id_politist = :id_politist",
            nativeQuery = true)
    void updatePolitist(
            @Param("id_politist") Integer id_politist,
            @Param("nume") String nume,
            @Param("prenume") String prenume,
            @Param("grad") String grad,
            @Param("functie") String functie,
            @Param("telefon_serviciu") String telefon_serviciu
    );

    // DELETE (Variable Parameter: ID)
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM Politisti WHERE id_politist = :id", nativeQuery = true)
    void stergePolitistManual(@Param("id") Integer id);


    // =================================================================================
    // 2. SIMPLE QUERIES WITH JOIN (And Variable Parameters)
    // =================================================================================

    // Top Officers by fine value (JOIN + SUM + GROUP BY)
    // [Variable Parameter]: Date Range (startDate, endDate)
    @Query(value = "" +
            "SELECT p.nume, p.prenume, p.grad, p.functie, SUM(a.suma) as total_valoare " +
            "FROM politisti p " +
            "JOIN amenzi a ON p.id_politist = a.id_politist " +
            "WHERE (:startDate IS NULL OR a.data_emitere >= :startDate) " +
            "  AND (:endDate IS NULL OR a.data_emitere <= :endDate) " +
            "GROUP BY p.id_politist, p.nume, p.prenume, p.grad, p.functie " +
            "ORDER BY total_valoare DESC",
            nativeQuery = true)
    List<Map<String, Object>> getTopPolitistiAmenzi(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    // Statistics grouped by Rank (JOIN + COUNT + SUM)
    // [Variable Parameter]: Date Range
    @Query(value = "" +
            "SELECT p.grad, " +
            "       COUNT(a.id_amenda) as nr_amenzi, " +
            "       SUM(a.suma) as valoare_totala " +
            "FROM politisti p " +
            "JOIN amenzi a ON p.id_politist = a.id_politist " +
            "WHERE (:startDate IS NULL OR a.data_emitere >= :startDate) " +
            "  AND (:endDate IS NULL OR a.data_emitere <= :endDate) " +
            "GROUP BY p.grad",
            nativeQuery = true)
    List<Map<String, Object>> getStatisticiPerGrad(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );


    // =================================================================================
    // 3. COMPLEX QUERIES (Subqueries, Having, Aggregate Functions)
    // =================================================================================

    // Strict Agents: Officers with average fine value above the global station average.
    // [Complexity]: Subquery in HAVING + AVG
    // [Variable Parameter]: Date Range
    @Query(value = "" +
            "SELECT p.nume, p.prenume, p.grad, p.functie, AVG(a.suma) as medie_personala " +
            "FROM Politisti p " +
            "JOIN Amenzi a ON p.id_politist = a.id_politist " +
            "WHERE (:startDate IS NULL OR a.data_emitere >= :startDate) " +
            "  AND (:endDate IS NULL OR a.data_emitere <= :endDate) " +
            "GROUP BY p.id_politist, p.nume, p.prenume, p.grad, p.functie " +
            "HAVING AVG(a.suma) > (" +
            "    SELECT AVG(a2.suma) " +
            "    FROM Amenzi a2 " +
            "    WHERE (:startDate IS NULL OR a2.data_emitere >= :startDate) " +
            "      AND (:endDate IS NULL OR a2.data_emitere <= :endDate)" +
            ") " +
            "ORDER BY medie_personala DESC",
            nativeQuery = true)
    List<Map<String, Object>> getAgentiSeveri(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );


    // =================================================================================
    // 4. LIVE SEARCH & UTILITIES (String Functions, Count, Simple Selects)
    // =================================================================================

    // Intelligent Search (CONCAT + COLLATE)
    // [Variable Parameter]: Search term
    @Query(value = "" +
            "SELECT * FROM Politisti WHERE " +
            "CONCAT(COALESCE(nume, ''), ' ', COALESCE(prenume, ''), ' ', " +
            "       COALESCE(grad, ''), ' ', COALESCE(functie, ''), ' ', " +
            "       COALESCE(telefon_serviciu, '')) " +
            "COLLATE Latin1_General_100_CI_AI " +
            "LIKE CONCAT(:termen, '%')",
            nativeQuery = true)
    List<Politist> cautaDupaInceput(@Param("termen") String termen);

    // Account Activation (Search by multiple criteria)
    @Query(value = "SELECT * FROM Politisti WHERE nume = :nume AND prenume = :prenume AND telefon_serviciu = :telefon", nativeQuery = true)
    Optional<Politist> findForActivation(@Param("nume") String nume, @Param("prenume") String prenume, @Param("telefon") String telefon);

    // Check Phone Uniqueness (COUNT + Conditional Parameters)
    @Query(value = "SELECT count(*) FROM Politisti WHERE telefon_serviciu = :tel AND (:idExclus IS NULL OR id_politist != :idExclus)", nativeQuery = true)
    int verificaTelefonUnic(@Param("tel") String tel, @Param("idExclus") Integer idExclus);

    // Native Pagination
    @Query(value = "SELECT * FROM Politisti", countQuery = "SELECT count(*) FROM Politisti", nativeQuery = true)
    Page<Politist> findAllNative(Pageable pageable);

    // Standard Selects
    @Query(value = "SELECT * FROM Politisti", nativeQuery = true)
    List<Politist> toataListaPolitisti();

    @Query(value = "SELECT MAX(id_politist) FROM Politisti", nativeQuery = true)
    Integer getLastInsertedId();

    @Query(value = "SELECT * FROM Politisti WHERE id_politist = :id", nativeQuery = true)
    Optional<Politist> findByIdNative(@Param("id") Integer id);

    @Query(value = "SELECT * FROM Politisti WHERE nume = 'ARHIVA' AND prenume = 'SISTEM' LIMIT 1", nativeQuery = true)
    Optional<Politist> findPolitistArhiva();

    Optional<Politist> findByUsernameAndPassword(String username, String password);
    Optional<Politist> findByUsername(String username);
}