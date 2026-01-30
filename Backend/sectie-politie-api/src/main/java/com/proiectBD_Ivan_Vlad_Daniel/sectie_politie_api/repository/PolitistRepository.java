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

/** Interfata Repository pentru accesul la datele despre Politisti
 * Structurata pe categorii pentru prezentare: CRUD, Rapoarte, Search.
 * @author Ivan Vlad-Daniel
 * @version 11 ianuarie 2026
 */
@Repository
public interface PolitistRepository extends JpaRepository<Politist, Integer> {

    // =================================================================================
    // 1. OPERATII CRUD NATIVE (Insert, Update, Delete)
    // =================================================================================

    // INSERT (Parametri Variabili)
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

    // UPDATE (Parametri Variabili)
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

    // DELETE (Parametru Variabil: ID)
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM Politisti WHERE id_politist = :id", nativeQuery = true)
    void stergePolitistManual(@Param("id") Integer id);


    // =================================================================================
    // 2. INTEROGARI SIMPLE CU JOIN (Si Parametri Variabili)
    // =================================================================================

    // Top Politisti dupa valoarea amenzilor (JOIN + SUM + GROUP BY)
    // [Parametru Variabil]: Intervalul de date (startDate, endDate)
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

    // Statistici grupate pe Grade (JOIN + COUNT + SUM)
    // [Parametru Variabil]: Intervalul de date
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
    // 3. INTEROGARI COMPLEXE (Subcereri, Having, Functii Agregat)
    // =================================================================================

    // Agenti Severi: Politistii cu media amenzilor peste media globala a sectiei
    // [Complexitate]: Subquery in HAVING + AVG
    // [Parametru Variabil]: Intervalul de date
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
    // 4. LIVE SEARCH & UTILITARE (Functii String, Count, Select Simple)
    // =================================================================================

    // Search Inteligent (CONCAT + COLLATE)
    // [Parametru Variabil]: Termenul de cautare
    @Query(value = "" +
            "SELECT * FROM Politisti WHERE " +
            "CONCAT(COALESCE(nume, ''), ' ', COALESCE(prenume, ''), ' ', " +
            "       COALESCE(grad, ''), ' ', COALESCE(functie, ''), ' ', " +
            "       COALESCE(telefon_serviciu, '')) " +
            "COLLATE Latin1_General_100_CI_AI " +
            "LIKE CONCAT(:termen, '%')",
            nativeQuery = true)
    List<Politist> cautaDupaInceput(@Param("termen") String termen);

    // Activare Cont (Cautare dupa multiple criterii)
    @Query(value = "SELECT * FROM Politisti WHERE nume = :nume AND prenume = :prenume AND telefon_serviciu = :telefon", nativeQuery = true)
    Optional<Politist> findForActivation(@Param("nume") String nume, @Param("prenume") String prenume, @Param("telefon") String telefon);

    // Verificare Unicitate Telefon (COUNT + Parametri Conditionali)
    @Query(value = "SELECT count(*) FROM Politisti WHERE telefon_serviciu = :tel AND (:idExclus IS NULL OR id_politist != :idExclus)", nativeQuery = true)
    int verificaTelefonUnic(@Param("tel") String tel, @Param("idExclus") Integer idExclus);

    // Paginare Nativa
    @Query(value = "SELECT * FROM Politisti", countQuery = "SELECT count(*) FROM Politisti", nativeQuery = true)
    Page<Politist> findAllNative(Pageable pageable);

    // Select-uri standard
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