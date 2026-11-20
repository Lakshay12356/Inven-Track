'use client';

import React, { useEffect, useState } from 'react';
import { X, Package, Truck, Store, RefreshCw, Pencil, Trash2, Check, ChevronDown } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { getProducts, updateProduct, deleteProduct } from '@/app/lib/api/products';
import { getDeliveryOrders, updateOrderStatus } from '@/app/lib/api/deliveries';
import { getBranches } from '@/app/lib/api/branches';
import type { Product } from '@/app/types';
import type { DeliveryOrder } from '@/app/lib/api/deliveries';
import type { BranchData } from '@/app/lib/api/branches';

export type SheetView = 'inventory' | 'deliveries' | 'branches' | null;

interface Props { view: SheetView; onClose: () => void; }

const STATUS_FLOW: Record<string, string[]> = {
  pending:    ['assigned', 'cancelled'],
  assigned:   ['in_transit', 'cancelled'],
  in_transit: ['completed', 'cancelled'],
  completed:  [],
  cancelled:  [],
};

const STATUS_COLOR: Record<string, string> = {
  pending:    'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400',
  assigned:   'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
  in_transit: 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400',
  completed:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  cancelled:  'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400',
};

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending', assigned: 'Assigned', in_transit: 'In Transit',
  completed: 'Completed', cancelled: 'Cancelled',
};

const inputCls = 'w-full rounded-lg px-2.5 py-1.5 text-xs bg-white dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.1] text-gray-800 dark:text-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500/20';

