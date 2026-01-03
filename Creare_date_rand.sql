-- =============================================
-- SCRIPT GENERARE DATE TEST - VERSIUNEA "PLATINUM" (FIXED)
-- AMENZI: 50% Platite, 25% Neplatite, 25% Anulate
-- INCIDENTE: 40% Activ, 30% Inchis, 30% Arhivat
-- FIX: Prevenire duplicate cheie primara la participanti
-- =============================================

SET NOCOUNT ON;

-- =============================================
-- 1. CURATARE BAZA DE DATE (SIGURA)
-- =============================================
PRINT '1. Curatare baza de date...'

IF OBJECT_ID('dbo.Persoane_Incidente', 'U') IS NOT NULL DELETE FROM Persoane_Incidente;
IF OBJECT_ID('dbo.Persoane_Adrese', 'U') IS NOT NULL DELETE FROM Persoane_Adrese;
DELETE FROM Amenzi;
DELETE FROM Incidente;
DELETE FROM Politisti;
DELETE FROM Persoane;
DELETE FROM Adrese;

DBCC CHECKIDENT ('Amenzi', RESEED, 0);
DBCC CHECKIDENT ('Incidente', RESEED, 0);
DBCC CHECKIDENT ('Politisti', RESEED, 0);
DBCC CHECKIDENT ('Persoane', RESEED, 0);
DBCC CHECKIDENT ('Adrese', RESEED, 0);

PRINT '   Curatare finalizata.'

-- =============================================
-- 2. DEFINIRE VARIABILE SI LISTE
-- =============================================
DECLARE @Nume TABLE (Valoare NVARCHAR(50));
INSERT INTO @Nume VALUES ('Popescu'), ('Ionescu'), ('Radu'), ('Dumitru'), ('Stoica'), ('Dobre'), ('Gheorghe'), ('Stan'), ('Matei'), ('Ciobanu'), ('Enache'), ('Munteanu'), ('Diaconu'), ('Vlad'), ('Ivan'), ('Nistor'), ('Oprea'), ('Voicu'), ('Marinescu'), ('Dumitrescu'), ('Florescu'), ('Grigore'), ('Stanciu');

DECLARE @Prenume TABLE (Valoare NVARCHAR(50));
INSERT INTO @Prenume VALUES ('Andrei'), ('Alexandru'), ('Ionut'), ('Gabriel'), ('Stefan'), ('Mihai'), ('Cristian'), ('Florin'), ('Daniel'), ('Vlad'), ('Elena'), ('Maria'), ('Ana'), ('Ioana'), ('Andreea'), ('Carmen'), ('Roxana'), ('Mircea'), ('Adrian'), ('Nicolae'), ('Simona'), ('Daniela');

DECLARE @Orase TABLE (Oras NVARCHAR(50), Judet NVARCHAR(50));
INSERT INTO @Orase VALUES 
('Bucuresti', 'Sector 1'), ('Bucuresti', 'Sector 2'), ('Bucuresti', 'Sector 3'), ('Bucuresti', 'Sector 4'), ('Bucuresti', 'Sector 5'), ('Bucuresti', 'Sector 6'),
('Cluj-Napoca', 'Cluj'), ('Timisoara', 'Timis'), ('Iasi', 'Iasi'), ('Constanta', 'Constanta'), 
('Brasov', 'Brasov'), ('Craiova', 'Dolj'), ('Ploiesti', 'Prahova');

DECLARE @Strazi TABLE (Valoare NVARCHAR(100));
INSERT INTO @Strazi VALUES 
('Bulevardul Unirii'), ('Calea Victoriei'), ('Strada Libertatii'), ('Bulevardul Eroilor'), 
('Strada Mare'), ('Strada Garii'), ('Aleea Rozelor'), ('Strada Mihai Eminescu'), 
('Strada Avram Iancu'), ('Strada Cuza Voda'), ('Bulevardul Republicii'), ('Strada Primaverii'),
('Strada Sportului'), ('Strada Pacii'), ('Aleea Teilor'), ('Strada Lunga');

DECLARE @GradeTeren TABLE (Valoare NVARCHAR(50)); INSERT INTO @GradeTeren VALUES ('Agent'), ('Agent Principal'), ('Agent Sef');
DECLARE @GradeBirou TABLE (Valoare NVARCHAR(50)); INSERT INTO @GradeBirou VALUES ('Subinspector'), ('Inspector'), ('Comisar'), ('Chestor');
DECLARE @Functii TABLE (Valoare NVARCHAR(50)); INSERT INTO @Functii VALUES ('Rutiera'), ('Ordine Publica'), ('Investigatii Criminale'), ('Logistica');
DECLARE @TipuriIncidente TABLE (Valoare NVARCHAR(50)); INSERT INTO @TipuriIncidente VALUES ('Furt Calificat'), ('Accident Rutier'), ('Tulburarea Linistii'), ('Violenta Domestica'), ('Vandalism'), ('Inselaciune'), ('Infractiune Informatica'), ('Disparitie Persoana'), ('Incendiu');

