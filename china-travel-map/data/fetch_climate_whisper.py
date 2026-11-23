# -*- coding: utf-8 -*-
"""Build 24 half-month climate normals from WeatherWhisper's processed
prefecture climate pages (1991-2020 normals, NOAA/NASA POWER based).

Only aggregated values are kept; downloaded source files are cached locally.
"""
import json, math, os, time
from concurrent.futures import ThreadPoolExecutor, as_completed
import requests

BASE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(BASE, 'whisper_cache')
OUT = os.path.join(BASE, 'climate.json')
os.makedirs(CACHE, exist_ok=True)

LIST_URL = 'https://api.github.com/repos/lzq1206/WeatherWhisper/contents/public/data'
RAW = 'https://raw.githubusercontent.com/lzq1206/WeatherWhisper/main/public/data/'
HEADERS = {'User-Agent': 'china-season-atlas/1.0'}

# Three extra station pages for Taiwan (the prefecture catalog has no Taiwan page).
EXTRA = {'710000': '466960.json'}


def get_json(url, tries=5):
    for i in range(tries):
        try:
            r = requests.get(url, timeout=60, headers=HEADERS)
            if r.status_code == 200:
                return r.json()
            if r.status_code == 404:
                return None
            print('HTTP', r.status_code, url[-80:])
        except Exception as e:
            print('ERR', e)
        time.sleep(1.5 * (i + 1))
    raise RuntimeError(url)


def download(name):
    path = os.path.join(CACHE, name)
    if os.path.exists(path) and os.path.getsize(path) > 1000:
        return name, path
    for i in range(6):
        try:
            r = requests.get(RAW + name, timeout=90, headers=HEADERS)
            if r.status_code == 200:
                open(path, 'wb').write(r.content)
                return name, path
            if r.status_code == 404:
                return name, None
        except Exception as e:
            print('DL ERR', name, e)
        time.sleep(1.2 * (i + 1))
    return name, None


def dot(a, b):
    return sum(x * y for x, y in zip(a, b))


def score_period(p):
    # p: t, tx, tn, app, rh, wet, sun, cloud
    app = p['app']
    rh = p['rh']
    wet = p['wet']
    sun = p['sun']
    temp_score = 100.0 * math.exp(-0.5 * ((app - 21.5) / 8.2) ** 2)
    hum_score = 100.0 - max(0, rh - 68) * 0.9 - max(0, 38 - rh) * 0.9
    hum_score = max(20, min(100, hum_score))
    wet_score = max(15, min(100, 100 - wet * 0.75))
    sun_score = max(35, min(100, 60 + (sun - 3.5) * 9))
    score = 0.72 * temp_score + 0.14 * hum_score + 0.09 * wet_score + 0.05 * sun_score
    # Extra penalties for genuinely hard heat / cold, and for muggy nights.
    if app > 27:
        score -= (app - 27) * 3.0
    if app < 8:
        score -= (8 - app) * 2.0
    if app > 24 and rh > 78:
        score -= (rh - 78) * 0.35
    if wet > 45:
        score -= (wet - 45) * 0.9
    return int(max(0, min(100, round(score))))


def half_month_label(i):
    m = i // 2 + 1
    return f'{m}月上' if i % 2 == 0 else f'{m}月下'


def window_label(a, b):
    # a,b are period indexes; include half markers only at open ends
    def point(i):
        m = i // 2 + 1
        return f'{m}月' if i % 2 == 0 else f'{m}月下'
    ma, mb = a // 2 + 1, b // 2 + 1
    if a == b:
        return half_month_label(a)
    if ma == mb and a % 2 == 0 and b % 2 == 1:
        return f'{ma}月'
    start = f'{ma}月' if a % 2 == 0 else f'{ma}月下'
    end = f'{mb}月' if b % 2 == 1 else f'{mb}月上'
    return f'{start}—{end}'


def best_windows(hs):
    mx = max(hs)
    threshold = min(78, max(65, mx - 12))
    hot = [i for i, v in enumerate(hs) if v >= threshold]
    windows = []
    i = 0
    while i < len(hot):
        a = hot[i]
        b = a
        while i + 1 < len(hot) and hot[i + 1] == b + 1:
            i += 1
            b = hot[i]
        vals = hs[a:b + 1]
        windows.append((sum(vals) / len(vals), a, b))
        i += 1
    windows.sort(key=lambda w: (-w[0], w[1]))
    windows = windows[:2]
    windows.sort(key=lambda w: w[1])
    return '、'.join(window_label(a, b) for _, a, b in windows), mx


