package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.repository;

import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities.Persoana;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Repository interface for manipulating citizen data.
 * Structured by category: Native CRUD, Reports, Validations.
 * @author Ivan Vlad-Daniel
 * @version January 11, 2026
 */
@Repository
public interface PersoanaRepository extends JpaRepository<Persoana, Integer> {

    // =================================================================================
    // 1. NATIVE CRUD OPERATIONS (Insert, Update, Delete)
    // =================================================================================

    // INSERT (Variable Parameters: Personal Data)
    @Modifying
    @Transactional
    @Query(value = "" +
            "INSERT INTO Persoane (nume, prenume, cnp, data_nasterii, telefon) " +
            "VALUES (:nume, :prenume, :cnp, :dataNasterii, :telefon)",
            nativeQuery = true)
    void insertPersoana(
            @Param("nume") String nume,
            @Param("prenume") String prenume,
            @Param("cnp") String cnp,
            @Param("dataNasterii") LocalDate dataNasterii,
            @Param("telefon") String telefon
    );

    // UPDATE (Variable Parameters: ID + New Data)
    @Modifying
    @Transactional
    @Query(value = "" +
            "UPDATE Persoane " +
            "SET nume = :nume, " +
            "    prenume = :prenume, " +
            "    cnp = :cnp, " +
            "    data_nasterii = :dataNasterii, " +
            "    telefon = :telefon " +
            "WHERE id_persoana = :id",
            nativeQuery = true)
    void updatePersoana(
            @Param("id") Integer id,
            @Param("nume") String nume,
            @Param("prenume") String prenume,
            @Param("cnp") String cnp,
            @Param("dataNasterii") LocalDate dataNasterii,
            @Param("telefon") String telefon
    );

    // DELETE (Variable Parameter: ID)
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM Persoane WHERE id_persoana = :id", nativeQuery = true)
    void deletePersoanaNative(@Param("id") Integer id);


    // =================================================================================
    // 2. SIMPLE QUERIES WITH JOIN (And Variable Parameters)
    // =================================================================================

    // Report "Bad Payers": People with unpaid debt (JOIN Persons-Fines)
    // [Variable Parameters]: Date Range
    @Query(value = "" +
            "SELECT p.nume, p.prenume, p.cnp, SUM(a.suma) as datorie_totala " +
            "FROM persoane p " +
            "JOIN amenzi a ON p.id_persoana = a.id_persoana " +
            "WHERE a.stare_plata = 'Neplatita' " +
            "  AND (:startDate IS NULL OR a.data_emitere >= :startDate) " +
            "  AND (:endDate IS NULL OR a.data_emitere <= :endDate) " +
            "GROUP BY p.id_persoana, p.nume, p.prenume, p.cnp " +
            "ORDER BY datorie_totala DESC",
            nativeQuery = true)
    List<Map<String, Object>> getRauPlatnici(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );


    // =================================================================================
    // 3. COMPLEX QUERIES (Subqueries, Having, Aggregate Functions)
    // =================================================================================

    // Report "Recidivists": People with fine count > population average
    // [Complexity]: Subquery in HAVING + COUNT/AVG
    // [Variable Parameters]: Date Range
    // I compare the individual count against a dynamically calculated global average.
    @Query(value = "" +
            "SELECT p.nume, p.prenume, p.cnp, COUNT(a.id_amenda) as nr_abateri " +
            "FROM Persoane p " +
            "JOIN Amenzi a ON p.id_persoana = a.id_persoana " +
            "WHERE (:startDate IS NULL OR a.data_emitere >= :startDate) " +
            "  AND (:endDate IS NULL OR a.data_emitere <= :endDate) " +
            "GROUP BY p.id_persoana, p.nume, p.prenume, p.cnp " +
            "HAVING COUNT(a.id_amenda) > (" +
            "    SELECT CAST(COUNT(*) AS FLOAT) / COUNT(DISTINCT id_persoana) " +
            "    FROM Amenzi a2 " +
            "    WHERE (:startDate IS NULL OR a2.data_emitere >= :startDate) " +
            "      AND (:endDate IS NULL OR a2.data_emitere <= :endDate)" +
            ") " +
            "ORDER BY nr_abateri DESC",
            nativeQuery = true)
    List<Map<String, Object>> getRecidivisti(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );


    // =================================================================================
    // 4. LIVE SEARCH & VALIDATIONS (SQL Logic)
    // =================================================================================

    // Intelligent Search (CONCAT + COLLATE for diacritics)
    @Query(value = "" +
            "SELECT * FROM Persoane WHERE " +
            "CONCAT(COALESCE(nume, ''), ' ', COALESCE(prenume, ''), ' ', " +
            "       COALESCE(cnp, ''), ' ', COALESCE(telefon, '')) " +
            "COLLATE Latin1_General_100_CI_AI " +
            "LIKE CONCAT(:termen, '%')",
            nativeQuery = true)
    List<Persoana> cautaDupaInceput(@Param("termen") String termen);

    // CNP Uniqueness Validation (Conditional COUNT)
    @Query(value = "" +
            "SELECT count(*) FROM Persoane " +
            "WHERE cnp = :cnp " +
            "  AND (:idExclus IS NULL OR id_persoana != :idExclus)",
            nativeQuery = true)
    int verificaCnpUnic(@Param("cnp") String cnp, @Param("idExclus") Integer idExclus);

    // Phone Uniqueness Validation
    @Query(value = "" +
            "SELECT count(*) FROM Persoane " +
            "WHERE telefon = :tel " +
            "  AND (:idExclus IS NULL OR id_persoana != :idExclus)",
            nativeQuery = true)
    int verificaTelefonUnic(@Param("tel") String tel, @Param("idExclus") Integer idExclus);

    // --- Standard Selects ---
    @Query(value = "SELECT * FROM Persoane", countQuery = "SELECT count(*) FROM Persoane", nativeQuery = true)
    Page<Persoana> findAllNativePaginat(Pageable pageable);

    @Query(value = "SELECT * FROM Persoane", nativeQuery = true)
    List<Persoana> getAllPersoaneNative();

    @Query(value = "SELECT * FROM Persoane WHERE id_persoana = :id", nativeQuery = true)
    Optional<Persoana> getPersoanaByIdNative(@Param("id") Integer id);

    @Query(value = "SELECT MAX(id_persoana) FROM Persoane", nativeQuery = true)
    Integer getLastInsertedId();
}