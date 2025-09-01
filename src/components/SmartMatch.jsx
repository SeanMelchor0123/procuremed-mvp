import React, { useMemo, useState } from 'react';
import { useStore } from '../store';

const normalize = (s) => String(s || '').trim().toLowerCase();
const regionMatch = (inventoryRegions, requestLocation) => {
  const req = normalize(requestLocation);
  return normalize(inventoryRegions).includes(req) || req === '';
};

const SmartMatch = () => {
  const { requests, inventory, addOrders, consumeInventoryForOrders, removeRequest } = useStore();
  const [selectedReqId, setSelectedReqId] = useState(requests[0]?.id || null);

  const request = useMemo(
    () => requests.find(r => r.id === selectedReqId) || null,
    [requests, selectedReqId]
  );

  const plan = useMemo(() => {
    if (!request) return null;
    const reqName = normalize(request.itemName);
    const reqBrand = normalize(request.brand);
    let remaining = request.quantity;

    const eligible = inventory.filter(row => {
      const sameItem = normalize(row.itemName) === reqName;
      const brandOk = !reqBrand || normalize(row.brand) === reqBrand;
      const regionOk = regionMatch(row.deliveryRegions || '', request.deliveryLocation || '');
      return sameItem && brandOk && regionOk && (row.quantity > 0);
    });

    eligible.sort((a, b) => (a.price - b.price) || (b.quantity - a.quantity));

    const allocations = [];
    let totalCost = 0;

    for (const row of eligible) {
      if (remaining <= 0) break;
      const take = Math.min(row.quantity, remaining);
      allocations.push({
        supplierName: row.supplierName || 'Supplier',
        itemName: row.itemName,
        brand: row.brand,
        unitPrice: Number(row.price) || 0,
        allocatedQty: take,
        lineCost: take * (Number(row.price) || 0)
      });
      totalCost += take * (Number(row.price) || 0);
      remaining -= take;
    }

    return {
      request,
      allocations,
      totalCost,
      matchedQty: request.quantity - remaining,
      remainingQty: remaining,
      status: remaining <= 0 ? 'Fully Matched' : (allocations.length ? 'Partially Matched' : 'No Match')
    };
  }, [request, inventory]);

  const acceptPlan = () => {
    if (!plan || !plan.allocations.length) {
      alert('No allocations to accept.');
      return;
    }
    const nowIso = new Date().toISOString();

    const batch = plan.allocations.map(a => ({
      id: Date.now() + Math.random(),
      requestId: plan.request.id,
      supplierName: a.supplierName,
      itemName: a.itemName,
      brand: a.brand,
      quantity: a.allocatedQty,
      unitPrice: a.unitPrice,
      lineCost: a.lineCost,
      deliveryLocation: plan.request.deliveryLocation,
      neededBy: plan.request.deliveryDate,
      urgency: plan.request.urgency,
      status: 'Accepted',
      createdAt: nowIso
    }));

    addOrders(batch);
    consumeInventoryForOrders(batch);
    removeRequest(plan.request.id);

    alert('Plan accepted and sent to suppliers. Request closed.');
  };

  return (
    <div className="gap-8">
      <div className="card">
        <h2>Procurement Matching</h2>
        <div className="mt-8">
          {requests.length === 0 ? (
            <div className="badge info">No open requests. Create one from Job Requests.</div>
          ) : (
            <>
              <label style={{ fontWeight: 600, marginRight: 8 }}>Select Request:</label>
              <select
                className="select"
                value={selectedReqId || ''}
                onChange={(e) => setSelectedReqId(Number(e.target.value))}
              >
                {requests.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.itemName} ({r.brand || 'Any'}) — Qty {r.quantity} — {r.deliveryLocation}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
      </div>

      {plan && (
        <>
          <div className="card">
            <h3>Match Summary</h3>
            <div className="mt-8 kv">
              <span><b>Status:</b> {plan.status}</span>
              <span><b>Requested:</b> {plan.request.quantity}</span>
              <span><b>Matched:</b> {plan.matchedQty}</span>
              <span><b>Remaining:</b> {plan.remainingQty}</span>
              <span><b>Total Cost:</b> ₱{plan.totalCost.toFixed(2)}</span>
            </div>
            <div className="mt-16">
              <button className="button success" disabled={!plan.allocations.length} onClick={acceptPlan}>
                Accept Plan & Notify Suppliers
              </button>
            </div>
          </div>

          <div className="card">
            <h3>Allocations</h3>
            <div className="mt-8">
              {plan.allocations.length === 0 && <div className="badge info">No eligible suppliers found.</div>}
              {plan.allocations.map((a, idx) => (
                <div key={idx} className="row">
                  <div className="kv">
                    <b>{a.supplierName}</b>
                    <span>{a.itemName} ({a.brand})</span>
                    <span>Unit: ₱{a.unitPrice.toFixed(2)}</span>
                    <span>Allocated: {a.allocatedQty}</span>
                  </div>
                  <div className="badge ok">₱{a.lineCost.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SmartMatch;