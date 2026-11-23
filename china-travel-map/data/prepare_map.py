import json, os, re, math, glob

BASE = os.path.dirname(os.path.abspath(__file__))
CHINA = json.load(open(os.path.join(BASE, '100000_full.json'), encoding='utf-8'))

REGION = {
    '21': 0, '22': 0, '23': 0,
    '11': 1, '12': 1, '13': 1, '14': 1, '15': 1,
    '31': 2, '32': 2, '33': 2, '34': 2, '35': 2, '36': 2, '37': 2,
    '41': 3, '42': 3, '43': 3,
    '44': 4, '45': 4, '46': 4, '71': 4, '81': 4, '82': 4,
    '50': 5, '51': 5, '52': 5, '53': 5,
    '61': 6, '62': 6, '64': 6, '65': 6,
    '54': 7, '63': 7,
}

PROV_SHORT = {
    '110000': '北京', '120000': '天津', '130000': '河北', '140000': '山西',
    '150000': '内蒙古', '210000': '辽宁', '220000': '吉林', '230000': '黑龙江',
    '310000': '上海', '320000': '江苏', '330000': '浙江', '340000': '安徽',
    '350000': '福建', '360000': '江西', '370000': '山东', '410000': '河南',
    '420000': '湖北', '430000': '湖南', '440000': '广东', '450000': '广西',
    '460000': '海南', '500000': '重庆', '510000': '四川', '520000': '贵州',
    '530000': '云南', '540000': '西藏', '610000': '陕西', '620000': '甘肃',
    '630000': '青海', '640000': '宁夏', '650000': '新疆', '710000': '台湾',
    '810000': '香港', '820000': '澳门',
}

ETHNIC = re.compile(r'(蒙古族|藏族|羌族|彝族|苗族|侗族|布依族|傣族|白族|哈尼族|壮族|朝鲜族|哈萨克族|回族|柯尔克孜|土家族|傈僳族|景颇族|拉祜族|佤族|纳西族|瑶族|畲族|黎族|水族|仡佬族|满族|土族|撒拉族|锡伯族|裕固族|东乡族|保安族|达斡尔族|鄂温克族|鄂伦春族|赫哲族|门巴族|珞巴族|基诺族|德昂族|阿昌族|普米族|怒族|独龙族|布朗族|毛南族|京族|高山族|俄罗斯族|乌孜别克族|塔塔尔族|塔吉克族|维吾尔族)')


def short_name(name):
    if not name:
        return ''
    name = re.sub(r'(特别行政区|维吾尔自治区|壮族自治区|回族自治区|自治区|省|市)$', '', name)
    name = re.sub(r'(地区|盟|林区)$', '', name)
    if name.endswith('自治州'):
        name = name[:-3]
        m = ETHNIC.search(name)
        if m:
            name = name[:m.start()]
    name = re.sub(r'(黎族|苗族|回族|藏族|彝族|壮族|蒙古族|土家族|瑶族|畲族|仡佬族|侗族|布依族|傣族|白族|哈尼族|朝鲜族|哈萨克族|维吾尔族|柯尔克孜|傈僳族|景颇族|拉祜族|佤族|纳西族)*(自治县|县)$', '', name)
    name = name.replace('哈萨克', '').replace('蒙古', '')
    if name == '海南':
        name = '海南州'
    return name


def simplify_ring(pts, tol):
    """Ramer-Douglas-Peucker on [[lon,lat],...] closed ring."""
    if len(pts) <= 5:
        return pts
    # drop closing duplicate for processing
    closed = pts[0] == pts[-1]
    p = pts[:-1] if closed else pts[:]
    if len(p) < 4:
        return pts
    keep = [False] * len(p)
    keep[0] = keep[-1] = True

    def dist2(pt, a, b):
        x, y = pt
        x1, y1 = a
        x2, y2 = b
        dx, dy = x2 - x1, y2 - y1
        if dx == 0 and dy == 0:
            return (x - x1) ** 2 + (y - y1) ** 2
        t = ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)
        t = max(0.0, min(1.0, t))
        px, py = x1 + t * dx, y1 + t * dy
        return (x - px) ** 2 + (y - py) ** 2

    stack = [(0, len(p) - 1)]
    tol2 = tol * tol
    while stack:
        i, j = stack.pop()
        if j <= i + 1:
            continue
        dmax, idx = 0.0, i
        for k in range(i + 1, j):
            d = dist2(p[k], p[i], p[j])
            if d > dmax:
                dmax, idx = d, k
        if dmax > tol2:
            keep[idx] = True
            stack.append((i, idx))
            stack.append((idx, j))
    out = [p[i] for i in range(len(p)) if keep[i]]
    if closed:
        out.append(out[0])
    return out


