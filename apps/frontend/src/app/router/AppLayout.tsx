import { Link, NavLink, Outlet } from 'react-router-dom';
import { Home, ShieldCheck, UserRound } from 'lucide-react';
import { useCurrentUserQuery, useLogoutMutation } from '../../features/auth/api/authQueries';

export function AppLayout() {
  const { data: user } = useCurrentUserQuery();
  const logoutMutation = useLogoutMutation();

  return (
    <div className="app-shell">
      <header className="site-header">
        <Link className="brand" to="/" aria-label="AirDnD 홈">
          AirDnD
        </Link>
        <nav className="site-nav" aria-label="주요 메뉴">
          <NavLink to="/" end>
            <Home size={16} />
            숙소
          </NavLink>
          <NavLink to="/reservations">예약</NavLink>
          <NavLink to="/host/rooms">호스트</NavLink>
          <NavLink to="/admin">
            <ShieldCheck size={16} />
            관리자
          </NavLink>
        </nav>
        <div className="header-actions">
          {user ? (
            <>
              <Link className="user-chip" to="/my">
                <UserRound size={16} />
                {user.name}
              </Link>
              <button type="button" className="ghost-button" onClick={() => logoutMutation.mutate()}>
                로그아웃
              </button>
            </>
          ) : (
            <Link className="primary-button" to="/login">
              로그인
            </Link>
          )}
        </div>
      </header>
      <main className="page-container">
        <Outlet />
      </main>
    </div>
  );
}
