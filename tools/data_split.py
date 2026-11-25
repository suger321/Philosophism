# -*- coding: utf-8 -*-
"""把 42 条拆成两套模式：30 条生活活法（生活 8 轴）+ 20 条哲学主义（哲学 8 轴）。"""
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
PATH = ROOT / 'data' / 'isms.json'

LIFE_AXES = ['mood', 'effort', 'focus', 'reality', 'social', 'money', 'horizon', 'stance']
PHILO_AXES = ['situation', 'theory', 'locus', 'source', 'stance', 'plurality', 'dimension', 'aim']

PHILO_IDS = {
    'nihilism', 'stoicism', 'hedonism', 'existentialism', 'pragmatism', 'skepticism',
    'cynicism', 'pessimism', 'absurdism', 'altruism', 'egoism', 'romanticism'
}

PHILO_COORDS = {
    'nihilism': [-0.9, -0.5, 0.0, -0.2, 0.3, 0.4, -0.8, -0.4],
    'stoicism': [0.2, 0.8, 0.6, 0.6, 0.1, -0.3, 0.4, 0.5],
    'hedonism': [0.4, 0.5, 0.4, 0.1, 0.0, 0.0, -0.8, 0.6],
    'existentialism': [0.0, 0.2, 0.6, -0.2, 0.6, 0.5, -0.2, 0.3],
    'pragmatism': [0.5, 0.9, -0.4, 0.3, -0.1, 0.6, -0.7, 0.2],
    'skepticism': [-0.2, -0.7, -0.1, -0.1, 0.2, 0.9, -0.4, -0.6],
    'cynicism': [-0.3, 0.6, 0.9, -0.4, 0.8, 0.3, -0.3, 0.4],
    'pessimism': [-0.9, -0.5, 0.3, -0.3, -0.2, -0.1, 0.3, -0.4],
    'absurdism': [-0.1, -0.4, 0.5, -0.3, 0.7, 0.4, -0.3, 0.2],
    'altruism': [0.6, 0.2, -0.7, -0.2, 0.2, 0.1, 0.1, 0.7],
    'egoism': [-0.3, 0.6, 0.9, 0.3, 0.1, 0.2, -0.7, 0.5],
    'romanticism': [0.5, -0.9, 0.6, -0.7, 0.4, 0.6, 0.8, 0.3],
    'idealism': [0.3, -0.8, -0.5, 0.5, -0.2, -0.2, 0.7, 0.1],
    'physicalism': [-0.1, 0.7, -0.3, 0.8, -0.3, -0.4, -0.9, -0.2],
    'relativism': [-0.4, -0.2, -0.4, -0.3, 0.3, 0.9, -0.5, -0.3],
    'mysticism': [0.5, -0.9, 0.5, -0.9, 0.2, 0.3, 0.95, -0.1],
    'cosmopolitanism': [0.3, 0.3, -0.9, 0.2, 0.1, 0.3, -0.2, 0.7],
    'rationalism': [0.3, -0.6, 0.2, 0.9, -0.1, -0.4, 0.3, 0.0],
    'empiricism': [0.0, 0.8, 0.1, -0.8, -0.1, 0.3, -0.6, -0.1],
    'utilitarianism': [0.4, 0.9, -0.8, 0.6, 0.0, -0.2, -0.8, 0.8],
}

