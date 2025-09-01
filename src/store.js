import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const AppStore = createContext(null);
const norm = (s) => String(s || '').trim().toLowerCase();

export const StoreProvider = ({ children }) => {
  // Grouped requests (requisitions with line items)
  const [requisitions, setRequisitions] = useState([]);

  // Supplier inventory & orders
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);

  // Demo auth
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pm_user') || 'null'); }
    catch { return null; }
  });
  useEffect(() => {
    user
      ? localStorage.setItem('pm_user', JSON.stringify(user))
      : localStorage.removeItem('pm_user');
  }, [user]);
  const login = ({ name, role }) => setUser({ id: Date.now(), name: name.trim(), role });
  const logout = () => setUser(null);

  // ----- REQUISITIONS -----
  const addRequisition = (header, items) => {
    const req = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      deliveryDate: header.deliveryDate,
      deliveryLocation: header.deliveryLocation,
      urgency: header.urgency,
      status: 'Open',
      items: items.map((it, i) => ({
        id: Date.now() + i + Math.random(),
        itemName: it.itemName.trim(),
        brand: it.brand.trim(),
        quantity: parseInt(it.quantity, 10),
        status: 'Open'
      }))
    };
    setRequisitions(prev => [req, ...prev]);
    return req.id;
  };

  const markItemAccepted = (requisitionId, itemId) => {
    setRequisitions(prev => prev.map(r => {
      if (r.id !== requisitionId) return r;
      const items = r.items.map(it => it.id === itemId ? { ...it, status: 'Accepted' } : it);
      const allAccepted = items.every(it => it.status === 'Accepted');
      return { ...r, items, status: allAccepted ? 'Closed' : r.status };
    }));
  };

  // ----- INVENTORY (add/edit/delete/bulk) -----
  const addInventoryItem = (item) =>
    setInventory(prev => [{ id: Date.now(), ...item }, ...prev]);

  const addInventoryBulk = (rows) =>
    setInventory(prev => [...rows.map(r => ({ id: Date.now() + Math.random(), ...r })), ...prev]);

  const updateInventoryItem = (id, patch) =>
    setInventory(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i));

  const deleteInventoryItem = (id) =>
    setInventory(prev => prev.filter(i => i.id !== id));

  // Reduce inventory on order acceptance
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

  // ----- ORDERS -----
  const addOrders = (batch) =>
    setOrders(prev => [...batch, ...prev]);

  const updateOrderStatus = (orderId, status) =>
    setOrders(prev => prev.map(o => o.id === orderId ? ({ ...o, status, updatedAt: new Date().toISOString() }) : o));

  const value = useMemo(() => ({
    user, login, logout,
    requisitions, addRequisition, markItemAccepted,
    inventory, orders,
    addInventoryItem, addInventoryBulk,
    updateInventoryItem, deleteInventoryItem,   // <- ensure these are in the context
    consumeInventoryForOrders, addOrders, updateOrderStatus,
  }), [user, requisitions, inventory, orders]);

  return <AppStore.Provider value={value}>{children}</AppStore.Provider>;
};

export const useStore = () => {
  const ctx = useContext(AppStore);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
};
