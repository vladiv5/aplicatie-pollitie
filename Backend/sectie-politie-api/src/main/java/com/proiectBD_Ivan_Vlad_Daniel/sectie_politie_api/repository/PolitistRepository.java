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

@Repository
public interface PolitistRepository extends JpaRepository<Politist, Integer> {

    @Query(value = "SELECT * FROM Politisti",
            countQuery = "SELECT count(*) FROM Politisti",
            nativeQuery = true)
    Page<Politist> findAllNative(Pageable pageable);

    // --- METODE STANDARD (NU LE MODIFICĂM) ---
    @Query(value = "SELECT * FROM Politisti", nativeQuery = true)
    List<Politist> toataListaPolitisti();

    @Modifying
    @Transactional
    @Query(value = "INSERT INTO Politisti (nume, prenume, grad, functie, telefon_serviciu) " +
            "VALUES (:nume, :prenume, :grad, :functie, :telefon)", nativeQuery = true)
    void adaugaPolitistManual(@Param("nume") String nume, @Param("prenume") String prenume, @Param("grad") String grad, @Param("functie") String functie, @Param("telefon") String telefon);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM Politisti WHERE id_politist = :id", nativeQuery = true)
    void stergePolitistManual(@Param("id") Integer id);

    java.util.Optional<Politist> findByNume(String nume);

    @Modifying
    @Transactional
    @Query(value = "UPDATE Politisti SET nume = :nume, prenume = :prenume, grad = :grad, functie = :functie, telefon_serviciu = :telefon_serviciu WHERE id_politist = :id_politist", nativeQuery = true)
    void updatePolitist(@Param("id_politist") Integer id_politist, @Param("nume") String nume, @Param("prenume") String prenume, @Param("grad") String grad, @Param("functie") String functie, @Param("telefon_serviciu") String telefon_serviciu);

    @Query(value = "SELECT * FROM Politisti WHERE LOWER(nume) LIKE LOWER(CONCAT(:termen, '%')) OR LOWER(prenume) LIKE LOWER(CONCAT(:termen, '%')) OR LOWER(grad) LIKE LOWER(CONCAT(:termen, '%'))", nativeQuery = true)
    List<Politist> cautaDupaInceput(@Param("termen") String termen);

    @Query(value = "SELECT * FROM Politisti WHERE id_politist = :id", nativeQuery = true)
    java.util.Optional<Politist> findByIdNative(@Param("id") Integer id);

    // =================================================================================
    // === 📊 RAPOARTE SIMPLE (Refactorizate cu Filtru de Dată) ===
    // =================================================================================

    // --- RAPORT 1: Top Polițiști (Cu filtru de timp pe tabela Amenzi) ---
    @Query(value = "SELECT p.nume, p.prenume, p.grad, SUM(a.suma) as total_valoare " +
            "FROM politisti p " +
            "JOIN amenzi a ON p.id_politist = a.id_politist " +
            "WHERE (:startDate IS NULL OR a.data_emitere >= :startDate) " +
            "  AND (:endDate IS NULL OR a.data_emitere <= :endDate) " +
            "GROUP BY p.id_politist, p.nume, p.prenume, p.grad " +
            "ORDER BY total_valoare DESC", nativeQuery = true)
    List<Map<String, Object>> getTopPolitistiAmenzi(@Param("startDate") LocalDateTime startDate,
                                                    @Param("endDate") LocalDateTime endDate);

    // --- RAPORT 5: Statistici per Grad (Cu filtru de timp) ---
    @Query(value = "SELECT p.grad, COUNT(a.id_amenda) as nr_amenzi, SUM(a.suma) as valoare_totala " +
            "FROM politisti p " +
            "JOIN amenzi a ON p.id_politist = a.id_politist " +
            "WHERE (:startDate IS NULL OR a.data_emitere >= :startDate) " +
            "  AND (:endDate IS NULL OR a.data_emitere <= :endDate) " +
            "GROUP BY p.grad", nativeQuery = true)
    List<Map<String, Object>> getStatisticiPerGrad(@Param("startDate") LocalDateTime startDate,
                                                   @Param("endDate") LocalDateTime endDate);

    // =================================================================================
    // === 🧠 INTEROGARE COMPLEXĂ (SUBCERERE 1) ===
    // =================================================================================

    // --- Agenți Severi: Polițiști a căror medie a amenzilor > Media generală a secției ---
    @Query(value = "SELECT p.nume, p.prenume, p.grad, AVG(a.suma) as medie_personala " +
            "FROM Politisti p " +
            "JOIN Amenzi a ON p.id_politist = a.id_politist " +
            "WHERE (:startDate IS NULL OR a.data_emitere >= :startDate) " +
            "  AND (:endDate IS NULL OR a.data_emitere <= :endDate) " +
            "GROUP BY p.id_politist, p.nume, p.prenume, p.grad " +
            "HAVING AVG(a.suma) > (" +
            "   SELECT AVG(a2.suma) FROM Amenzi a2 " +
            "   WHERE (:startDate IS NULL OR a2.data_emitere >= :startDate) " +
            "     AND (:endDate IS NULL OR a2.data_emitere <= :endDate) " +
            ")", nativeQuery = true)
    List<Map<String, Object>> getAgentiSeveri(@Param("startDate") LocalDateTime startDate,
                                              @Param("endDate") LocalDateTime endDate);
    // Cautam politistul special de arhiva
    @Query(value = "SELECT * FROM Politisti WHERE nume = 'ARHIVA' AND prenume = 'SISTEM' LIMIT 1", nativeQuery = true)
    java.util.Optional<Politist> findPolitistArhiva();
}