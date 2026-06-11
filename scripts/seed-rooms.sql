-- Seed N rooms bounded by Korean coordinates, clustered around 10 city anchors.
-- Expects the caller to prepend:  SET @seed_count = <N>;
-- All seed rows are tagged with host oauth_id='seed-host' so they can be reset cleanly.

SET SESSION cte_max_recursion_depth = 1000000;

-- 1) Ensure a single seed host member exists (rooms.host_id -> members.id FK).
INSERT INTO members (email, nickname, role, oauth_provider, oauth_id, is_deleted)
SELECT 'seed-host@airdnd.local', 'Seed Host', 'HOST', 'GOOGLE', 'seed-host', FALSE
WHERE NOT EXISTS (SELECT 1 FROM members WHERE oauth_id = 'seed-host');

SET @host_id = (SELECT id FROM members WHERE oauth_id = 'seed-host');

-- 2) Generate @seed_count rooms. Each row is assigned a city anchor (n % 10) and
--    jittered by +/-0.12 deg (~13km), keeping every point within Korea near a real city.
INSERT INTO rooms (host_id, host_name, name, region, description, address, country_code,
                   latitude, longitude, price_per_night, max_capacity,
                   allows_infants, allows_pets, is_active, is_deleted)
WITH RECURSIVE seq (n) AS (
    SELECT 1
    UNION ALL
    SELECT n + 1 FROM seq WHERE n < @seed_count
),
anchors (aid, region, lat, lng) AS (
              SELECT 0, '서울특별시',   37.566500, 126.978000
    UNION ALL SELECT 1, '부산광역시',   35.179600, 129.075600
    UNION ALL SELECT 2, '인천광역시',   37.456300, 126.705200
    UNION ALL SELECT 3, '대구광역시',   35.871400, 128.601400
    UNION ALL SELECT 4, '대전광역시',   36.350400, 127.384500
    UNION ALL SELECT 5, '광주광역시',   35.159500, 126.852600
    UNION ALL SELECT 6, '제주특별자치도', 33.499600, 126.531200
    UNION ALL SELECT 7, '강원특별자치도', 37.751900, 128.876100
    UNION ALL SELECT 8, '전북특별자치도', 35.824200, 127.148000
    UNION ALL SELECT 9, '경기도',       37.263600, 127.028600
)
SELECT
    @host_id,
    'Seed Host',
    CONCAT('[seed] ', a.region, ' 숙소 #', s.n),
    a.region,
    CONCAT(a.region, ' 인근의 시드 데이터 숙소입니다.'),
    CONCAT(a.region, ' 일대'),
    'KR',
    ROUND(a.lat + (RAND() - 0.5) * 0.24, 9),
    ROUND(a.lng + (RAND() - 0.5) * 0.24, 9),
    (50 + FLOOR(RAND() * 250)) * 1000,     -- 50,000 ~ 299,000 KRW / night
    1 + FLOOR(RAND() * 8),                 -- 1 ~ 8 guests
    RAND() < 0.5,                          -- allows_infants
    RAND() < 0.3,                          -- allows_pets
    TRUE,
    FALSE
FROM seq s
JOIN anchors a ON a.aid = (s.n % 10);

-- 3) Give every seed room a representative image (idempotent: only if missing).
INSERT INTO room_images (room_id, image_url, is_representative)
SELECT r.id, CONCAT('https://picsum.photos/seed/airdnd', r.id, '/800/600'), TRUE
FROM rooms r
WHERE r.host_id = @host_id
  AND NOT EXISTS (
      SELECT 1 FROM room_images ri WHERE ri.room_id = r.id AND ri.is_representative = TRUE
  );

SELECT CONCAT('Seeded. Total seed rooms now: ',
              (SELECT COUNT(*) FROM rooms WHERE host_id = @host_id)) AS result;
