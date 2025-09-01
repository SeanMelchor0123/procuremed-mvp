import React, { useMemo } from 'react';
import { useStore } from '../store';

const STATUS_OPTIONS = ['Accepted', 'Preparing', 'In Transit', 'Delivered', 'Cancelled'];

const SupplierDashboard = () => {
  const { user, inventory, orders, updateOrderStatus } = useStore();

  const myItems = useMemo(
    () => inventory.filter(i => (i.supplierName || '').toLowerCase() === (user?.name || '').toLowerCase()),
    [inventory, user?.name]
  );

  const myOrders = useMemo(
    () => orders.filter(o => (o.supplierName || '').toLowerCase() === (user?.name || '').toLowerCase()),
    [orders, user?.name]
  );

  const totalSkus = myItems.length;
  const totalQty = myItems.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
  const openOrders = myOrders.length;
  const openOrderQty = myOrders.reduce((sum, o) => sum + (Number(o.quantity) || 0), 0);

  return (
    <div className="gap-8">
      <div className="card">
        <h2>Procurement Dashboard</h2>
        <div className="kv mt-8">Supplier: <b>{user?.name}</b></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(160px, 1fr))', gap: 12, marginTop: 12 }}>
          <div className="card"><div className="kv"><span>Total SKUs</span></div><h2>{totalSkus}</h2></div>
          <div className="card"><div className="kv"><span>Inventory Qty</span></div><h2>{totalQty}</h2></div>
          <div className="card"><div className="kv"><span>Assigned Orders</span></div><h2>{openOrders}</h2></div>
          <div className="card"><div className="kv"><span>Order Qty</span></div><h2>{openOrderQty}</h2></div>
        </div>
      </div>

      <div className="card">
        <h3>Assigned Orders</h3>
        <div className="mt-8">
          {myOrders.length === 0 && <div className="badge info">No orders yet.</div>}
          {myOrders.map((o) => (
            <div key={o.id} className="row">
              <div className="kv">
                <b>{o.itemName}</b>
                <span>({o.brand})</span>
                <span>Qty {o.quantity}</span>
                <span>₱{Number(o.unitPrice).toFixed(2)}</span>
                <span>Needed by: {o.neededBy || '—'}</span>
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block' }}>Status</label>
                <select value={o.status} onChange={(e) => updateOrderStatus(o.id, e.target.value)} className="select">
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>My Inventory</h3>
        <table className="table mt-8">
          <thead>
            <tr><th>Item</th><th>Brand</th><th>Qty</th><th>Price</th><th>Regions</th></tr>
          </thead>
          <tbody>
            {myItems.length === 0 && (
              <tr><td colSpan="5"><span className="badge info">No items yet. Add via Inventory Upload.</span></td></tr>
            )}
            {myItems.map((i) => (
              <tr key={i.id}>
                <td><b>{i.itemName}</b></td>
                <td>{i.brand}</td>
                <td>{i.quantity}</td>
                <td>₱{Number(i.price).toFixed(2)}</td>
                <td>{i.deliveryRegions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SupplierDashboard;