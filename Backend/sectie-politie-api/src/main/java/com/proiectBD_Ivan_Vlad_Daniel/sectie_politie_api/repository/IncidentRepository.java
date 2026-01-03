package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.repository;

import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities.Incident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, Integer> {

    @Query(value = "SELECT * FROM Incidente",
            countQuery = "SELECT count(*) FROM Incidente",
            nativeQuery = true)
    Page<Incident> findAllNativePaginat(Pageable pageable);

    @Query(value = "SELECT * FROM Incidente", nativeQuery = true)
    List<Incident> getAllIncidenteNative();

    @Query(value = "SELECT * FROM Incidente WHERE id_incident = :id", nativeQuery = true)
    Optional<Incident> getIncidentByIdNative(@Param("id") Integer id);

    @Modifying
    @Transactional
    @Query(value = "INSERT INTO Incidente (tip_incident, data_emitere, descriere_locatie, descriere_incident, id_politist_responsabil, id_adresa_incident, status) " +
            "VALUES (:tip, :data, :locatie, :descriere, :idPolitist, :idAdresa, :status)", nativeQuery = true)
    void insertIncident(@Param("tip") String tip,
                        @Param("data") LocalDateTime data,
                        @Param("locatie") String locatie,
                        @Param("descriere") String descriere,
                        @Param("idPolitist") Integer idPolitist,
                        @Param("idAdresa") Integer idAdresa,
                        @Param("status") String status);

    @Modifying
    @Transactional
    @Query(value = "UPDATE Incidente SET tip_incident = :tip, data_emitere = :data, descriere_locatie = :locatie, descriere_incident = :descriere, id_politist_responsabil = :idPolitist, id_adresa_incident = :idAdresa, status = :status WHERE id_incident = :id", nativeQuery = true)
    void updateIncident(@Param("id") Integer id,
                        @Param("tip") String tip,
                        @Param("data") LocalDateTime data,
                        @Param("locatie") String locatie,
                        @Param("descriere") String descriere,
                        @Param("idPolitist") Integer idPolitist,
                        @Param("idAdresa") Integer idAdresa,
                        @Param("status") String status);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM Incidente WHERE id_incident = :id", nativeQuery = true)
    void deleteIncidentNative(@Param("id") Integer id);

    @Query(value = "SELECT i.* FROM Incidente i LEFT JOIN Politisti p ON i.id_politist_responsabil = p.id_politist WHERE LOWER(i.tip_incident) LIKE LOWER(CONCAT(:termen, '%')) OR LOWER(i.descriere_locatie) LIKE LOWER(CONCAT(:termen, '%')) OR LOWER(p.nume) LIKE LOWER(CONCAT(:termen, '%'))", nativeQuery = true)
    List<Incident> cautaDupaInceput(@Param("termen") String termen);

    // =================================================================================
    // === 📊 RAPOARTE SIMPLE (Pastrate) ===
    // =================================================================================

    @Query(value = "SELECT adr.strada, adr.localitate, COUNT(i.id_incident) as nr_incidente " +
            "FROM adrese adr " +
            "JOIN incidente i ON adr.id_adresa = i.id_adresa_incident " +
            "WHERE (:startDate IS NULL OR i.data_emitere >= :startDate) " +
            "  AND (:endDate IS NULL OR i.data_emitere <= :endDate) " +
            "GROUP BY adr.id_adresa, adr.strada, adr.localitate " +
            "ORDER BY nr_incidente DESC", nativeQuery = true)
    List<Map<String, Object>> getTopStraziIncidente(@Param("startDate") LocalDateTime startDate,
                                                    @Param("endDate") LocalDateTime endDate);

    @Query(value = "SELECT i.tip_incident, i.data_emitere, i.descriere_locatie, adr.strada " +
            "FROM incidente i " +
            "JOIN politisti p ON i.id_politist_responsabil = p.id_politist " +
            "JOIN adrese adr ON i.id_adresa_incident = adr.id_adresa " +
            "WHERE p.id_politist = :idPolitist " +
            "  AND (:startDate IS NULL OR i.data_emitere >= :startDate) " +
            "  AND (:endDate IS NULL OR i.data_emitere <= :endDate)", nativeQuery = true)
    List<Map<String, Object>> getIncidenteByPolitist(@Param("idPolitist") Integer idPolitist,
                                                     @Param("startDate") LocalDateTime startDate,
                                                     @Param("endDate") LocalDateTime endDate);

    // =================================================================================
    // === 🧠 INTEROGĂRI COMPLEXE (Pastrate) ===
    // =================================================================================

    @Query(value = "SELECT a.strada, a.localitate, a.judet_sau_sector " +
            "FROM Adrese a " +
            "WHERE a.id_adresa NOT IN (" +
            "    SELECT i.id_adresa_incident FROM Incidente i " +
            "    WHERE (:startDate IS NULL OR i.data_emitere >= :startDate) " +
            "      AND (:endDate IS NULL OR i.data_emitere <= :endDate) " +
            "      AND i.id_adresa_incident IS NOT NULL" +
            ")", nativeQuery = true)
    List<Map<String, Object>> getZoneSigure(@Param("startDate") LocalDateTime startDate,
                                            @Param("endDate") LocalDateTime endDate);

    @Query(value = "SELECT CAST(i.data_emitere AS DATE) as ziua, COUNT(*) as nr_incidente " +
            "FROM Incidente i " +
            "WHERE (:startDate IS NULL OR i.data_emitere >= :startDate) " +
            "  AND (:endDate IS NULL OR i.data_emitere <= :endDate) " +
            "GROUP BY CAST(i.data_emitere AS DATE) " +
            "HAVING COUNT(*) > (" +
            "   SELECT AVG(sub.zilnic) FROM (" +
            "       SELECT COUNT(*) as zilnic FROM Incidente i2 " +
            "       WHERE (:startDate IS NULL OR i2.data_emitere >= :startDate) " +
            "         AND (:endDate IS NULL OR i2.data_emitere <= :endDate) " +
            "       GROUP BY CAST(i2.data_emitere AS DATE) " +
            "   ) as sub" +
            ")", nativeQuery = true)
    List<Map<String, Object>> getZileCritice(@Param("startDate") LocalDateTime startDate,
                                             @Param("endDate") LocalDateTime endDate);

    @Query(value = "SELECT COUNT(*) FROM Incidente WHERE id_politist_responsabil = :id", nativeQuery = true)
    int countIncidenteByPolitist(@Param("id") Integer id);

    @Modifying
    @Transactional
    @Query(value = "UPDATE Incidente SET id_politist_responsabil = :idNou WHERE id_politist_responsabil = :idVechi", nativeQuery = true)
    void mutaIncidentePeAltPolitist(@Param("idVechi") Integer idVechi, @Param("idNou") Integer idNou);

    @Query(value = "SELECT * FROM Incidente WHERE id_politist_responsabil = :id AND status = 'Activ'", nativeQuery = true)
    List<Incident> findActiveIncidentsByPolitist(@Param("id") Integer id);

    @Query(value = "SELECT COUNT(*) FROM Incidente WHERE id_politist_responsabil = :id AND status = 'Închis'", nativeQuery = true)
    int countClosedIncidentsByPolitist(@Param("id") Integer id);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM Incidente WHERE id_politist_responsabil = :id", nativeQuery = true)
    void deleteByPolitistId(@Param("id") Integer id);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM Incidente WHERE id_politist_responsabil = :id", nativeQuery = true)
    void stergeIncidenteDupaPolitist(@Param("id") Integer id);

    @Query(value = "SELECT * FROM Incidente WHERE id_politist_responsabil = :id", nativeQuery = true)
    List<Incident> findAllNativeByPolitist(@Param("id") Integer id);

    @Query(value = "SELECT i.* FROM Incidente i JOIN Persoane_Incidente pi ON i.id_incident = pi.id_incident WHERE pi.id_persoana = :idPersoana", nativeQuery = true)
    List<Incident> findIncidenteByPersoana(@Param("idPersoana") Integer idPersoana);

    @Query(value = "SELECT * FROM Incidente WHERE id_adresa_incident = :idAdresa", nativeQuery = true)
    List<Incident> findByAdresaId(@Param("idAdresa") Integer idAdresa);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM Incidente WHERE id_adresa_incident = :idAdresa", nativeQuery = true)
    void deleteByAdresaId(@Param("idAdresa") Integer idAdresa);
}