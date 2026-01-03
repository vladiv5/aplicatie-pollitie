package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.repository;

import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities.Amenda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface AmendaRepository extends JpaRepository<Amenda, Integer> {

    // --- PAGINARE ---
    @Query(value = "SELECT * FROM Amenzi",
            countQuery = "SELECT count(*) FROM Amenzi",
            nativeQuery = true)
    Page<Amenda> findAllNativePaginat(Pageable pageable);

    // --- METODE STANDARD ---
    @Query(value = "SELECT * FROM Amenzi", nativeQuery = true)
    List<Amenda> getAllAmenziNative();

    @Query(value = "SELECT * FROM Amenzi WHERE id_amenda = :id", nativeQuery = true)
    Optional<Amenda> getAmendaByIdNative(@Param("id") Integer id);

    @Modifying
    @Transactional
    @Query(value = "INSERT INTO Amenzi (motiv, suma, stare_plata, data_emitere, id_politist, id_persoana) VALUES (:motiv, :suma, :stare, :data, :idPolitist, :idPersoana)", nativeQuery = true)
    void insertAmenda(@Param("motiv") String motiv, @Param("suma") BigDecimal suma, @Param("stare") String stare, @Param("data") LocalDateTime data, @Param("idPolitist") Integer idPolitist, @Param("idPersoana") Integer idPersoana);

    @Modifying
    @Transactional
    @Query(value = "UPDATE Amenzi SET motiv = :motiv, suma = :suma, stare_plata = :stare, data_emitere = :data, id_politist = :idPolitist, id_persoana = :idPersoana WHERE id_amenda = :id", nativeQuery = true)
    void updateAmenda(@Param("id") Integer id, @Param("motiv") String motiv, @Param("suma") BigDecimal suma, @Param("stare") String stare, @Param("data") LocalDateTime data, @Param("idPolitist") Integer idPolitist, @Param("idPersoana") Integer idPersoana);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM Amenzi WHERE id_amenda = :id", nativeQuery = true)
    void deleteAmendaNative(@Param("id") Integer id);

    @Query(value = "SELECT a.* FROM Amenzi a LEFT JOIN Persoane p ON a.id_persoana = p.id_persoana LEFT JOIN Politisti pol ON a.id_politist = pol.id_politist WHERE LOWER(a.motiv) LIKE LOWER(CONCAT(:termen, '%')) OR LOWER(p.nume) LIKE LOWER(CONCAT(:termen, '%')) OR LOWER(p.prenume) LIKE LOWER(CONCAT(:termen, '%')) OR LOWER(pol.nume) LIKE LOWER(CONCAT(:termen, '%'))", nativeQuery = true)
    List<Amenda> cautaDupaInceput(@Param("termen") String termen);

    // =================================================================================
    // === 📊 RAPORT PENTRU STATISTICI: ISTORIC CNP ===
    // =================================================================================
    @Query(value = "SELECT a.motiv, a.suma, a.data_emitere, a.stare_plata, " +
            "pol.nume as nume_politist, pol.prenume as prenume_politist " +
            "FROM amenzi a " +
            "JOIN persoane p ON a.id_persoana = p.id_persoana " +
            "JOIN politisti pol ON a.id_politist = pol.id_politist " +
            "WHERE p.cnp = :cnp " +
            "  AND (:startDate IS NULL OR a.data_emitere >= :startDate) " +
            "  AND (:endDate IS NULL OR a.data_emitere <= :endDate)", nativeQuery = true)
    List<Map<String, Object>> getAmenziByCNP(@Param("cnp") String cnp,
                                             @Param("startDate") LocalDateTime startDate,
                                             @Param("endDate") LocalDateTime endDate);

    // =================================================================================
    // === 🛡️ LOGICĂ PROTECȚIE ȘTERGERE POLIȚIST ===
    // =================================================================================

    // Numără amenzile care NU sunt neplătite (Platita/Anulata)
    @Query(value = "SELECT COUNT(*) FROM Amenzi WHERE id_politist = :idPolitist AND stare_plata != 'Neplatita'", nativeQuery = true)
    int countAmenziSolubileByPolitist(@Param("idPolitist") Integer idPolitist);

    // Anonimizare (stergerea legaturii cu politistul)
    @Modifying
    @Transactional
    @Query(value = "UPDATE Amenzi SET id_politist = NULL WHERE id_politist = :idPolitist", nativeQuery = true)
    void anonimizeazaAmenziPolitist(@Param("idPolitist") Integer idPolitist);

    // Reatribuire (Mutam amenzile pe un alt politist - Arhiva)
    @Modifying
    @Transactional
    @Query(value = "UPDATE Amenzi SET id_politist = :idNou WHERE id_politist = :idVechi", nativeQuery = true)
    void mutaAmenziPeAltPolitist(@Param("idVechi") Integer idVechi, @Param("idNou") Integer idNou);

    // Gasim amenzile NEPLATITE (Blocante)
    @Query(value = "SELECT * FROM Amenzi WHERE id_politist = :id AND stare_plata = 'Neplatita'", nativeQuery = true)
    List<Amenda> findUnpaidAmenziByPolitist(@Param("id") Integer id);

    // Gasim amenzile PLATITE (Warning)
    @Query(value = "SELECT COUNT(*) FROM Amenzi WHERE id_politist = :id AND stare_plata = 'Platita'", nativeQuery = true)
    int countPaidAmenziByPolitist(@Param("id") Integer id);

    // Returnează TOATE amenzile polițistului
    @Query(value = "SELECT * FROM Amenzi WHERE id_politist = :id", nativeQuery = true)
    List<Amenda> findAllNativeByPolitist(@Param("id") Integer id);

    // Stergere in cascada
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM Amenzi WHERE id_politist = :id", nativeQuery = true)
    void deleteByPolitistId(@Param("id") Integer id);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM Amenzi WHERE id_politist = :id", nativeQuery = true)
    void stergeAmenziDupaPolitist(@Param("id") Integer id);

    // =================================================================================
    // === 🛡️ LOGICĂ PROTECȚIE ȘTERGERE PERSOANĂ ===
    // =================================================================================

    @Query(value = "SELECT * FROM Amenzi WHERE id_persoana = :id AND stare_plata = 'Neplatita'", nativeQuery = true)
    List<Amenda> findUnpaidAmenziByPersoana(@Param("id") Integer id);

    @Query(value = "SELECT * FROM Amenzi WHERE id_persoana = :id", nativeQuery = true)
    List<Amenda> findAllNativeByPersoana(@Param("id") Integer id);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM Amenzi WHERE id_persoana = :id", nativeQuery = true)
    void deleteByPersoanaId(@Param("id") Integer id);
}