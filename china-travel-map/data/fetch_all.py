import requests, json, os, time
base = 'https://geo.datav.aliyun.com/areas_v3/bound/'
out = os.path.dirname(os.path.abspath(__file__))
china = json.load(open(os.path.join(out, '100000_full.json'), encoding='utf-8'))
codes = [str(f['properties']['adcode']) for f in china['features'] if str(f['properties']['adcode']).isdigit()]
print('province codes', len(codes), codes)
for code in codes:
    fn = os.path.join(out, code + '_full.json')
    if os.path.exists(fn) and os.path.getsize(fn) > 500:
        continue
    for attempt in range(3):
        try:
            r = requests.get(base + code + '_full.json', timeout=40)
            r.raise_for_status()
            open(fn, 'wb').write(r.content)
            print(code, len(r.content))
            break
        except Exception as e:
            print('retry', code, e)
            time.sleep(1)
print('done')
