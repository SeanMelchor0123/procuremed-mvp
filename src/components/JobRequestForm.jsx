import React, { useState } from 'react';
import { useStore } from '../store';

const emptyItem = () => ({ itemName: '', brand: '', quantity: '' });

const JobRequestForm = () => {
  const { addRequisition } = useStore();

  const [header, setHeader] = useState({
    deliveryDate: '',
    deliveryLocation: '',
    urgency: 'Normal',
  });
  const [items, setItems] = useState([emptyItem()]);

  const [pastOrders] = useState([
    { id: '001', date: '2025-07-28', itemName: 'IV Catheters M', brand: 'Surgitech', quantity: 300, status: 'Delivered' },
    { id: '002', date: '2025-08-11', itemName: 'Paracetamol 500mg', brand: 'Generix', quantity: 600, status: 'In Transit' },
  ]);

  const onHeaderChange = (e) => setHeader(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const onItemChange = (idx, field, value) => setItems(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  const addRow = () => setItems(prev => [...prev, emptyItem()]);
  const removeRow = (idx) => setItems(prev => prev.length === 1 ? prev : prev.filter((_, i) => i !== idx));

  const validate = () => {
    if (!header.deliveryDate || !header.deliveryLocation) return false;
    for (const row of items) {
      if (!row.itemName || !row.brand || !row.quantity || Number(row.quantity) <= 0) return false;
    }
    return true;
  };

  const submit = (e) => {
    e.preventDefault();
    if (!validate()) { alert('Please complete all fields and ensure quantities are > 0.'); return; }
    const id = addRequisition(header, items);
    alert(`Requisition #${id} created with ${items.length} item(s).`);
    setHeader({ deliveryDate: '', deliveryLocation: '', urgency: 'Normal' });
    setItems([emptyItem()]);
  };

  return (
    <div className="gap-8">
      <div className="card">
        <h2>Create Requisition</h2>

        <form onSubmit={submit} className="mt-8">
          <div className="form-grid">
            <input className="input" type="date" name="deliveryDate" value={header.deliveryDate} onChange={onHeaderChange} required />
            <input className="input" name="deliveryLocation" placeholder="Delivery Location (e.g., Region I)" value={header.deliveryLocation} onChange={onHeaderChange} required />
            <select className="select" name="urgency" value={header.urgency} onChange={onHeaderChange}>
              <option>Normal</option>
              <option>Critical</option>
            </select>
          </div>

          <div className="mt-16">
            <h3>Items</h3>
            <div className="mt-8" style={{ overflowX: 'auto' }}>
              <table className="table" style={{ minWidth: 720 }}>
                <thead>
                  <tr>
                    <th style={{ width: '40%' }}>Item Name</th>
                    <th style={{ width: '25%' }}>Brand</th>
                    <th style={{ width: '20%' }}>Quantity</th>
                    <th style={{ width: '15%' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((row, idx) => (
                    <tr key={idx}>
                      <td><input className="input" placeholder="e.g., Amoxicillin 500mg" value={row.itemName} onChange={(e) => onItemChange(idx, 'itemName', e.target.value)} required /></td>
                      <td><input className="input" placeholder="Brand" value={row.brand} onChange={(e) => onItemChange(idx, 'brand', e.target.value)} required /></td>
                      <td><input className="input" type="number" min="1" placeholder="Qty" value={row.quantity} onChange={(e) => onItemChange(idx, 'quantity', e.target.value)} required /></td>
                      <td>
                        <button type="button" className="button ghost" onClick={() => removeRow(idx)} disabled={items.length === 1}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-8" style={{ display: 'flex', gap: 8 }}>
                <button type="button" className="button" onClick={addRow}>+ Add another item</button>
                <div style={{ color: 'var(--muted)', fontSize: 12 }}>One requisition = shared delivery date, location, urgency.</div>
              </div>
            </div>
          </div>

          <div className="form-actions" style={{ marginTop: 16 }}>
            <button type="submit" className="button primary">Create Requisition</button>
          </div>
        </form>
      </div>

      <div className="card">
        <h3>Your Past Orders</h3>
        <div className="mt-8">
          {pastOrders.map(o => (
            <div key={o.id} className="row">
              <div className="kv">
                <b>Order {o.id}</b>
                <span>{o.date}</span>
                <span>{o.itemName}</span>
                <span>{o.brand}</span>
                <span>× {o.quantity}</span>
              </div>
              <span className={`badge ${o.status === 'Delivered' ? 'ok' : 'info'}`}>Status: {o.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JobRequestForm;
