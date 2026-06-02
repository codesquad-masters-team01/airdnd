import { Link, NavLink, Outlet } from 'react-router-dom';
import { Bell, Home, Map, Menu, ShieldCheck, UserRound } from 'lucide-react';
import { useCurrentUserQuery, useLogoutMutation } from '../../features/auth/api/authQueries';

export function AppLayout() {
  const { data: user } = useCurrentUserQuery();
  const logoutMutation = useLogoutMutation();

  return (
    <div className="app-shell">
      <header className="site-header">
        <Link className="brand" to="/" aria-label="AirDnD 홈">
          <span className="brand-mark">A</span>
          AirDnD
        </Link>
        <nav className="site-nav" aria-label="주요 메뉴">
          <NavLink to="/" end>
            <Home size={16} />
            숙소
          </NavLink>
          <NavLink to="/rooms/map">
            <Map size={16} />
            지도
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
              <Link className="icon-button" to="/notifications" aria-label="알림">
                <Bell size={16} />
              </Link>
              <button type="button" className="ghost-button" onClick={() => logoutMutation.mutate()}>
                로그아웃
              </button>
            </>
          ) : (
            <Link className="secondary-button" to="/login">
              <Menu size={16} />
              로그인
            </Link>
          )}
        </div>
      </header>
      <main className="page-container">
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="footer-grid">
          <section>
            <h2>소개</h2>
            <ul>
              <li>AirDnD 소개</li>
              <li>뉴스룸</li>
              <li>채용</li>
              <li>투자자 정보</li>
            </ul>
          </section>
          <section>
            <h2>커뮤니티</h2>
            <ul>
              <li>게스트 추천</li>
              <li>다양성과 포용</li>
              <li>지역 파트너</li>
              <li>여행 가이드</li>
            </ul>
          </section>
          <section>
            <h2>호스팅</h2>
            <ul>
              <li>숙소 등록</li>
              <li>호스트 리소스</li>
              <li>호스트 보호 정책</li>
              <li>수익 계산</li>
            </ul>
          </section>
          <section>
            <h2>지원</h2>
            <ul>
              <li>도움말 센터</li>
              <li>예약 취소 옵션</li>
              <li>안전 정보</li>
              <li>문의하기</li>
            </ul>
          </section>
        </div>
        <div className="footer-bottom">
          <span>© 2026 AirDnD</span>
          <span>개인정보 처리방침 · 이용약관 · 사이트맵</span>
        </div>
      </footer>
    </div>
  );
}
