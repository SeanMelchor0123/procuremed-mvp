import React, { useMemo } from 'react';
import { useStore } from '../store';

const ComplianceLog = () => {
  const { requisitions, inventory, orders } = useStore();

  // Group orders by requisition
  const ordersByReq = useMemo(() => {
    const m = new Map();
    for (const o of orders) {
      const key = o.requisitionId || 'ungrouped';
      if (!m.has(key)) m.set(key, []);
      m.get(key).push(o);
    }
    return m;
  }, [orders]);

  return (
    <div className="gap-8">
      <div className="card">
        <h2>Compliance Log</h2>
        <div style={{ color: 'var(--muted)' }}>
          (Placeholder) Auto-logged steps and export coming soon.
        </div>
      </div>

      {/* Requisitions with their items and any related orders */}
      <div className="card">
        <h3>Requisitions</h3>
        <div className="mt-8">
          {requisitions.length === 0 && <div className="badge info">No requisitions yet.</div>}
          {requisitions.map(r => (
            <div key={r.id} className="card" style={{ marginTop: 10 }}>
              <div className="kv">
                <b>Requisition #{r.id}</b>
                <span>Delivery: {r.deliveryDate}</span>
                <span>Location: {r.deliveryLocation}</span>
                <span>Urgency: {r.urgency}</span>
                <span>Status: {r.status}</span>
              </div>

              <div className="mt-8">
                <h3>Items</h3>
                {r.items.map(it => (
                  <div key={it.id} className="row">
                    <div className="kv">
                      <b>{it.itemName}</b>
                      <span>({it.brand})</span>
                      <span>Qty {it.quantity}</span>
                      <span>Status: {it.status}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <h3>Orders</h3>
                {!(ordersByReq.get(r.id)?.length) && <div className="badge info">No accepted orders for this requisition.</div>}
                {(ordersByReq.get(r.id) || []).map(o => (
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
                      <span>Needed by: {o.neededBy}</span>
                      <span>Deliver to: {o.deliveryLocation}</span>
                    </div>
                  </div>
                ))}
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
