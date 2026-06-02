# AirDnD 프론트엔드

AirDnD의 React/Vite 프론트엔드입니다. 백엔드가 없어도 MSW mock API로 주요 화면과 사용자 흐름을 확인할 수 있도록 구성했습니다.

## 기술 스택

- React
- TypeScript
- Vite
- React Router
- TanStack Query
- React Hook Form
- Zod
- Zustand 준비
- MSW
- Vitest
- Playwright
- plain CSS

## 실행 환경

- Node.js 20 LTS 이상 권장
- npm 사용 기준

## 설치

```bash
cd apps/frontend
npm install
```

## 개발 서버 실행

```bash
npm run dev
```

기본 주소:

```text
http://localhost:5173
```

## 환경 변수

`.env.example`을 참고합니다.

```text
VITE_API_BASE_URL=http://localhost:8080
VITE_ENABLE_MOCKS=true
```

- `VITE_ENABLE_MOCKS=true`: 브라우저에서 MSW mock API 사용
- `VITE_ENABLE_MOCKS=false`: 실제 백엔드 API 호출

## 라우트

- `/`: 숙소 목록 및 검색
- `/rooms/map`: 지도 기반 숙소 탐색
- `/rooms/:roomId`: 숙소 상세 및 예약
- `/login`: OAuth 진입 및 개발용 mock 로그인
- `/auth/callback`: OAuth 콜백 placeholder
- `/reservations`: 내 예약 목록 및 취소
- `/reservations/:reservationId`: 예약 확인 상세
- `/my`: 마이페이지
- `/notifications`: 알림 목록
- `/host/rooms`: 호스트 숙소 관리
- `/host/rooms/new`: 호스트 숙소 등록
- `/host/rooms/:roomId/edit`: 호스트 숙소 수정
- `/admin`: 관리자 대시보드
- `/admin/rooms/pending`: 관리자 숙소 승인
- `/admin/users`: 사용자 관리
- `/admin/reservations`: 예약 현황 대시보드
- `/admin/waitlist`: 대기 시스템 상태

## 디렉터리 구조

```text
src/
  app/              앱 부트스트랩, provider, router
  features/         auth, rooms, reservations, host, admin 도메인 코드
  mocks/            MSW handler와 fixture
  pages/            URL 단위 화면
  shared/           공통 API client, UI, util, config
  styles/           전역 스타일
```

## API 계약

프론트엔드가 기대하는 API는 다음 문서를 기준으로 합니다.

- `docs/api/openapi.yaml`
- `docs/api/frontend-api-spec.md`

백엔드 API가 바뀌면 API 문서, `src/features/*/api`, mock handler를 함께 갱신합니다.

## 검증 명령

```bash
npm run lint
npm run test
npm run build
npm run e2e
```

## 수동 확인 시나리오

1. `/`에서 숙소 목록이 보이는지 확인합니다.
2. 검색 조건을 변경했을 때 목록 요청이 다시 실행되는지 확인합니다.
3. 숙소 카드를 클릭해 `/rooms/:roomId`로 이동합니다.
4. 비로그인 상태에서 예약 버튼이 로그인 유도로 보이는지 확인합니다.
5. `/login`에서 게스트로 mock 로그인합니다.
6. 숙소 상세에서 예약을 생성하고 `/reservations`에서 확인합니다.
7. 예약을 취소하고 목록 상태가 갱신되는지 확인합니다.
8. `/login`에서 호스트로 mock 로그인한 뒤 `/host/rooms`에 접근합니다.
9. 숙소 등록 폼의 필수값과 숫자 검증을 확인합니다.
10. `/login`에서 관리자로 mock 로그인한 뒤 `/admin` 지표를 확인합니다.
