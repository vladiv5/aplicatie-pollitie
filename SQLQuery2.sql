-- 2. Creez un INDEX SPECIAL care permite mai multe NULL-uri, dar username-urile scrise trebuie sa fie unice
CREATE UNIQUE INDEX IX_Politisti_Username_Unique
ON Politisti(username)
WHERE username IS NOT NULL;

-- 3. Inserez Admin-ul manual 
UPDATE Politisti SET username = 'admin', password = 'admin' WHERE nume = 'Admin';