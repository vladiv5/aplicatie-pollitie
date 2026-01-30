package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.repository;

import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities.PersoanaIncident;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities.PersoanaIncidentId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Repository for managing the link between People and Incidents (Many-to-Many).
 * @author Ivan Vlad-Daniel
 * @version January 11, 2026
 */
@Repository
public interface PersoanaIncidentRepository extends JpaRepository<PersoanaIncident, PersoanaIncidentId> {

    List<PersoanaIncident> findByIncident_IdIncident(Integer idIncident);
    List<PersoanaIncident> findByPersoana_IdPersoana(Integer idPersoana);

    // I clean up links when deleting an OFFICER responsible for cases (Cascade via subquery).
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM Persoane_Incidente WHERE id_incident IN (SELECT id_incident FROM Incidente WHERE id_politist_responsabil = :idPolitist)", nativeQuery = true)
    void stergeParticipantiDupaPolitist(@Param("idPolitist") Integer idPolitist);

    // I clean up links when deleting a PERSON from the database.
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM Persoane_Incidente WHERE id_persoana = :id", nativeQuery = true)
    void deleteByPersoanaId(@Param("id") Integer id);

    // I clean up only links when an INCIDENT disappears (not the physical persons).
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM Persoane_Incidente WHERE id_incident = :idIncident", nativeQuery = true)
    void deleteByIncidentId(@Param("idIncident") Integer idIncident);

    // I delete participants from incidents that occurred at an ADDRESS to be deleted.
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM Persoane_Incidente WHERE id_incident IN (SELECT id_incident FROM Incidente WHERE id_adresa_incident = :idAdresa)", nativeQuery = true)
    void deleteParticipantiByAdresa(@Param("idAdresa") Integer idAdresa);
}