import React, { useState } from 'react';
import { useStore } from '../store';

const JobRequestForm = () => {
  const { addRequest } = useStore();

  const [formData, setFormData] = useState({
    itemName: '',
    brand: '',
    quantity: '',
    deliveryDate: '',
    deliveryLocation: '',
    urgency: 'Normal',
  });

  const [pastOrders] = useState([
    { id: '001', date: '2025-07-28', itemName: 'IV Catheters M', brand: 'Surgitech', quantity: 300, status: 'Delivered' },
    { id: '002', date: '2025-08-11', itemName: 'Paracetamol 500mg', brand: 'Generix', quantity: 600, status: 'In Transit' },
  ]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const submit = (e) => {
    e.preventDefault();
    const payload = {
      itemName: formData.itemName.trim(),
      brand: formData.brand.trim(),
      quantity: parseInt(formData.quantity || '0', 10),
      deliveryDate: formData.deliveryDate,
      deliveryLocation: formData.deliveryLocation.trim(),
      urgency: formData.urgency,
    };
    if (!payload.itemName || !payload.brand || !payload.quantity || !payload.deliveryDate || !payload.deliveryLocation) {
      alert('Please fill all required fields.');
      return;
    }
    addRequest(payload);
    alert(`Request saved: ${payload.itemName}`);
    setFormData({
      itemName: '', brand: '', quantity: '', deliveryDate: '', deliveryLocation: '', urgency: 'Normal'
    });
  };

  return (
    <div className="gap-8">
      <div className="card">
        <h2>Job Request Form</h2>
        <form onSubmit={submit} className="form-grid mt-8">
          <input className="input" name="itemName" placeholder="Item Name" value={formData.itemName} onChange={onChange} required />
          <input className="input" name="brand" placeholder="Brand" value={formData.brand} onChange={onChange} required />
          <input className="input" type="number" name="quantity" placeholder="Quantity" value={formData.quantity} onChange={onChange} required />
          <input className="input" type="date" name="deliveryDate" value={formData.deliveryDate} onChange={onChange} required />
          <input className="input" name="deliveryLocation" placeholder="Delivery Location (e.g., Region I)" value={formData.deliveryLocation} onChange={onChange} required />
          <select className="select" name="urgency" value={formData.urgency} onChange={onChange}>
            <option>Normal</option>
            <option>Critical</option>
          </select>
          <div className="form-actions" style={{ gridColumn: '1 / -1' }}>
            <button type="submit" className="button primary">Submit Request</button>
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