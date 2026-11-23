# -*- coding: utf-8 -*-
import json, os

BASE = os.path.dirname(os.path.abspath(__file__))
data = json.load(open(os.path.join(BASE, 'data', 'scenic_data.json'), encoding='utf-8'))
css = open(os.path.join(BASE, 'src', 'style.css'), encoding='utf-8').read()
app = open(os.path.join(BASE, 'src', 'app.js'), encoding='utf-8').read()
tpl = open(os.path.join(BASE, 'src', 'template.html'), encoding='utf-8').read()

data_js = 'window.__CHINA_SEASON_DATA__ = ' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';'
data_js = data_js.replace('</script', '<\\/script')
app = app.replace('</script', '<\\/script')

html = tpl.replace('/*__CSS__*/', css).replace('/*__DATA__*/', data_js).replace('/*__APP__*/', app)
root = os.path.dirname(BASE)
out = os.path.join(root, '中国四季旅行地图.html')
index = os.path.join(root, 'index.html')
for path in (out, index):
    open(path, 'w', encoding='utf-8', newline='\n').write(html)
    print('built', path)
print('size', os.path.getsize(out), 'bytes')
print('cities', len(data['map']['cities']), 'spots', len(data['spots']))
