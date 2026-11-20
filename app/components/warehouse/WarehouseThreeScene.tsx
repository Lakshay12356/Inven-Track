'use client';

import { useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react';
import * as THREE from 'three';

/* ── public API ─────────────────────────────────────────────── */
export interface WarehouseSceneHandle {
  triggerAdd: () => Promise<void>;
  triggerDeliver: () => Promise<void>;
  triggerBuildBranch: () => Promise<void>;
  getSlotCount: () => { occupied: number; total: number };
  branchBuilt: () => boolean;
}

/* ── constants ──────────────────────────────────────────────── */
const RACK_Z    = -1.8;
const RACK_D    = 1.3;
const RACK_H    = 3.6;
const BAY_X     = [-1.8, 0, 1.8] as const;
const SHELF_Y   = [0.68, 1.58, 2.48] as const;
const BAYS      = 3;
const LEVELS    = 3;
const BOX_W = 0.88, BOX_H = 0.5, BOX_D = 0.72;
const PARK_X    = 5.8;
const AISLE_Z   = 1.2;
const APPROACH_Z = -0.33;
const FC_REST   = 0.28;
const BUILD_POS = new THREE.Vector3(-4.2, 0, -1.8);

const BOX_COLORS = [0x3b82f6,0x10b981,0xf97316,0x8b5cf6,0xec4899,0x06b6d4,0x84cc16,0xef4444,0xfbbf24];

const BLOCK_DEFS: [number,number,number,number,number,number,number][] = [
  [ 0,    0.10, 0,    3.3, 0.20, 1.15, 0x1e293b],
  [-1.35, 0.80, 0,    0.42,1.20, 1.15, 0x334155],
  [ 1.35, 0.80, 0,    0.42,1.20, 1.15, 0x334155],
  [ 0,    0.80,-0.50, 3.3, 1.20, 0.10, 0x1e293b],
  [ 0,    1.12, 0,    0.90,0.18, 0.12, 0x475569],
  [-0.70, 0.72, 0,    0.50,0.85, 0.10, 0x334155],
  [ 0.70, 0.72, 0,    0.50,0.85, 0.10, 0x334155],
  [ 0,    1.30, 0,    3.3, 0.12, 1.15, 0x0f172a],
  [-1.35, 1.95, 0,    0.42,1.10, 1.15, 0x334155],
  [ 1.35, 1.95, 0,    0.42,1.10, 1.15, 0x334155],
  [ 0,    1.95,-0.50, 3.3, 1.10, 0.10, 0x1e293b],
  [-0.68, 1.88, 0,    0.55,0.52, 0.09, 0x1e3a5f],
  [ 0.68, 1.88, 0,    0.55,0.52, 0.09, 0x1e3a5f],
  [ 0,    2.57, 0,    3.5, 0.22, 1.2,  0x0f172a],
  [-1.0,  2.87, 0,    1.30,0.42, 0.90, 0x334155],
  [ 1.0,  2.87, 0,    1.30,0.42, 0.90, 0x334155],
  [-0.90, 3.30,-0.1,  0.28,0.55, 0.28, 0x1e293b],
  [ 0,    1.72, 0.52, 1.10,0.32, 0.03, 0x2563eb],
  [ 0,    0.58, 0.52, 0.60,0.82, 0.03, 0x475569],
  [ 1.2,  3.55, 0,    0.05,0.50, 0.05, 0x475569],
];

/* ── tween ──────────────────────────────────────────────────── */
interface TweenEntry {
  target: Record<string,number>;
  from: Record<string,number>;
  to: Record<string,number>;
  dur: number; elapsed: number; easing: string;
  resolve: () => void;
}

function makeTweenSystem() {
  const active: TweenEntry[] = [];

  function tw(target: Record<string,number>, props: Record<string,number>, dur: number, easing = 'inOut') {
    return new Promise<void>(resolve => {
      const from: Record<string,number> = {};
      for (const k in props) from[k] = target[k];
      active.push({ target, from, to: { ...props }, dur, elapsed: 0, easing, resolve });
    });
  }

  function tick(dt: number) {
    for (let i = active.length - 1; i >= 0; i--) {
      const t = active[i];
      t.elapsed += dt;
      const raw = Math.min(t.elapsed / t.dur, 1);
      let e = raw < 0.5 ? 2*raw*raw : -1+(4-2*raw)*raw;
      if (t.easing === 'out') e = 1-(1-raw)*(1-raw);
      if (t.easing === 'in')  e = raw*raw;
      for (const k in t.to) t.target[k] = t.from[k] + (t.to[k] - t.from[k]) * e;
      if (raw >= 1) { active.splice(i, 1); t.resolve(); }
    }
  }

  return { tw, tick };
}

/* ── component ──────────────────────────────────────────────── */
const WarehouseThreeScene = forwardRef<WarehouseSceneHandle, { className?: string; isDark?: boolean }>(
  function WarehouseThreeScene({ className, isDark = true }, ref) {
    const mountRef = useRef<HTMLDivElement>(null);
    const handleRef = useRef<WarehouseSceneHandle | null>(null);

    useImperativeHandle(ref, () => ({
      triggerAdd:          () => handleRef.current?.triggerAdd()          ?? Promise.resolve(),
      triggerDeliver:      () => handleRef.current?.triggerDeliver()      ?? Promise.resolve(),
      triggerBuildBranch:  () => handleRef.current?.triggerBuildBranch()  ?? Promise.resolve(),
      getSlotCount:        () => handleRef.current?.getSlotCount()        ?? { occupied: 0, total: 9 },
      branchBuilt:         () => handleRef.current?.branchBuilt()         ?? false,
    }));

    const init = useCallback(() => {
      const el = mountRef.current;
      if (!el) return () => {};

      /* renderer */
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      const w = el.clientWidth  || el.offsetWidth  || 800;
      const h = el.clientHeight || el.offsetHeight || 600;
      renderer.setSize(w, h);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.85;
      el.appendChild(renderer.domElement);

      /* scene */
      const scene = new THREE.Scene();
      const bgColor = isDark ? 0x0c0f1a : 0xe8edf5;
      scene.background = new THREE.Color(bgColor);
      scene.fog = new THREE.FogExp2(bgColor, 0.032);

      /* camera */
      const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 60);
      camera.position.set(5.8, 5.2, 7.8);
      camera.lookAt(-0.3, 1.6, -0.5);

      /* resize */
      const onResize = () => {
        camera.aspect = el.clientWidth / el.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(el.clientWidth, el.clientHeight);
      };
      const ro = new ResizeObserver(onResize);
      ro.observe(el);

      /* lights */
      scene.add(new THREE.AmbientLight(0x8899cc, 0.45));
      const sun = new THREE.DirectionalLight(0xfff4e8, 1.4);
      sun.position.set(6, 12, 7); sun.castShadow = true;
      sun.shadow.mapSize.set(2048, 2048);
      Object.assign(sun.shadow.camera, { near:0.5, far:40, left:-10, right:10, top:10, bottom:-10 });
      sun.shadow.bias = -0.001; scene.add(sun);
      const fillLight = new THREE.DirectionalLight(0x4466aa, 0.35); fillLight.position.set(-5,4,3); scene.add(fillLight);
      const mkLamp = (x: number) => { const l = new THREE.PointLight(0x7799ff, 0.7, 9); l.position.set(x,5,-1.5); scene.add(l); };
      mkLamp(-1.8); mkLamp(1.8);

      /* materials */
      const M = {
        floor:   new THREE.MeshLambertMaterial({ color: 0x181c2e }),
        rack:    new THREE.MeshLambertMaterial({ color: 0x374151 }),
        shelf:   new THREE.MeshLambertMaterial({ color: 0x4b5563 }),
        back:    new THREE.MeshLambertMaterial({ color: 0x1a2035, transparent: true, opacity: 0.8 }),
        stripe:  new THREE.MeshLambertMaterial({ color: 0xf59e0b, emissive: new THREE.Color(0xf59e0b), emissiveIntensity: 0.2 }),
        bgRack:  new THREE.MeshLambertMaterial({ color: 0x1a2235 }),
        bgBox:   new THREE.MeshLambertMaterial({ color: 0x252d40 }),
        fkBody:  new THREE.MeshLambertMaterial({ color: 0xf59e0b }),
        fkDark:  new THREE.MeshLambertMaterial({ color: 0x1c2130 }),
        fkFork:  new THREE.MeshLambertMaterial({ color: 0xd97706 }),
        hl:      new THREE.MeshLambertMaterial({ color: 0xfffcdc, emissive: new THREE.Color(0xfffcdc), emissiveIntensity: 0.6 }),
        skin:    new THREE.MeshLambertMaterial({ color: 0xf3c99e }),
        uniform: new THREE.MeshLambertMaterial({ color: 0x1e3a8a }),
        pants:   new THREE.MeshLambertMaterial({ color: 0x111827 }),
        helmet:  new THREE.MeshLambertMaterial({ color: 0xf59e0b }),
        smoke:   new THREE.MeshLambertMaterial({ color: 0x8899aa, transparent: true, opacity: 0.55 }),
      };
      const boxMats = BOX_COLORS.map(c => new THREE.MeshLambertMaterial({ color: c }));

      /* floor */
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(28,28), M.floor);
      floor.rotation.x = -Math.PI/2; floor.receiveShadow = true; scene.add(floor);
      const grid = new THREE.GridHelper(28,28,0x1c2238,0x1c2238); grid.position.set(0,0.002,0); scene.add(grid);
      const stripeGeo = new THREE.BoxGeometry(0.07,0.004,5.5);
      [-3.6, 3.6].forEach(x => { const s = new THREE.Mesh(stripeGeo, M.stripe); s.position.set(x,0.003,0.5); scene.add(s); });

      /* rack builder */
      const PILLAR_X = [-2.72,-0.92,0.92,2.72];
      function buildRack(rMat: THREE.Material, sMat: THREE.Material, bMat: THREE.Material) {
        const g = new THREE.Group();
        const pGeo = new THREE.BoxGeometry(0.09, RACK_H, 0.09);
        PILLAR_X.forEach(x => [RACK_Z+RACK_D/2, RACK_Z-RACK_D/2].forEach(z => {
          const p = new THREE.Mesh(pGeo, rMat); p.position.set(x, RACK_H/2, z); p.castShadow = true; g.add(p);
        }));
        const sGeo = new THREE.BoxGeometry(5.56, 0.065, RACK_D);
        [...SHELF_Y, RACK_H].forEach(y => { const s = new THREE.Mesh(sGeo, sMat); s.position.set(0,y,RACK_Z); s.castShadow=true; s.receiveShadow=true; g.add(s); });
        const fs = new THREE.Mesh(sGeo, sMat); fs.position.set(0,0.035,RACK_Z); g.add(fs);
        const back = new THREE.Mesh(new THREE.BoxGeometry(5.56,RACK_H,0.03), bMat);
        back.position.set(0, RACK_H/2, RACK_Z-RACK_D/2-0.015); g.add(back);
        const brGeo = new THREE.BoxGeometry(0.05,0.05,RACK_D+0.05);
        [-0.92,0.92].forEach(x => [1.1,2.05].forEach(y => { const b = new THREE.Mesh(brGeo,rMat); b.position.set(x,y,RACK_Z); g.add(b); }));
        return g;
      }
      scene.add(buildRack(M.rack, M.shelf, M.back));
      const bgRack = buildRack(M.bgRack, M.bgRack, M.bgRack);
      bgRack.position.z = -5.5; scene.add(bgRack);
      [[-1.8,0.95],[0,0.95],[1.8,2.45],[-1.8,1.85]].forEach(([x,y]) => {
        const b = new THREE.Mesh(new THREE.BoxGeometry(BOX_W,BOX_H,BOX_D), M.bgBox);
        b.position.set(x,y,-1.8-5.5); scene.add(b);
      });
      const ceil = new THREE.Mesh(new THREE.BoxGeometry(14,0.12,10), new THREE.MeshLambertMaterial({ color:0x0f1220 }));
      ceil.position.set(0,5.5,-2); scene.add(ceil);

      /* slots */
      interface Slot { bay:number; lv:number; wx:number; wy:number; wz:number; occupied:boolean; mesh:THREE.Mesh|null }
      const slots: Slot[] = [];
      for (let bay=0; bay<BAYS; bay++) for (let lv=0; lv<LEVELS; lv++) {
        slots.push({ bay, lv, wx: BAY_X[bay], wy: SHELF_Y[lv]+BOX_H/2+0.04, wz: RACK_Z, occupied:false, mesh:null });
      }
      const boxGeo = new THREE.BoxGeometry(BOX_W, BOX_H, BOX_D);
      function placeBox(slot: Slot) {
        const m = new THREE.Mesh(boxGeo, boxMats[slot.bay*LEVELS+slot.lv]);
        m.position.set(slot.wx, slot.wy, slot.wz); m.castShadow=true; m.receiveShadow=true;
        scene.add(m); slot.mesh=m; slot.occupied=true; return m;
      }
      function removeBox(slot: Slot) {
        if (slot.mesh) { scene.remove(slot.mesh); slot.mesh=null; } slot.occupied=false;
      }
      [[0,0],[0,1],[1,0],[1,2],[2,1]].forEach(([b,l]) => placeBox(slots[b*LEVELS+l]));

      /* forklift */
      function buildForklift() {
        const g = new THREE.Group();
        const add = (geo: THREE.BufferGeometry, mat: THREE.Material, [px,py,pz]: [number,number,number]) => {
          const m = new THREE.Mesh(geo,mat); m.position.set(px,py,pz); m.castShadow=true; g.add(m); return m;
        };
        add(new THREE.BoxGeometry(1.05,0.46,1.7), M.fkBody, [0,0.33,0]);
        add(new THREE.BoxGeometry(0.68,0.72,0.54), M.fkBody, [0.04,0.9,0.42]);
        add(new THREE.BoxGeometry(0.85,0.065,0.72), M.fkDark, [0,1.32,0.36]);
        [[-0.38,0.05],[0.38,0.05],[-0.38,0.66],[0.38,0.66]].forEach(([px,pz]) => add(new THREE.BoxGeometry(0.055,0.62,0.055),M.fkDark,[px,1.0,pz]));
        const wGeo = new THREE.CylinderGeometry(0.23,0.23,0.19,14);
        [[-0.57,0.23,-0.6],[0.57,0.23,-0.6],[-0.57,0.23,0.6],[0.57,0.23,0.6]].forEach(([wx,wy,wz]) => {
          const w = new THREE.Mesh(wGeo,M.fkDark); w.rotation.z=Math.PI/2; w.position.set(wx,wy,wz); g.add(w);
        });
        add(new THREE.BoxGeometry(0.88,0.52,0.28), M.fkDark, [0,0.42,0.92]);
        [-0.31,0.31].forEach(mx => add(new THREE.BoxGeometry(0.07,2.5,0.07),M.fkDark,[mx,1.5,-0.87]));
        const fc = new THREE.Group(); fc.position.set(0,FC_REST,-0.87);
        fc.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.76,0.19,0.1),M.fkDark)));
        [-0.22,0.22].forEach(fx => { const fk=new THREE.Mesh(new THREE.BoxGeometry(0.13,0.072,1.15),M.fkFork); fk.position.set(fx,-0.07,-0.62); fc.add(fk); });
        g.add(fc);
        [-0.31,0.31].forEach(hx => add(new THREE.BoxGeometry(0.13,0.1,0.04),M.hl,[hx,0.52,-0.91]));
        const proxy = new THREE.Mesh(boxGeo, boxMats[0].clone());
        proxy.position.set(0,0.12,-0.63); proxy.scale.setScalar(0.82); proxy.visible=false; fc.add(proxy);
        return { group:g, fc, proxy };
      }
      const { group:fkl, fc, proxy:proxyBox } = buildForklift();
      fkl.position.set(PARK_X, 0, AISLE_Z); scene.add(fkl);

      /* delivery partner */
      function buildPartner() {
        const g = new THREE.Group();
        const mk = (geo: THREE.BufferGeometry, mat: THREE.Material, [px,py,pz]: [number,number,number]) => {
          const m=new THREE.Mesh(geo,mat); m.position.set(px,py,pz); m.castShadow=true; g.add(m);
        };
        mk(new THREE.BoxGeometry(0.22,0.22,0.22), M.skin,    [0,1.08,0]);
        mk(new THREE.BoxGeometry(0.27,0.12,0.27), M.helmet,  [0,1.22,0]);
        mk(new THREE.BoxGeometry(0.30,0.36,0.18), M.uniform, [0,0.78,0]);
        [-0.21,0.21].forEach(ax => mk(new THREE.BoxGeometry(0.10,0.30,0.12),M.uniform,[ax,0.76,0]));
        [-0.08,0.08].forEach(lx => mk(new THREE.BoxGeometry(0.11,0.32,0.13),M.pants,[lx,0.44,0]));
        return g;
      }
      const partner = buildPartner();
      const PARTNER_MEET_X = 3.8;
      partner.position.set(PARK_X, 0, AISLE_Z); partner.visible=false; scene.add(partner);
      const partnerBox = new THREE.Mesh(boxGeo, boxMats[0].clone());
      partnerBox.scale.setScalar(0.75); partnerBox.visible=false; scene.add(partnerBox);

      /* building */
      const buildingGroup = new THREE.Group();
      buildingGroup.position.copy(BUILD_POS); buildingGroup.visible=false; scene.add(buildingGroup);
      const buildingMeshes = BLOCK_DEFS.map(([rx,ry,rz,w,h,d,col]) => {
        const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), new THREE.MeshLambertMaterial({ color:col }));
        m.position.set(rx,ry,rz); m.castShadow=true; m.receiveShadow=true; m.visible=false;
        buildingGroup.add(m); return m;
      });

      /* smoke */
      interface SmokeP { mesh:THREE.Mesh; vel:THREE.Vector3; life:number; age:number }
      const smokePs: SmokeP[] = [];
      function emitSmoke(wp: THREE.Vector3) {
        for (let i=0; i<14; i++) {
          const mat = M.smoke.clone();
          const s = new THREE.Mesh(new THREE.SphereGeometry(0.12+Math.random()*0.14,6,6), mat);
          s.position.set(wp.x+(Math.random()-0.5)*0.8, wp.y+Math.random()*0.3, wp.z+(Math.random()-0.5)*0.5);
          const vel = new THREE.Vector3((Math.random()-0.5)*0.6, 0.9+Math.random()*0.7, (Math.random()-0.5)*0.4);
          scene.add(s);
          smokePs.push({ mesh:s, vel, life:0.7+Math.random()*0.5, age:0 });
        }
      }
      function tickSmoke(dt: number) {
        for (let i=smokePs.length-1; i>=0; i--) {
          const p=smokePs[i]; p.age+=dt;
          p.mesh.position.addScaledVector(p.vel,dt); p.vel.y*=0.96;
          const frac=p.age/p.life;
          (p.mesh.material as THREE.MeshLambertMaterial).opacity=0.55*(1-frac);
          p.mesh.scale.setScalar(1+frac*1.4);
          if (p.age>=p.life) { scene.remove(p.mesh); smokePs.splice(i,1); }
        }
      }

      /* tween system */
      const { tw, tick: tickTweens } = makeTweenSystem();
      const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

      /* animation state */
      let busy = false;
      let _branchBuilt = false;

      /* add animation */
      async function triggerAdd() {
        if (busy) return;
        const slot = slots.find(s => !s.occupied); if (!slot) return;
        busy = true;
        proxyBox.material = boxMats[slot.bay*LEVELS+slot.lv].clone();
        proxyBox.visible = true; proxyBox.scale.setScalar(0.82);
        await tw(fkl.position as unknown as Record<string,number>, { x: slot.wx }, 0.85);
        const forkY = (slot.wy-BOX_H/2)-0.06;
        await tw(fc.position as unknown as Record<string,number>, { y: forkY }, 0.6, 'out');
        await tw(fkl.position as unknown as Record<string,number>, { z: APPROACH_Z }, 0.5);
        proxyBox.visible = false;
        const box = placeBox(slot);
        box.scale.set(0.01,1,1);
        await tw(box.scale as unknown as Record<string,number>, { x: 1 }, 0.25, 'out');
        await tw(fkl.position as unknown as Record<string,number>, { z: AISLE_Z }, 0.45);
        await tw(fc.position as unknown as Record<string,number>, { y: FC_REST }, 0.55, 'out');
        await tw(fkl.position as unknown as Record<string,number>, { x: PARK_X }, 0.85);
        busy = false;
      }

      /* deliver animation */
      async function triggerDeliver() {
        if (busy) return;
        const slot = slots.find(s => s.occupied); if (!slot) return;
        busy = true;
        partner.visible = true;
        partner.position.set(PARK_X+1.5, 0, AISLE_Z);
        await Promise.all([
          tw(fkl.position as unknown as Record<string,number>, { x: slot.wx }, 0.85),
          tw(partner.position as unknown as Record<string,number>, { x: PARTNER_MEET_X }, 0.9),
        ]);
        const forkY = (slot.wy-BOX_H/2)-0.06;
        await tw(fc.position as unknown as Record<string,number>, { y: forkY }, 0.6, 'out');
        await tw(fkl.position as unknown as Record<string,number>, { z: APPROACH_Z }, 0.5);
        proxyBox.material = (slot.mesh?.material as THREE.MeshLambertMaterial)?.clone() ?? proxyBox.material as THREE.MeshLambertMaterial;
        removeBox(slot);
        proxyBox.visible=true; proxyBox.scale.setScalar(0.82);
        await tw(fc.position as unknown as Record<string,number>, { y: forkY+0.28 }, 0.28, 'out');
        await tw(fkl.position as unknown as Record<string,number>, { z: AISLE_Z }, 0.5);
        await Promise.all([
          tw(fc.position as unknown as Record<string,number>, { y: FC_REST }, 0.5, 'out'),
          tw(fkl.position as unknown as Record<string,number>, { x: PARTNER_MEET_X-0.9 }, 0.75),
        ]);
        proxyBox.visible=false;
        partnerBox.material = (boxMats[slot.bay*LEVELS+slot.lv] as THREE.MeshLambertMaterial).clone();
        partnerBox.visible=true; partnerBox.scale.setScalar(0.75);
        const fklBack = tw(fkl.position as unknown as Record<string,number>, { x: PARK_X }, 0.8);
        const walkOut = (async () => {
          for (let step=0; step<18; step++) {
            partner.position.x = PARTNER_MEET_X+(step/17)*4.5;
            partner.position.y = Math.sin(step*0.9)*0.05;
            partnerBox.position.set(partner.position.x, partner.position.y+0.58, partner.position.z-0.18);
            await sleep(52);
          }
        })();
        await Promise.all([fklBack, walkOut]);
        partner.visible=false; partnerBox.visible=false;
        partner.position.set(PARK_X,0,AISLE_Z);
        busy=false;
      }

      /* branch animation */
      async function triggerBuildBranch() {
        if (busy || _branchBuilt) return;
        busy=true; _branchBuilt=true;
        buildingGroup.visible=true;
        const smokeOrigin = BUILD_POS.clone().add(new THREE.Vector3(0,0.1,0));
        for (let b=0; b<3; b++) { emitSmoke(smokeOrigin); await sleep(180); }
        for (let i=0; i<buildingMeshes.length; i++) {
          const m=buildingMeshes[i]; const finalY=BLOCK_DEFS[i][1];
          m.position.y=finalY+0.45; m.scale.set(0.01,0.01,0.01); m.visible=true;
          if (i%3===0) emitSmoke(new THREE.Vector3(BUILD_POS.x+BLOCK_DEFS[i][0], BUILD_POS.y+finalY+0.3, BUILD_POS.z+BLOCK_DEFS[i][2]));
          await Promise.all([
            tw(m.position as unknown as Record<string,number>, { y: finalY }, 0.22, 'out'),
            tw(m.scale as unknown as Record<string,number>, { x:1, y:1, z:1 }, 0.18, 'out'),
          ]);
          await sleep(55);
        }
        emitSmoke(smokeOrigin.add(new THREE.Vector3(0,2.5,0)));
        busy=false;
      }

      /* expose handle */
      handleRef.current = {
        triggerAdd,
        triggerDeliver,
        triggerBuildBranch,
        getSlotCount: () => ({ occupied: slots.filter(s=>s.occupied).length, total: 9 }),
        branchBuilt: () => _branchBuilt,
      };

      /* render loop */
      let rafId = 0;
      let prev = performance.now();
      let t = 0;
      function loop() {
        rafId = requestAnimationFrame(loop);
        const now = performance.now();
        const dt = Math.min((now-prev)/1000, 0.05); prev=now; t+=dt;
        tickTweens(dt);
        tickSmoke(dt);
        camera.position.x = 5.8 + Math.sin(t*0.11)*0.18;
        camera.position.y = 5.2 + Math.sin(t*0.07)*0.09;
        camera.lookAt(-0.3, 1.6, -0.5);
        renderer.render(scene, camera);
      }
      loop();

      return () => {
        cancelAnimationFrame(rafId);
        ro.disconnect();
        renderer.dispose();
        el.removeChild(renderer.domElement);
        handleRef.current = null;
      };
    }, []);

    useEffect(() => {
      const cleanup = init();
      return cleanup;
    }, [init]);

    return <div ref={mountRef} className={className ?? 'w-full h-full'} style={{ background: isDark ? '#0c0f1a' : '#e8edf5', display: 'block' }} />;
  }
);

export default WarehouseThreeScene;
