#!/usr/bin/env python3
"""Extract architectural layout + REAL surface colors/textures from Matterport scan. v3
World coords: world = (x_obj, z_obj, -y_obj)  [y-up]
Outputs: layout.js (geometry + colors + collision), floor.png, ceiling.png, debug PNG.
"""
import numpy as np, json, base64, os
from scipy import ndimage
from PIL import Image
Image.MAX_IMAGE_PIXELS = None

MESHDIR = "/tmp/mesh/"
OBJ = MESHDIR + "dd9d132cf1054955980ef003f055a40f.obj"
MTL = MESHDIR + "dd9d132cf1054955980ef003f055a40f.mtl"
PLAN = "/tmp/plans/colorplan_000.jpg"
CEILPLAN = "/tmp/plans/ceilingcolorplan_000.jpg"
OUT = "/sessions/wizardly-ecstatic-brown/mnt/outputs/xmas-gift-hunt/"
CELL = 0.10
TEXS = 4  # texture px per grid cell

# ---------- parse OBJ with uvs + materials ----------
print("parsing OBJ...")
verts, uvs, faces = [], [], []   # faces: (v0,v1,v2, t0,t1,t2, matIdx)
mats, matidx = [], {}
cur = -1
with open(OBJ) as f:
    for line in f:
        if line.startswith("v "):
            p = line.split(); verts.append((float(p[1]), float(p[2]), float(p[3])))
        elif line.startswith("vt "):
            p = line.split(); uvs.append((float(p[1]), float(p[2])))
        elif line.startswith("usemtl"):
            name = line.split()[1]
            if name not in matidx: matidx[name] = len(mats); mats.append(name)
            cur = matidx[name]
        elif line.startswith("f "):
            p = line.split()[1:]
            vv, tt = [], []
            for tok in p:
                sp = tok.split("/")
                vv.append(int(sp[0]) - 1)
                tt.append(int(sp[1]) - 1 if len(sp) > 1 and sp[1] else 0)
            for k in range(1, len(vv)-1):
                faces.append((vv[0], vv[k], vv[k+1], tt[0], tt[k], tt[k+1], cur))
V = np.array(verts, dtype=np.float32)
T = np.array(uvs, dtype=np.float32) if uvs else np.zeros((1,2), np.float32)
F = np.array(faces, dtype=np.int64)
W = np.stack([V[:,0], V[:,2], -V[:,1]], axis=1)
obj_xmin, obj_xmax = float(V[:,0].min()), float(V[:,0].max())
obj_ymin, obj_ymax = float(V[:,1].min()), float(V[:,1].max())
print("verts", len(V), "uvs", len(T), "tris", len(F), "materials", len(mats))

# material -> texture file (from mtl)
mtlmap, curm = {}, None
for line in open(MTL):
    if line.startswith("newmtl"): curm = line.split()[1]
    elif line.strip().startswith("map_Kd") and curm: mtlmap[curm] = line.split()[-1]

minx, minz = W[:,0].min()-0.3, W[:,2].min()-0.3
maxx, maxz = W[:,0].max()+0.3, W[:,2].max()+0.3
GW = int(np.ceil((maxx-minx)/CELL)); GH = int(np.ceil((maxz-minz)/CELL))
print("grid", GW, "x", GH)
A, B, C = W[F[:,0]], W[F[:,1]], W[F[:,2]]

# ---------- per-triangle real colors ----------
print("sampling colors from textures...")
cent = (A + B + C) / 3.0
uvc = (T[F[:,3]] + T[F[:,4]] + T[F[:,5]]) / 3.0
tricol = np.zeros((len(F), 3), dtype=np.uint8); tricol[:] = 180
for mi, mname in enumerate(mats):
    tf = mtlmap.get(mname)
    if not tf or not os.path.exists(MESHDIR + tf): continue
    im = np.asarray(Image.open(MESHDIR + tf).convert("RGB").resize((256,256), Image.BILINEAR))
    sel = np.where(F[:,6] == mi)[0]
    if not len(sel): continue
    uu = np.clip((uvc[sel,0] % 1.0) * 255, 0, 255).astype(int)
    vv = np.clip((1.0 - (uvc[sel,1] % 1.0)) * 255, 0, 255).astype(int)
    tricol[sel] = im[vv, uu]
