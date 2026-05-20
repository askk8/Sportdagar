-- Sportdagar Seed Data
-- Run AFTER schema.sql in Supabase SQL editor

-- =============================================
-- SPORTS
-- =============================================

INSERT INTO sports (name, icon, color) VALUES
('Fotboll', '⚽', 'green'),
('Handboll', '🤾', 'orange'),
('Innebandy', '🏒', 'blue'),
('Bordtennis', '🏓', 'yellow'),
('Volleyboll', '🏐', 'purple'),
('Hockey', '🏑', 'red'),
('Konståkning', '⛸️', 'cyan'),
('Padel', '🎾', 'lime'),
('Boxning', '🥊', 'rose'),
('Basket', '🏀', 'amber');

-- =============================================
-- SPORT WEEKS
-- =============================================

INSERT INTO sport_weeks (title, description, start_date, end_date, location, is_published) VALUES
(
    'Sommarsportdagar 2025',
    'En fantastisk vecka fylld med sport och aktiviteter för barn i alla åldrar! Prova på olika sporter och träffa nya vänner.',
    '2025-07-07',
    '2025-07-11',
    'Idrottsparken, Stockholm',
    TRUE
),
(
    'Höstsportdagar 2025',
    'Perfekt tillfälle att prova nya sporter inför höstsäsongen. Välkommen till en rolig och aktiv vecka!',
    '2025-10-27',
    '2025-10-31',
    'Sporthallen, Bromma',
    TRUE
),
(
    'Vintersportdagar 2026',
    'Vinterkul med sport för hela familjen. Utomhus- och inomhusaktiviteter för alla åldrar.',
    '2026-02-16',
    '2026-02-20',
    'Isarenan, Solna',
    FALSE
);

-- =============================================
-- SESSIONS (Sommarsportdagar 2025)
-- =============================================

-- Get sport week IDs and sport IDs for reference
-- Week 1: Sommarsportdagar 2025

WITH
  week1 AS (SELECT id FROM sport_weeks WHERE title = 'Sommarsportdagar 2025'),
  week2 AS (SELECT id FROM sport_weeks WHERE title = 'Höstsportdagar 2025'),
  fotboll AS (SELECT id FROM sports WHERE name = 'Fotboll'),
  handboll AS (SELECT id FROM sports WHERE name = 'Handboll'),
  innebandy AS (SELECT id FROM sports WHERE name = 'Innebandy'),
  basket AS (SELECT id FROM sports WHERE name = 'Basket'),
  bordtennis AS (SELECT id FROM sports WHERE name = 'Bordtennis'),
  volleyboll AS (SELECT id FROM sports WHERE name = 'Volleyboll'),
  hockey AS (SELECT id FROM sports WHERE name = 'Hockey'),
  konstakaning AS (SELECT id FROM sports WHERE name = 'Konståkning')

INSERT INTO sessions (sport_week_id, sport_id, title, description, session_date, start_time, end_time, location, min_age, max_age, max_capacity) VALUES

-- Monday Week 1
((SELECT id FROM week1), (SELECT id FROM fotboll), 'Fotboll för yngre', 'Grundläggande fotbollsträning för de minsta', '2025-07-07', '09:00', '10:00', 'Fotbollsplan A', 6, 9, 20),
((SELECT id FROM week1), (SELECT id FROM handboll), 'Handboll introduktion', 'Lär dig grunderna i handboll', '2025-07-07', '10:00', '11:00', 'Sporthall 1', 8, 12, 16),
((SELECT id FROM week1), (SELECT id FROM basket), 'Basket för nybörjare', 'Kul och lärorik basketträning', '2025-07-07', '11:00', '12:00', 'Basketplan', 10, 14, 18),
((SELECT id FROM week1), (SELECT id FROM innebandy), 'Innebandy kul', 'Prova på innebandy i en rolig miljö', '2025-07-07', '13:00', '14:00', 'Sporthall 2', 8, 14, 20),
((SELECT id FROM week1), (SELECT id FROM bordtennis), 'Bordtennis & pingis', 'Lär dig spela bordtennis', '2025-07-07', '14:00', '15:00', 'Aktivitetsrum', 7, 16, 12),

