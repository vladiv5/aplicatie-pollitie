-- 1. Adaug coloanele FARA constrangerea UNIQUE direct
ALTER TABLE Politisti
ADD username VARCHAR(50) NULL;

ALTER TABLE Politisti
ADD password VARCHAR(100) NULL;