print("colors sampled")

# ---------- slices ----------
def slice_at(h):
    g = np.zeros((GH, GW), dtype=bool)
    ya, yb, yc = A[:,1]-h, B[:,1]-h, C[:,1]-h
    span = (np.minimum(np.minimum(ya,yb),yc) < 0) & (np.maximum(np.maximum(ya,yb),yc) > 0)
    for i in np.where(span)[0]:
        pts = []; tri = (A[i],B[i],C[i]); d = (ya[i],yb[i],yc[i])
        for e in ((0,1),(1,2),(2,0)):
            d0,d1 = d[e[0]], d[e[1]]
            if (d0<0)!=(d1<0):
                t = d0/(d0-d1); pts.append(tri[e[0]] + (tri[e[1]]-tri[e[0]])*t)
        if len(pts)<2: continue
        p0,p1 = pts[0],pts[1]
        L = np.hypot(p1[0]-p0[0], p1[2]-p0[2])
        n = max(2, int(L/(CELL*0.5))+1); ts = np.linspace(0,1,n)
        xs = ((p0[0]+(p1[0]-p0[0])*ts - minx)/CELL).astype(int)
        zs = ((p0[2]+(p1[2]-p0[2])*ts - minz)/CELL).astype(int)
        ok = (xs>=0)&(xs<GW)&(zs>=0)&(zs<GH)
        g[zs[ok], xs[ok]] = True
    return g

print("slicing...")
s10, s19 = slice_at(1.00), slice_at(1.90)
walls = ndimage.binary_closing(s10 & s19, np.ones((3,3)), iterations=2)
lab, n = ndimage.label(walls)
sizes = ndimage.sum(walls, lab, range(1, n+1))
walls = np.isin(lab, np.where(sizes >= 8)[0] + 1)

anyg = s10 | s19 | slice_at(0.5) | slice_at(0.05)
building = ndimage.binary_closing(anyg, np.ones((5,5)), iterations=3)
building = ndimage.binary_fill_holes(building)
building = ndimage.binary_opening(building, np.ones((3,3)), iterations=1)
lab, n = ndimage.label(building)
if n > 1:
    sizes = ndimage.sum(building, lab, range(1, n+1))
    building = lab == (int(np.argmax(sizes)) + 1)

edge = building & ~ndimage.binary_erosion(building, np.ones((3,3)), iterations=2)

floor_geom = np.zeros((GH,GW), dtype=bool)
ymin_t = np.minimum(np.minimum(A[:,1],B[:,1]),C[:,1])
for i in np.where(ymin_t < 0.25)[0]:
    for p in (A[i],B[i],C[i],(A[i]+B[i]+C[i])/3):
        x = int((p[0]-minx)/CELL); z = int((p[2]-minz)/CELL)
        if 0<=x<GW and 0<=z<GH: floor_geom[z,x] = True
scanned = ndimage.binary_dilation(floor_geom | anyg, np.ones((3,3)), iterations=4)
core = building & ~scanned & ~edge
core = ndimage.binary_opening(core, np.ones((3,3)), iterations=2)
core = ndimage.binary_dilation(core, np.ones((3,3)), iterations=1) & building & ~edge

floor = building & ~walls & ~edge & ~core
walls_in = walls & ~edge & building & ~core

occ = {h: slice_at(h) for h in (0.25, 0.5, 0.8, 1.1)}
furn = (occ[0.25]|occ[0.5]|occ[0.8]) & ~ndimage.binary_dilation(walls|edge, np.ones((3,3))) & floor
furn = ndimage.binary_closing(furn, np.ones((3,3)), iterations=1)

