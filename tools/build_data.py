import json
import pathlib

root = pathlib.Path(__file__).resolve().parent.parent
isms = json.load(open(root / 'data' / 'isms.json', encoding='utf-8'))
srcs = json.load(open(root / 'data' / 'sources.json', encoding='utf-8'))
edit = json.load(open(root / 'data' / 'editorial.json', encoding='utf-8'))
react = json.load(open(root / 'data' / 'reactions.json', encoding='utf-8'))

payload = {'isms': isms, 'sources': srcs, 'editorial': edit, 'reactions': react}
out = root / 'data' / 'isms.js'
text = 'window.ISM_DATA = ' + json.dumps(payload, ensure_ascii=False) + ';\n'
out.write_text(text, encoding='utf-8')
print('written', out, len(text), 'chars')
