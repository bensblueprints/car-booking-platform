import { Routes, Route, Navigate } from 'react-router-dom';
import { getToken } from './lib/api';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Fleet from './pages/Fleet';
import FleetEdit from './pages/FleetEdit';
import FleetCalendar from './pages/FleetCalendar';
import Categories from './pages/Categories';
import Locations from './pages/Locations';
import Bookings from './pages/Bookings';
import BookingDetail from './pages/BookingDetail';
import BookingNew from './pages/BookingNew';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import CustomerNew from './pages/CustomerNew';
import Reviews from './pages/Reviews';
import Settings from './pages/Settings';

function Protected({ children }: { children: JSX.Element }) {
  return getToken() ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="fleet" element={<Fleet />} />
        <Route path="fleet/new" element={<FleetEdit />} />
        <Route path="fleet/:id/calendar" element={<FleetCalendar />} />
        <Route path="fleet/:id" element={<FleetEdit />} />
        <Route path="categories" element={<Categories />} />
        <Route path="locations" element={<Locations />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="bookings/new" element={<BookingNew />} />
        <Route path="bookings/:id" element={<BookingDetail />} />
        <Route path="customers" element={<Customers />} />
        <Route path="customers/new" element={<CustomerNew />} />
        <Route path="customers/:id" element={<CustomerDetail />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
