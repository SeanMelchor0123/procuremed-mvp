import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { StoreProvider, useStore } from './store';

import JobRequestForm from './components/JobRequestForm';
import InventoryUpload from './components/InventoryUpload';
import SmartMatch from './components/SmartMatch';
import ComplianceLog from './components/ComplianceLog';
import SupplierDashboard from './components/SupplierDashboard';
import Login from './components/Login';
import './theme.css';

const RequireSupplier = ({ children }) => {
  const { user } = useStore();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'supplier') return <div style={{ padding: 24 }}>Access denied. Supplier role required.</div>;
  return children;
};

const RequireProvider = ({ children }) => {
  const { user } = useStore();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'provider') return <div style={{ padding: 24 }}>Access denied. Healthcare Provider role required.</div>;
  return children;
};

const Sidebar = () => {
  const { user, logout } = useStore();

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-badge">PM</div>
        ProcureMed
      </div>
      <nav className="nav">
        {!user && <Link to="/login">Sign in</Link>}

        {user?.role === 'provider' && (
          <>
            <Link to="/">Job Requests</Link>
            <Link to="/match">Procurement Matching</Link>
            <Link to="/compliance">Compliance Log</Link>
          </>
        )}

        {user?.role === 'supplier' && (
          <>
            <Link to="/inventory">Inventory Upload</Link>
            <Link to="/supplier-dashboard">Procurement Dashboard</Link>
          </>
        )}
      </nav>

      {user && (
        <div className="userbox">
          <div style={{ marginBottom: 8 }}>
            Signed in as <b>{user.name}</b> ({user.role})
          </div>
          <button className="button ghost" onClick={logout}>Sign out</button>
        </div>
      )}
    </aside>
  );
};

const AppShell = () => (
  <div className="app">
    <Sidebar />
    <main className="main">
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Provider-only */}
        <Route path="/" element={<RequireProvider><JobRequestForm /></RequireProvider>} />
        <Route path="/match" element={<RequireProvider><SmartMatch /></RequireProvider>} />
        <Route path="/compliance" element={<RequireProvider><ComplianceLog /></RequireProvider>} />

        {/* Supplier-only */}
        <Route path="/inventory" element={<RequireSupplier><InventoryUpload /></RequireSupplier>} />
        <Route path="/supplier-dashboard" element={<RequireSupplier><SupplierDashboard /></RequireSupplier>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </main>
  </div>
);

function App() {
  return (
    <StoreProvider>
      <Router>
        <AppShell />
      </Router>
    </StoreProvider>
  );
}

export default App;