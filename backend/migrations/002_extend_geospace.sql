ALTER TABLE geospaces 
    ADD COLUMN parent_id BIGINT,
    ADD COLUMN name VARCHAR,
    ADD FOREIGN KEY(parent_id) REFERENCES geospaces(id) ON DELETE SET NULL
;