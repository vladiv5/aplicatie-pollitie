USE SectiePolitieDB;
GO

INSERT INTO Adrese (strada, numar, bloc, apartament, localitate, judet_sau_sector) VALUES
('Bd. Unirii', '10', 'Z3', 12, 'Bucuresti', 'Sector 3'), -- ID 1
('Str. Mihai Viteazu', '22A', NULL, NULL, 'Ploiesti', 'Prahova'), -- ID 2
('Aleea Trandafirilor', '5', 'T1', 30, 'Bucuresti', 'Sector 6'), -- ID 3
('Calea Victoriei', '110', NULL, NULL, 'Bucuresti', 'Sector 1'), -- ID 4
('Str. Libertatii', '1', NULL, NULL, 'Cluj-Napoca', 'Cluj'), -- ID 5
('Bd. Independentei', '50', 'A5', 2, 'Iasi', 'Iasi'), -- ID 6
('Str. Avram Iancu', '150', NULL, NULL, 'Cluj-Napoca', 'Cluj'), -- ID 7
('Bd. Dacia', '33', 'D2', 17, 'Bucuresti', 'Sector 2'), -- ID 8
('Splaiul Independentei', '290', 'R1', 101, 'Bucuresti', 'Sector 6'), -- ID 9
('Str. Republicii', '8', NULL, NULL, 'Brasov', 'Brasov'), -- ID 10
('Bd. Carol I', '25', NULL, NULL, 'Craiova', 'Dolj'), -- ID 11
('Str. Baba Novac', '14', 'G1', 8, 'Bucuresti', 'Sector 3'), -- ID 12
('Str. Napoca', '12', NULL, NULL, 'Cluj-Napoca', 'Cluj'), -- ID 13
('Bd. Tomis', '300', 'T2', 5, 'Constanta', 'Constanta'), -- ID 14
('Aleea Studentilor', '1', 'C1', 205, 'Timisoara', 'Timis'), -- ID 15
('Piata Sfatului', '3', NULL, NULL, 'Brasov', 'Brasov'), -- ID 16
('Str. Gh. Lazar', '9', NULL, NULL, 'Timisoara', 'Timis'), -- ID 17
('Calea Mosilor', '220', 'M5', 15, 'Bucuresti', 'Sector 2'), -- ID 18
('Str. Lunga', '112', NULL, NULL, 'Brasov', 'Brasov'), -- ID 19
('Bd. Ghencea', '43B', 'C2', 44, 'Bucuresti', 'Sector 6'); -- ID 20
GO

INSERT INTO Politisti (nume, prenume, grad, functie, telefon_serviciu) VALUES
('Popescu', 'Vasile', 'Comisar Sef', 'Sef Sectie', '0722100200'), -- ID 1
('Ionescu', 'Maria', 'Agent Sef', 'Ordine Publica', '0745200300'), -- ID 2
('Radulescu', 'Andrei', 'Subinspector', 'Politia Rutiera', '0766300400'), -- ID 3
('Dumitru', 'Elena', 'Comisar', 'Investigatii Criminale', '0729400500'), -- ID 4
('Constantin', 'Mihai', 'Agent', 'Ordine Publica', '0735500600'), -- ID 5
('Barbu', 'Ion', 'Agent Principal', 'Politia Rutiera', '0788600700'), -- ID 6
('Neagu', 'Florin', 'Inspector', 'Investigatii Criminale', '0721700800'), -- ID 7
('Stoica', 'Roxana', 'Agent', 'Proximitate', '0744800900'), -- ID 8
('Grigorescu', 'Dan', 'Comisar', 'Economic', '0765900100'), -- ID 9
('Anghel', 'Catalina', 'Subinspector', 'Ordine Publica', '0733100110'), -- ID 10
('Manea', 'Sergiu', 'Agent', 'Politia Rutiera', '0722333444'), -- ID 11
('Craciun', 'Diana', 'Inspector', 'Investigatii Criminale', '0749555666'), -- ID 12
('Dinu', 'George', 'Agent Sef', 'Ordine Publica', '0767777888'), -- ID 13
('Petre', 'Marius', 'Agent', 'Proximitate', '0731222333'), -- ID 14
('Voicu', 'Alexandru', 'Comisar', 'Investigatii Criminale', '0728999000'); -- ID 15
GO

