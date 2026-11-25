import json
import pathlib

root = pathlib.Path(r'D:\WORK\project\ism-map')
isms = json.load(open(root / 'data' / 'isms.json', encoding='utf-8'))
srcs = json.load(open(root / 'data' / 'sources.json', encoding='utf-8'))
edit = json.load(open(root / 'data' / 'editorial.json', encoding='utf-8'))

payload = {'isms': isms, 'sources': srcs, 'editorial': edit}
out = root / 'data' / 'isms.js'
text = 'window.ISM_DATA = ' + json.dumps(payload, ensure_ascii=False) + ';\n'
out.write_text(text, encoding='utf-8')
print('written', out, len(text), 'chars')
