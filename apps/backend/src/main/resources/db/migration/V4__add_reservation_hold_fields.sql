ALTER TABLE reservations
    MODIFY total_price BIGINT NOT NULL,
    ADD COLUMN expires_at TIMESTAMP NULL
        COMMENT 'PENDING 홀드 만료 시각. 이 시각 이후의 PENDING 은 점유로 보지 않는다(결제 미완료 자동 해제)';

CREATE INDEX idx_res_status_expires ON reservations (status, expires_at);
