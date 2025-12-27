USE SectiePolitieDB;
GO

CREATE TABLE Adrese (
id_adresa INT IDENTITY(1,1) PRIMARY KEY,
strada NVARCHAR(100) NOT NULL,
numar NVARCHAR(10) NOT NULL,
bloc NVARCHAR(10) NULL,
apartament INT null,
localitate NVARCHAR(50) NOT NULL,
judet_sau_sector NVARCHAR(50) NOT NULL
);

CREATE TABLE Politisti (
    id_politist INT IDENTITY(1,1) PRIMARY KEY,
    nume NVARCHAR(50) NOT NULL,
    prenume NVARCHAR(50) NOT NULL,
    grad NVARCHAR(50) NULL,
    functie NVARCHAR(100) NULL,
    telefon_serviciu NVARCHAR(15) UNIQUE NULL
);
GO

CREATE TABLE Persoane (
    id_persoana INT IDENTITY(1,1) PRIMARY KEY,
    nume NVARCHAR(50) NOT NULL,
    prenume NVARCHAR(50) NOT NULL,
    CNP NVARCHAR(13) NOT NULL UNIQUE,
    data_nasterii DATE NULL,
    telefon NVARCHAR(15) NULL
);
GO

CREATE TABLE Incidente (
    id_incident INT IDENTITY(1,1) PRIMARY KEY,
    tip_incident NVARCHAR(100) NOT NULL,
    data_emitere DATETIME2 NOT NULL,
    descriere_locatie NVARCHAR(255) NULL,
    descriere_fapte NVARCHAR(MAX) NULL,
    id_politist_responsabil INT,
    id_adresa_incident INT,
    
    CONSTRAINT FK_Incident_Politist FOREIGN KEY (id_politist_responsabil) 
        REFERENCES Politisti(id_politist),

    CONSTRAINT FK_Adresa_Incident FOREIGN KEY (id_adresa_incident)
        REFERENCES Adrese(id_adresa)
);
GO

CREATE TABLE Amenzi (
    id_amenda INT IDENTITY(1,1) PRIMARY KEY,
    data_emitere DATETIME2 NOT NULL,
    motiv NVARCHAR(255) NOT NULL,
    suma DECIMAL(10, 2) NOT NULL,
    stare_plata NVARCHAR(20) NOT NULL 
        CHECK (stare_plata IN ('Neplatita', 'Platita', 'Anulata')),
    
    id_persoana INT,
    id_politist INT,
    
    CONSTRAINT FK_Amenda_Persoana FOREIGN KEY (id_persoana) 
        REFERENCES Persoane(id_persoana),
    
    CONSTRAINT FK_Amenda_Politist FOREIGN KEY (id_politist) 
        REFERENCES Politisti(id_politist)
);
GO

CREATE TABLE Persoane_Adrese (
    id_persoana INT NOT NULL,
    id_adresa INT NOT NULL,
    tip_adresa NVARCHAR(20) NOT NULL 
        CHECK (tip_adresa IN ('Domiciliu', 'Resedinta')),
    
    CONSTRAINT PK_Persoane_Adrese PRIMARY KEY (id_persoana, id_adresa),
    
    CONSTRAINT FK_PA_Persoana FOREIGN KEY (id_persoana) 
        REFERENCES Persoane(id_persoana),

    CONSTRAINT FK_PA_Adresa FOREIGN KEY (id_adresa) 
        REFERENCES Adrese(id_adresa)
);
GO

CREATE TABLE Persoane_Incidente (
    id_persoana INT NOT NULL,
    id_incident INT NOT NULL,
    calitate NVARCHAR(20) NOT NULL 
        CHECK (calitate IN ('Victima', 'Martor', 'Suspect', 'Reclamant')),
    
    CONSTRAINT PK_Persoane_Incidente PRIMARY KEY (id_persoana, id_incident),
    
    CONSTRAINT FK_PI_Persoana FOREIGN KEY (id_persoana) 
        REFERENCES Persoane(id_persoana),

    CONSTRAINT FK_PI_Incident FOREIGN KEY (id_incident) 
        REFERENCES Incidente(id_incident)
);
GO