NEW_PHILO = [
    {
        'id': 'idealism', 'name': '观念论', 'nameEn': 'Idealism',
        'oneLine': '你看到的世界，一半是你自己添上去的。',
        'definition': '认为实在离不开心灵。极端版本说"存在就是被感知"，温和版本说我们认识的永远是被加工过的现象，而不是事物本身。它不否认外面有东西，只否认我们能直接碰到"未经加工"的那个东西。',
        'when': '争论"这是客观事实，还是你的看法"的时候。',
        'tenets': ['心灵或精神是实在的基础', '我们认识的一切都被框架加工过', '知识与对象之间必须"同构"，否则认识不可能'],
        'strengths': ['能解释同一件事为什么不同人看到不同的东西', '为意义、价值、审美保留位置，不被还原成物质'],
        'limits': ['违反常识：桌子就在那儿，不因为你不看就消失', '容易滑向"一切都是我想的"，说不清公共性'],
        'figures': ['「存在即被感知」', '「你怎么知道那是本来面目」', '「现实是被建构的」'],
        'coords': PHILO_COORDS['idealism'],
    },
    {
        'id': 'physicalism', 'name': '物理主义', 'nameEn': 'Physicalism',
        'oneLine': '说到底，都是物质在动。',
        'definition': '一切现象最终都由物理事实决定。情绪、想法、社会关系，都能落到大脑与物质过程上。它不要求你把"爱"翻译成激素，只主张：物质层面完全一样，其他层面也就一样。',
        'when': '别人说"这不科学"，或者你想给一个现象找硬解释的时候。',
        'tenets': ['物理事实决定一切事实', '心理可以随附于、实现于物理，但不必被还原', '说不清"物理"指什么，这理论就不完整'],
        'strengths': ['与科学一致，能解释药物、睡眠、运动为什么影响心情', '排除玄学解释，逼着人去找可验证的原因'],
        'limits': ['说不清"疼是什么感觉"为什么不是物理知识', '把爱说成激素，总觉得少了点什么'],
        'figures': ['「有数据吗」', '「这是生理反应」', '「大脑决定的」'],
        'coords': PHILO_COORDS['physicalism'],
    },
    {
        'id': 'relativism', 'name': '相对主义', 'nameEn': 'Relativism',
        'oneLine': '对错要看在谁的框架里说。',
        'definition': '真、善、合理都相对于某个文化、时代或视角才成立，没有一个超然的中立标准来裁决。多数人是局部相对主义：只在道德或审美上这样想，数学上不。',
        'when': '跨文化冲突、家庭观念冲突、不知道该不该评价别人的时候。',
        'tenets': ['真与善随框架而变', '「P 为真」其实是「P 相对于 C 为真」', '不存在能站到所有框架之外的裁判'],
        'strengths': ['不那么容易 judge 别人', '能理解差异，减少无谓的优越感'],
        'limits': ['滑到底就是"什么都可以"，连明显的恶也不能批评', '「一切皆相对」这句话本身怎么算'],
        'figures': ['「各有各的活法」', '「你不懂他们的文化」', '「没有标准答案」'],
        'coords': PHILO_COORDS['relativism'],
    },
    {
        'id': 'mysticism', 'name': '神秘主义', 'nameEn': 'Mysticism',
        'oneLine': '有些东西只能体验，说不出来。',
        'definition': '主张存在一种超越感官和语言的体验，能直接接触到更深的实在。重点不是奇异的经历，而是长期修行之后的转变——人变了，看世界的方式也变了。',
        'when': '冥想、宗教体验、或者觉得语言怎么都不够用的时候。',
        'tenets': ['存在超越语言的直接体验', '各传统的神秘体验共享一个核心', '这类体验自带认知，不只是情绪'],
        'strengths': ['为难以言说的感受留了位置', '能解释为什么有人被一次体验彻底改变'],
        'limits': ['无法验证，谁都可以这么说', '各传统的说法互相矛盾，到底谁对'],
        'figures': ['「说不出来」', '「只能自己体会」', '「语言到此为止」'],
        'coords': PHILO_COORDS['mysticism'],
    },
    {
        'id': 'cosmopolitanism', 'name': '世界主义', 'nameEn': 'Cosmopolitanism',
        'oneLine': '人不分国界，都一样重要。',
        'definition': '认为所有人同属一个共同体，远方陌生人和隔壁邻居同等重要。对本国、本地、本文化的偏爱不是不能有，但需要给出理由。',
        'when': '看到远方的灾难、思考移民与全球化、被问"为什么帮远处不帮身边"的时候。',
        'tenets': ['国界不构成道德界线', '以人类为单位反思对同胞的特殊义务', '通过全球正义、人权与国际制度落实'],
        'strengths': ['为援助远方、反对排外提供依据', '理论弹性大，不等于要世界政府'],
        'limits': ['容易忽视身边的具体责任', '难以落地，谁来做、按什么规则做'],
        'figures': ['「都是人」', '「不分国家」', '「远方的命也是命」'],
        'coords': PHILO_COORDS['cosmopolitanism'],
    },
    {
        'id': 'rationalism', 'name': '理性主义', 'nameEn': 'Rationalism',
        'oneLine': '有些事，想明白就行，不用试。',
        'definition': '认为理性可以独立于经验获得知识：数学的必然、逻辑的关系、某些价值判断，不需要靠一次次实验来确认。经验只是触发器，不是来源。',
        'when': '做纯推理、写代码、或者在争论"这用试吗"的时候。',
        'tenets': ['存在不依赖经验的知识', '直觉与演绎能通达必然真理', '理性在可靠性上高于感觉'],
        'strengths': ['能解释数学与逻辑为什么必然', '推理链条长，不容易被个案带偏'],
        'limits': ['说不清"直觉"到底是什么，凭什么可信', '容易过度自信，忽略现实反例'],
        'figures': ['「推一下就知道了」', '「逻辑上不成立」', '「这不用试」'],
        'coords': PHILO_COORDS['rationalism'],
    },
    {
        'id': 'empiricism', 'name': '经验主义', 'nameEn': 'Empiricism',
        'oneLine': '没见过的，先别下结论。',
        'definition': '认为一切知识来自经验，理性单独不产生关于世界的新知识。逻辑和数学只管形式对不对，不管世界是什么样。',
        'when': '看数据、做实验、被要求"拿证据"的时候。',
        'tenets': ['经验是知识与概念的唯一来源', '逻辑只处理观念之间的关系', '没有天生的观念，都是一点点攒的'],
        'strengths': ['不容易被空话和大词骗', '尊重证据，可被反驳'],
        'limits': ['解释不了"必然"从哪来', '「没见过」不等于「不存在」'],
        'figures': ['「有证据吗」', '「先看数据」', '「样本多大」'],
        'coords': PHILO_COORDS['empiricism'],
    },
    {
        'id': 'utilitarianism', 'name': '功利主义', 'nameEn': 'Utilitarianism',
        'oneLine': '看结果，哪个让更多人好就选哪个。',
        'definition': '行为的对错只看后果，正当的行为是让所有相关者的总福利最大。动机好不好、承诺守没守，只有影响到结果时才重要。',
        'when': '做资源分配、算性价比、决定先帮谁的时候。',
        'tenets': ['后果决定对错', '每个人的利益同等计算', '追求总量最大，而不是让最多人满意'],
        'strengths': ['标准明确，能比较、能算', '可操作，不用纠结动机纯不纯'],
        'limits': ['可能为了多数牺牲少数', '要求太高，人算不过来，也做不到'],
        'figures': ['「算总账」', '「哪个收益大」', '「少数服从多数」'],
        'coords': PHILO_COORDS['utilitarianism'],
    },
]