DECLARE @RepereLocatie TABLE (Txt NVARCHAR(100));
INSERT INTO @RepereLocatie VALUES 
('Langa parcul central'), ('In incinta mall-ului'), ('La intrarea in metrou'),
('In parcarea supermarketului'), ('Langa Scoala Generala nr. 1'), ('In fata Spitalului Judetean'),
('Pe aleea din spatele blocului'), ('La intrarea in scara blocului'), ('In farmacie'),
('La casa de pariuri'), ('In statia de autobuz'), ('In curtea liceului'),
('La bancomat'), ('In intersectia principala'), ('Pe terenul de sport'),
('In incinta bancii'), ('La benzinarie'), ('Langa biserica'),
('In sala de jocuri'), ('La magazinul non-stop'), ('In cladirea de birouri'),
('Pe podul pietonal'), ('Langa oficiul postal'), ('In piata agroalimentara'),
('La terasa restaurantului'), ('In autogara'), ('Pe santierul in constructie');

DECLARE @i INT = 0;
DECLARE @DataStart DATETIME = '2025-01-01 08:00:00'; 
DECLARE @ZileTotale INT = 396; 

-- =============================================
-- 3. GENERARE ADRESE
-- =============================================
PRINT '2. Generare Adrese...'
SET @i = 0;
WHILE @i < 300 
BEGIN
    DECLARE @RandOras NVARCHAR(50), @RandJudet NVARCHAR(50);
    SELECT TOP 1 @RandOras = Oras, @RandJudet = Judet FROM @Orase ORDER BY NEWID();

    INSERT INTO Adrese (strada, numar, bloc, apartament, localitate, judet_sau_sector)
    SELECT TOP 1 Valoare, 
        CAST(ABS(CHECKSUM(NEWID()) % 200) + 1 AS VARCHAR), 
        CASE WHEN RAND() > 0.6 THEN CAST(ABS(CHECKSUM(NEWID()) % 50) + 1 AS VARCHAR) ELSE NULL END,
        CASE WHEN RAND() > 0.6 THEN CAST(ABS(CHECKSUM(NEWID()) % 80) + 1 AS INT) ELSE NULL END,
        @RandOras, @RandJudet
    FROM @Strazi ORDER BY NEWID();
    SET @i = @i + 1;
END

-- =============================================
-- 4. GENERARE POLITISTI
-- =============================================
PRINT '3. Generare Politisti...'
INSERT INTO Politisti (nume, prenume, grad, functie, telefon_serviciu) VALUES ('Popescu', 'Andrei', 'Agent', 'Rutiera', '0711111111'), ('Popescu', 'Andrei', 'Comisar', 'Investigatii Criminale', '0722222222');

SET @i = 0;
WHILE @i < 60
BEGIN
    DECLARE @IsFieldOfficer BIT = CASE WHEN RAND() > 0.3 THEN 1 ELSE 0 END;
    DECLARE @GradPolitist NVARCHAR(50);
    IF @IsFieldOfficer = 1 SELECT TOP 1 @GradPolitist = Valoare FROM @GradeTeren ORDER BY NEWID();
    ELSE SELECT TOP 1 @GradPolitist = Valoare FROM @GradeBirou ORDER BY NEWID();

    INSERT INTO Politisti (nume, prenume, grad, functie, telefon_serviciu)
    SELECT TOP 1 (SELECT TOP 1 Valoare FROM @Nume ORDER BY NEWID()), (SELECT TOP 1 Valoare FROM @Prenume ORDER BY NEWID()), @GradPolitist, (SELECT TOP 1 Valoare FROM @Functii ORDER BY NEWID()), '07' + RIGHT('00000000' + CAST(ABS(CHECKSUM(NEWID())) AS VARCHAR), 8)
    SET @i = @i + 1;
END

