# -*- coding: utf-8 -*-
"""Build a non-housing ordinary-consumption price index for all mapped cities.

Base: Numbeo 12-city Cost of Living Index (excl. rent), groceries and restaurant
subindices. For non-anchor cities, a log-linear model from provincial per-capita
consumption is blended with the nearest measured anchor; capital/county
adjustments are applied. Everything is normalized to Shanghai = 100.
"""
import json, math, os, re

BASE = os.path.dirname(os.path.abspath(__file__))
MD = json.load(open(os.path.join(BASE, 'map_data.json'), encoding='utf-8'))
ANCHORS = json.load(open(os.path.join(BASE, 'numbeo_anchors.json'), encoding='utf-8'))
CONS = json.load(open(os.path.join(BASE, 'province_consumption.json'), encoding='utf-8'))

# Shanghai is the normalization base.
SH = next(a for a in ANCHORS if a['city'] == '上海')
SH_INDEX = SH['index']

def hav(lat1, lon1, lat2, lon2):
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))

# least squares: raw index = a + b * ln(provincial consumption)
xs = [math.log(CONS[a['prov']]) for a in ANCHORS if a['prov'] in CONS]
ys = [a['index'] for a in ANCHORS if a['prov'] in CONS]
mx, my = sum(xs) / len(xs), sum(ys) / len(ys)
b = sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / sum((x - mx) ** 2 for x in xs)
a0 = my - b * mx

ANCHOR_BY_CITY = {a['city']: a for a in ANCHORS}

def comp_anchor(a):
    food = a['groceries'] / SH['groceries'] * 100
    dining = a['restaurant'] / SH['restaurant'] * 100
    trans = 100 * sum([
        (a.get('oneway') or SH['oneway']) / SH['oneway'],
        (a.get('monthly') or SH['monthly']) / SH['monthly'],
        (a.get('taxi') or SH['taxi']) / SH['taxi'],
        (a.get('gas') or SH['gas']) / SH['gas'],
    ]) / 4
    util = 100 * sum([
        (a.get('basic') or SH['basic']) / SH['basic'],
        (a.get('internet') or SH['internet']) / SH['internet'],
        (a.get('mobile') or SH['mobile']) / SH['mobile'],
    ]) / 3
    daily = 100 * ((food / 100) * .55 + (a['index'] / SH_INDEX) * .45)
    return {
        'i': round(a['index'] / SH_INDEX * 100, 1),
        'f': round(food), 'd': round(dining), 't': round(trans), 'u': round(util), 'g': round(daily),
        'src': 'm', 'a': a['city'],
    }

anchor_comps = {a['city']: comp_anchor(a) for a in ANCHORS}
# ratios used to split an estimated overall index into components
ratios = {}
for k in ['f', 'd', 't', 'u', 'g']:
    ratios[k] = sum(v[k] / v['i'] for v in anchor_comps.values()) / len(anchor_comps)

CAPITALS = {
    '北京', '天津', '上海', '重庆', '广州', '成都', '武汉', '西安', '南京', '杭州',
    '合肥', '济南', '郑州', '长沙', '南昌', '福州', '台北', '石家庄', '太原',
    '呼和浩特', '沈阳', '长春', '哈尔滨', '南宁', '海口', '贵阳', '昆明', '拉萨',
    '兰州', '西宁', '银川', '乌鲁木齐', '香港', '澳门'
}

out = {}
for c in MD['cities']:
    name = c['n']
    prov = c['p']
    if name in anchor_comps:
        out[str(c['a'])] = anchor_comps[name]
        continue

    # nearest measured city, used only when geographically close enough
    nearest = min(ANCHORS, key=lambda x: hav(c['c'][1], c['c'][0], x['lat'], x['lon']))
    dist = hav(c['c'][1], c['c'][0], nearest['lat'], nearest['lon'])
    w = max(0.0, min(0.8, 1.0 - dist / 450.0))

    if prov in CONS:
        model = a0 + b * math.log(CONS[prov])
        raw = w * nearest['index'] + (1 - w) * model
    elif prov == '香港':
        raw = 47.5
    elif prov == '澳门':
        raw = 43.0
    elif prov == '台湾':
        raw = 31.5
    else:
        raw = nearest['index'] * .95

    if name in CAPITALS:
        raw *= 1.03
    if c['full'].endswith('县') or c['full'].endswith('自治县'):
        raw *= .97
    idx = round(max(48, min(130, raw / SH_INDEX * 100)), 1)
    out[str(c['a'])] = {
        'i': idx,
        'f': round(idx * ratios['f']),
        'd': round(idx * ratios['d']),
        't': round(idx * ratios['t']),
        'u': round(idx * ratios['u']),
        'g': round(idx * ratios['g']),
        'src': 'e',
        'a': nearest['city'],
    }

json.dump(out, open(os.path.join(BASE, 'cost.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print('a,b', round(a0, 2), round(b, 3), 'ratios', {k: round(v, 2) for k, v in ratios.items()})
print('entries', len(out), 'size', os.path.getsize(os.path.join(BASE, 'cost.json')))
for k in ['310000', '110000', '440300', '230100', '650100', '540100', '460200', '500000']:
    if k in out:
        print(k, out[k])
vals = [v['i'] for v in out.values()]
print('min/max', min(vals), max(vals))
