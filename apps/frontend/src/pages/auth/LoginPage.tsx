import { useNavigate, useLocation } from 'react-router-dom';
import { LoginButton } from '../../features/auth/ui/LoginButton';
import { useMockLoginMutation } from '../../features/auth/api/authQueries';
import { useAuthUiStore } from '../../features/auth/model/authStore';
import { UserRole } from '../../features/auth/model/authTypes';
import { ErrorMessage } from '../../shared/ui/ErrorMessage';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const loginMutation = useMockLoginMutation();
  const { lastSelectedRole, setLastSelectedRole } = useAuthUiStore();
  const from = (location.state as { from?: Location } | null)?.from?.pathname ?? '/';

  function handleLogin(role: UserRole) {
    setLastSelectedRole(role);
    loginMutation.mutate(role, {
      onSuccess: () => navigate(from, { replace: true }),
    });
  }

  return (
    <section className="auth-card">
      <p className="eyebrow">OAuth Login</p>
      <h1>로그인</h1>
      <p className="muted">
        실제 백엔드 연동 시 이 화면은 GitHub 또는 Google OAuth 시작 URL로 이동합니다. 현재는
        개발용 mock 세션을 생성합니다.
      </p>
      {lastSelectedRole ? <p className="muted">최근 선택한 역할: {lastSelectedRole}</p> : null}
      <div className="button-group vertical">
        <LoginButton
          role="GUEST"
          label="게스트로 mock 로그인"
          onLogin={handleLogin}
          disabled={loginMutation.isPending}
        />
        <LoginButton
          role="HOST"
          label="호스트로 mock 로그인"
          onLogin={handleLogin}
          disabled={loginMutation.isPending}
        />
        <LoginButton
          role="ADMIN"
          label="관리자로 mock 로그인"
          onLogin={handleLogin}
          disabled={loginMutation.isPending}
        />
      </div>
      {loginMutation.error ? <ErrorMessage error={loginMutation.error} /> : null}
    </section>
  );
}
