import json, os, re

OUT_DIR = "src/data/words"
os.makedirs(OUT_DIR, exist_ok=True)

# Parse existing files
def parse_ts_file(filepath):
    if not os.path.exists(filepath):
        return []
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    pattern = r'\{\s*id:\s*(\d+),\s*category:\s*[\'\"](\w+)[\'\"],\s*wordBn:\s*[\'\"]([^\'\"]+)[\'\"],\s*wordEn:\s*[\'\"]([^\'\"]+)[\'\"],\s*hintBn:\s*[\'\"]([^\'\"]+)[\'\"],\s*hintEn:\s*[\'\"]([^\'\"]+)[\'\"]'
    matches = re.findall(pattern, content)
    items = []
    for m in matches:
        items.append({
            "id": int(m[0]),
            "category": m[1],
            "wordBn": m[2],
            "wordEn": m[3],
            "hintBn": m[4],
            "hintEn": m[5],
            "shortHintBn": m[4][:25],
            "shortHintEn": m[5][:25]
        })
    return items

existing_food = parse_ts_file("src/data/wordsFood.ts")
existing_people = parse_ts_file("src/data/wordsPeople.ts")
existing_animal = parse_ts_file("src/data/wordsAnimal.ts")
existing_object = parse_ts_file("src/data/wordsObject.ts")

print(f"Loaded existing: food={len(existing_food)}, people={len(existing_people)}, animal={len(existing_animal)}, object={len(existing_object)}")
