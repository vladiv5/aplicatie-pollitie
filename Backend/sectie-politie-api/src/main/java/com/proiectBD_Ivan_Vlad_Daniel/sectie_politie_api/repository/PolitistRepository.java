package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.repository;

import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities.Politist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Map;
import java.util.List;
import java.util.Optional;

/** Interfata Repository pentru accesul la datele despre Politisti
 * @author Ivan Vlad-Daniel
 * @version 11 ianuarie 2026
 */
@Repository
public interface PolitistRepository extends JpaRepository<Politist, Integer> {

    // --- METODE PENTRU LOGIN & ACTIVARE ---

    // 1. Caut utilizatorul exact dupa nume si parola pentru autentificare
    Optional<Politist> findByUsernameAndPassword(String username, String password);

    // 2. Caut politistul dupa datele personale pentru a-i putea activa contul
    // Folosesc SQL nativ pentru a fi sigur ca interogarea se executa rapid
    @Query(value = "SELECT * FROM Politisti WHERE nume = :nume AND prenume = :prenume AND telefon_serviciu = :telefon", nativeQuery = true)
    Optional<Politist> findForActivation(@Param("nume") String nume, @Param("prenume") String prenume, @Param("telefon") String telefon);

    // 3. Verific daca un username este deja luat cand cineva isi creeaza contul
    Optional<Politist> findByUsername(String username);

    // Folosesc aceasta metoda pentru a incarca politistii pagina cu pagina in tabelul principal
    @Query(value = "SELECT * FROM Politisti", countQuery = "SELECT count(*) FROM Politisti", nativeQuery = true)
    Page<Politist> findAllNative(Pageable pageable);

    // Aceasta metoda imi returneaza absolut toti politistii (utila pentru dropdown-uri)
    @Query(value = "SELECT * FROM Politisti", nativeQuery = true)
    List<Politist> toataListaPolitisti();

    // Inserez un nou politist folosind SQL pur, fara a depinde de logica implicita a Hibernate
    @Modifying
    @Transactional
    @Query(value = "INSERT INTO Politisti (nume, prenume, grad, functie, telefon_serviciu) VALUES (:nume, :prenume, :grad, :functie, :telefon)", nativeQuery = true)
    void adaugaPolitistManual(@Param("nume") String nume, @Param("prenume") String prenume, @Param("grad") String grad, @Param("functie") String functie, @Param("telefon") String telefon);

    // Stergerea unui politist din baza de date dupa ID
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM Politisti WHERE id_politist = :id", nativeQuery = true)
    void stergePolitistManual(@Param("id") Integer id);

    // Am nevoie de aceasta metoda pentru a sti ce ID a primit ultimul politist adaugat
    @Query(value = "SELECT MAX(id_politist) FROM Politisti", nativeQuery = true)
    Integer getLastInsertedId();

    // Actualizez informatiile unui politist existent
    @Modifying
    @Transactional
    @Query(value = "UPDATE Politisti SET nume = :nume, prenume = :prenume, grad = :grad, functie = :functie, telefon_serviciu = :telefon_serviciu WHERE id_politist = :id_politist", nativeQuery = true)
    void updatePolitist(@Param("id_politist") Integer id_politist, @Param("nume") String nume, @Param("prenume") String prenume, @Param("grad") String grad, @Param("functie") String functie, @Param("telefon_serviciu") String telefon_serviciu);

    // === SEARCH INTELIGENT (_100_CI_AI) ===
    // Am modificat LIKE-ul pentru a cauta doar la inceputul cuvintelor (fara %)
    // Am folosit un Collation special pentru a ignora accentele si literele mari/mici
    @Query(value = "SELECT * FROM Politisti WHERE " +
            "CONCAT(COALESCE(nume, ''), ' ', COALESCE(prenume, ''), ' ', COALESCE(grad, ''), ' ', COALESCE(functie, ''), ' ', COALESCE(telefon_serviciu, '')) " +
            "COLLATE Latin1_General_100_CI_AI " +
            "LIKE CONCAT(:termen, '%')", nativeQuery = true)
    List<Politist> cautaDupaInceput(@Param("termen") String termen);

    // Metoda standard de gasire dupa ID, dar scrisa nativ
    @Query(value = "SELECT * FROM Politisti WHERE id_politist = :id", nativeQuery = true)
    Optional<Politist> findByIdNative(@Param("id") Integer id);

    // --- RAPOARTE DE PERFORMANTA ---
    // Aici calculez ce politisti au dat cele mai mari amenzi intr-un interval de timp
    @Query(value = "SELECT p.nume, p.prenume, p.grad, p.functie, SUM(a.suma) as total_valoare FROM politisti p JOIN amenzi a ON p.id_politist = a.id_politist WHERE (:startDate IS NULL OR a.data_emitere >= :startDate) AND (:endDate IS NULL OR a.data_emitere <= :endDate) GROUP BY p.id_politist, p.nume, p.prenume, p.grad, p.functie ORDER BY total_valoare DESC", nativeQuery = true)
    List<Map<String, Object>> getTopPolitistiAmenzi(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    // Statistici grupate pe grade (ex: cati bani au adus Agentii vs Inspectorii)
    @Query(value = "SELECT p.grad, COUNT(a.id_amenda) as nr_amenzi, SUM(a.suma) as valoare_totala FROM politisti p JOIN amenzi a ON p.id_politist = a.id_politist WHERE (:startDate IS NULL OR a.data_emitere >= :startDate) AND (:endDate IS NULL OR a.data_emitere <= :endDate) GROUP BY p.grad", nativeQuery = true)
    List<Map<String, Object>> getStatisticiPerGrad(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    // Filtru complex: Gasesc politistii care dau amenzi peste media sectiei (Agenti Severi)
    @Query(value = "SELECT p.nume, p.prenume, p.grad, p.functie, AVG(a.suma) as medie_personala FROM Politisti p JOIN Amenzi a ON p.id_politist = a.id_politist WHERE (:startDate IS NULL OR a.data_emitere >= :startDate) AND (:endDate IS NULL OR a.data_emitere <= :endDate) GROUP BY p.id_politist, p.nume, p.prenume, p.grad, p.functie HAVING AVG(a.suma) > (SELECT AVG(a2.suma) FROM Amenzi a2 WHERE (:startDate IS NULL OR a2.data_emitere >= :startDate) AND (:endDate IS NULL OR a2.data_emitere <= :endDate)) ORDER BY medie_personala DESC", nativeQuery = true)
    List<Map<String, Object>> getAgentiSeveri(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    // Caut politistul special 'ARHIVA' pentru a muta dosarele orfanilor
    @Query(value = "SELECT * FROM Politisti WHERE nume = 'ARHIVA' AND prenume = 'SISTEM' LIMIT 1", nativeQuery = true)
    Optional<Politist> findPolitistArhiva();

    // Verific daca telefonul este unic (excluzand ID-ul curent la editare)
    @Query(value = "SELECT count(*) FROM Politisti WHERE telefon_serviciu = :tel AND (:idExclus IS NULL OR id_politist != :idExclus)", nativeQuery = true)
    int verificaTelefonUnic(@Param("tel") String tel, @Param("idExclus") Integer idExclus);
}