import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import VendorDashboard from "./pages/VendorDashboard";
import ClientDashboard from "./pages/ClientDashboard";

function ProtectedRoute({ children, allowedRole }) {
  const role = localStorage.getItem("role");
  if (!role) return <Navigate to="/login" />;
  if (role !== allowedRole) return <Navigate to="/login" />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/signup" />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/vendor" element={
          <ProtectedRoute allowedRole="vendor">
            <VendorDashboard />
          </ProtectedRoute>
        } />
        <Route path="/client" element={
          <ProtectedRoute allowedRole="client">
            <ClientDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;