def ring_area(ring):
    s = 0.0
    for i in range(len(ring) - 1):
        s += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1]
    return abs(s) * 0.5


def clean_rings(geom, tol=0.012, min_area=0.00012):
    """Flatten Polygon/MultiPolygon into simplified rings."""
    if not geom:
        return []
    t, coords = geom.get('type'), geom.get('coordinates')
    if t == 'Polygon':
        polygons = [coords]
    elif t == 'MultiPolygon':
        polygons = coords
    else:
        return []
    rings = []
    for poly in polygons:
        for r in poly:
            pts = [[round(float(c[0]), 4), round(float(c[1]), 4)] for c in r if len(c) >= 2]
            # dedupe consecutive
            out = []
            for pt in pts:
                if not out or pt != out[-1]:
                    out.append(pt)
            if len(out) < 4:
                continue
            if out[0] != out[-1]:
                out.append(out[0])
            # simplify outer, lower tolerance for holes
            simp = simplify_ring(out, tol)
            if len(simp) < 4:
                continue
            if ring_area(simp) < min_area:
                continue
            rings.append(simp)
    return rings


cities = []
provinces = []

for f in CHINA['features']:
    p = f['properties']
    code = str(p.get('adcode', ''))
    if not code.isdigit():
        continue
    pcode = code[:2] + '0000'
    if pcode not in PROV_SHORT:
        continue
    pname = PROV_SHORT[pcode]
    center = p.get('center') or p.get('centroid') or [0, 0]
    provinces.append({
        'code': int(pcode), 'name': pname, 'region': REGION[pcode[:2]],
        'center': [round(center[0], 4), round(center[1], 4)]
    })

    if pcode in ('110000', '120000', '310000', '500000', '810000', '820000', '710000'):
        # municipalities / SAR / Taiwan -> one city region
        rings = clean_rings(f.get('geometry'), tol=0.010, min_area=0.00005)
        if not rings:
            continue
        cities.append({
            'n': pname, 'full': p.get('name') or pname, 'a': int(pcode),
            'p': pname, 'r': REGION[pcode[:2]], 'c': [round(center[0], 4), round(center[1], 4)],
            'g': rings
        })
        continue

    fn = os.path.join(BASE, pcode + '_full.json')
    fd = json.load(open(fn, encoding='utf-8'))
    for cf in fd['features']:
        cp = cf['properties']
        cname = cp.get('name') or ''
        cc = cp.get('center') or cp.get('centroid') or center
        rings = clean_rings(cf.get('geometry'), tol=0.010, min_area=0.00008)
        if not rings:
            continue
        if cname == '三沙市':
            # Keep the Paracel Islands in the main map; southern islands live in the inset.
            rings = [r for r in rings if sum(p[1] for p in r) / len(r) >= 16.0]
            if not rings:
                continue
        cities.append({
            'n': short_name(cname), 'full': cname, 'a': int(cp.get('adcode') or 0),
            'p': pname, 'r': REGION[pcode[:2]], 'c': [round(cc[0], 4), round(cc[1], 4)],
            'g': rings
        })

# South China Sea inset geometry
jd = []
for f in CHINA['features']:
    if str(f['properties'].get('adcode', '')).startswith('100000_'):
        jd = clean_rings(f.get('geometry'), tol=0.008, min_area=0.0)

# sort cities by adcode for stable display
cities.sort(key=lambda c: (c['r'], c['p'], c['a']))
provinces.sort(key=lambda p: p['code'])

out = {'provinces': provinces, 'cities': cities, 'jd': jd}
dst = os.path.join(BASE, 'map_data.json')
json.dump(out, open(dst, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print('cities', len(cities), 'provinces', len(provinces), 'jd rings', len(jd))
print('size', os.path.getsize(dst))
pts = sum(len(r) for c in cities for r in c['g'])
print('city points', pts)
print('sample', [(c['n'], c['p'], c['r'], len(c['g'])) for c in cities[:12]])
print('province labels', [(p['name'], p['center']) for p in provinces])