/* ── Inline edit row for a product ── */
function ProductEditRow({ product, uid, email, onSave, onDelete }: {
  product: Product; uid: string; email?: string;
  onSave: (p: Product) => void; onDelete: (id: string | number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [name, setName]     = useState(product.name);
  const [qty, setQty]       = useState(String(product.quantity));
  const [buy, setBuy]       = useState(String(product.buyPrice ?? 0));
  const [sale, setSale]     = useState(String(product.price));

  const margin = parseFloat(buy) > 0
    ? Math.round(((parseFloat(sale) - parseFloat(buy)) / parseFloat(sale)) * 100)
    : null;

  async function save() {
    setBusy(true);
    try {
      const updated = await updateProduct(product.id, {
        name, quantity: parseInt(qty) || 0,
        buyPrice: parseFloat(buy) || 0, price: parseFloat(sale) || 0,
      }, uid, email);
      onSave(updated);
      setEditing(false);
    } catch { /* silent */ }
    setBusy(false);
  }

  async function remove() {
    if (!confirm(`Delete "${product.name}"?`)) return;
    setBusy(true);
    try { await deleteProduct(product.id, uid, email); onDelete(product.id); }
    catch { /* silent */ }
    setBusy(false);
  }

  if (editing) {
    return (
      <tr className="bg-blue-50/60 dark:bg-blue-500/[0.06]">
        <td className="px-3 py-2"><input className={inputCls} value={name} onChange={e => setName(e.target.value)} /></td>
        <td className="px-3 py-2 text-xs text-gray-400 dark:text-white/30 font-mono">{product.sku}</td>
        <td className="px-3 py-2"><input type="number" className={inputCls} value={qty} onChange={e => setQty(e.target.value)} /></td>
        <td className="px-3 py-2"><input type="number" className={inputCls} value={buy} onChange={e => setBuy(e.target.value)} /></td>
        <td className="px-3 py-2"><input type="number" className={inputCls} value={sale} onChange={e => setSale(e.target.value)} /></td>
        <td className="px-3 py-2">
          {margin !== null && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${margin >= 20 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400'}`}>{margin}%</span>}
        </td>
        <td className="px-3 py-2">
          <div className="flex gap-1.5">
            <button onClick={save} disabled={busy} className="p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40 transition-colors">
              {busy ? <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin block" /> : <Check className="w-3 h-3" />}
            </button>
            <button onClick={() => setEditing(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white/60 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors">
              <X className="w-3 h-3" />
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="hover:bg-gray-50/80 dark:hover:bg-white/[0.03] transition-colors group">
      <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-white/80">{product.name}</td>
      <td className="px-4 py-3 text-xs text-gray-500 dark:text-white/35 font-mono">{product.sku}</td>
      <td className="px-4 py-3">
        <span className={`text-sm font-semibold ${product.quantity < 50 ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>{product.quantity}</span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 dark:text-white/45">₹{product.buyPrice?.toFixed(2)}</td>
      <td className="px-4 py-3 text-sm text-gray-600 dark:text-white/45">₹{product.price.toFixed(2)}</td>
      <td className="px-4 py-3">
        {margin !== null && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${margin >= 20 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400'}`}>{margin}%</span>}
      </td>
      <td className="px-3 py-3">
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors">
            <Pencil className="w-3 h-3" />
          </button>
          <button onClick={remove} disabled={busy} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-40">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </td>
    </tr>
  );
}

/* ── Status dropdown for a delivery ── */
function DeliveryStatusCell({ order, uid, onUpdate }: {
  order: DeliveryOrder; uid: string;
  onUpdate: (id: string, status: DeliveryOrder['status']) => void;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const next = STATUS_FLOW[order.status] || [];

  async function pick(s: string) {
    setOpen(false);
    setBusy(true);
    try {
      await updateOrderStatus(order.id, s as DeliveryOrder['status'], uid);
      onUpdate(order.id, s as DeliveryOrder['status']);
    } catch { /* silent */ }
    setBusy(false);
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => next.length > 0 && setOpen(o => !o)}
        disabled={busy || next.length === 0}
        className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full transition-all ${STATUS_COLOR[order.status]} ${next.length > 0 ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
      >
        {busy ? <span className="w-2.5 h-2.5 border border-current/30 border-t-current rounded-full animate-spin" /> : STATUS_LABEL[order.status]}
        {next.length > 0 && !busy && <ChevronDown className="w-2.5 h-2.5" />}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-50 bg-white dark:bg-[#1a1d2e] rounded-xl border border-gray-200 dark:border-white/[0.08] shadow-xl overflow-hidden min-w-[130px]">
            {next.map(s => (
              <button key={s} onClick={() => pick(s)}
                className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-colors flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${STATUS_COLOR[s].split(' ')[0].replace('bg-', 'bg-').replace('/15', '')}`} />
                {STATUS_LABEL[s]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Main sheet ── */
export default function WarehouseDataSheet({ view, onClose }: Props) {
  const { user } = useUser();
  const [products,  setProducts]  = useState<Product[]>([]);
  const [orders,    setOrders]    = useState<DeliveryOrder[]>([]);
  const [branches,  setBranches]  = useState<BranchData[]>([]);
  const [loading,   setLoading]   = useState(false);
  const [search,    setSearch]    = useState('');

  const uid   = user?.id ?? '';
  const email = user?.primaryEmailAddress?.emailAddress;

  useEffect(() => {
    if (!view || !uid) return;
    setSearch('');
    setLoading(true);
    (async () => {
      try {
        if (view === 'inventory')  setProducts(await getProducts(uid, email));
        if (view === 'deliveries') setOrders(await getDeliveryOrders(uid, email));
        if (view === 'branches')   setBranches(await getBranches(uid, email));
      } catch { /* silent */ }
      setLoading(false);
    })();
  }, [view, uid]);

  async function refresh() {
    if (!view || !uid) return;
    setLoading(true);
    try {
      if (view === 'inventory')  setProducts(await getProducts(uid, email));
      if (view === 'deliveries') setOrders(await getDeliveryOrders(uid, email));
      if (view === 'branches')   setBranches(await getBranches(uid, email));
    } catch { /* silent */ }
    setLoading(false);
  }

  const meta = view ? ({
    inventory:  { label: 'Inventory',  icon: Package, color: 'text-blue-500' },
    deliveries: { label: 'Deliveries', icon: Truck,   color: 'text-amber-500' },
    branches:   { label: 'Branches',   icon: Store,   color: 'text-emerald-500' },
  } as const)[view] : null;

  const fp = products.filter(p => `${p.name} ${p.sku}`.toLowerCase().includes(search.toLowerCase()));
  const fo = orders.filter(o => `${o.customer_name} ${o.customer_address}`.toLowerCase().includes(search.toLowerCase()));
  const fb = branches.filter(b => `${b.name} ${b.location ?? ''}`.toLowerCase().includes(search.toLowerCase()));

  const count = view === 'inventory' ? fp.length : view === 'deliveries' ? fo.length : fb.length;
  const noun  = view === 'inventory' ? 'product' : view === 'deliveries' ? 'order' : 'branch';

  return (
    <>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 z-20 transition-opacity duration-300 ${view ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ background: 'rgba(0,0,0,0.38)', backdropFilter: 'blur(3px)' }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={`absolute inset-y-0 left-0 z-30 w-[min(680px,92%) ] flex flex-col transition-transform duration-300 ease-out ${view ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: 'var(--ds-bg)', backdropFilter: 'blur(28px)' }}
      >
        <style>{`
          :root { --ds-bg: rgba(248,250,252,0.97); }
          .dark { --ds-bg: rgba(11,13,22,0.97); }
        `}</style>

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-200/60 dark:border-white/[0.07] flex-shrink-0">
          {meta && <meta.icon className={`w-4.5 h-4.5 ${meta.color}`} />}
          <h2 className="text-sm font-bold text-gray-900 dark:text-white/90 flex-1">{meta?.label}</h2>
          <button onClick={refresh} disabled={loading} title="Refresh"
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white/60 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-all disabled:opacity-40">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={onClose} title="Close"
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white/70 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-2.5 border-b border-gray-200/40 dark:border-white/[0.05] flex-shrink-0">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
            className="w-full rounded-xl px-3.5 py-2 text-sm bg-gray-100/80 dark:bg-white/[0.05] border border-gray-200/60 dark:border-white/[0.07] text-gray-800 dark:text-white/80 placeholder-gray-400 dark:placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {loading ? (
            <div className="flex items-center justify-center h-40 gap-2">
              <span className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
              <span className="text-sm text-gray-400 dark:text-white/30">Loading…</span>
            </div>
          ) : (
            <>
              {/* ── INVENTORY ── */}
              {view === 'inventory' && (
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-50/98 dark:bg-[#0b0d16]/98 z-10">
                    <tr>
                      {['Product', 'SKU', 'Qty', 'Buy ₹', 'Sale ₹', 'Margin', ''].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-500 dark:text-white/30 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100/70 dark:divide-white/[0.04]">
                    {fp.length === 0 ? (
                      <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400 dark:text-white/25">No products found</td></tr>
                    ) : fp.map(p => (
                      <ProductEditRow key={p.id} product={p} uid={uid} email={email}
                        onSave={updated => setProducts(ps => ps.map(x => String(x.id) === String(updated.id) ? updated : x))}
                        onDelete={id => setProducts(ps => ps.filter(x => String(x.id) !== String(id)))}
                      />
                    ))}
                  </tbody>
                </table>
              )}

              {/* ── DELIVERIES ── */}
              {view === 'deliveries' && (
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-50/98 dark:bg-[#0b0d16]/98 z-10">
                    <tr>
                      {['Customer', 'Address', 'Phone', 'Items', 'Status', 'Date'].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-500 dark:text-white/30 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100/70 dark:divide-white/[0.04]">
                    {fo.length === 0 ? (
                      <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400 dark:text-white/25">No orders found</td></tr>
                    ) : fo.map(o => (
                      <tr key={o.id} className="hover:bg-gray-50/80 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-800 dark:text-white/80 whitespace-nowrap">{o.customer_name}</td>
                        <td className="px-4 py-3 text-xs text-gray-500 dark:text-white/40 max-w-[140px] truncate">{o.customer_address}</td>
                        <td className="px-4 py-3 text-xs text-gray-500 dark:text-white/35 font-mono whitespace-nowrap">{o.customer_phone || '—'}</td>
                        <td className="px-4 py-3 text-xs text-gray-500 dark:text-white/35">{o.items?.length ?? 0} item{(o.items?.length ?? 0) !== 1 ? 's' : ''}</td>
                        <td className="px-4 py-3">
                          <DeliveryStatusCell order={o} uid={uid}
                            onUpdate={(id, status) => setOrders(os => os.map(x => x.id === id ? { ...x, status } : x))} />
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400 dark:text-white/25 whitespace-nowrap">{new Date(o.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* ── BRANCHES ── */}
              {view === 'branches' && (
                <div className="p-5 grid gap-2.5">
                  {fb.length === 0 ? (
                    <p className="text-center py-12 text-sm text-gray-400 dark:text-white/25">No branches found</p>
                  ) : fb.map(b => (
                    <div key={b.id} className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-gray-50/80 dark:bg-white/[0.04] border border-gray-200/50 dark:border-white/[0.07]">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                        <Store className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-800 dark:text-white/85 truncate">{b.name}</p>
                        <p className="text-xs text-gray-500 dark:text-white/35 truncate">{b.location || 'No location set'}</p>
                      </div>
                      <p className="text-[10px] text-gray-400 dark:text-white/25 flex-shrink-0">{new Date(b.created_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 border-t border-gray-200/40 dark:border-white/[0.06] flex-shrink-0">
          <p className="text-[11px] text-gray-400 dark:text-white/25">{count} {noun}{count !== 1 ? (noun === 'branch' ? 'es' : 's') : ''}</p>
        </div>
      </div>
    </>
  );
}
