package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.repository;

import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities.PersoanaAdresa;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities.PersoanaAdresaId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PersoanaAdresaRepository extends JpaRepository<PersoanaAdresa, PersoanaAdresaId> {

    // Aveai deja asta:
    List<PersoanaAdresa> findByPersoana_IdPersoana(Integer idPersoana);

    // --- METODĂ NOUĂ: Găsește toți oamenii de la o adresă ---
    List<PersoanaAdresa> findByAdresa_IdAdresa(Integer idAdresa);
}