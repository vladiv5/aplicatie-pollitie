package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.repository;

import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities.Amenda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface AmendaRepository extends JpaRepository<Amenda, Integer> {

    @Query(value = "SELECT * FROM Amenzi", nativeQuery = true)
    List<Amenda> getAllAmenziNative();

    @Query(value = "SELECT * FROM Amenzi WHERE id_amenda = :id", nativeQuery = true)
    Optional<Amenda> getAmendaByIdNative(@Param("id") Integer id);

    // INSERT
    @Modifying
    @Transactional
    @Query(value = "INSERT INTO Amenzi (motiv, suma, stare_plata, data_emitere, id_politist, id_persoana) " +
            "VALUES (:motiv, :suma, :stare, :data, :idPolitist, :idPersoana)", nativeQuery = true)
    void insertAmenda(@Param("motiv") String motiv,
                      @Param("suma") BigDecimal suma,
                      @Param("stare") String stare,
                      @Param("data") LocalDateTime data,
                      @Param("idPolitist") Integer idPolitist,
                      @Param("idPersoana") Integer idPersoana);

    // UPDATE
    @Modifying
    @Transactional
    @Query(value = "UPDATE Amenzi SET motiv = :motiv, suma = :suma, stare_plata = :stare, " +
            "data_emitere = :data, id_politist = :idPolitist, id_persoana = :idPersoana " +
            "WHERE id_amenda = :id", nativeQuery = true)
    void updateAmenda(@Param("id") Integer id,
                      @Param("motiv") String motiv,
                      @Param("suma") BigDecimal suma,
                      @Param("stare") String stare,
                      @Param("data") LocalDateTime data,
                      @Param("idPolitist") Integer idPolitist,
                      @Param("idPersoana") Integer idPersoana);

    // DELETE
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM Amenzi WHERE id_amenda = :id", nativeQuery = true)
    void deleteAmendaNative(@Param("id") Integer id);

    // SEARCH
    @Query(value = "SELECT a.* FROM Amenzi a " +
            "LEFT JOIN Persoane p ON a.id_persoana = p.id_persoana " +
            "LEFT JOIN Politisti pol ON a.id_politist = pol.id_politist " +
            "WHERE " +
            "LOWER(a.motiv) LIKE LOWER(CONCAT(:termen, '%')) OR " +
            "LOWER(p.nume) LIKE LOWER(CONCAT(:termen, '%')) OR " +
            "LOWER(p.prenume) LIKE LOWER(CONCAT(:termen, '%')) OR " +
            "LOWER(pol.nume) LIKE LOWER(CONCAT(:termen, '%'))", nativeQuery = true)
    List<Amenda> cautaDupaInceput(@Param("termen") String termen);
    // REPORTS
    @Query(value = "SELECT FORMAT(data_emitere, 'MMMM') as luna, count(*) as numar " +
            "FROM Amenzi GROUP BY FORMAT(data_emitere, 'MMMM')", nativeQuery = true)
    List<Map<String, Object>> raportAmenzi();

    @Query(value = "SELECT a.motiv, a.suma, a.data_emitere, a.stare_plata " +
            "FROM amenzi a " +
            "JOIN persoane p ON a.id_persoana = p.id_persoana " +
            "WHERE p.cnp = :cnp", nativeQuery = true)
    List<Map<String, Object>> getAmenziByCNP(@Param("cnp") String cnp);
}