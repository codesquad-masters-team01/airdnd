-- 테스트를 위한 기본 호스트 회원 데이터 삽입
-- RoomService 테스트 및 프론트엔드 연동 시 host_id 외래키 참조를 위해 필요합니다.

INSERT INTO members (id, email, nickname, role, oauth_provider, oauth_id, is_deleted)
VALUES (1, 'test-host@example.com', '테스트호스트', 'HOST', 'GITHUB', 'test-oauth-id-1234', false);