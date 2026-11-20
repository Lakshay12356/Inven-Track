'use client';

import React, { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import AppLayout from '@/app/components/layout/AppLayout';
import WarehouseActionPanel from '@/app/components/warehouse/WarehouseActionPanel';
import WarehouseDataSheet from '@/app/components/warehouse/WarehouseDataSheet';
import type { WarehouseSceneHandle } from '@/app/components/warehouse/WarehouseThreeScene';
import type { SheetView } from '@/app/components/warehouse/WarehouseDataSheet';
import { useTheme } from '@/app/contexts/ThemeContext';
import { Package, Truck, Store } from 'lucide-react';

const WarehouseThreeScene = dynamic(
  () => import('@/app/components/warehouse/WarehouseThreeScene'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-[#0c0f1a]">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <span className="text-xs text-white/30 font-mono tracking-wider">Loading warehouse…</span>
        </div>
      </div>
    ),
  }
);

const VIEW_BTNS: { id: SheetView & string; label: string; icon: React.ElementType; color: string; bg: string }[] = [
  { id: 'inventory',  label: 'Inventory',  icon: Package, color: 'text-blue-500',    bg: 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20' },
  { id: 'deliveries', label: 'Deliveries', icon: Truck,   color: 'text-amber-500',   bg: 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20' },
  { id: 'branches',   label: 'Branches',   icon: Store,   color: 'text-emerald-500', bg: 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20' },
];

export default function WarehousePage() {
  const sceneRef = useRef<WarehouseSceneHandle>(null);
  const { theme } = useTheme();
  const [sheetView, setSheetView] = useState<SheetView>(null);

  return (
    <AppLayout fullHeight>
      <div className="flex h-full overflow-hidden">

        {/* 3D canvas — relative so the sheet can be absolute-positioned inside */}
        <div className="relative flex-1 min-w-0 min-h-0">

          {/* Data view buttons — bottom-left floating strip */}
          <div className="absolute bottom-5 left-5 z-10 flex gap-2">
            {VIEW_BTNS.map(btn => (
              <button
                key={btn.id}
                onClick={() => setSheetView(sheetView === btn.id ? null : btn.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold backdrop-blur-md transition-all ${btn.bg} ${btn.color} ${sheetView === btn.id ? 'ring-2 ring-current/30' : ''}`}
              >
                <btn.icon className="w-3.5 h-3.5" />
                {btn.label}
              </button>
            ))}
          </div>

          {/* Scene header */}
          <div className="absolute top-4 left-5 z-10 pointer-events-none">
            <h1 className="text-sm font-bold text-white/70 tracking-tight leading-none drop-shadow">Warehouse 3D</h1>
            <p className="text-[11px] text-white/30 mt-0.5 drop-shadow">Use panel → or view data below</p>
          </div>

          <WarehouseThreeScene ref={sceneRef} className="w-full h-full" isDark={theme === 'dark'} />

          {/* Slide-over data sheet (rendered inside the 3D container so it overlaps only the canvas) */}
          <WarehouseDataSheet view={sheetView} onClose={() => setSheetView(null)} />
        </div>

        {/* Action panel */}
        <div className="w-[300px] flex-shrink-0 border-l border-gray-200/50 dark:border-white/[0.06] bg-white/60 dark:bg-white/[0.02] backdrop-blur-xl flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 py-5">
            <WarehouseActionPanel sceneRef={sceneRef} />
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
