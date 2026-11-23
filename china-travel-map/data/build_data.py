# -*- coding: utf-8 -*-
import json, os, sys, math
from spots import SPOTS

BASE = os.path.dirname(os.path.abspath(__file__))
md = json.load(open(os.path.join(BASE, 'map_data.json'), encoding='utf-8'))
cities = md['cities']
by_name = {}
for c in cities:
    by_name.setdefault(c['n'], []).append(c)

tw_areas = {'台北', '花莲', '屏东'}
out = []
errors = []
for i, (name, city, lng, lat, scores, tags, desc, best) in enumerate(SPOTS, 1):
    area = city
    map_city = city
    if city in tw_areas:
        map_city, area = '台湾', city
    matches = by_name.get(map_city, [])
    if not matches:
        errors.append(f'{name}: city not found -> {map_city}')
        continue
    base = matches[0]
    if len(matches) > 1:
        errors.append(f'{name}: duplicate city name {map_city} ({[m["p"] for m in matches]})')
    arr = [int(scores.get(m, 40)) for m in range(1, 13)]
    out.append({
        'id': 's%03d' % i,
        'n': name,
        'city': base['n'],
        'area': area,
        'p': base['p'],
        'r': base['r'],
        'a': base['a'],
        'o': [round(lng, 4), round(lat, 4)],
        's': arr,
        'tags': tags,
        'd': desc,
        'b': best,
    })

if errors:
    print('\n'.join(errors))
    sys.exit(1)

# add city spot counts
counts = {}
for s in out:
    counts[s['a']] = counts.get(s['a'], 0) + 1
for c in cities:
    c['sc'] = counts.get(c['a'], 0)

# attach half-month climate normals to every city (nearest entry for the
# handful of county-level cities that have no own prefecture climate page)
clim = json.load(open(os.path.join(BASE, 'climate.json'), encoding='utf-8'))
clim_list = []
for code, obj in clim.items():
    lat, lon = obj.get('lat'), obj.get('lon')
    if lat is None or lon is None:
        continue
    clim_list.append((code, float(lat), float(lon), obj))

def hav(lat1, lon1, lat2, lon2):
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))

direct = nearest = 0
for c in cities:
    obj = clim.get(str(c['a']))
    is_near = 0
    if obj:
        direct += 1
    else:
        clat, clon = c['c'][1], c['c'][0]
        best = min(clim_list, key=lambda x: hav(clat, clon, x[1], x[2]))
        obj = best[3]
        nearest += 1
        is_near = 1
    c['clNear'] = is_near
    c['cl'] = {
        'hs': obj['hs'], 'ht': obj['ht'], 'htx': obj['htx'], 'htn': obj['htn'],
        'ha': obj['ha'], 'hr': obj['hr'], 'hw': obj['hw'],
        'bt': obj['bt'], 'bs': obj['bs'], 'el': obj.get('el'),
    }

cost = json.load(open(os.path.join(BASE, 'cost.json'), encoding='utf-8'))
for c in cities:
    c['cost'] = cost.get(str(c['a']))

data = {'map': md, 'spots': out}
dst = os.path.join(BASE, 'scenic_data.json')
json.dump(data, open(dst, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print('spots', len(out), 'size', os.path.getsize(dst))
print('cities with spots', len(counts))
print('climate direct', direct, 'nearest', nearest)
for m in range(1, 13):
    top = sorted(out, key=lambda s: (-s['s'][m - 1], s['n']))[:12]
    print(m, ' | '.join(f"{s['n']}:{s['s'][m-1]}" for s in top))