INSERT INTO Persoane (nume, prenume, CNP, data_nasterii, telefon) VALUES
('Stan', 'Ana-Maria', '2900101123456', '1990-01-01', '0744111222'), -- ID 1
('Georgescu', 'Mihai', '1880510223344', '1988-05-10', '0723111333'), -- ID 2
('Marin', 'Alexandru', '1950720334455', '1995-07-20', '0766111444'), -- ID 3
('Diaconu', 'Gabriela', '2850315556677', '1985-03-15', '0729111666'), -- ID 4
('Pop', 'Traian', '1850615445566', '1985-06-15', '0740111777'), -- ID 5
('Vasilescu', 'Cristian', '1990220667788', '1999-02-20', '0788111888'), -- ID 6
('Tudor', 'Vlad', '1801212778899', '1980-12-12', '0765111999'), -- ID 7
('Mocanu', 'Andreea', '2920405889900', '1992-04-05', '0722111000'), -- ID 8
('Dobre', 'Stefan', '1750930990011', '1975-09-30', '0749112111'), -- ID 9
('Florea', 'Laura', '2970814001122', '1997-08-14', '0730112222'), -- ID 10
('Ciobanu', 'Robert', '1910625112233', '1991-06-25', '0722112333'), -- ID 11
('Rusu', 'Matei', '5010310223344', '2001-03-10', '0745334455'), -- ID 12
('Ilie', 'Simona', '6030120556677', '2003-01-20', '0766445566'), -- ID 13
('Manole', 'Victor', '1680214667788', '1968-02-14', '0721556677'), -- ID 14
('Oprea', 'David', '5001130778899', '2000-11-30', '0743667788'), -- ID 15
('Dumitrescu', 'Ioana', '2770808889900', '1977-08-08', '0732778899'), -- ID 16
('Barbu', 'Andrei', '1930412990011', '1993-04-12', '0728889900'), -- ID 17
('Ene', 'Catalina', '2980909001122', '1998-09-09', '0769990011'), -- ID 18
('Lazar', 'Mihnea', '1821005112233', '1982-10-05', '0727001122'), -- ID 19
('Antonescu', 'Elena', '2860718223344', '1986-07-18', '0748112233'); -- ID 20
GO

INSERT INTO Incidente (tip_incident, data_emitere, descriere_locatie, descriere_incident, id_politist_responsabil, id_adresa_incident) VALUES
('Furt din buzunare', '2025-10-20 14:30:00', 'Statia de metrou Unirii', 'Victima raporteaza sustragerea portofelului in aglomeratie, in timp ce urca in metrou.', 4, 1),
('Accident rutier', '2025-10-21 08:15:00', 'Intersectie Calea Victoriei', 'Coliziune frontala usoara intre doua autovehicule. Fara victime, doar pagube materiale.', 3, 4),
('Tulburarea linistii publice', '2025-10-21 22:00:00', 'Apartament 30, Bloc T1', 'Muzica la volum excesiv raportata de vecini in mod repetat. Patrula s-a deplasat la fata locului.', 2, 3),
('Furt calificat', '2025-10-22 10:00:00', 'Magazin Profi Libertatii', 'Suspectul a sustras bunuri de pe raft si a devenit violent la iesirea din magazin.', 7, 5),
('Conflict', '2025-10-22 18:00:00', 'Parc zona Mihai Viteazu', 'Conflict verbal intre doua grupuri de tineri, escaladat in imbranceli. Fara vatamari.', 5, 2),
('Insusire bun gasit', '2025-10-23 12:00:00', 'Mall Vitan', 'Persoana a gasit un telefon mobil pe o banca si nu l-a predat autoritatilor sau pazei.', 4, 12),
('Talharie', '2025-10-24 19:45:00', 'Alee intunecata langa camin R1', 'Victima a fost amenintata si i s-a sustras geanta. Autorii au fugit.', 7, 9),
('Scandal in loc public', '2025-10-25 03:00:00', 'Statie autobuz Dacia', 'Doi indivizi in stare de ebrietate au provocat scandal si au adresat injurii trecatorilor.', 10, 8),
('Accident rutier cu victima', '2025-10-26 17:10:00', 'Trecere de pietoni Carol I', 'Conducatorul auto nu a acordat prioritate si a acrosat un pieton. Victima a fost transportata la spital.', 6, 11),
('Inselaciune online', '2025-10-27 11:00:00', 'Plangere depusa la sediu', 'Victima raporteaza pierderea unei sume de bani in urma unei tranzactii false pe un site de anunturi.', 9, 1),
('Furt din auto', '2025-10-27 21:00:00', 'Parcare subterana Piata Sfatului', 'Fortarea portierei si sustragerea unui laptop de pe bancheta din spate a autoturismului.', 12, 16),
('Distrugere ATM', '2025-10-28 01:50:00', 'Sucursala BCR Napoca', 'Tentativa de fortare a bancomatului cu un obiect contondent. Alarma s-a declansat.', 15, 13),
('Vatamare corporala', '2025-10-28 19:00:00', 'Bar "La Studentu"', 'Conflict izbucnit intre doi clienti, soldat cu lovirea unuia dintre ei. Necesita ingrijiri medicale.', 13, 15),
('Spargere locuinta', '2025-10-29 14:00:00', 'Apartament 15, Calea Mosilor', 'Autorii au patruns prin efractie (fortarea butucului) si au sustras bijuterii si electronice.', 15, 18),
('Evaziune fiscala', '2025-10-30 10:00:00', 'Sediul firmei Fantom SRL', 'Plangere privind nedeclararea veniturilor si utilizarea de facturi false.', 9, 17);
GO