-- Tuesday Week 1
((SELECT id FROM week1), (SELECT id FROM fotboll), 'Fotboll avancerat', 'För lite mer erfarna spelare', '2025-07-08', '09:00', '10:30', 'Fotbollsplan B', 10, 14, 20),
((SELECT id FROM week1), (SELECT id FROM volleyboll), 'Volleyboll nybörjare', 'Grunderna i volleyboll', '2025-07-08', '10:30', '11:30', 'Volleybollplan', 10, 16, 16),
((SELECT id FROM week1), (SELECT id FROM konstakaning), 'Konståkning', 'Prova på konståkning på is', '2025-07-08', '13:00', '14:00', 'Isarenan', 6, 12, 15),
((SELECT id FROM week1), (SELECT id FROM hockey), 'Hockeykul', 'Introduktion till ishockey', '2025-07-08', '14:30', '15:30', 'Isarenan', 8, 14, 16),

-- Wednesday Week 1
((SELECT id FROM week1), (SELECT id FROM handboll), 'Handboll turnering', 'Mini-turnering i handboll', '2025-07-09', '09:00', '11:00', 'Sporthall 1', 10, 16, 24),
((SELECT id FROM week1), (SELECT id FROM fotboll), 'Fotboll turnering', 'Rolig mini-turnering', '2025-07-09', '09:00', '11:00', 'Fotbollsplan A', 6, 10, 24),
((SELECT id FROM week1), (SELECT id FROM basket), 'Basket avancerat', 'Taktik och spelupplägg', '2025-07-09', '13:00', '14:30', 'Basketplan', 12, 16, 16),
((SELECT id FROM week1), (SELECT id FROM innebandy), 'Innebandy turnering', 'Mini-cup i innebandy', '2025-07-09', '13:00', '15:00', 'Sporthall 2', 10, 16, 24),

-- Thursday Week 1
((SELECT id FROM week1), (SELECT id FROM bordtennis), 'Bordtennis turnering', 'Tävla mot andra barn', '2025-07-10', '09:00', '11:00', 'Aktivitetsrum', 8, 16, 16),
((SELECT id FROM week1), (SELECT id FROM volleyboll), 'Volleyboll match', 'Spela match mot andra lag', '2025-07-10', '09:00', '11:00', 'Volleybollplan', 10, 16, 20),
((SELECT id FROM week1), (SELECT id FROM fotboll), 'Fotboll dag 4', 'Avancerade tekniker', '2025-07-10', '13:00', '14:30', 'Fotbollsplan A', 10, 16, 20),

-- Friday Week 1 (Avslutningsdag)
((SELECT id FROM week1), (SELECT id FROM fotboll), 'Stor fotbolls-cup', 'Avslutningens stora turnering', '2025-07-11', '10:00', '12:00', 'Fotbollsplan A', 6, 16, 40),
((SELECT id FROM week1), (SELECT id FROM basket), 'Basketfinal', 'Veckans sista basketmatch', '2025-07-11', '13:00', '14:30', 'Basketplan', 10, 16, 20),

-- Week 2: Höstsportdagar 2025
((SELECT id FROM week2), (SELECT id FROM fotboll), 'Höstfotboll', 'Fotboll i höstväder', '2025-10-27', '10:00', '11:30', 'Fotbollsplan A', 6, 12, 20),
((SELECT id FROM week2), (SELECT id FROM innebandy), 'Innebandy höst', 'Säsongsstart innebandy', '2025-10-27', '13:00', '14:30', 'Sporthall 1', 8, 14, 20),
((SELECT id FROM week2), (SELECT id FROM handboll), 'Handboll höst', 'Ny säsong börjar', '2025-10-28', '09:00', '10:30', 'Sporthall 2', 8, 14, 18),
((SELECT id FROM week2), (SELECT id FROM basket), 'Basket höst', 'Basketsäsongens start', '2025-10-28', '10:30', '12:00', 'Basketplan', 10, 16, 18),
((SELECT id FROM week2), (SELECT id FROM bordtennis), 'Bordtennis höst', 'Inomhussport för hösten', '2025-10-29', '13:00', '14:30', 'Aktivitetsrum', 7, 16, 12);
