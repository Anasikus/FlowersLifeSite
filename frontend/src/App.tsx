import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Catalog from "./pages/client/Catalog";
import AdminPanel from "./pages/admin/Dashboard";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import Cart from "./pages/client/Cart";
import Favorites from "./pages/client/Favorites";
import Profile from "./pages/client/Profile";
import Orders from "./pages/client/Orders";
import AdminOrders from "./pages/admin/AdminOrders";
import CategoriesPage from './pages/admin/CategoriesPage';
import UsersPage from "./pages/admin/UsersPage";
import AdminAddressesPage from "./pages/admin/AdminAddressesPage";
import AdminStats from "./pages/admin/AdminStats";
import AdminProductsPage from "./pages/admin/AdminProductsPage";

// Компонент автоматической переадресации
const RoleRedirect = () => {
  const { role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (role === "admin" || role === "employee") {
      navigate("/admin/stats");
    } else if (role === "user") {
      navigate("/catalog");
    } else {
      navigate("/auth/login");
    }
  }, [role, navigate]);

  return null;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RoleRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/categories" element={<CategoriesPage />} />
        <Route path="/admin/users" element = {<UsersPage/>} />
        <Route path="/admin/addresses" element={<AdminAddressesPage />} />
        <Route path="/admin/stats" element={<AdminStats />} />
        <Route path="/admin/products" element={<AdminProductsPage/>} />
      </Routes>
    </Router>
  );
};

export default App;