INSERT INTO Amenzi (data_emitere, motiv, suma, stare_plata, id_persoana, id_politist) VALUES
('2025-10-21 22:30:00', 'Tulburarea linistii publice', 400.00, 'Neplatita', 3, 2),
('2025-10-21 08:30:00', 'Neacordare prioritate', 870.00, 'Platita', 2, 3),
('2025-10-22 15:00:00', 'Fumat in spatiu interzis', 300.00, 'Neplatita', 5, 5),
('2025-10-22 18:10:00', 'Consum de alcool in public', 200.00, 'Platita', 3, 5),
('2025-10-23 10:00:00', 'Trecere pe rosu', 700.00, 'Anulata', 1, 3),
('2025-10-24 12:00:00', 'Parcare neregulamentara', 450.00, 'Neplatita', 7, 6),
('2025-10-24 12:05:00', 'Parcare neregulamentara', 450.00, 'Neplatita', 8, 6),
('2025-10-25 14:00:00', 'Lipsa documente', 150.00, 'Platita', 10, 2),
('2025-10-26 17:30:00', 'Neacordare prioritate pietoni', 1100.00, 'Neplatita', 11, 6),
('2025-10-27 09:00:00', 'Viteza excesiva (65km/h in localitate)', 600.00, 'Platita', 9, 3),
('2025-10-27 16:20:00', 'Prezentare date false', 1000.00, 'Anulata', 12, 8),
('2025-10-28 11:00:00', 'Comert ambulant neautorizat', 500.00, 'Neplatita', 5, 8),
('2025-10-28 13:00:00', 'Viteza excesiva (81km/h in localitate)', 1300.00, 'Neplatita', 17, 11),
('2025-10-29 17:00:00', 'Parcare pe trecerea de pietoni', 700.00, 'Neplatita', 19, 11),
('2025-10-29 19:10:00', 'Refuz legitimare', 500.00, 'Platita', 15, 13),
('2025-10-30 10:00:00', 'Stationare interzisa', 250.00, 'Platita', 14, 5),
('2025-10-30 11:00:00', 'Depasire linie continua', 870.00, 'Neplatita', 2, 6),
('2025-10-30 15:30:00', 'Lipsa ITP', 1500.00, 'Neplatita', 7, 3);
GO

INSERT INTO Persoane_Adrese (id_persoana, id_adresa, tip_adresa) VALUES
(1, 1, 'Domiciliu'),
(2, 2, 'Domiciliu'),
(3, 3, 'Domiciliu'),
(4, 3, 'Domiciliu'),
(5, 5, 'Domiciliu'),
(5, 18, 'Resedinta'),
(6, 6, 'Domiciliu'),
(7, 7, 'Domiciliu'),
(8, 8, 'Domiciliu'),
(9, 9, 'Resedinta'),
(10, 10, 'Domiciliu'),
(11, 9, 'Domiciliu'),
(12, 11, 'Resedinta'),
(13, 12, 'Domiciliu'),
(14, 13, 'Domiciliu'),
(15, 14, 'Resedinta'),
(16, 15, 'Domiciliu'),
(17, 16, 'Domiciliu'),
(18, 17, 'Domiciliu'),
(19, 19, 'Resedinta'),
(20, 20, 'Domiciliu');
GO

INSERT INTO Persoane_Incidente (id_persoana, id_incident, calitate) VALUES
(1, 1, 'Victima'),
(2, 2, 'Victima'),
(7, 2, 'Suspect'),
(3, 3, 'Suspect'),
(4, 3, 'Reclamant'),
(6, 4, 'Suspect'),
(14, 4, 'Martor'),
(4, 5, 'Martor'),
(8, 6, 'Victima'),
(9, 7, 'Victima'),
(11, 7, 'Suspect'),
(15, 8, 'Martor'),
(17, 8, 'Suspect'),
(10, 9, 'Victima'),
(11, 9, 'Suspect'),
(12, 10, 'Victima'),
(19, 11, 'Martor'),
(14, 12, 'Martor'),
(15, 13, 'Victima'),
(16, 13, 'Suspect'),
(18, 13, 'Reclamant'),
(20, 14, 'Victima'),
(19, 15, 'Suspect'),
(9, 15, 'Reclamant');
GO
