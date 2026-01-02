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

@Repository
public interface PersoanaIncidentRepository extends JpaRepository<PersoanaIncident, PersoanaIncidentId> {

    List<PersoanaIncident> findByIncident_IdIncident(Integer idIncident);
    List<PersoanaIncident> findByPersoana_IdPersoana(Integer idPersoana);

    // Sterge legaturile cand stergem un POLITIST
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM Persoane_Incidente WHERE id_incident IN (SELECT id_incident FROM Incidente WHERE id_politist_responsabil = :idPolitist)", nativeQuery = true)
    void stergeParticipantiDupaPolitist(@Param("idPolitist") Integer idPolitist);

    // Sterge legaturile cand stergem o PERSOANA
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM Persoane_Incidente WHERE id_persoana = :id", nativeQuery = true)
    void deleteByPersoanaId(@Param("id") Integer id);

    // --- CORECTIE PENTRU STERGERE INCIDENT ---
    // Stergem DOAR din tabela de legatura. Persoanele raman in baza de date!
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM Persoane_Incidente WHERE id_incident = :idIncident", nativeQuery = true)
    void deleteByIncidentId(@Param("idIncident") Integer idIncident);

    // STERGE participanții de la incidentele care au avut loc la adresa X
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM Persoane_Incidente WHERE id_incident IN (SELECT id_incident FROM Incidente WHERE id_adresa_incident = :idAdresa)", nativeQuery = true)
    void deleteParticipantiByAdresa(@Param("idAdresa") Integer idAdresa);
}