-- =============================================
-- 5. GENERARE PERSOANE + ADRESE
-- =============================================
PRINT '4. Generare Persoane si Adrese...'
SET @i = 0;
WHILE @i < 300
BEGIN
    DECLARE @CNP VARCHAR(13) = CASE WHEN RAND() > 0.5 THEN '1' ELSE '2' END + RIGHT('00' + CAST(ABS(CHECKSUM(NEWID()) % 99) AS VARCHAR), 2) + RIGHT('00' + CAST(ABS(CHECKSUM(NEWID()) % 12) + 1 AS VARCHAR), 2) + RIGHT('00' + CAST(ABS(CHECKSUM(NEWID()) % 28) + 1 AS VARCHAR), 2) + RIGHT('000000' + CAST(ABS(CHECKSUM(NEWID())) AS VARCHAR), 6);
    DECLARE @DataNasterii DATE = DATEADD(DAY, -(ABS(CHECKSUM(NEWID()) % 365)), DATEADD(YEAR, -(ABS(CHECKSUM(NEWID()) % 60) + 18), GETDATE()));

    INSERT INTO Persoane (nume, prenume, cnp, data_nasterii, telefon)
    SELECT TOP 1 (SELECT TOP 1 Valoare FROM @Nume ORDER BY NEWID()), (SELECT TOP 1 Valoare FROM @Prenume ORDER BY NEWID()), @CNP, @DataNasterii, '07' + RIGHT('00000000' + CAST(ABS(CHECKSUM(NEWID())) AS VARCHAR), 8)
    
    DECLARE @NewPersonID INT = SCOPE_IDENTITY();

    IF RAND() < 0.95 
    BEGIN
        DECLARE @IdDomiciliu INT; SELECT TOP 1 @IdDomiciliu = id_adresa FROM Adrese ORDER BY NEWID();
        INSERT INTO Persoane_Adrese (id_persoana, id_adresa, tip_adresa) VALUES (@NewPersonID, @IdDomiciliu, 'Domiciliu');

        IF RAND() < 0.30
        BEGIN
            DECLARE @IdResedinta INT; SELECT TOP 1 @IdResedinta = id_adresa FROM Adrese WHERE id_adresa <> @IdDomiciliu ORDER BY NEWID();
            INSERT INTO Persoane_Adrese (id_persoana, id_adresa, tip_adresa) VALUES (@NewPersonID, @IdResedinta, 'Resedinta');
        END
    END
    SET @i = @i + 1;
END

-- =============================================
-- 6. GENERARE INCIDENTE + MULTIPLE PERSOANE
-- =============================================
PRINT '5. Generare Incidente...'
SET @i = 0;
WHILE @i < 400 
BEGIN
    DECLARE @DataIncident DATETIME = DATEADD(hour, ABS(CHECKSUM(NEWID()) % 24), DATEADD(day, ABS(CHECKSUM(NEWID()) % @ZileTotale), @DataStart));
    DECLARE @IdAdresa INT; SELECT TOP 1 @IdAdresa = id_adresa FROM Adrese ORDER BY NEWID();
    DECLARE @LocatieScurta NVARCHAR(255); SELECT TOP 1 @LocatieScurta = Txt FROM @RepereLocatie ORDER BY NEWID();

    DECLARE @TipInc NVARCHAR(50); SELECT TOP 1 @TipInc = Valoare FROM @TipuriIncidente ORDER BY NEWID();
    DECLARE @Desc NVARCHAR(255);
    
    IF @TipInc = 'Furt Calificat' SET @Desc = 'Sustragere de bunuri. Victima declara lipsa portofelului.';
    ELSE IF @TipInc = 'Accident Rutier' SET @Desc = 'Coliziune usoara. Soferii au completat amiabila.';
    ELSE IF @TipInc = 'Tulburarea Linistii' SET @Desc = 'Muzica tare si galagie reclamata de vecini.';
    ELSE IF @TipInc = 'Violenta Domestica' SET @Desc = 'Conflict intre soti. Politia a emis ordin de protectie.';
    ELSE IF @TipInc = 'Vandalism' SET @Desc = 'Distrugere de bunuri in spatiul public.';
    ELSE SET @Desc = 'Incident semnalat prin 112.';

    -- Status: 40% Activ, 30% Inchis, 30% Arhivat
    DECLARE @StatusInc NVARCHAR(20) = CASE 
        WHEN RAND() < 0.40 THEN 'Activ'
        WHEN RAND() < 0.70 THEN 'Închis'
        ELSE 'Arhivat'
    END;

    INSERT INTO Incidente (tip_incident, data_emitere, descriere_locatie, descriere_incident, id_politist_responsabil, id_adresa_incident, status)
    VALUES (@TipInc, @DataIncident, @LocatieScurta, @Desc, (SELECT TOP 1 id_politist FROM Politisti ORDER BY NEWID()), @IdAdresa, @StatusInc);
    
    DECLARE @NewIncidentID INT = SCOPE_IDENTITY();

    -- ACTORI: Victima 1 (Obligatoriu)
    DECLARE @Victima1 INT; SELECT TOP 1 @Victima1 = id_persoana FROM Persoane ORDER BY NEWID();
    INSERT INTO Persoane_Incidente (id_persoana, id_incident, calitate) VALUES (@Victima1, @NewIncidentID, 'Victima');

    -- Victima Extra
    IF RAND() < 0.3 
    BEGIN
        DECLARE @Victima2 INT; SELECT TOP 1 @Victima2 = id_persoana FROM Persoane WHERE id_persoana <> @Victima1 ORDER BY NEWID();
        -- !!! FIX: VERIFICARE EXISTENTA INAINTE DE INSERT !!!
        IF NOT EXISTS (SELECT 1 FROM Persoane_Incidente WHERE id_persoana = @Victima2 AND id_incident = @NewIncidentID)
            INSERT INTO Persoane_Incidente (id_persoana, id_incident, calitate) VALUES (@Victima2, @NewIncidentID, 'Victima');
    END

    -- Suspect 1
    IF RAND() < 0.5
    BEGIN
        DECLARE @Suspect1 INT; SELECT TOP 1 @Suspect1 = id_persoana FROM Persoane WHERE id_persoana <> @Victima1 ORDER BY NEWID();
        -- !!! FIX: VERIFICARE EXISTENTA !!!
        IF NOT EXISTS (SELECT 1 FROM Persoane_Incidente WHERE id_persoana = @Suspect1 AND id_incident = @NewIncidentID)
            INSERT INTO Persoane_Incidente (id_persoana, id_incident, calitate) VALUES (@Suspect1, @NewIncidentID, 'Suspect');
        
        -- Suspect 2
        IF RAND() < 0.3
        BEGIN
            DECLARE @Suspect2 INT; SELECT TOP 1 @Suspect2 = id_persoana FROM Persoane WHERE id_persoana NOT IN (@Victima1, @Suspect1) ORDER BY NEWID();
            -- !!! FIX: VERIFICARE EXISTENTA !!!
            IF NOT EXISTS (SELECT 1 FROM Persoane_Incidente WHERE id_persoana = @Suspect2 AND id_incident = @NewIncidentID)
                INSERT INTO Persoane_Incidente (id_persoana, id_incident, calitate) VALUES (@Suspect2, @NewIncidentID, 'Suspect');
        END
    END

    -- Martor
    IF RAND() < 0.3
    BEGIN
        DECLARE @Martor INT; SELECT TOP 1 @Martor = id_persoana FROM Persoane ORDER BY NEWID();
        -- !!! FIX: VERIFICARE EXISTENTA !!!
        IF NOT EXISTS (SELECT 1 FROM Persoane_Incidente WHERE id_persoana = @Martor AND id_incident = @NewIncidentID)
            INSERT INTO Persoane_Incidente (id_persoana, id_incident, calitate) VALUES (@Martor, @NewIncidentID, 'Martor');
    END

    -- Reclamant
    IF RAND() < 0.3
    BEGIN
         DECLARE @Reclamant INT; SELECT TOP 1 @Reclamant = id_persoana FROM Persoane ORDER BY NEWID();
         -- !!! FIX: VERIFICARE EXISTENTA !!!
         IF NOT EXISTS (SELECT 1 FROM Persoane_Incidente WHERE id_persoana = @Reclamant AND id_incident = @NewIncidentID)
            INSERT INTO Persoane_Incidente (id_persoana, id_incident, calitate) VALUES (@Reclamant, @NewIncidentID, 'Reclamant');
    END

    SET @i = @i + 1;
