import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminPage } from '../../pages/admin/AdminPage';
import { AuthCallbackPage } from '../../pages/auth/AuthCallbackPage';
import { LoginPage } from '../../pages/auth/LoginPage';
import { ForbiddenPage } from '../../pages/ForbiddenPage';
import { HostRoomFormPage } from '../../pages/host/HostRoomFormPage';
import { HostRoomsPage } from '../../pages/host/HostRoomsPage';
import { MyPage } from '../../pages/my/MyPage';
import { NotFoundPage } from '../../pages/NotFoundPage';
import { ReservationsPage } from '../../pages/reservations/ReservationsPage';
import { HomePage } from '../../pages/rooms/HomePage';
import { RoomDetailPage } from '../../pages/rooms/RoomDetailPage';

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/rooms/:roomId', element: <RoomDetailPage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/auth/callback', element: <AuthCallbackPage /> },
      { path: '/forbidden', element: <ForbiddenPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/reservations', element: <ReservationsPage /> },
          { path: '/my', element: <MyPage /> },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={['HOST', 'ADMIN']} />,
        children: [
          { path: '/host/rooms', element: <HostRoomsPage /> },
          { path: '/host/rooms/new', element: <HostRoomFormPage /> },
          { path: '/host/rooms/:roomId/edit', element: <HostRoomFormPage /> },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={['ADMIN']} />,
        children: [{ path: '/admin', element: <AdminPage /> }],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
