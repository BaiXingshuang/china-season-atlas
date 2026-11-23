# -*- coding: utf-8 -*-
"""Fetch Numbeo city indices + a few raw price components for 12 Chinese
anchor cities, and parse provincial per-capita consumption (2025) from the
saved statistics page.
"""
import json, os, re, time
import requests
from lxml import html

BASE = os.path.dirname(os.path.abspath(__file__))
MAP = json.load(open(os.path.join(BASE, 'map_data.json'), encoding='utf-8'))
CITY_BY_NAME = {}
for c in MAP['cities']:
    CITY_BY_NAME.setdefault(c['n'], c)

ANCHORS = [
    ('Shenzhen', '深圳', '广东'),
    ('Shanghai', '上海', '上海'),
    ('Beijing', '北京', '北京'),
    ('Guangzhou', '广州', '广东'),
    ('Hangzhou', '杭州', '浙江'),
    ('Suzhou', '苏州', '江苏'),
    ('Wuhan', '武汉', '湖北'),
    ('Nanjing', '南京', '江苏'),
    ('Qingdao', '青岛', '山东'),
    ('Chongqing', '重庆', '重庆'),
    ('Chengdu', '成都', '四川'),
    ("Xi'an", '西安', '陕西'),
]

HEADERS = {'User-Agent': 'Mozilla/5.0'}


def fetch(url, tries=4):
    for i in range(tries):
        try:
            r = requests.get(url, timeout=50, headers=HEADERS)
            if r.status_code == 200:
                return r.text
            if r.status_code == 429:
                time.sleep(8 + i * 6)
                continue
            print('HTTP', r.status_code, url)
        except Exception as e:
            print('ERR', e, url)
        time.sleep(2 + i * 2)
    return ''


def money(s):
    s = s.replace(',', '')
    m = re.search(r'([0-9]+(?:\.[0-9]+)?)', s)
    return float(m.group(1)) if m else None


def parse_country():
    t = fetch('https://www.numbeo.com/cost-of-living/country_result.jsp?country=China')
    d = html.fromstring(t)
    rows = d.xpath('//table[@id="t2"]//tbody/tr')
    out = {}
    for r in rows:
        cells = [c.text_content().strip() for c in r.xpath('./td')]
        if len(cells) < 8:
            continue
        name = cells[1].split(',')[0].strip()
        out[name] = {
            'index': float(cells[2]),
            'rent': float(cells[3]),
            'groceries': float(cells[5]),
            'restaurant': float(cells[6]),
        }
    return out


def parse_city_prices(en):
    slug = en.replace(' ', '_').replace("'", '%27')
    t = fetch('https://www.numbeo.com/cost-of-living/in/' + slug)
    if not t:
        return {}
    d = html.fromstring(t)
    vals = {}
    keys = {
        'oneway': 'One-Way Ticket (Local Transport)',
        'monthly': 'Monthly Public Transport Pass (Regular Price)',
        'taxi': 'Taxi Start (Standard Tariff)',
        'gas': 'Gasoline (1 Liter)',
        'basic': 'Basic Utilities for 85 m2 Apartment (Electricity, Heating, Cooling, Water, Garbage)',
        'internet': 'Broadband Internet (Unlimited Data, 60 Mbps or Higher)',
        'mobile': 'Mobile Phone Plan (Monthly, with Calls and 10GB+ Data)',
        'meal': 'Meal at an Inexpensive Restaurant',
    }
    for tr in d.xpath('//tr'):
        cells = tr.xpath('./td')
        if len(cells) < 2:
            continue
        label = ' '.join(cells[0].text_content().split())
        for k, target in keys.items():
            if label == target:
                vals[k] = money(cells[1].text_content())
    return vals


def main():
    country = parse_country()
    out = []
    for en, city, prov in ANCHORS:
        base = country.get(en.split(',')[0].strip(), {})
        if not base:
            # Qingdao is stored as "Qingdao, Shandong" -> handled by split
            print('NO COUNTRY ROW', en)
            continue
        vals = parse_city_prices(en)
        c = CITY_BY_NAME.get(city)
        lat = c['c'][1] if c else None
        lon = c['c'][0] if c else None
        item = {
            'en': en, 'city': city, 'prov': prov,
            'lat': lat, 'lon': lon,
            **base, **vals
        }
        out.append(item)
        print(item, flush=True)
        time.sleep(2)
    json.dump(out, open(os.path.join(BASE, 'numbeo_anchors.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

    # Provincial per-capita consumption, parsed from the saved table page.
    t = open(os.path.join(BASE, 'jujin.html'), encoding='utf-8').read()
    d = html.fromstring(t)
    cons = {}
    for r in d.xpath('//table//tr'):
        cells = [x.text_content().strip() for x in r.xpath('./td')]
        if len(cells) >= 3 and cells[0].isdigit():
            cons[cells[1]] = int(float(cells[2]))
    json.dump(cons, open(os.path.join(BASE, 'province_consumption.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('provinces', len(cons), cons)


if __name__ == '__main__':
    main()