data = json.load(open(PATH, encoding='utf-8'))
by_id = {i['id']: i for i in data['isms']}

for ism in data['isms']:
    if ism['id'] in PHILO_IDS:
        ism['mode'] = 'philosophy'
        ism['coordsLife'] = ism['coords']
        ism['coords'] = dict(zip(PHILO_AXES, PHILO_COORDS[ism['id']]))
    else:
        ism['mode'] = 'life'

for item in NEW_PHILO:
    if item['id'] in by_id:
        continue
    data['isms'].append({
        'id': item['id'], 'name': item['name'], 'nameEn': item['nameEn'],
        'oneLine': item['oneLine'], 'definition': item['definition'], 'when': item['when'],
        'tenets': item['tenets'], 'strengths': item['strengths'], 'limits': item['limits'],
        'figures': item['figures'], 'mode': 'philosophy',
        'coords': dict(zip(PHILO_AXES, item['coords'])),
        'axes': {'x': item['coords'][0], 'y': item['coords'][1], 'z': item['coords'][2]},
        'axesConfidence': 'editorial', 'sources': []
    })

data['meta']['version'] = '2.0-dual'
data['meta']['modes'] = {
    'life': {
        'name': '生活模式',
        'count': sum(1 for i in data['isms'] if i['mode'] == 'life'),
        'axes': [
            {'key': 'mood', 'neg': '消极', 'pos': '积极'},
            {'key': 'effort', 'neg': '放松', 'pos': '用力'},
            {'key': 'focus', 'neg': '向内', 'pos': '向外'},
            {'key': 'reality', 'neg': '现实', 'pos': '玄学'},
            {'key': 'social', 'neg': '独处', 'pos': '群居'},
            {'key': 'money', 'neg': '省', 'pos': '花'},
            {'key': 'horizon', 'neg': '当下', 'pos': '长期'},
            {'key': 'stance', 'neg': '顺从', 'pos': '反抗'},
        ],
    },
    'philosophy': {
        'name': '哲学模式',
        'count': sum(1 for i in data['isms'] if i['mode'] == 'philosophy'),
        'axes': [
            {'key': 'situation', 'neg': '消极', 'pos': '积极'},
            {'key': 'theory', 'neg': '思辨', 'pos': '实用'},
            {'key': 'locus', 'neg': '集体', 'pos': '个体'},
            {'key': 'source', 'neg': '体验', 'pos': '理性'},
            {'key': 'stance', 'neg': '顺从', 'pos': '反抗'},
            {'key': 'plurality', 'neg': '一元', 'pos': '多元'},
            {'key': 'dimension', 'neg': '世俗', 'pos': '超越'},
            {'key': 'aim', 'neg': '描述', 'pos': '规范'},
        ],
    },
}

json.dump(data, open(PATH, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
life = sum(1 for i in data['isms'] if i['mode'] == 'life')
philo = sum(1 for i in data['isms'] if i['mode'] == 'philosophy')
print('life:', life, '| philosophy:', philo, '| total:', len(data['isms']))
