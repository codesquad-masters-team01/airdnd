# AirDnD 백엔드

AirDnD를 위한 Spring Boot 3 API 서버입니다.

## 예정 기술 스택

- Spring Boot 3.x
- Spring Security OAuth2
- JPA
- QueryDSL
- 주어진 조건/실행 시점/기대 결과 구조의 BDD 스타일 테스트

## 초기 도메인

- IAM: OAuth 로그인, 세션 또는 토큰 검증, 역할 관리
- 카탈로그: 숙소 검색, 상세 조회, 호스트 숙소 관리
- 예약: 예약 가능 여부, 예약 생성, 예약 취소, 중복 예약 방지
- 관리자: 승인 및 운영 API
- 실시간/대기열: 알림, 채팅 또는 대기열 확장 기능

## 로컬 메모

백엔드 프로젝트를 생성한 뒤 최종 Java 패키지, OAuth 제공자 설정을 추가합니다.

## 데이터베이스 실행 설정

로컬 개발은 Docker MySQL과 `local` Spring profile을 사용합니다. 배포 환경은 Docker Compose에 의존하지 않고 `prod` Spring profile과 외부 환경 변수로 데이터베이스에 연결합니다.

### 로컬 개발

프로젝트 루트에서 MySQL을 실행합니다.

```bash
docker compose up -d mysql
```

백엔드는 `local` profile로 실행합니다.

```bash
SPRING_PROFILES_ACTIVE=local ./gradlew bootRun
```

로컬 기본값은 다음과 같습니다.

- host: `localhost`
- port: `3306`
- database: `airdnd`
- user: `airdnd`
- password: `airdnd`

필요하면 프로젝트 루트의 `.env.example`을 기준으로 `.env`를 만들고 값을 바꿉니다. `.env`는 git에 커밋하지 않습니다.

### 배포 환경

배포 환경에서는 MySQL을 애플리케이션 Docker Compose에 묶지 않고 별도 DB 인스턴스나 플랫폼 제공 DB를 사용합니다.

필수 환경 변수:

```bash
SPRING_PROFILES_ACTIVE=prod
SPRING_DATASOURCE_URL=jdbc:mysql://<host>:3306/<database>?useSSL=true&serverTimezone=Asia/Seoul&characterEncoding=UTF-8
SPRING_DATASOURCE_USERNAME=<username>
SPRING_DATASOURCE_PASSWORD=<password>
```

선택 환경 변수:

```bash
SPRING_JPA_HIBERNATE_DDL_AUTO=validate
```

`prod` profile의 기본 DDL 정책은 `validate`입니다. 운영 배포에서 `update`를 기본값으로 두지 않습니다.
