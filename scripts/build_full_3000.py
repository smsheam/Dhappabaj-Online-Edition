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
            "shortHintBn": m[4][:25],
            "shortHintEn": m[5][:25]
        })
    return out

# Categories to write
# 1. school_life (150)
# 2. sports (150)
# 3. lifestyle (150)
# 4. historical_places (150)
# 5. bd_tourist (150)
# 6. food (120 existing + 30 new = 150)
# 7. people (120 existing + 30 new = 150)
# 8. animal (120 existing + 30 new = 150)
# 9. object (120 existing + 30 new = 150)
# 10. tech (150)
# 11. movies (150)
# 12. geography (150)
# 13. professions (150)
# 14. nature (150)
# 15. transport (150)
# 16. festivals (150)
# 17. everyday_activities (150)
# 18. science (150)
# 19. clothing (150)
# 20. landmarks (150)

print("Setup ready.")
