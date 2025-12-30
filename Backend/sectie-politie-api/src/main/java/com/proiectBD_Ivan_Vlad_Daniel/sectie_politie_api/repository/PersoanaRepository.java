package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.repository;

import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities.Persoana;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface PersoanaRepository extends JpaRepository<Persoana, Integer> {

    // --- 1. SELECT ALL ---
    @Query(value = "SELECT * FROM Persoane", nativeQuery = true)
    List<Persoana> getAllPersoaneNative();

    // --- 2. SELECT BY ID ---
    @Query(value = "SELECT * FROM Persoane WHERE id_persoana = :id", nativeQuery = true)
    Optional<Persoana> getPersoanaByIdNative(@Param("id") Integer id);

    // --- 3. INSERT (Creare) ---
    @Modifying
    @Transactional
    @Query(value = "INSERT INTO Persoane (nume, prenume, cnp, data_nasterii, telefon) " +
            "VALUES (:nume, :prenume, :cnp, :dataNasterii, :telefon)", nativeQuery = true)
    void insertPersoana(@Param("nume") String nume,
                        @Param("prenume") String prenume,
                        @Param("cnp") String cnp,
                        @Param("dataNasterii") LocalDate dataNasterii,
                        @Param("telefon") String telefon);

    // --- 4. UPDATE (Modificare) ---
    @Modifying
    @Transactional
    @Query(value = "UPDATE Persoane SET nume = :nume, prenume = :prenume, cnp = :cnp, " +
            "data_nasterii = :dataNasterii, telefon = :telefon WHERE id_persoana = :id", nativeQuery = true)
    void updatePersoana(@Param("id") Integer id,
                        @Param("nume") String nume,
                        @Param("prenume") String prenume,
                        @Param("cnp") String cnp,
                        @Param("dataNasterii") LocalDate dataNasterii,
                        @Param("telefon") String telefon);

    // --- 5. DELETE ---
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM Persoane WHERE id_persoana = :id", nativeQuery = true)
    void deletePersoanaNative(@Param("id") Integer id);

    // --- 6. CAUTARE (Search) ---
    @Query(value = "SELECT * FROM Persoane WHERE " +
            "LOWER(nume) LIKE LOWER(CONCAT(:termen, '%')) OR " +
            "LOWER(prenume) LIKE LOWER(CONCAT(:termen, '%')) OR " +
            "cnp LIKE CONCAT(:termen, '%')", nativeQuery = true)
    List<Persoana> cautaDupaInceput(@Param("termen") String termen);

    // --- 7. REPORT (Rau Platnici) ---
    @Query(value = "SELECT p.nume, p.prenume, p.cnp, SUM(a.suma) as datorie " +
            "FROM persoane p " +
            "JOIN amenzi a ON p.id_persoana = a.id_persoana " +
            "WHERE a.stare_plata = 'Neplatita' " +
            "GROUP BY p.id_persoana, p.nume, p.prenume, p.cnp", nativeQuery = true)
    List<Map<String, Object>> getRauPlatnici();
}