END

-- =============================================
-- 7. GENERARE AMENZI (DISTRIBUTIE PROCENTUALA NOUA)
-- =============================================
PRINT '6. Generare Amenzi (50% Platite, 25% Neplatite, 25% Anulate)...'
SET @i = 0;
WHILE @i < 700
BEGIN
    DECLARE @DataAmenda DATETIME = DATEADD(hour, ABS(CHECKSUM(NEWID()) % 24), DATEADD(day, ABS(CHECKSUM(NEWID()) % @ZileTotale), @DataStart));
    DECLARE @Valoare DECIMAL(10, 2) = 50 + (ABS(CHECKSUM(NEWID()) % 120) * 25); 

    -- !!! NOUA DISTRIBUTIE !!!
    DECLARE @RandStare FLOAT = RAND();
    DECLARE @StarePlata NVARCHAR(20) = CASE 
        WHEN @RandStare < 0.50 THEN 'Platita'   -- 50%
        WHEN @RandStare < 0.75 THEN 'Neplatita' -- 25%
        ELSE 'Anulata'                          -- 25%
    END;

    INSERT INTO Amenzi (motiv, suma, stare_plata, data_emitere, id_politist, id_persoana)
    SELECT TOP 1 CASE WHEN RAND() < 0.3 THEN 'Viteza' ELSE 'Parcare ilegala' END, @Valoare, @StarePlata, @DataAmenda,
        (SELECT TOP 1 id_politist FROM Politisti WHERE grad IN ('Agent', 'Agent Principal', 'Agent Sef') ORDER BY NEWID()), 
        (SELECT TOP 1 id_persoana FROM Persoane ORDER BY NEWID())
    SET @i = @i + 1;
END

PRINT 'GENERARE PLATINUM MASTER REUSITA!'