# ---------- bin triangle colors to grid (wall band + furniture band) ----------
cx_i = ((cent[:,0]-minx)/CELL).astype(int); cz_i = ((cent[:,2]-minz)/CELL).astype(int)
inb = (cx_i>=0)&(cx_i<GW)&(cz_i>=0)&(cz_i<GH)
def color_grid(hmin, hmax):
    sm = np.zeros((GH,GW,3), np.float64); ct = np.zeros((GH,GW), np.float64)
    sel = np.where(inb & (cent[:,1]>hmin) & (cent[:,1]<hmax))[0]
    np.add.at(sm, (cz_i[sel], cx_i[sel]), tricol[sel].astype(np.float64))
    np.add.at(ct, (cz_i[sel], cx_i[sel]), 1)
    return sm, ct
wall_sm, wall_ct = color_grid(0.7, 2.3)
furn_sm, furn_ct = color_grid(0.15, 1.3)

def rect_color(sm, ct, x0c, x1c, z0c, z1c, pad=1):
    z0c=max(0,z0c-pad); x0c=max(0,x0c-pad); z1c=min(GH-1,z1c+pad); x1c=min(GW-1,x1c+pad)
    c = ct[z0c:z1c+1, x0c:x1c+1].sum()
    if c < 1: return None
    s = sm[z0c:z1c+1, x0c:x1c+1].sum(axis=(0,1)) / c
    return "%02X%02X%02X" % tuple(int(v) for v in np.clip(s,0,255))

# ---------- furniture blobs with colors ----------
lab, n = ndimage.label(furn)
blobs = []
for i in range(1, n+1):
    m = lab == i; cnt = int(m.sum())
    if cnt < 6 or cnt > 2500: continue
    zs, xs = np.where(m)
    x0,x1,z0,z1 = int(xs.min()),int(xs.max()),int(zs.min()),int(zs.max())
    h = 0.35
    for hh in (1.1,0.8,0.5,0.25):
        if (occ[hh]&m).sum() > cnt*0.15: h = hh+0.12; break
    col = rect_color(furn_sm, furn_ct, x0,x1,z0,z1, pad=0)
    b = {"x":round(float(minx+(x0+x1+1)/2*CELL),2), "z":round(float(minz+(z0+z1+1)/2*CELL),2),
         "w":round(float((x1-x0+1)*CELL),2), "d":round(float((z1-z0+1)*CELL),2),
         "h":round(float(h),2)}
    if col: b["c"] = col
    blobs.append(b)
print("furniture blobs:", len(blobs))

# ---------- floor zones (for base slabs) ----------
plan = np.asarray(Image.open(PLAN).convert("RGB"))
PH, PW = plan.shape[:2]
def world_to_plan_idx(xw, zw):
    px = (xw - obj_xmin) / (obj_xmax - obj_xmin) * (PW-1)
    py = ((-zw) - obj_ymin) / (obj_ymax - obj_ymin) * (PH-1)
    return px, (PH-1) - py
wood = np.zeros((GH,GW), dtype=bool)
zs, xs = np.where(floor)
for z, x in zip(zs, xs):
    px, py = world_to_plan_idx(minx+(x+0.5)*CELL, minz+(z+0.5)*CELL)
    px, py = int(px), int(py)
    if 0<=px<PW and 0<=py<PH:
        r,g,b = plan[py,px].astype(int)
        if r>140 and (r-b)>25 and g>110: wood[z,x] = True
wood = ndimage.binary_closing(wood, np.ones((3,3)), iterations=2) & floor
carpet = floor & ~wood

tree = None
lab, n = ndimage.label(wood)
if n:
    sizes = ndimage.sum(wood, lab, range(1,n+1))
    big = lab == (int(np.argmax(sizes))+1)
    dist = ndimage.distance_transform_edt(big & ~furn)
    zt, xt = np.unravel_index(int(np.argmax(dist)), dist.shape)
    tree = [round(float(minx+xt*CELL),2), round(float(minz+zt*CELL),2), round(float(dist[zt,xt]*CELL),2)]
print("tree spot:", tree)

