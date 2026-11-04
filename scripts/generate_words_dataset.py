import json, os, re

OUT_DIR = "src/data/words"
os.makedirs(OUT_DIR, exist_ok=True)

def parse_existing(fn, cat_name):
    if not os.path.exists(fn):
        return []
    with open(fn, 'r', encoding='utf-8') as f:
        content = f.read()
    pattern = r'\{\s*id:\s*(\d+),\s*category:\s*[\'\"](\w+)[\'\"],\s*wordBn:\s*[\'\"]([^\'\"]+)[\'\"],\s*wordEn:\s*[\'\"]([^\'\"]+)[\'\"],\s*hintBn:\s*[\'\"]([^\'\"]+)[\'\"],\s*hintEn:\s*[\'\"]([^\'\"]+)[\'\"]'
    matches = re.findall(pattern, content)
    out = []
    for m in matches:
        out.append({
            "id": int(m[0]),
            "category": cat_name,
            "wordBn": m[2],
            "wordEn": m[3],
            "hintBn": m[4],
            "hintEn": m[5],
            "shortHintBn": m[4][:30],
            "shortHintEn": m[5][:30]
        })
    return out

# Load existing
existing_food = parse_existing("src/data/wordsFood.ts", "food")
existing_people = parse_existing("src/data/wordsPeople.ts", "people")
existing_animal = parse_existing("src/data/wordsAnimal.ts", "animal")
existing_object = parse_existing("src/data/wordsObject.ts", "object")

print(f"Loaded: food {len(existing_food)}, people {len(existing_people)}, animal {len(existing_animal)}, object {len(existing_object)}")
