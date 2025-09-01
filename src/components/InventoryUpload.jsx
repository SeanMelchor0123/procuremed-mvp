import React, { useMemo, useState } from 'react';
import Papa from 'papaparse';
import { useStore } from '../store';

const InventoryUpload = () => {
  const {
    user,
    inventory,
    addInventoryItem,
    addInventoryBulk,
    updateInventoryItem,
    deleteInventoryItem,
  } = useStore();

  // simple form state for single add
  const [form, setForm] = useState({
    itemName: '',
    brand: '',
    quantity: '',
    price: '',
    deliveryRegions: '',
  });

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => setForm({
    itemName: '',
    brand: '',
    quantity: '',
    price: '',
    deliveryRegions: '',
  });

  const validateRow = (row) => {
    const qty = Number(row.quantity);
    const price = Number(row.price);
    return row.itemName && row.brand && qty > 0 && price >= 0 && row.deliveryRegions;
  };

  const handleAdd = (e) => {
    e.preventDefault();
    const row = {
      supplierName: user?.name || 'Supplier',
      itemName: form.itemName.trim(),
      brand: form.brand.trim(),
      quantity: Number(form.quantity),
      price: Number(form.price),
      deliveryRegions: form.deliveryRegions.trim(),
    };
    if (!validateRow(row)) {
      alert('Please complete all fields. Quantity must be > 0, price ≥ 0.');
      return;
    }
    addInventoryItem(row);
    resetForm();
  };

  // CSV import
  const onCSV = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const rows = (result.data || [])
          .map(r => ({
            supplierName: user?.name || 'Supplier',
            itemName: String(r.itemName || r.Item || '').trim(),
            brand: String(r.brand || r.Brand || '').trim(),
            quantity: Number(r.quantity || r.Qty || r.qty || 0),
            price: Number(r.price || r.Price || 0),
            deliveryRegions: String(r.deliveryRegions || r.regions || '').trim(),
          }))
          .filter(validateRow);

        if (!rows.length) {
          alert('No valid rows found. Ensure headers include itemName, brand, quantity, price, deliveryRegions.');
          return;
        }
        addInventoryBulk(rows);
        e.target.value = ''; // reset input
      }
    });
  };

  // Filter to "my" inventory
  const myInventory = useMemo(() => {
    const me = (user?.name || '').trim().toLowerCase();
    return inventory.filter(i => (i.supplierName || '').trim().toLowerCase() === me);
  }, [inventory, user]);

  // Inline edit state: { [id]: { fieldName: value, ... } }
  const [editById, setEditById] = useState({});

  const startEdit = (row) => {
    setEditById(prev => ({
      ...prev,
      [row.id]: {
        itemName: row.itemName,
        brand: row.brand,
        quantity: String(row.quantity),
        price: String(row.price),
        deliveryRegions: row.deliveryRegions,
      }
    }));
  };

  const cancelEdit = (id) => {
    setEditById(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const onEditField = (id, field, value) => {
    setEditById(prev => ({
      ...prev,
      [id]: { ...(prev[id] || {}), [field]: value }
    }));
  };

  const saveEdit = (id) => {
    const draft = editById[id];
    const row = {
      itemName: draft.itemName.trim(),
      brand: draft.brand.trim(),
      quantity: Number(draft.quantity),
      price: Number(draft.price),
      deliveryRegions: draft.deliveryRegions.trim(),
    };
    if (!validateRow(row)) {
      alert('Please complete all fields. Quantity must be > 0, price ≥ 0.');
      return;
    }
    updateInventoryItem(id, row);
    cancelEdit(id);
  };

  const removeRow = (id) => {
    if (window.confirm('Delete this item from your inventory?')) {
      deleteInventoryItem(id);
    }
  };

  return (
    <div className="gap-8">
      <div className="card">
        <h2>Inventory Upload</h2>
        <p style={{ color: 'var(--muted)' }}>
          You’re signed in as <b>{user?.name || 'Supplier'}</b>. Items you add are visible to you and used for matching.
        </p>

        <form onSubmit={handleAdd} className="mt-16">
          <div className="form-grid">
            <input className="input" name="itemName" placeholder="Item Name (e.g., Amoxicillin 500mg)"
              value={form.itemName} onChange={onChange} required />
            <input className="input" name="brand" placeholder="Brand" value={form.brand} onChange={onChange} required />
            <input className="input" type="number" min="1" name="quantity" placeholder="Quantity"
              value={form.quantity} onChange={onChange} required />
            <input className="input" type="number" min="0" step="0.01" name="price" placeholder="Unit Price"
              value={form.price} onChange={onChange} required />
            <input className="input" name="deliveryRegions" placeholder="Delivery Regions (comma-separated)"
              value={form.deliveryRegions} onChange={onChange} required />
          </div>

          <div className="form-actions" style={{ marginTop: 12 }}>
            <button type="submit" className="button primary">Add to Inventory</button>
            <label className="button ghost" style={{ marginLeft: 8 }}>
              Import CSV
              <input type="file" accept=".csv" onChange={onCSV} style={{ display: 'none' }} />
            </label>
          </div>
        </form>
      </div>

      <div className="card">
        <h3>My Inventory</h3>
        <div className="mt-8" style={{ overflowX: 'auto' }}>
          <table className="table" style={{ minWidth: 900 }}>
            <thead>
              <tr>
                <th>Item</th>
                <th>Brand</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Regions</th>
                <th style={{ width: 200 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {myInventory.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <span className="badge info">No items yet. Add above or import a CSV.</span>
                  </td>
                </tr>
              )}
              {myInventory.map((row) => {
                const draft = editById[row.id];
                const editing = Boolean(draft);
                return (
                  <tr key={row.id}>
                    <td>
                      {editing ? (
                        <input
                          className="input"
                          value={draft.itemName}
                          onChange={(e) => onEditField(row.id, 'itemName', e.target.value)}
                        />
                      ) : <b>{row.itemName}</b>}
                    </td>
                    <td>
                      {editing ? (
                        <input
                          className="input"
                          value={draft.brand}
                          onChange={(e) => onEditField(row.id, 'brand', e.target.value)}
                        />
                      ) : row.brand}
                    </td>
                    <td>
                      {editing ? (
                        <input
                          className="input"
                          type="number"
                          min="0"
                          value={draft.quantity}
                          onChange={(e) => onEditField(row.id, 'quantity', e.target.value)}
                        />
                      ) : row.quantity}
                    </td>
                    <td>
                      {editing ? (
                        <input
                          className="input"
                          type="number"
                          min="0"
                          step="0.01"
                          value={draft.price}
                          onChange={(e) => onEditField(row.id, 'price', e.target.value)}
                        />
                      ) : `₱${Number(row.price).toFixed(2)}`}
                    </td>
                    <td>
                      {editing ? (
                        <input
                          className="input"
                          value={draft.deliveryRegions}
                          onChange={(e) => onEditField(row.id, 'deliveryRegions', e.target.value)}
                        />
                      ) : row.deliveryRegions}
                    </td>
                    <td style={{ display: 'flex', gap: 8 }}>
                      {!editing ? (
                        <>
                          <button className="button" onClick={() => startEdit(row)}>Edit</button>
                          <button className="button danger" onClick={() => removeRow(row.id)}>Delete</button>
                        </>
                      ) : (
                        <>
                          <button className="button success" onClick={() => saveEdit(row.id)}>Save</button>
                          <button className="button ghost" onClick={() => cancelEdit(row.id)}>Cancel</button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="mt-8" style={{ color: 'var(--muted)', fontSize: 12 }}>
            Note: After you **Accept** a match, quantities are reduced automatically.
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryUpload;
