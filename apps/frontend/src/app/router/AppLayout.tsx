import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Bell, Home, LogOut, Map, Menu, ShieldCheck, UserRound } from 'lucide-react';
import { useCurrentUserQuery, useLogoutMutation } from '../../features/auth/api/authQueries';

export function AppLayout() {
  const { data: user } = useCurrentUserQuery();
  const logoutMutation = useLogoutMutation();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

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
          <div className={`account-menu ${isAccountMenuOpen ? 'open' : ''}`}>
            <button
              className="account-menu-trigger"
              type="button"
              aria-expanded={isAccountMenuOpen}
              aria-label={user ? `${user.name} 계정 메뉴` : '계정 메뉴'}
              onClick={() => setIsAccountMenuOpen((isOpen) => !isOpen)}
            >
              <Menu size={16} />
              <UserRound size={18} />
              {user ? <span className="sr-only">{user.name}</span> : null}
            </button>
            {isAccountMenuOpen ? (
              <div className="account-menu-panel">
                {user ? (
                  <>
                    <Link to="/my">
                      <UserRound size={16} />
                      마이페이지
                    </Link>
                    <Link to="/reservations">예약</Link>
                    <Link to="/notifications">
                      <Bell size={16} />
                      알림
                    </Link>
                    <Link to="/host/rooms">호스트</Link>
                    <Link to="/admin">
                      <ShieldCheck size={16} />
                      관리자
                    </Link>
                    <button type="button" onClick={() => logoutMutation.mutate()}>
                      <LogOut size={16} />
                      로그아웃
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login">로그인</Link>
                    <Link to="/rooms/map">지도에서 찾기</Link>
                    <Link to="/host/rooms">호스팅하기</Link>
                  </>
                )}
              </div>
            ) : null}
          </div>
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
