package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.repository;

import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities.PersoanaAdresa;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities.PersoanaAdresaId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface PersoanaAdresaRepository extends JpaRepository<PersoanaAdresa, PersoanaAdresaId> {

    // Aveai deja asta:
    List<PersoanaAdresa> findByPersoana_IdPersoana(Integer idPersoana);

    // --- METODĂ NOUĂ: Găsește toți oamenii de la o adresă ---
    List<PersoanaAdresa> findByAdresa_IdAdresa(Integer idAdresa);

    // STERGE legaturile persoanei cu adresele (nu sterge adresele fizice)
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM Persoane_Adrese WHERE id_persoana = :id", nativeQuery = true)
    void deleteByPersoanaId(@Param("id") Integer id);

    // STERGE legatura locatarilor cu adresa
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM Persoane_Adrese WHERE id_adresa = :idAdresa", nativeQuery = true)
    void deleteByAdresaId(@Param("idAdresa") Integer idAdresa);
}