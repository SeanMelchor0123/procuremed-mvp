import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const AppStore = createContext(null);
const norm = (s) => String(s || '').trim().toLowerCase();

export const StoreProvider = ({ children }) => {
  const [requests, setRequests] = useState([]);   // provider-created (open only)
  const [inventory, setInventory] = useState([]); // supplier inventory
  const [orders, setOrders] = useState([]);       // accepted allocations -> supplier worklist

  // user: { id, name, role: 'supplier' | 'provider' }
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pm_user') || 'null'); }
    catch { return null; }
  });

  useEffect(() => {
    if (user) localStorage.setItem('pm_user', JSON.stringify(user));
    else localStorage.removeItem('pm_user');
  }, [user]);

  const login = ({ name, role }) => setUser({ id: Date.now(), name: name.trim(), role });
  const logout = () => setUser(null);

  // REQUESTS
  const addRequest = (req) =>
    setRequests(prev => [{ id: Date.now(), status: 'Open', ...req }, ...prev]);

  const removeRequest = (id) =>
    setRequests(prev => prev.filter(r => r.id !== id));

  // INVENTORY
  const addInventoryItem = (item) =>
    setInventory(prev => [{ id: Date.now(), ...item }, ...prev]);

  const addInventoryBulk = (rows) =>
    setInventory(prev => [...rows.map(r => ({ id: Date.now() + Math.random(), ...r })), ...prev]);

  // ORDERS
  const addOrders = (batch) =>
    setOrders(prev => [...batch, ...prev]);

  const updateOrderStatus = (orderId, status) =>
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o));

  // Reduce inventory quantities based on accepted orders
  const consumeInventoryForOrders = (batch) => {
    setInventory(prev => {
      const next = [...prev];
      batch.forEach(o => {
        const idx = next.findIndex(it =>
          norm(it.supplierName) === norm(o.supplierName) &&
          norm(it.itemName) === norm(o.itemName) &&
          norm(it.brand) === norm(o.brand)
        );
        if (idx >= 0) {
          const current = next[idx];
          const newQty = Math.max(0, (Number(current.quantity) || 0) - (Number(o.quantity) || 0));
          next[idx] = { ...current, quantity: newQty };
        }
      });
      return next;
    });
  };

  const value = useMemo(() => ({
    // auth
    user, login, logout,
    // data
    requests, inventory, orders,
    // requests
    addRequest, removeRequest,
    // inventory
    addInventoryItem, addInventoryBulk,
    // orders
    addOrders, updateOrderStatus, consumeInventoryForOrders,
  }), [user, requests, inventory, orders]);

  return <AppStore.Provider value={value}>{children}</AppStore.Provider>;
};

export const useStore = () => {
  const ctx = useContext(AppStore);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
};