def aggregate(d):
    daily = d.get('daily_climatology') or []
    buckets = [[] for _ in range(24)]
    for day in daily:
        mmdd = day.get('date', '')
        try:
            m, dd = [int(x) for x in mmdd.split('-')]
        except Exception:
            continue
        idx = (m - 1) * 2 + (0 if dd <= 15 else 1)
        buckets[idx].append(day)
    periods = []
    for b in buckets:
        if not b:
            periods.append(None)
            continue
        keys = ['temp_avg', 'temp_max', 'temp_min', 'apparent_temp', 'humidity', 'wet_probability', 'solar_kwh', 'cloud']
        avg = {k: sum(float(x.get(k) or 0) for x in b) / len(b) for k in keys}
        periods.append({
            't': round(avg['temp_avg'], 1),
            'tx': round(avg['temp_max'], 1),
            'tn': round(avg['temp_min'], 1),
            'app': round(avg['apparent_temp'], 1),
            'rh': round(avg['humidity'], 0),
            'wet': round(avg['wet_probability'], 0),
            'sun': round(avg['solar_kwh'], 2),
            'cloud': round(avg['cloud'], 0),
        })
    for p in periods:
        if p:
            p['s'] = score_period(p)
    return periods


def build_one(name):
    path = os.path.join(CACHE, name)
    d = json.load(open(path, encoding='utf-8'))
    meta = d.get('metadata') or {}
    periods = aggregate(d)
    if not periods or any(p is None for p in periods):
        return None
    hs = [p['s'] for p in periods]
    bt, bs = best_windows(hs)
    code = str(meta.get('division_code') or '').zfill(6)
    return {
        'code': code,
        'name': meta.get('city') or meta.get('city_short_zh') or '',
        'province': meta.get('province') or '',
        'lat': meta.get('lat'),
        'lon': meta.get('lon'),
        'el': meta.get('elev'),
        'hs': hs,
        'ht': [p['t'] for p in periods],
        'htx': [p['tx'] for p in periods],
        'htn': [p['tn'] for p in periods],
        'ha': [p['app'] for p in periods],
        'hr': [p['rh'] for p in periods],
        'hw': [p['wet'] for p in periods],
        'bt': bt,
        'bs': bs,
    }


def build_taiwan(path):
    d = json.load(open(path, encoding='utf-8'))
    monthly = d.get('monthly') or {}
    periods = []
    for m in range(1, 13):
        x = monthly.get(str(m)) or {}
        p = {
            't': round(float(x.get('temp_avg', 20)), 1),
            'tx': round(float(x.get('temp_max', 24)), 1),
            'tn': round(float(x.get('temp_min', 16)), 1),
            'app': round(float(x.get('apparent_temp_avg', x.get('temp_avg', 20))), 1),
            'rh': round(float(x.get('humidity', 75)), 0),
            'wet': round(float(x.get('precip_probability', 30)), 0),
            'sun': 4.5,
            'cloud': round(float(x.get('cloud', 65)), 0),
        }
        p['s'] = score_period(p)
        periods.append(p)
        periods.append(dict(p))
    hs = [p['s'] for p in periods]
    bt, bs = best_windows(hs)
    return {
        'code': '710000',
        'name': '台湾',
        'province': '台湾',
        'lat': 25.03,
        'lon': 121.56,
        'el': 5,
        'hs': hs,
        'ht': [p['t'] for p in periods],
        'htx': [p['tx'] for p in periods],
        'htn': [p['tn'] for p in periods],
        'ha': [p['app'] for p in periods],
        'hr': [p['rh'] for p in periods],
        'hw': [p['wet'] for p in periods],
        'bt': bt,
        'bs': bs,
    }


def main():
    data = get_json(LIST_URL)
    names = [x['name'] for x in data if x['name'].startswith('prefecture-') and x['name'].endswith('.json')]
    print('prefecture files', len(names))
    downloaded = []
    with ThreadPoolExecutor(max_workers=24) as ex:
        futs = {ex.submit(download, n): n for n in names}
        for i, fut in enumerate(as_completed(futs), 1):
            n, p = fut.result()
            if p:
                downloaded.append(n)
            if i % 40 == 0:
                print('downloaded', i, flush=True)

    out = {}
    for name in downloaded:
        try:
            item = build_one(name)
        except Exception as e:
            print('BUILD ERR', name, e)
            continue
        if not item:
            continue
        code = item.pop('code')
        if code and code != '000000':
            out[code] = item

    # Taiwan: the prefecture catalog has no Taiwan page; use the Taipei
    # Songshan station's monthly normals for the island reference.
    tw_name, tw_path = download(EXTRA['710000'])
    if tw_path:
        try:
            out['710000'] = build_taiwan(tw_path)
        except Exception as e:
            print('TAIWAN ERR', e)

    json.dump(out, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print('written', OUT, os.path.getsize(OUT), 'entries', len(out))
    sh = out.get('310000')
    if sh:
        print('SHANGHAI', sh['bt'], sh['bs'], sh['hs'])


if __name__ == '__main__':
    main()
