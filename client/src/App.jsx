import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import AppLayout from './layouts/AppLayout.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import RoomsPage from './pages/RoomsPage.jsx';
import RoomDetailsPage from './pages/RoomDetailsPage.jsx';
import AdminInventoryPage from './pages/AdminInventoryPage.jsx';
import MyBookingsPage from './pages/MyBookingsPage.jsx';
import AdminBookingsPage from './pages/AdminBookingsPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import GuestRoute from './components/GuestRoute.jsx';
import AdminUsersPage from './pages/AdminUsersPage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import MyReviewsPage from './pages/MyReviewsPage.jsx';

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="rooms" element={<RoomsPage />} />
        <Route path="rooms/:id" element={<RoomDetailsPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>
        <Route element={<GuestRoute />}>
          <Route path="bookings" element={<MyBookingsPage />} />
          <Route path="reviews" element={<MyReviewsPage />} />
        </Route>
        <Route element={<AdminRoute />}>
          <Route path="admin/inventory" element={<AdminInventoryPage />} />
          <Route path="admin/users" element={<AdminUsersPage />} />
        </Route>
        <Route element={<AdminRoute allowedRoles={['admin', 'staff']} />}>
          <Route path="admin/bookings" element={<AdminBookingsPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
