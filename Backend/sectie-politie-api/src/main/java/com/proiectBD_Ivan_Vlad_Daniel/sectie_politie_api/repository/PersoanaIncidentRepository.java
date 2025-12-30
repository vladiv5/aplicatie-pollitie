package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.repository;

import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities.PersoanaIncident;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities.PersoanaIncidentId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PersoanaIncidentRepository extends JpaRepository<PersoanaIncident, PersoanaIncidentId> {

    // Găsește participanții unui incident (deja aveai asta)
    List<PersoanaIncident> findByIncident_IdIncident(Integer idIncident);

    // --- METODĂ NOUĂ: Găsește incidentele unei persoane ---
    List<PersoanaIncident> findByPersoana_IdPersoana(Integer idPersoana);
}