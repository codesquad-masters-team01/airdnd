import { Link } from 'react-router-dom';

export function AuthCallbackPage() {
  return (
    <section className="stack">
      <p className="eyebrow">OAuth Callback</p>
      <h1>로그인 콜백 처리 화면</h1>
      <p className="muted">
        실제 OAuth 연동 시 백엔드가 세션 또는 토큰을 발급한 뒤 이 화면으로 돌아오게 됩니다.
      </p>
      <Link className="primary-button inline-action" to="/">
        홈으로 이동
      </Link>
    </section>
  );
}
