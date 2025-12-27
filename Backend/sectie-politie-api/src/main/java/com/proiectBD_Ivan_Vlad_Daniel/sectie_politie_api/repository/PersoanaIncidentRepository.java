package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.repository;

import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities.PersoanaIncident;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities.PersoanaIncidentId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PersoanaIncidentRepository extends JpaRepository<PersoanaIncident, PersoanaIncidentId> {
}