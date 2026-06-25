// k6 load test for airdnd room search — KOREA-only edition.
//
// Companion to loadtest/rooms.js (which keeps the US/cross-continent cases for
// regression testing). This one stays inside the Korean peninsula but still
// exercises every behavior that matters, including the empty-box PK-walk — which
// is a domestic risk too (panning the map onto an ocean or an empty rural area),
// not something unique to overseas listings.
//
//   k6 run loadtest/rooms-korea.js                       # against prod (default URL)
//   BASE_URL=http://localhost:8080 k6 run loadtest/rooms-korea.js
//   PEAK_VUS=200 k6 run loadtest/rooms-korea.js          # push harder
//
// Each request carries a unique `cb` param so CloudFront/browser caches are
// bypassed and every call actually reaches the backend.
import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'https://d3jcrga8nxeldx.cloudfront.net';
const PEAK_VUS = parseInt(__ENV.PEAK_VUS || '50');

export const options = {
  scenarios: {
    ramp: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: Math.ceil(PEAK_VUS * 0.2) },
        { duration: '1m',  target: Math.ceil(PEAK_VUS * 0.5) },
        { duration: '1m',  target: PEAK_VUS },
        { duration: '30s', target: 0 },
      ],
      gracefulRampDown: '10s',
    },
  },
  thresholds: {
    http_req_failed: [{ threshold: 'rate<0.10', abortOnFail: true }],
    http_req_duration: ['p(95)<3000'],
  },
};

const COMMON = 'guests=1&adults=1&children=0&infants=0';
const QUERIES = [
  // 1) Dense metro box — the healthy fast path.
  { name: 'seoul-dense', path: `/api/rooms?south=37.4&west=126.8&north=37.7&east=127.2&${COMMON}` },
  // 2) Whole peninsula + Jeju — fully-zoomed-out DENSE box. This is the case that
  //    exercises the `ORDER BY id + 0` filesort trade-off (gather many → sort).
  { name: 'korea-wide', path: `/api/rooms?south=33&west=125&north=39&east=130&${COMMON}` },
  // 3) East Sea box with no listings — the EMPTY-box PK-walk, the real pathology.
  //    Should be ~ms after the fix; was seconds before (full PK scan finding nothing).
  { name: 'empty-sea', path: `/api/rooms?south=37&west=130&north=39&east=132&${COMMON}` },
  // 4) Region text search (sargable prefix on the region index).
  { name: 'region-seoul', path: `/api/rooms?region=${encodeURIComponent('서울특별시')}&${COMMON}` },
];

export default function () {
  const q = QUERIES[Math.floor(Math.random() * QUERIES.length)];
  const cb = `${__VU}-${__ITER}-${Date.now()}`;
  const res = http.get(`${BASE_URL}${q.path}&cb=${cb}`, {
    tags: { name: q.name },
    headers: { 'Accept': 'application/json' },
  });
  check(res, {
    'status 200': (r) => r.status === 200,
    'has body': (r) => r.body && r.body.length > 0,
  });
  sleep(1);
}
