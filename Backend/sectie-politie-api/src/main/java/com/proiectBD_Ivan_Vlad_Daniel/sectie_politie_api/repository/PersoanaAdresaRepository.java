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

/**
 * Repository for managing residents at addresses.
 * @author Ivan Vlad-Daniel
 * @version January 11, 2026
 */
@Repository
public interface PersoanaAdresaRepository extends JpaRepository<PersoanaAdresa, PersoanaAdresaId> {

    List<PersoanaAdresa> findByPersoana_IdPersoana(Integer idPersoana);

    // I find all people living at a certain address.
    List<PersoanaAdresa> findByAdresa_IdAdresa(Integer idAdresa);

    // I delete the person-address links when the person is removed.
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM Persoane_Adrese WHERE id_persoana = :id", nativeQuery = true)
    void deleteByPersoanaId(@Param("id") Integer id);

    // I delete the resident links when the address is removed.
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM Persoane_Adrese WHERE id_adresa = :idAdresa", nativeQuery = true)
    void deleteByAdresaId(@Param("idAdresa") Integer idAdresa);
}