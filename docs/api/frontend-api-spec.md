# 프론트엔드 API 명세

이 문서는 현재 프론트엔드가 기대하는 백엔드 API 계약을 설명합니다. 상세 스키마는 `docs/api/openapi.yaml`을 기준으로 합니다.

## 공통 규칙

- 기본 URL은 `VITE_API_BASE_URL` 환경 변수로 주입합니다.
- 인증은 우선 세션 쿠키 기반을 가정하고 `credentials: include`로 요청합니다.
- 날짜는 `YYYY-MM-DD` 형식을 사용합니다.
- 금액은 원화 정수 값으로 주고받습니다.
- 인원 수는 1 이상의 정수입니다.
- 오류 응답은 `{ "code": string, "message": string, "details"?: object }` 형식을 사용합니다.

## 인증

### 현재 사용자 조회

`GET /api/auth/me`

- 로그인 상태면 `User`를 반환합니다.
- 비로그인 상태면 `null`을 반환합니다.

### OAuth 로그인 시작

`GET /oauth2/authorization/github`

`GET /oauth2/authorization/google`

- 백엔드는 OAuth provider로 리다이렉트합니다.
- 로그인 성공 후 프론트엔드의 `/auth/callback` 또는 합의된 URL로 돌아오게 합니다.

### 로그아웃

`POST /api/auth/logout`

- 성공 시 `204 No Content`를 반환합니다.

## 숙소

### 숙소 목록 검색

`GET /api/rooms?region=서울&checkIn=2026-07-10&checkOut=2026-07-12&guests=2`

응답은 `RoomSummary[]`입니다.

프론트엔드는 다음 상태를 처리합니다.

- 로딩
- 데이터 없음
- 오류
- 성공

### 숙소 상세 조회

`GET /api/rooms/{roomId}`

응답은 `RoomDetail`입니다.

## 예약

### 내 예약 목록

`GET /api/reservations`

- 로그인 필요
- 응답은 `Reservation[]`입니다.

### 예약 생성

`POST /api/reservations`

요청:

```json
{
  "roomId": 101,
  "checkIn": "2026-07-10",
  "checkOut": "2026-07-12",
  "guests": 2
}
```

주요 오류:

- `401 UNAUTHENTICATED`: 로그인 필요
- `409 TOO_MANY_GUESTS`: 최대 인원 초과
- `409 ALREADY_BOOKED`: 이미 예약된 날짜

### 예약 취소

`DELETE /api/reservations/{reservationId}`

- 성공 시 `204 No Content`
- 취소 후 프론트엔드는 예약 목록을 다시 가져옵니다.

## 호스트

### 호스트 숙소 목록

`GET /api/host/rooms`

- 로그인 필요
- `HOST` 또는 `ADMIN` 권한 필요

### 호스트 숙소 등록

`POST /api/host/rooms`

요청:

```json
{
  "name": "성수 루프탑 스테이",
  "region": "서울",
  "address": "서울특별시 성동구 성수동",
  "description": "숙소 설명",
  "pricePerNight": 145000,
  "maxGuests": 4,
  "imageUrl": "https://example.com/room.jpg",
  "amenities": ["와이파이", "주방"]
}
```

### 호스트 숙소 수정

`PUT /api/host/rooms/{roomId}`

등록과 같은 요청 형식을 사용합니다.

### 호스트 숙소 상태 변경

`PATCH /api/host/rooms/{roomId}/status`

요청:

```json
{
  "status": "INACTIVE"
}
```

가능한 상태:

- `ACTIVE`
- `INACTIVE`
- `PENDING_APPROVAL`

## 관리자

### 관리자 대시보드

`GET /api/admin/dashboard`

- 로그인 필요
- `ADMIN` 권한 필요
- 승인 대기 숙소, 활성 사용자, 오늘 예약 수, 대기열 크기를 반환합니다.

## 프론트엔드 mock API

현재 프론트엔드는 MSW를 사용해 위 API를 브라우저에서 mock 처리합니다.

- mock 사용: `VITE_ENABLE_MOCKS=true`
- 실제 백엔드 사용: `VITE_ENABLE_MOCKS=false`

개발용 mock 로그인만 다음 엔드포인트를 사용합니다.

`POST /api/auth/mock-login`

실제 운영 백엔드에는 이 엔드포인트를 만들 필요가 없습니다.
