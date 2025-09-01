import React, { useState } from 'react';
import Papa from 'papaparse';
import { useStore } from '../store';

const InventoryUpload = () => {
  const { user, addInventoryItem, addInventoryBulk } = useStore();

  const [formData, setFormData] = useState({
    itemName: '',
    brand: '',
    quantity: '',
    price: '',
    deliveryRegions: '',
  });
  const [csvPreview, setCsvPreview] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addManualItem = (e) => {
    e.preventDefault();
    const newItem = {
      supplierName: user?.name || 'Supplier',
      itemName: formData.itemName.trim(),
      brand: formData.brand.trim(),
      quantity: parseInt(formData.quantity || '0', 10),
      price: parseFloat(formData.price || '0'),
      deliveryRegions: formData.deliveryRegions.trim(),
    };
    if (!newItem.itemName || !newItem.brand || !newItem.quantity || !newItem.price || !newItem.deliveryRegions) {
      alert('Please fill out all fields.');
      return;
    }
    addInventoryItem(newItem);
    setFormData({ itemName: '', brand: '', quantity: '', price: '', deliveryRegions: '' });
    alert('Item added to global inventory.');
  };

  const handleCsvSelect = (file) => {
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const rows = (res.data || [])
          .filter(r => String(r.itemName || '').trim() !== '')
          .map(r => ({
            supplierName: user?.name || 'CSV Supplier',
            itemName: String(r.itemName || '').trim(),
            brand: String(r.brand || '').trim(),
            quantity: parseInt(String(r.quantity || '0'), 10) || 0,
            price: parseFloat(String(r.price || '0')) || 0,
            deliveryRegions: String(r.deliveryRegions || '').trim(),
          }));
        setCsvPreview(rows);
      },
      error: (err) => alert('CSV parse error: ' + err.message),
    });
  };

  const importCsvRows = () => {
    if (!csvPreview.length) { alert('No CSV rows to import.'); return; }
    addInventoryBulk(csvPreview);
    setCsvPreview([]);
    alert('CSV rows imported into global inventory.');
  };

  return (
    <div className="gap-8">
      <div className="card">
        <h2>Inventory Upload</h2>
        <div className="kv mt-8">Supplier: <b>{user?.name}</b></div>

        <form onSubmit={addManualItem} className="form-grid mt-8">
          <input className="input" name="itemName" placeholder="Item Name" value={formData.itemName} onChange={handleChange} required />
          <input className="input" name="brand" placeholder="Brand" value={formData.brand} onChange={handleChange} required />
          <input className="input" type="number" name="quantity" placeholder="Quantity Available" value={formData.quantity} onChange={handleChange} required />
          <input className="input" type="number" step="0.01" name="price" placeholder="Price per Unit" value={formData.price} onChange={handleChange} required />
          <input className="input" name="deliveryRegions" placeholder="Delivery Regions (comma separated)" value={formData.deliveryRegions} onChange={handleChange} required />
          <div className="form-actions" style={{ gridColumn: '1 / -1' }}>
            <button type="submit" className="button primary">Add Item</button>
          </div>
        </form>
      </div>

      <div className="card">
        <h3>Upload via CSV</h3>
        <div className="mt-8">
          <input type="file" accept=".csv" onChange={(e) => handleCsvSelect(e.target.files?.[0])} />
          <div style={{ marginTop: 10, fontSize: 12, color: 'var(--muted)' }}>
            Expected headers (supplier auto-set): <code>itemName,brand,quantity,price,deliveryRegions</code>
          </div>
        </div>

        {csvPreview.length > 0 && (
          <>
            <div className="mt-16"><b>Preview ({csvPreview.length} rows)</b></div>
            <div className="mt-8" style={{ maxHeight: 180, overflow: 'auto' }}>
              {csvPreview.map((row, idx) => (
                <div key={idx} className="row">
                  <div className="kv">
                    <b>{row.itemName}</b>
                    <span>({row.brand})</span>
                    <span>Qty {row.quantity}</span>
                    <span>₱{row.price.toFixed(2)}</span>
                    <span>{row.deliveryRegions}</span>
                  </div>
                  <span className="badge info">{row.supplierName}</span>
                </div>
              ))}
            </div>
            <button onClick={importCsvRows} className="button success mt-8">Import to Inventory</button>
          </>
        )}
      </div>
    </div>
  );
};

export default InventoryUpload;