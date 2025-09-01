import React, { useMemo, useState } from 'react';
import { useStore } from '../store';

const normalize = (s) => String(s || '').trim().toLowerCase();
const regionMatch = (inventoryRegions, requestLocation) => {
  const req = normalize(requestLocation);
  return normalize(inventoryRegions).includes(req) || req === '';
};

const SmartMatch = () => {
  const { requisitions, inventory, addOrders, consumeInventoryForOrders, markItemAccepted } = useStore();

  const [selectedReqId, setSelectedReqId] = useState(requisitions[0]?.id || null);
  const selectedReq = useMemo(
    () => requisitions.find(r => r.id === selectedReqId) || null,
    [requisitions, selectedReqId]
  );

  const [selectedItemId, setSelectedItemId] = useState(null);
  const selectedItem = useMemo(
    () => selectedReq?.items.find(it => it.id === selectedItemId) || null,
    [selectedReq, selectedItemId]
  );

  const plan = useMemo(() => {
    if (!selectedReq || !selectedItem) return null;

    const reqName = normalize(selectedItem.itemName);
    const reqBrand = normalize(selectedItem.brand);
    let remaining = selectedItem.quantity;

    const eligible = inventory.filter(row => {
      const sameItem = normalize(row.itemName) === reqName;
      const brandOk = !reqBrand || normalize(row.brand) === reqBrand;
      const regionOk = regionMatch(row.deliveryRegions || '', selectedReq.deliveryLocation || '');
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
      requisition: selectedReq,
      item: selectedItem,
      allocations,
      totalCost,
      matchedQty: selectedItem.quantity - remaining,
      remainingQty: remaining,
      status: remaining <= 0 ? 'Fully Matched' : (allocations.length ? 'Partially Matched' : 'No Match')
    };
  }, [selectedReq, selectedItem, inventory]);

  const acceptPlan = () => {
    if (!plan || !plan.allocations.length) {
      alert('No allocations to accept.');
      return;
    }
    const nowIso = new Date().toISOString();

    const batch = plan.allocations.map(a => ({
      id: Date.now() + Math.random(),
      requisitionId: plan.requisition.id,
      itemId: plan.item.id,
      supplierName: a.supplierName,
      itemName: a.itemName,
      brand: a.brand,
      quantity: a.allocatedQty,
      unitPrice: a.unitPrice,
      lineCost: a.lineCost,
      deliveryLocation: plan.requisition.deliveryLocation,
      neededBy: plan.requisition.deliveryDate,
      urgency: plan.requisition.urgency,
      status: 'Accepted',
      createdAt: nowIso
    }));

    addOrders(batch);
    consumeInventoryForOrders(batch);
    markItemAccepted(plan.requisition.id, plan.item.id);

    alert('Allocations accepted. Line item marked Accepted.');
  };

  return (
    <div className="gap-8">
      <div className="card">
        <h2>Procurement Matching</h2>

        <div className="mt-8">
          <label style={{ fontWeight: 600, marginRight: 8 }}>Select Requisition:</label>
          <select
            className="select"
            value={selectedReqId || ''}
            onChange={(e) => { setSelectedReqId(Number(e.target.value)); setSelectedItemId(null); }}
          >
            {requisitions.map(r => (
              <option key={r.id} value={r.id}>
                #{r.id} — {r.deliveryLocation} — {r.deliveryDate} — {r.urgency} — {r.status}
              </option>
            ))}
          </select>
        </div>

        {selectedReq && (
          <div className="mt-16">
            <h3>Items in Requisition</h3>
            <div className="mt-8">
              {selectedReq.items.map(it => (
                <div key={it.id} className="row">
                  <div className="kv">
                    <b>{it.itemName}</b>
                    <span>({it.brand})</span>
                    <span>Qty {it.quantity}</span>
                    <span>Status: {it.status}</span>
                  </div>
                  <button
                    className="button"
                    onClick={() => setSelectedItemId(it.id)}
                    disabled={it.status === 'Accepted'}
                    title={it.status === 'Accepted' ? 'Already accepted' : 'Match this line'}
                  >
                    {it.status === 'Accepted' ? 'Accepted' : 'Match'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {plan && (
        <>
          <div className="card">
            <h3>Match Summary</h3>
            <div className="mt-8 kv">
              <span><b>Line:</b> {plan.item.itemName} ({plan.item.brand})</span>
              <span><b>Status:</b> {plan.status}</span>
              <span><b>Requested:</b> {plan.item.quantity}</span>
              <span><b>Matched:</b> {plan.matchedQty}</span>
              <span><b>Remaining:</b> {plan.remainingQty}</span>
              <span><b>Total Cost:</b> ₱{plan.totalCost.toFixed(2)}</span>
            </div>
            <div className="mt-16">
              <button className="button success" disabled={!plan.allocations.length} onClick={acceptPlan}>
                Accept Allocations & Notify Suppliers
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
