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

/** Repository pentru gestionarea locatarilor la adrese
 * @author Ivan Vlad-Daniel
 * @version 11 ianuarie 2026
 */
@Repository
public interface PersoanaAdresaRepository extends JpaRepository<PersoanaAdresa, PersoanaAdresaId> {

    List<PersoanaAdresa> findByPersoana_IdPersoana(Integer idPersoana);

    // Găsesc toti oamenii care locuiesc la o anumita adresa
    List<PersoanaAdresa> findByAdresa_IdAdresa(Integer idAdresa);

    // Sterg legaturile persoanei cu adresele (cand persoana dispare)
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM Persoane_Adrese WHERE id_persoana = :id", nativeQuery = true)
    void deleteByPersoanaId(@Param("id") Integer id);

    // Sterg legatura locatarilor cu adresa (cand adresa dispare)
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM Persoane_Adrese WHERE id_adresa = :idAdresa", nativeQuery = true)
    void deleteByAdresaId(@Param("idAdresa") Integer idAdresa);
}