package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.repository;

import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities.Persoana;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface PersoanaRepository extends JpaRepository<Persoana, Integer> {

    @Query(value = "SELECT * FROM Persoane", countQuery = "SELECT count(*) FROM Persoane", nativeQuery = true)
    Page<Persoana> findAllNativePaginat(Pageable pageable);

    @Query(value = "SELECT * FROM Persoane", nativeQuery = true)
    List<Persoana> getAllPersoaneNative();

    @Query(value = "SELECT * FROM Persoane WHERE id_persoana = :id", nativeQuery = true)
    Optional<Persoana> getPersoanaByIdNative(@Param("id") Integer id);

    @Modifying
    @Transactional
    @Query(value = "INSERT INTO Persoane (nume, prenume, cnp, data_nasterii, telefon) VALUES (:nume, :prenume, :cnp, :dataNasterii, :telefon)", nativeQuery = true)
    void insertPersoana(@Param("nume") String nume, @Param("prenume") String prenume, @Param("cnp") String cnp, @Param("dataNasterii") LocalDate dataNasterii, @Param("telefon") String telefon);

    @Modifying
    @Transactional
    @Query(value = "UPDATE Persoane SET nume = :nume, prenume = :prenume, cnp = :cnp, data_nasterii = :dataNasterii, telefon = :telefon WHERE id_persoana = :id", nativeQuery = true)
    void updatePersoana(@Param("id") Integer id, @Param("nume") String nume, @Param("prenume") String prenume, @Param("cnp") String cnp, @Param("dataNasterii") LocalDate dataNasterii, @Param("telefon") String telefon);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM Persoane WHERE id_persoana = :id", nativeQuery = true)
    void deletePersoanaNative(@Param("id") Integer id);

    // === SEARCH INTELIGENT (_100_CI_AI) ===
    @Query(value = "SELECT * FROM Persoane WHERE " +
            "CONCAT(COALESCE(nume, ''), ' ', COALESCE(prenume, ''), ' ', COALESCE(cnp, ''), ' ', COALESCE(telefon, '')) " +
            "COLLATE Latin1_General_100_CI_AI " +
            "LIKE CONCAT('%', :termen, '%')", nativeQuery = true)
    List<Persoana> cautaDupaInceput(@Param("termen") String termen);

    // --- RAPOARTE ---
    @Query(value = "SELECT p.nume, p.prenume, p.cnp, SUM(a.suma) as datorie_totala FROM persoane p JOIN amenzi a ON p.id_persoana = a.id_persoana WHERE a.stare_plata = 'Neplatita' AND (:startDate IS NULL OR a.data_emitere >= :startDate) AND (:endDate IS NULL OR a.data_emitere <= :endDate) GROUP BY p.id_persoana, p.nume, p.prenume, p.cnp ORDER BY datorie_totala DESC", nativeQuery = true)
    List<Map<String, Object>> getRauPlatnici(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query(value = "SELECT p.nume, p.prenume, p.cnp, COUNT(a.id_amenda) as nr_abateri FROM Persoane p JOIN Amenzi a ON p.id_persoana = a.id_persoana WHERE (:startDate IS NULL OR a.data_emitere >= :startDate) AND (:endDate IS NULL OR a.data_emitere <= :endDate) GROUP BY p.id_persoana, p.nume, p.prenume, p.cnp HAVING COUNT(a.id_amenda) > (SELECT CAST(COUNT(*) AS FLOAT) / COUNT(DISTINCT id_persoana) FROM Amenzi a2 WHERE (:startDate IS NULL OR a2.data_emitere >= :startDate) AND (:endDate IS NULL OR a2.data_emitere <= :endDate)) ORDER BY nr_abateri DESC", nativeQuery = true)
    List<Map<String, Object>> getRecidivisti(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query(value = "SELECT count(*) FROM Persoane WHERE cnp = :cnp AND (:idExclus IS NULL OR id_persoana != :idExclus)", nativeQuery = true)
    int verificaCnpUnic(@Param("cnp") String cnp, @Param("idExclus") Integer idExclus);

    @Query(value = "SELECT count(*) FROM Persoane WHERE telefon = :tel AND (:idExclus IS NULL OR id_persoana != :idExclus)", nativeQuery = true)
    int verificaTelefonUnic(@Param("tel") String tel, @Param("idExclus") Integer idExclus);
}