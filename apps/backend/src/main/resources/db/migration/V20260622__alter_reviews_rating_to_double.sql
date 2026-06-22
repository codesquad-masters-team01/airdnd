-- The Review entity models `rating` as a double, but the V1 baseline created
-- the column as INT (this branch is behind the review changes). V1 is already
-- applied, so we realign the column in a new migration rather than editing V1
-- (which would trip Flyway's checksum check).
--
-- Timestamp-style version so it sorts after V5 and won't collide with the
-- sequential V6+ migrations on the review branch. Hibernate's double maps to
-- float(53), which MySQL realizes as DOUBLE.
ALTER TABLE reviews
    MODIFY COLUMN rating DOUBLE NOT NULL COMMENT '1 ~ 5점';
