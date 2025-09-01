import React from 'react';
import { useStore } from '../store';

const ComplianceLog = () => {
  const { requests, inventory, orders } = useStore();

  return (
    <div className="gap-8">
      <div className="card">
        <h2>Compliance Log</h2>
        <div style={{ color: 'var(--muted)' }}>
          (Placeholder) Auto-logged steps and export coming soon.
        </div>
      </div>

      <div className="card">
        <h3>Accepted Orders</h3>
        <div className="mt-8">
          {orders.length === 0 && <div className="badge info">No accepted orders yet.</div>}
          {orders.map(o => (
            <div key={o.id} className="row">
              <div className="kv">
                <b>{o.itemName}</b>
                <span>({o.brand})</span>
                <span>Qty {o.quantity}</span>
                <span>@ ₱{Number(o.unitPrice).toFixed(2)}</span>
                <span>Supplier: {o.supplierName}</span>
                <span>Status: {o.status}</span>
              </div>
              <div className="kv">
                <span>Req #{o.requestId}</span>
                <span>Deliver to: {o.deliveryLocation}</span>
                <span>Needed by: {o.neededBy}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>Recent Requests (Open)</h3>
        <div className="mt-8">
          {requests.length === 0 && <div className="badge info">No open requests.</div>}
          {requests.map((r) => (
            <div key={r.id} className="row">
              <div className="kv">
                <b>{r.itemName}</b>
                <span>({r.brand})</span>
                <span>Qty {r.quantity}</span>
                <span>Urgency: {r.urgency}</span>
              </div>
              <div className="kv">
                <span>Date needed: {r.deliveryDate}</span>
                <span>Location: {r.deliveryLocation}</span>
                <span>Status: {r.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>Inventory Snapshot</h3>
        <table className="table mt-8">
          <thead>
            <tr><th>Item</th><th>Brand</th><th>Qty</th><th>Price</th><th>Supplier</th><th>Regions</th></tr>
          </thead>
          <tbody>
            {inventory.length === 0 && (
              <tr><td colSpan="6"><span className="badge info">No inventory loaded.</span></td></tr>
            )}
            {inventory.slice(0, 12).map((i) => (
              <tr key={i.id}>
                <td><b>{i.itemName}</b></td>
                <td>{i.brand}</td>
                <td>{i.quantity}</td>
                <td>₱{Number(i.price).toFixed(2)}</td>
                <td>{i.supplierName || 'Supplier'}</td>
                <td>{i.deliveryRegions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComplianceLog;