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

@Repository
public interface IncidentRepository extends JpaRepository<Incident, Integer> {

    @Query(value = "SELECT * FROM Incidente", nativeQuery = true)
    List<Incident> getAllIncidenteNative();

    @Query(value = "SELECT * FROM Incidente WHERE id_incident = :id", nativeQuery = true)
    Optional<Incident> getIncidentByIdNative(@Param("id") Integer id);

    // INSERT (Aici punem FK-urile manual)
    @Modifying
    @Transactional
    @Query(value = "INSERT INTO Incidente (tip_incident, data_emitere, descriere_locatie, descriere_incident, id_politist_responsabil, id_adresa_incident) " +
            "VALUES (:tip, :data, :locatie, :descriere, :idPolitist, :idAdresa)", nativeQuery = true)
    void insertIncident(@Param("tip") String tip,
                        @Param("data") LocalDateTime data,
                        @Param("locatie") String locatie,
                        @Param("descriere") String descriere,
                        @Param("idPolitist") Integer idPolitist,
                        @Param("idAdresa") Integer idAdresa);

    // UPDATE
    @Modifying
    @Transactional
    @Query(value = "UPDATE Incidente SET tip_incident = :tip, data_emitere = :data, descriere_locatie = :locatie, " +
            "descriere_incident = :descriere, id_politist_responsabil = :idPolitist, id_adresa_incident = :idAdresa " +
            "WHERE id_incident = :id", nativeQuery = true)
    void updateIncident(@Param("id") Integer id,
                        @Param("tip") String tip,
                        @Param("data") LocalDateTime data,
                        @Param("locatie") String locatie,
                        @Param("descriere") String descriere,
                        @Param("idPolitist") Integer idPolitist,
                        @Param("idAdresa") Integer idAdresa);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM Incidente WHERE id_incident = :id", nativeQuery = true)
    void deleteIncidentNative(@Param("id") Integer id);

    // SEARCH
    @Query(value = "SELECT i.* FROM Incidente i " +
            "LEFT JOIN Politisti p ON i.id_politist_responsabil = p.id_politist " +
            "WHERE LOWER(i.tip_incident) LIKE LOWER(CONCAT(:termen, '%')) OR " +
            "LOWER(i.descriere_locatie) LIKE LOWER(CONCAT(:termen, '%')) OR " +
            "LOWER(p.nume) LIKE LOWER(CONCAT(:termen, '%'))", nativeQuery = true)
    List<Incident> cautaDupaInceput(@Param("termen") String termen);

    // REPORTS
    @Query(value = "SELECT adr.strada, COUNT(i.id_incident) as nr_incidente " +
            "FROM adrese adr " +
            "JOIN incidente i ON adr.id_adresa = i.id_adresa_incident " +
            "GROUP BY adr.id_adresa, adr.strada " +
            "ORDER BY nr_incidente DESC", nativeQuery = true)
    List<Map<String, Object>> getTopStraziIncidente();

    @Query(value = "SELECT i.tip_incident, i.data_emitere, i.descriere_locatie " +
            "FROM incidente i " +
            "JOIN politisti p ON i.id_politist_responsabil = p.id_politist " +
            "WHERE p.id_politist = :idPolitist", nativeQuery = true)
    List<Map<String, Object>> getIncidenteByPolitist(@Param("idPolitist") Integer idPolitist);
}