# ---------- merge rects ----------
def merge_rects(g, sm=None, ct=None):
    out = []
    for z in range(GH):
        x = 0
        while x < GW:
            if g[z,x]:
                x0 = x
                while x < GW and g[z,x]: x += 1
                out.append((x0, x-1, z))
            else: x += 1
    spans = {}
    for x0,x1,z in out:
        key = (x0,x1); sl = spans.setdefault(key, [])
        if sl and sl[-1][1] == z-1: sl[-1][1] = z
        else: sl.append([z,z])
    rects, cols = [], []
    for (x0,x1),zl in spans.items():
        for z0,z1 in zl:
            rects.append([round(float(minx+x0*CELL),2), round(float(minz+z0*CELL),2),
                          round(float((x1-x0+1)*CELL),2), round(float((z1-z0+1)*CELL),2)])
            if sm is not None:
                cols.append(rect_color(sm, ct, x0,x1,z0,z1) or "F5F0E8")
    return (rects, cols) if sm is not None else rects

wall_rects, wall_cols = merge_rects(walls_in, wall_sm, wall_ct)
win_rects  = merge_rects(edge)
wood_rects = merge_rects(wood)
carp_rects = merge_rects(carpet)
core_rects = merge_rects(core)
print("walls", len(wall_rects), "windows", len(win_rects), "cores", len(core_rects))

coll = walls | edge | core
b64 = base64.b64encode(np.packbits(coll.astype(np.uint8), axis=None).tobytes()).decode()
walk64 = base64.b64encode(np.packbits(floor.astype(np.uint8), axis=None).tobytes()).decode()

# ---------- bake floor + ceiling textures ----------
print("baking textures...")
def bake(planimg, flip_rows, fname):
    P = np.asarray(Image.open(planimg).convert("RGB"))
    ph, pw = P.shape[:2]
    TW, TH = GW*TEXS, GH*TEXS
    cgrid, rgrid = np.meshgrid(np.arange(TW), np.arange(TH))
    xw = minx + (cgrid + 0.5) * (CELL/TEXS)
    zw = minz + (rgrid + 0.5) * (CELL/TEXS)
    px = (xw - obj_xmin) / (obj_xmax - obj_xmin) * (pw-1)
    py = (ph-1) - (((-zw) - obj_ymin) / (obj_ymax - obj_ymin) * (ph-1))
    valid = (px>=0)&(px<pw)&(py>=0)&(py<ph)
    pxc = np.clip(px,0,pw-1).astype(int); pyc = np.clip(py,0,ph-1).astype(int)
    img = P[pyc, pxc]
    mask = building[np.clip(rgrid//TEXS,0,GH-1), np.clip(cgrid//TEXS,0,GW-1)] & valid
    rgba = np.dstack([img, (mask*255).astype(np.uint8)])
    if flip_rows: rgba = rgba[::-1]
    Image.fromarray(rgba, "RGBA").save(OUT+fname, optimize=True)
    print(fname, "size KB:", os.path.getsize(OUT+fname)//1024)
bake(PLAN, False, "floor.png")
bake(CEILPLAN, True, "ceiling.png")

layout = {
  "origin":[round(float(minx),3), round(float(minz),3)], "cell":CELL, "gw":GW, "gh":GH,
  "wallH":2.55, "walls":wall_rects, "wallC":wall_cols, "windows":win_rects, "cores":core_rects,
  "wood":wood_rects, "carpet":carp_rects, "furniture":blobs,
  "tree":tree, "floorTex":"floor.png", "ceilTex":"ceiling.png",
  "collision":b64, "walkable":walk64
}
js = "const LAYOUT = " + json.dumps(layout, separators=(",",":")) + ";\n"
open(OUT+"layout.js","w").write(js)
print("layout.js KB:", len(js)//1024)

img = np.zeros((GH,GW,3), dtype=np.uint8); img[:] = (40,44,52)
img[carpet] = (150,155,165); img[wood] = (225,195,150); img[core] = (90,90,100)
img[furn] = (120,170,120); img[walls_in] = (245,245,245); img[edge] = (90,160,230)
Image.fromarray(img[::-1]).resize((GW*2,GH*2), Image.NEAREST).save(OUT+"_layout_debug.png")
print("done")
