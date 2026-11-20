'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Package, Truck, Store, CheckCircle2, AlertCircle } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { addProduct, getProducts } from '@/app/lib/api/products';
import { createDeliveryOrder } from '@/app/lib/api/deliveries';
import { addBranch } from '@/app/lib/api/branches';
import type { Product } from '@/app/types';
import type { WarehouseSceneHandle } from './WarehouseThreeScene';

type Tab = 'add' | 'deliver' | 'branch';

interface Props {
  sceneRef: React.RefObject<WarehouseSceneHandle | null>;
}

const inputCls = 'w-full rounded-xl px-3.5 py-2.5 text-sm bg-white/70 dark:bg-white/[0.05] border border-gray-200/80 dark:border-white/[0.08] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400/50 dark:focus:border-blue-500/30 focus:outline-none transition-all placeholder-gray-400 dark:placeholder-white/20 text-gray-800 dark:text-white/85';
const labelCls = 'block text-[11px] font-semibold text-gray-500 dark:text-white/35 uppercase tracking-wider mb-1.5';

const tabs: { id: Tab; label: string; icon: React.ElementType; accent: string; btn: string }[] = [
  { id: 'add',     label: 'Add Stock',  icon: Package, accent: 'text-blue-500',    btn: 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20' },
  { id: 'deliver', label: 'Delivery',   icon: Truck,   accent: 'text-amber-500',   btn: 'bg-amber-500 hover:bg-amber-400 shadow-amber-500/20' },
  { id: 'branch',  label: 'New Branch', icon: Store,   accent: 'text-emerald-500', btn: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20' },
];

export default function WarehouseActionPanel({ sceneRef }: Props) {
  const { user } = useUser();
  const [tab, setTab] = useState<Tab>('add');
  const [busy, setBusy] = useState(false);
  const [lastMsg, setLastMsg] = useState<{ text: string; error: boolean } | null>(null);
  const msgTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Products list for delivery form
  const [products, setProducts] = useState<Product[]>([]);

  // Add product fields
  const [pName, setPName] = useState('');
  const [pSku, setPSku]   = useState('');
  const [pQty, setPQty]   = useState('');
  const [pBuy, setPBuy]   = useState('');
  const [pSale, setPSale] = useState('');

  // Delivery fields
  const [dCustomer, setDCustomer] = useState('');
  const [dAddress,  setDAddress]  = useState('');
  const [dPhone,    setDPhone]    = useState('');
  const [dProductId,setDProductId]= useState('');
  const [dQty,      setDQty]      = useState('');

  // Branch fields
  const [bName,     setBName]     = useState('');
  const [bLocation, setBLocation] = useState('');

  const [branchDone, setBranchDone] = useState(false);

  useEffect(() => {
    if (user?.id && tab === 'deliver') {
      getProducts(user.id, user.primaryEmailAddress?.emailAddress)
        .then(setProducts)
        .catch(() => {});
    }
  }, [user?.id, tab]);

  function flash(text: string, error = false) {
    if (msgTimer.current) clearTimeout(msgTimer.current);
    setLastMsg({ text, error });
    msgTimer.current = setTimeout(() => setLastMsg(null), 4000);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.id || busy) return;
    const scene = sceneRef.current;
    if (scene && scene.getSlotCount().occupied >= scene.getSlotCount().total) {
      flash('Rack full — no available slots', true); return;
    }
    setBusy(true);
    try {
      const animP = scene?.triggerAdd();
      await addProduct({
        name: pName, sku: pSku,
        quantity: parseInt(pQty) || 1,
        price: parseFloat(pSale) || 0,
        buyPrice: parseFloat(pBuy) || 0,
        lastUpdated: new Date().toISOString().split('T')[0],
      }, user.id, user.primaryEmailAddress?.emailAddress);
      await animP;
      flash(`"${pName}" × ${pQty || 1} added`);
      setPName(''); setPSku(''); setPQty(''); setPBuy(''); setPSale('');
    } catch (err: unknown) {
      flash(`Error: ${err instanceof Error ? err.message : 'Failed'}`, true);
    }
    setBusy(false);
  }

  async function handleDeliver(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.id || busy) return;
    const scene = sceneRef.current;
    if (scene && scene.getSlotCount().occupied === 0) {
      flash('No stock in rack', true); return;
    }
    if (!dProductId) { flash('Select a product', true); return; }
    setBusy(true);
    try {
      const animP = scene?.triggerDeliver();
      await createDeliveryOrder({
        customerName: dCustomer,
        customerAddress: dAddress,
        customerPhone: dPhone || undefined,
        items: [{ productId: dProductId, quantity: parseInt(dQty) || 1 }],
      });
      await animP;
      flash(`Order for "${dCustomer}" dispatched`);
      setDCustomer(''); setDAddress(''); setDPhone(''); setDProductId(''); setDQty('');
    } catch (err: unknown) {
      flash(`Error: ${err instanceof Error ? err.message : 'Failed'}`, true);
    }
    setBusy(false);
  }

  async function handleBranch(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.id || busy || branchDone) return;
    setBusy(true);
    try {
      const animP = sceneRef.current?.triggerBuildBranch();
      await addBranch({ name: bName, location: bLocation || undefined }, user.id, user.primaryEmailAddress?.emailAddress);
      await animP;
      flash(`Branch "${bName}" created`);
      setBranchDone(true);
      setBName(''); setBLocation('');
    } catch (err: unknown) {
      flash(`Error: ${err instanceof Error ? err.message : 'Failed'}`, true);
    }
    setBusy(false);
  }

  const margin = (buy: string, sale: string) => {
    const b = parseFloat(buy), s = parseFloat(sale);
    if (!b || !s || b <= 0) return null;
    return Math.round(((s - b) / s) * 100);
  };

  return (
    <div className="flex flex-col h-full gap-3">

      {/* Tab row */}
      <div className="flex gap-1 p-1 bg-gray-100/80 dark:bg-white/[0.03] rounded-2xl border border-gray-200/50 dark:border-white/[0.06]">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-[11px] font-semibold transition-all duration-200 ${
              tab === t.id
                ? 'bg-white dark:bg-white/[0.08] text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-white/30 hover:text-gray-700 dark:hover:text-white/60'
            }`}>
            <t.icon className={`w-3.5 h-3.5 ${tab === t.id ? t.accent : ''}`} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Form */}
      <div className="bg-white/50 dark:bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-gray-200/60 dark:border-white/[0.07] p-4 flex-1">

        {/* ── ADD PRODUCT ── */}
        {tab === 'add' && (
          <form onSubmit={handleAdd} className="flex flex-col gap-3 h-full">
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-white/85 leading-none">Add Product</p>
              <p className="text-[11px] text-gray-400 dark:text-white/25 mt-0.5">Forklift loads a pallet onto the rack.</p>
            </div>
            <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto pr-0.5">
              <div>
                <label className={labelCls}>Product Name</label>
                <input className={inputCls} value={pName} onChange={e=>setPName(e.target.value)} placeholder="e.g. Wireless Earbuds Pro" required />
              </div>
              <div>
                <label className={labelCls}>SKU</label>
                <input className={`${inputCls} font-mono`} value={pSku} onChange={e=>setPSku(e.target.value)} placeholder="WEP-001" required />
              </div>
              <div>
                <label className={labelCls}>Quantity</label>
                <input type="number" min="1" className={inputCls} value={pQty} onChange={e=>setPQty(e.target.value)} placeholder="100" required />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelCls}>Buy Price (₹)</label>
                  <input type="number" min="0" step="0.01" className={inputCls} value={pBuy} onChange={e=>setPBuy(e.target.value)} placeholder="0.00" required />
                </div>
                <div>
                  <label className={labelCls}>Sale Price (₹)</label>
                  <input type="number" min="0" step="0.01" className={inputCls} value={pSale} onChange={e=>setPSale(e.target.value)} placeholder="0.00" required />
                </div>
              </div>
              {margin(pBuy, pSale) !== null && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/50 dark:border-emerald-500/20">
                  <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">Margin: {margin(pBuy, pSale)}%</span>
                  <span className="text-xs text-emerald-600 dark:text-emerald-500 ml-auto">+₹{(parseFloat(pSale||'0') - parseFloat(pBuy||'0')).toFixed(2)}/unit</span>
                </div>
              )}
            </div>
            <button type="submit" disabled={busy}
              className={`w-full py-2.5 rounded-xl text-white text-sm font-semibold shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${tabs[0].btn}`}>
              {busy ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</> : <><Package className="w-4 h-4" />Load onto Rack</>}
            </button>
          </form>
        )}

        {/* ── DELIVERY ── */}
        {tab === 'deliver' && (
          <form onSubmit={handleDeliver} className="flex flex-col gap-3 h-full">
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-white/85 leading-none">Assign Delivery</p>
              <p className="text-[11px] text-gray-400 dark:text-white/25 mt-0.5">Forklift picks + partner collects.</p>
            </div>
            <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto pr-0.5">
              <div>
                <label className={labelCls}>Customer Name</label>
                <input className={inputCls} value={dCustomer} onChange={e=>setDCustomer(e.target.value)} placeholder="e.g. Priya Sharma" required />
              </div>
              <div>
                <label className={labelCls}>Delivery Address</label>
                <textarea className={inputCls} rows={2} value={dAddress} onChange={e=>setDAddress(e.target.value)} placeholder="12 MG Road, Bengaluru" required />
              </div>
              <div>
                <label className={labelCls}>Phone (optional)</label>
                <input type="tel" className={inputCls} value={dPhone} onChange={e=>setDPhone(e.target.value)} placeholder="+91 98765 43210" />
              </div>
              <div>
                <label className={labelCls}>Product</label>
                <select className={inputCls} value={dProductId} onChange={e=>setDProductId(e.target.value)} required>
                  <option value="">— select product —</option>
                  {products.map(p => (
                    <option key={String(p.id)} value={String(p.id)}>{p.name} ({p.sku}) · {p.quantity} in stock</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Quantity</label>
                <input type="number" min="1" className={inputCls} value={dQty} onChange={e=>setDQty(e.target.value)} placeholder="1" required />
              </div>
            </div>
            <button type="submit" disabled={busy}
              className={`w-full py-2.5 rounded-xl text-white text-sm font-semibold shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${tabs[1].btn}`}>
              {busy ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Dispatching…</> : <><Truck className="w-4 h-4" />Dispatch Order</>}
            </button>
          </form>
        )}

        {/* ── NEW BRANCH ── */}
        {tab === 'branch' && (
          <form onSubmit={handleBranch} className="flex flex-col gap-3 h-full">
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-white/85 leading-none">Create Branch</p>
              <p className="text-[11px] text-gray-400 dark:text-white/25 mt-0.5">Watch your warehouse get built tile by tile.</p>
            </div>
            <div className="flex-1 flex flex-col gap-2.5">
              <div>
                <label className={labelCls}>Branch Name</label>
                <input className={inputCls} value={bName} onChange={e=>setBName(e.target.value)} placeholder="e.g. Warehouse B" required disabled={branchDone} />
              </div>
              <div>
                <label className={labelCls}>Location</label>
                <input className={inputCls} value={bLocation} onChange={e=>setBLocation(e.target.value)} placeholder="e.g. Bengaluru, Karnataka" disabled={branchDone} />
              </div>
            </div>
            <button type="submit" disabled={busy || branchDone}
              className={`w-full py-2.5 rounded-xl text-white text-sm font-semibold shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${tabs[2].btn}`}>
              {busy ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Building…</>
               : branchDone ? <><CheckCircle2 className="w-4 h-4" />Branch Constructed</>
               : <><Store className="w-4 h-4" />Build Branch</>}
            </button>
          </form>
        )}
      </div>

      {/* Flash toast */}
      {lastMsg && (
        <div className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-medium transition-all ${lastMsg.error ? 'bg-red-50 dark:bg-red-500/10 border-red-200/60 dark:border-red-500/20 text-red-600 dark:text-red-400' : 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200/60 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400'}`}>
          {lastMsg.error ? <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> : <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />}
          {lastMsg.text}
        </div>
      )}
    </div>
  );
}
