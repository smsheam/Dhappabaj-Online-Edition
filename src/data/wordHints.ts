import { WordItem } from '../types/game';

export interface WordHintAssociation {
  bn: string;
  en: string;
}

/**
 * HARDER Cryptic Clues (1-3 Words Maximum):
 * Subtler associations designed so the imposter gets general context
 * without being handed the answer directly.
 */
export const WORD_HINTS_BY_ID: Record<number, WordHintAssociation> = {
  "101": {
    "bn": "উৎসবের দাওয়াত",
    "en": "Festive banquet"
  },
  "102": {
    "bn": "টক স্বাদের গোল",
    "en": "Crispy tangy"
  },
  "103": {
    "bn": "সুগন্ধি পোলাও",
    "en": "Aromatic coastal rice"
  },
  "104": {
    "bn": "গাঁজানো দুগ্ধজাত",
    "en": "Fermented clay dairy"
  },
  "105": {
    "bn": "ঐতিহ্যবাহী পরত",
    "en": "Crispy heritage layer"
  },
  "106": {
    "bn": "রসালো গোল",
    "en": "Spongy syrup"
  },
  "107": {
    "bn": "ওভেনের ক্রাস্ট",
    "en": "Baked Italian crust"
  },
  "108": {
    "bn": "ফাস্টফুড বান",
    "en": "Stuffed bun fastfood"
  },
  "109": {
    "bn": "ঝাঁঝালো নাশতা",
    "en": "Pungent street mix"
  },
  "110": {
    "bn": "ধীরেসুস্থে সেদ্ধ",
    "en": "Slow cooked stew"
  },
  "111": {
    "bn": "ভাজা ত্রিকোণ",
    "en": "Fried savory pastry"
  },
  "112": {
    "bn": "তেঁতুলের পদখাবার",
    "en": "Tamarind tossed snack"
  },
  "113": {
    "bn": "সাদা পোলাও মাংস",
    "en": "Feast poultry rice"
  },
  "114": {
    "bn": "কড়া কষানো মশলা",
    "en": "Dark dry roast"
  },
  "115": {
    "bn": "ঝাল মিষ্টি ঘোল",
    "en": "Spiced mint dairy"
  },
  "116": {
    "bn": "মিষ্টি",
    "en": "sweet"
  },
  "117": {
    "bn": "ঐতিহ্যবাহী ক্ষীরসা",
    "en": "Dry coated sweet"
  },
  "118": {
    "bn": "বৃষ্টির দিনে",
    "en": "Rainy days"
  },
  "119": {
    "bn": "সরিষার চাল মাংস",
    "en": "Pungent spiced rice"
  },
  "120": {
    "bn": "পাতলা খাস্তা নাশতা",
    "en": "Flaky crisp envelope"
  },
  "121": {
    "bn": "নববর্ষের সকাল",
    "en": "New year morning"
  },
  "122": {
    "bn": "সকালের ফোলা ময়দা",
    "en": "Puffed morning fry"
  },
  "123": {
    "bn": "কুয়াশার ভোর",
    "en": "Foggy winter morning"
  },
  "124": {
    "bn": "পাতলা রোল পিঠা",
    "en": "Rolled crepe dessert"
  },
  "125": {
    "bn": "ভাপের পিঠা",
    "en": "Steamed winter cake"
  },
  "126": {
    "bn": "ভিনেগার দেওয়া চাল",
    "en": "Japanese roll"
  },
  "127": {
    "bn": "সিদ্ধ সেমোলিনা",
    "en": "Boiled wheat sauce"
  },
  "128": {
    "bn": "পার্বত্য মোড়ক",
    "en": "Himalayan steam pouch"
  },
  "129": {
    "bn": "মচমচে কোটিং",
    "en": "Crispy batter fry"
  },
  "130": {
    "bn": "হিমশীতল ডেজার্ট",
    "en": "Frozen sweet scoop"
  },
  "131": {
    "bn": "কোকো শুঁটি",
    "en": "Processed cocoa bar"
  },
  "132": {
    "bn": "গরম লিকার পেয়ালা",
    "en": "Brewed leaf cup"
  },
  "133": {
    "bn": "প্রকৃতির অমল পানি",
    "en": "Natural palm water"
  },
  "134": {
    "bn": "কাসুন্দির টক",
    "en": "Mustard tossed sour"
  },
  "135": {
    "bn": "রোদের বয়াম",
    "en": "Cured spiced jar"
  },
  "136": {
    "bn": "সাইট্রাস ঠান্ডা",
    "en": "Citrus summer chill"
  },
  "137": {
    "bn": "গাঢ় লালচে বল",
    "en": "Cardamom fried ball"
  },
  "138": {
    "bn": "উৎসবের গোল দানা",
    "en": "Festive yellow pearls"
  },
  "139": {
    "bn": "প্যাঁচানো খাস্তা",
    "en": "Crisp spiral batter"
  },
  "140": {
    "bn": "ঘিয়ের ডেজার্ট",
    "en": "Dense clarified dessert"
  },
  "141": {
    "bn": "লম্বা কাটা আলু",
    "en": "Golden fried batons"
  },
  "142": {
    "bn": "ভুট্টার রুটি ভাঁজ",
    "en": "Folded corn tortilla"
  },
  "143": {
    "bn": "গ্লেজড রিং",
    "en": "Glazed dough ring"
  },
  "144": {
    "bn": "ঘূর্ণি রোস্ট মোড়ক",
    "en": "Spit sliced wrap"
  },
  "145": {
    "bn": "কয়লার আঁচে পোড়া",
    "en": "Charred skewers"
  },
  "146": {
    "bn": "তন্দুরের লালচে",
    "en": "Earthen roasted poultry"
  },
  "147": {
    "bn": "ফোলা ফাঁপা রুটি",
    "en": "Leavened clay bread"
  },
  "148": {
    "bn": "ভাঁজ করা খাস্তা",
    "en": "Folded egg parcel"
  },
  "149": {
    "bn": "ডালভরা তেলে ভাজা",
    "en": "Lentil stuffed fry"
  },
  "150": {
    "bn": "তাওয়ায় সেঁকা পুর",
    "en": "Griddle stuffed bread"
  },
  "151": {
    "bn": "বেসনের পাতলা ফালি",
    "en": "Battered purple slice"
  },
  "152": {
    "bn": "ডাল ও কুচানো",
    "en": "Lentil crisp fritters"
  },
  "153": {
    "bn": "বেসনে ডোবানো গোল",
    "en": "Fried evening patty"
  },
  "154": {
    "bn": "দুপুরের তরকারি",
    "en": "River staple curry"
  },
  "155": {
    "bn": "নারকেলের ক্ষীরসা গ্রেভি",
    "en": "Coconut creamy stew"
  },
  "156": {
    "bn": "তীব্র ঝাঁঝাঁলো ভর্তা",
    "en": "Intense cured relish"
  },
  "157": {
    "bn": "পোড়া স্মোকি ভর্তা",
    "en": "Smoky roasted pulp"
  },
  "158": {
    "bn": "বাঙালির ঘরোয়া আরাম",
    "en": "Daily comfort mash"
  },
  "159": {
    "bn": "বড় মাথার পদ",
    "en": "Fin head curry"
  },
  "160": {
    "bn": "কোড়ানো গোল মিষ্টি",
    "en": "Shredded festive balls"
  },
  "161": {
    "bn": "ফুটিয়ে ঘন ক্ষীর",
    "en": "Simmered dairy rice"
  },
  "162": {
    "bn": "ভোজের পরবর্তী চিবুক",
    "en": "After feast chew"
  },
  "163": {
    "bn": "স্তরযুক্ত ঠান্ডা ডেজার্ট",
    "en": "Multi layered chill"
  },
  "164": {
    "bn": "ফেঁটানো টক মিষ্টি",
    "en": "Churned frothy yogurt"
  },
  "165": {
    "bn": "ক্যাফিনের বরফ পানীয়",
    "en": "Blended caffeine chill"
  },
  "166": {
    "bn": "ভেষজ পাতা ফুটানো",
    "en": "Unoxidized leaf infusion"
  },
  "167": {
    "bn": "গরম পুষ্টিকর ব্রোথ",
    "en": "Warm simmered bowl"
  },
  "168": {
    "bn": "লম্বা বানের মিট",
    "en": "Cased meat bun"
  },
  "169": {
    "bn": "প্রধান দানাদার খাদ্য",
    "en": "Daily staple boiled"
  },
  "170": {
    "bn": "হলুদ পাতলা ঝোল",
    "en": "Garlic infused soup"
  },
  "171": {
    "bn": "বহুপদী নিরামিষ",
    "en": "Temple slow medley"
  },
  "172": {
    "bn": "মৌসুমি কপির পদ",
    "en": "Seasonal winter florets"
  },
  "173": {
    "bn": "তীব্র ঝাঁঝাঁলো বীজ",
    "en": "Pungent golden seed"
  },
  "174": {
    "bn": "দইয়ের টপিংসহ খোল",
    "en": "Chilled yogurt shells"
  },
  "175": {
    "bn": "ক্রিমি চিজ স্লাইস",
    "en": "Dense cream dessert"
  },
  "176": {
    "bn": "গাঢ় চকোলেট স্কয়ার",
    "en": "Dense fudgy cocoa"
  },
  "177": {
    "bn": "খাঁজকাটা ছাঁচ কেক",
    "en": "Grid batter syrup"
  },
  "178": {
    "bn": "তাওয়ায় উল্টানো নরম",
    "en": "Fluffy griddle disk"
  },
  "179": {
    "bn": "মাখনের বাঁকানো পেস্ট্রি",
    "en": "Flaky buttery crescent"
  },
  "180": {
    "bn": "টমেটোর মাখন গ্রেভি",
    "en": "Velvety orange gravy"
  },
  "181": {
    "bn": "সবুজ পাতার পনির",
    "en": "Green leaf curd"
  },
  "182": {
    "bn": "কড়া সেদ্ধ ছোলা",
    "en": "Dark spiced legumes"
  },
  "183": {
    "bn": "হলুদ স্পঞ্জের ভাপ",
    "en": "Fermented yellow sponge"
  },
  "184": {
    "bn": "চালের পাতলা রোল",
    "en": "Fermented crisp batter"
  },
  "185": {
    "bn": "সাদা নরম ভাপ",
    "en": "Fluffy steamed round"
  },
  "186": {
    "bn": "ডালের মুচমুচে রিং",
    "en": "Crisp donut savory"
  },
  "187": {
    "bn": "ফুটে ওঠা দানা",
    "en": "Heat puffed kernels"
  },
  "188": {
    "bn": "পাতলা কুড়মুড়ে স্লাইস",
    "en": "Foil packed crunch"
  },
  "189": {
    "bn": "পনিরে ডোবানো ত্রিকোণ",
    "en": "Dipped corn crisps"
  },
  "190": {
    "bn": "কাটা ফলের মিশ্রণ",
    "en": "Mixed garden bowl"
  },
  "191": {
    "bn": "পূর্বদেশীয় ব্রোথ নুডুলস",
    "en": "East Asian broth"
  },
  "192": {
    "bn": "কড়াইয়ে নাড়া নুডুলস",
    "en": "Wok tossed ribbons"
  },
  "193": {
    "bn": "ভাজা সিলিন্ডার রোল",
    "en": "Crispy savory scroll"
  },
  "194": {
    "bn": "বাদামের সাদা গ্রেভি",
    "en": "Aromatic white gravy"
  },
  "195": {
    "bn": "রাতভর ফোটানো ঝোল",
    "en": "Overnight bone broth"
  },
  "196": {
    "bn": "বাটা কিমার বল",
    "en": "Spiced minced balls"
  },
  "197": {
    "bn": "তেলে ফোটা কুসুম",
    "en": "Caramelized boiled yolk"
  },
  "198": {
    "bn": "দ্বিমুখী স্বাদের মাছ",
    "en": "Dual taste river"
  },
  "199": {
    "bn": "কড়াইয়ে নাড়া খোসা",
    "en": "Shelled quick fry"
  },
  "200": {
    "bn": "রসুন ফোড়ন শাক",
    "en": "Wilted garlic greens"
  },
  "201": {
    "bn": "স্বাধীনতা ও নেতৃত্ব",
    "en": "Historic statesman"
  },
  "202": {
    "bn": "বিদ্রোহ ও কবিতা",
    "en": "Fiery literary rebel"
  },
  "203": {
    "bn": "বিশ্বসাহিত্যের নোবেল",
    "en": "Universal literary master"
  },
  "204": {
    "bn": "জনপ্রিয় কথাসাহিত্যিক",
    "en": "Iconic modern author"
  },
  "205": {
    "bn": "গ্রামীণ ব্যাংকিং শান্তিতে",
    "en": "Microcredit peace"
  },
  "206": {
    "bn": "মাঠের নির্ভীক অধিনায়ক",
    "en": "Courageous cricket skipper"
  },
  "207": {
    "bn": "শীর্ষস্থানীয় অলরাউন্ডার",
    "en": "Premier all-rounder"
  },
  "208": {
    "bn": "ফুটবলের জাদুকর",
    "en": "Argentine football icon"
  },
  "209": {
    "bn": "পর্তুগিজ ফুটবলার",
    "en": "Iberian athletic forward"
  },
  "210": {
    "bn": "সিলিকন ভ্যালি উদ্ভাবক",
    "en": "Silicon Valley visionary"
  },
  "211": {
    "bn": "পদার্থের স্থান-কাল",
    "en": "Theoretical spacetime genius"
  },
  "212": {
    "bn": "রকেট ও পরমাণু",
    "en": "Aerospace scientist leader"
  },
  "213": {
    "bn": "কালো রেখার তুলি",
    "en": "Charcoal famine canvas"
  },
  "214": {
    "bn": "নারী মুক্তির কলম",
    "en": "Pioneering woman activist"
  },
  "215": {
    "bn": "মরমী দর্শন সাধক",
    "en": "Spiritual mystic singer"
  },
  "216": {
    "bn": "তরঙ্গ ও উদ্ভিদ",
    "en": "Radio wave polymath"
  },
  "217": {
    "bn": "নারী জাগরণের দিশারী",
    "en": "Pioneer female educator"
  },
  "218": {
    "bn": "রেনেসাঁ নাট্যকার",
    "en": "Elizabethan playwright"
  },
  "219": {
    "bn": "গতি ও মহাকর্ষ",
    "en": "Classical motion laws"
  },
  "220": {
    "bn": "কারাগার ও সমঝোতা",
    "en": "Anti-apartheid statesman"
  },
  "221": {
    "bn": "অহিংস অনশন নেতা",
    "en": "Civil disobedience leader"
  },
  "222": {
    "bn": "দুস্থদের নীল পাড়",
    "en": "Slum caregiver saint"
  },
  "223": {
    "bn": "মেক্সিকোর ড্রিবলিং বিতর্ক",
    "en": "Iconic Argentine number 10"
  },
  "224": {
    "bn": "ব্রাজিলের ফুটবল সম্রাট",
    "en": "Brazilian football legend"
  },
  "225": {
    "bn": "অপারেটিং সিস্টেম নির্মাতা",
    "en": "Software foundation mogul"
  },
  "226": {
    "bn": "মহাকাশ পরিবহন উদ্যোক্তা",
    "en": "Space commercial pioneer"
  },
  "227": {
    "bn": "ডিজিটাল সামাজিক যোগাযোগ",
    "en": "Social network architect"
  },
  "228": {
    "bn": "দ্বৈত নোবেল গবেষক",
    "en": "Pioneering radiation lab"
  },
  "229": {
    "bn": "মহাবিশ্ব ও ব্ল্যাকহোল",
    "en": "Cosmology wheelchair theorist"
  },
  "230": {
    "bn": "পপ সঙ্গীত মঞ্চ",
    "en": "Glove pop performer"
  },
  "231": {
    "bn": "বাংলা রোমান্টিক সিনেমা",
    "en": "Golden romantic lead"
  },
  "232": {
    "bn": "ঢালিউডের রাজা",
    "en": "Pioneer silver screen"
  },
  "233": {
    "bn": "তরুণদের ফ্যাশন আইকন",
    "en": "Tragic 90s screen idol"
  },
  "234": {
    "bn": "সমসাময়িক শীর্ষ তারকা",
    "en": "Current screen superstar"
  },
  "235": {
    "bn": "বাংলা হার্ড রক",
    "en": "Gravelly rock guru"
  },
  "236": {
    "bn": "তালের গিটার সুরকার",
    "en": "Electric fretboard master"
  },
  "237": {
    "bn": "উপমহাদেশীয় সুরসম্রাজ্ঞী",
    "en": "Legendary versatile melody"
  },
  "238": {
    "bn": "কালজয়ী দেশাত্মবোধক কণ্ঠ",
    "en": "National anthem voice"
  },
  "239": {
    "bn": "খেলাধুলার কণ্ঠস্বর",
    "en": "Matchday commentary voice"
  },
  "240": {
    "bn": "মারকুটে বাঁহাতি উদ্বোধনী",
    "en": "Aggressive opening bat"
  },
  "241": {
    "bn": "উইকেটের বিশ্বস্ত প্রহরী",
    "en": "Resilient wicket keeper"
  },
  "242": {
    "bn": "গতি পরিবর্তনের বোলার",
    "en": "Deceptive seam cutters"
  },
  "243": {
    "bn": "চাপের মুখে ফিনিশার",
    "en": "Calm lower-order savior"
  },
  "244": {
    "bn": "ট্র্যাক অ্যান্ড ফিল্ড",
    "en": "Sprint world record"
  },
  "245": {
    "bn": "সাঁতারের পদক রেকর্ড",
    "en": "Freestyle pool titan"
  },
  "246": {
    "bn": "কোর্টে মসৃণ ব্যাকহ্যান্ড",
    "en": "Grass court champion"
  },
  "247": {
    "bn": "পাওয়ার টেনিস কোর্ট",
    "en": "Grand Slam powerhouse"
  },
  "248": {
    "bn": "রিংয়ের ভারী মুষ্টি",
    "en": "Heavyweight ring artist"
  },
  "249": {
    "bn": "নির্বাক যুগের ছড়ি",
    "en": "Silent comedy tramp"
  },
  "250": {
    "bn": "ইতালির রেনেসাঁ বহুবিদ্যা",
    "en": "Florentine polymath canvas"
  },
  "251": {
    "bn": "ঘূর্ণায়মান হলুদ তুলি",
    "en": "Post-impressionist swirling oil"
  },
  "252": {
    "bn": "জ্যামিতিক রূপান্তর ছবি",
    "en": "Geometric canvas pioneer"
  },
  "253": {
    "bn": "গম্ভীর কণ্ঠের শাহেনশাহ",
    "en": "Baritone Bollywood giant"
  },
  "254": {
    "bn": "রোমান্টিক হিন্দি নায়ক",
    "en": "Bollywood romance monarch"
  },
  "255": {
    "bn": "নিখুঁত বাছাই অভিনেতা",
    "en": "Methodical cinema transformer"
  },
  "256": {
    "bn": "বাস্তববাদী ভারতীয় সিনেমা",
    "en": "Auteur film laureate"
  },
  "257": {
    "bn": "দেশভাগের ট্র্যাজেডি চলচ্চিত্র",
    "en": "Partition trauma auteur"
  },
  "258": {
    "bn": "কারবালার উপাখ্যান লেখক",
    "en": "Historical tragedy writer"
  },
  "259": {
    "bn": "সামাজিক আবেগ কথাসাহিত্য",
    "en": "Sensory fiction novelist"
  },
  "260": {
    "bn": "প্রারম্ভিক বাংলা গদ্যসম্রাট",
    "en": "Early nationalist prose"
  },
  "261": {
    "bn": "ছন্দভাঙা ধ্রুপদী কাব্যাংশ",
    "en": "Subversive epic verses"
  },
  "262": {
    "bn": "নিভৃত ধূসর বাংলার",
    "en": "Solitary pastoral verses"
  },
  "263": {
    "bn": "পল্লী গাঁওয়ের আখ্যান",
    "en": "Rural folklore ballads"
  },
  "264": {
    "bn": "শহুরে মিছিলের কবি",
    "en": "Urban barricade poet"
  },
  "265": {
    "bn": "খোলা মাঠের কবিতা",
    "en": "Bohemian people poet"
  },
  "266": {
    "bn": "হাস্যরসাত্মক ভ্রমণকাহিনি",
    "en": "Polyglot witty rambler"
  },
  "267": {
    "bn": "কিশোর বৈজ্ঞানিক কল্পকাহিনী",
    "en": "Youth scientific tales"
  },
  "268": {
    "bn": "মঞ্চনাটক ও বহুবিদ্যা",
    "en": "Multi-genre dramatist"
  },
  "269": {
    "bn": "উপমহাদেশীয় সংসদ নেতা",
    "en": "Constitutional parliamentarian"
  },
  "270": {
    "bn": "কৃষক জনতার সমাবেশ",
    "en": "Grassroots agrarian tribune"
  },
  "271": {
    "bn": "যুদ্ধকালীন সচিবালয় সংগঠক",
    "en": "Exile wartime architect"
  },
  "272": {
    "bn": "আকাশের ককপিট প্রতিরোধ",
    "en": "Aviation cockpit martyr"
  },
  "273": {
    "bn": "সীমান্ত বাঙ্কারের আত্মদান",
    "en": "Forward trench casualty"
  },
  "274": {
    "bn": "সঙ্গীদের পশ্চাদপসরণ ঢাল",
    "en": "Covering defense stand"
  },
  "275": {
    "bn": "প্রামাণ্য ইতিহাস নির্মাতা",
    "en": "Folk celluloid chronicler"
  },
  "276": {
    "bn": "গণহত্যা প্রামাণ্যচিত্র নিখোঁজ",
    "en": "Disappeared celluloid lens"
  },
  "277": {
    "bn": "ঔপনিবেশিক বিরোধী কৃষক",
    "en": "Agrarian resistance leader"
  },
  "278": {
    "bn": "বিপ্লবী গুপ্ত শিক্ষক",
    "en": "Underground armory planner"
  },
  "279": {
    "bn": "ইউরোপীয় নিষিদ্ধ আস্তানা",
    "en": "Anti-colonial female pioneer"
  },
  "280": {
    "bn": "সশস্ত্র প্রতিরোধ বাহিনী",
    "en": "Militant freedom vanguard"
  },
  "281": {
    "bn": "অল্পবয়সী প্রতিবাদী কবিতা",
    "en": "Adolescent hunger verses"
  },
  "282": {
    "bn": "সংসদীয় প্রবীণ অভিভাবক",
    "en": "Veteran wetland statesman"
  },
  "283": {
    "bn": "জাতীয় সেতু প্রকৌশলী",
    "en": "Monumental structural consultant"
  },
  "284": {
    "bn": "বিশ্বমানের উন্নয়ন সংস্থা",
    "en": "Social enterprise architect"
  },
  "285": {
    "bn": "টেলিভিশন ব্যঙ্গ উপস্থাপক",
    "en": "Broadcast satire producer"
  },
  "286": {
    "bn": "ঐতিহাসিক শোকগাথা রচয়িতা",
    "en": "Memorial anthem writer"
  },
  "287": {
    "bn": "শহীদ সুরকার হারমোনিয়াম",
    "en": "Martyred orchestral mind"
  },
  "288": {
    "bn": "বাণিজ্যিক অ্যাকশন ডিরেক্টর",
    "en": "Action choreography pioneer"
  },
  "289": {
    "bn": "সিনেমার প্রধান বিরোধী",
    "en": "Archetypal movie antagonist"
  },
  "290": {
    "bn": "বহুরূপী চরিত্রাভিনেতা",
    "en": "Transformational character actor"
  },
  "291": {
    "bn": "বাস্তবধর্মী কমেডি অভিনেতা",
    "en": "Nuanced comedy performer"
  },
  "292": {
    "bn": "সাইকোলজিক্যাল ড্রামা চরিত্র",
    "en": "Intense thriller protagonist"
  },
  "293": {
    "bn": "পারিবারিক টেলিভিশন নাটক",
    "en": "Contemporary drama lead"
  },
  "294": {
    "bn": "পারিবারিক সিনেমার আইকন",
    "en": "Golden cinematic matriarch"
  },
  "295": {
    "bn": "আন্তর্জাতিক চলচ্চিত্র অভিনেত্রী",
    "en": "Cannes screened talent"
  },
  "296": {
    "bn": "ক্লাসিক রূপালী পর্দা",
    "en": "Nostalgic cinema face"
  },
  "297": {
    "bn": "বাঁহাতি রিভার্স পেসার",
    "en": "Reverse swing legend"
  },
  "298": {
    "bn": "বিশ্বের সর্বাধিক আন্তর্জাতিক",
    "en": "Record international runs"
  },
  "299": {
    "bn": "ক্রিকেটার",
    "en": "cricketer"
  },
  "300": {
    "bn": "আইসিসি শিরোপাজয়ী উইকেটরক্ষক",
    "en": "Tactical trophy captain"
  },
  "301": {
    "bn": "স্পর্শকাতর ডিজিটাল হ্যান্ডহেল্ড",
    "en": "Handheld touchscreen portal"
  },
  "302": {
    "bn": "পরিবহন",
    "en": "transport"
  },
  "303": {
    "bn": "নলজাতীয় কোমরের কাপড়",
    "en": "Tubular casual wrap"
  },
  "304": {
    "bn": "কাঁচের চিমনি বাতি",
    "en": "Vented fuel lantern"
  },
  "305": {
    "bn": "বৃষ্টি",
    "en": "rain"
  },
  "306": {
    "bn": "বুনন পাতার বাতাস",
    "en": "Plaited manual cooler"
  },
  "307": {
    "bn": "গ্যাজেট",
    "en": "gadget"
  },
  "308": {
    "bn": "দৃষ্টির কাঁচ ফ্রেম",
    "en": "Optic corrective frames"
  },
  "309": {
    "bn": "কবজির সেকেন্ড কাঁটা",
    "en": "Dial strapped gear"
  },
  "310": {
    "bn": "কালির নিব শ্যাফট",
    "en": "Ink feed cartridge"
  },
  "311": {
    "bn": "আলোক সংবেদনশীল সেন্সর",
    "en": "Shutter optical sensor"
  },
  "312": {
    "bn": "দুই চাকার থ্রটল",
    "en": "Dual wheeled throttle"
  },
  "313": {
    "bn": "যাত্রার টিকিট পাস",
    "en": "Boarding carriage slip"
  },
  "314": {
    "bn": "বাষ্প নির্গমনের নল",
    "en": "Spouted boiling vessel"
  },
  "315": {
    "bn": "গোলকাকার ক্রীড়া চামড়া",
    "en": "Inflated stitched sphere"
  },
  "316": {
    "bn": "কাঠের চ্যাপ্টা স্ট্রাইকার",
    "en": "Pressed willow blade"
  },
  "317": {
    "bn": "ঘরের সম্প্রচার পর্দা",
    "en": "Living room monitor"
  },
  "318": {
    "bn": "চাকাবিশিষ্ট বহন বাক্স",
    "en": "Rolling apparel carrier"
  },
  "319": {
    "bn": "শ্রবণ ইন্দ্রিয়ের অ্যাকোস্টিক",
    "en": "Binaural dynamic drivers"
  },
  "320": {
    "bn": "নাগরিক অভিবাসন পুস্তিকা",
    "en": "Consular transit booklet"
  },
  "321": {
    "bn": "জলরাশির সংযোগ মেগা",
    "en": "Spanned pylon superstructure"
  },
  "322": {
    "bn": "জ্বালানিচালিত সবুজ খাঁচা",
    "en": "Compressed gas trike"
  },
  "323": {
    "bn": "জোড়া ধারালো পিভট",
    "en": "Opposing lever blades"
  },
  "324": {
    "bn": "বস্ত্র মেরামতের আঁশ",
    "en": "Eyed steel thread"
  },
  "325": {
    "bn": "কাঠের হাল ভাসমান",
    "en": "Hollow wooden hull"
  },
  "326": {
    "bn": "ধাতব টিউম্বলার পিন",
    "en": "Notched tumbler shackle"
  },
  "327": {
    "bn": "পোর্টেবল ফোকাস আলো",
    "en": "Reflector bulb cylinder"
  },
  "328": {
    "bn": "শারীরিক ক্যালিব্রেশন পারদ",
    "en": "Thermal sensor tube"
  },
  "329": {
    "bn": "অভ্যন্তরীণ শব্দ নালী",
    "en": "Acoustic chest piece"
  },
  "330": {
    "bn": "রৌপ্য প্রলেপ কাচ",
    "en": "Specular reflective surface"
  },
  "331": {
    "bn": "দাঁতওয়ালা সাজসজ্জা প্লেট",
    "en": "Toothed grooming strip"
  },
  "332": {
    "bn": "ঘর্ষণমূলক স্বাস্থ্যকর শলাকা",
    "en": "Bristle scrub wand"
  },
  "333": {
    "bn": "জলধারণ পাত্রজোড়া",
    "en": "Sanitary reservoir basin"
  },
  "334": {
    "bn": "ক্ষারীয় ফেনা কেক",
    "en": "Saponified lipid block"
  },
  "335": {
    "bn": "শোষণকারী সুতি বয়ন",
    "en": "Absorbent checked fabric"
  },
  "336": {
    "bn": "ঘুমানোর নরম প্যাড",
    "en": "Cushioned cranial rest"
  },
  "337": {
    "bn": "সূক্ষ্ম জালের পর্দা",
    "en": "Porous nocturnal canopy"
  },
  "338": {
    "bn": "তাপ ধরে রাখা আস্তরণ",
    "en": "Insulating textile layer"
  },
  "339": {
    "bn": "শয্যার সমতল বস্ত্র",
    "en": "Mattress drape cotton"
  },
  "340": {
    "bn": "ভারী খোপের আসবাব",
    "en": "Upright panel closet"
  },
  "341": {
    "bn": "হিমশীতল খাদ্য সংরক্ষণাগার",
    "en": "Compressor thermal insulator"
  },
  "342": {
    "bn": "উচ্চ কম্পাঙ্ক উত্তাপক",
    "en": "Radiation reheating chamber"
  },
  "343": {
    "bn": "ঘূর্ণনশীল ধারালো পেস্ট",
    "en": "High RPM motor"
  },
  "344": {
    "bn": "থার্মোস্ট্যাট সেদ্ধ হাঁড়ি",
    "en": "Automated steam chamber"
  },
  "345": {
    "bn": "বাষ্পচাপ রিলিজ ভালভ",
    "en": "Hermetic steam regulator"
  },
  "346": {
    "bn": "আগুনের ধাতব গভীরতা",
    "en": "Concave heat vessel"
  },
  "347": {
    "bn": "স্থির পায়ের ব্লেড",
    "en": "Stationary bench blade"
  },
  "348": {
    "bn": "ঘর্ষণের সমতল শিলা",
    "en": "Granite friction tools"
  },
  "349": {
    "bn": "শলার মেঝের ঝাঁড়ু",
    "en": "Bundled fiber sweeper"
  },
  "350": {
    "bn": "বর্জ্য নিষ্কাশন খাপ",
    "en": "Waste containment drum"
  },
  "351": {
    "bn": "কালপঞ্জি ব্যক্তিগত পাতা",
    "en": "Dated blank chronicle"
  },
  "352": {
    "bn": "কাগজ বাঁধাই ক্লিপ",
    "en": "Crimping wire applicator"
  },
  "353": {
    "bn": "গাণিতিক লজিক সার্কিট",
    "en": "Arithmetic digital matrix"
  },
  "354": {
    "bn": "ইলেকট্রনিক ডিভাইস",
    "en": "Electronic device"
  },
  "355": {
    "bn": "বায়ু নিয়ন্ত্রণকারী কনডেনসার",
    "en": "Refrigerant split exchanger"
  },
  "356": {
    "bn": "পোর্টেবল লিথিয়াম কোষ",
    "en": "Rechargeable reserve cells"
  },
  "357": {
    "bn": "বেতার তরঙ্গ গেটওয়ে",
    "en": "Broadband spectrum transceiver"
  },
  "358": {
    "bn": "ফ্রেটবোর্ড অনুরণন খোলস",
    "en": "Resonant soundbox frets"
  },
  "359": {
    "bn": "রিড সমন্বিত চাবি",
    "en": "Pumped brass reeds"
  },
  "360": {
    "bn": "আঙ্গুলের তাল ঝিল্লি",
    "en": "Tuned skin drums"
  },
  "361": {
    "bn": "একক তারের লাউ",
    "en": "Resonating gourd monochord"
  },
  "362": {
    "bn": "বায়ুপ্রবাহ সুরনল",
    "en": "Wind acoustic chamber"
  },
  "363": {
    "bn": "কৌশলী ছকের চাল",
    "en": "Checkered strategy field"
  },
  "364": {
    "bn": "মসৃণ পাউডার স্ট্রাইক",
    "en": "Pocketed carrom boundary"
  },
  "365": {
    "bn": "বিন্দুময় সম্ভাব্যতা ঘনক",
    "en": "Pipped probability cube"
  },
  "366": {
    "bn": "বায়ুমণ্ডলে সুতার নিয়ন্ত্রণ",
    "en": "Aerodynamic spar bridling"
  },
  "367": {
    "bn": "গোলাকার শক্ত কাঁচ",
    "en": "Spherical vitreous tokens"
  },
  "368": {
    "bn": "সঞ্চয়ের ছিদ্রযুক্ত পাত্র",
    "en": "Sealed deposit hollow"
  },
  "369": {
    "bn": "রিমোট চালিত ঘূর্ণিপাখা",
    "en": "Multirotor aerial platform"
  },
  "370": {
    "bn": "শারীরবৃত্তীয় সংকেত রিস্টব্যান্ড",
    "en": "Wearable biometric sensor"
  },
  "371": {
    "bn": "ইথানল ডিসইনফেক্টেন্ট জেল",
    "en": "Volatile microbial rinse"
  },
  "372": {
    "bn": "শ্বাসনালী ফিল্ট্রেশন প্যাড",
    "en": "Elastic looped respirator"
  },
  "373": {
    "bn": "শিরোস্ত্রাণ প্রতিরোধী শেল",
    "en": "Impact absorbing shell"
  },
  "374": {
    "bn": "ধাতব চাবির গুচ্ছ",
    "en": "Key grouping fixture"
  },
  "375": {
    "bn": "মুদ্রা ভাঁজ খাপ",
    "en": "Compartmentalized note case"
  },
  "376": {
    "bn": "ইলেক্ট্রনিক লেনদেন চিপ",
    "en": "Magnetic chip card"
  },
  "377": {
    "bn": "পোলারাইজড ইউভি শেড",
    "en": "Tinted solar filter"
  },
  "378": {
    "bn": "ছায়া প্রদানকারী ক্রাউন",
    "en": "Brimmed headgear crown"
  },
  "379": {
    "bn": "জলরোধী সিন্থেটিক কোট",
    "en": "Impermeable stitched outer"
  },
  "380": {
    "bn": "রাবার সোলের পাদুকা",
    "en": "Treaded athletic sole"
  },
  "381": {
    "bn": "খোলামেলা চটি স্ট্র্যাপ",
    "en": "Open toe thong"
  },
  "382": {
    "bn": "গোড়ালির তুলার মোড়ক",
    "en": "Elasticated ankle sheath"
  },
  "383": {
    "bn": "কোমরবন্ধ বাকল বেল্ট",
    "en": "Tension buckled strap"
  },
  "384": {
    "bn": "গলবন্ধ ঝুলন্ত রেশম",
    "en": "Formal draped knot"
  },
  "385": {
    "bn": "সেলাইবিহীন দীর্ঘ বস্ত্র",
    "en": "Unstitched graceful drape"
  },
  "386": {
    "bn": "মসজিদ",
    "en": "masjid"
  },
  "387": {
    "bn": "দ্বিস্তর ভ্যাকুয়াম ফ্লাস্ক",
    "en": "Double walled thermos"
  },
  "388": {
    "bn": "পানযোগ্য তরল আধার",
    "en": "Capped hydration flask"
  },
  "389": {
    "bn": "কৌটার স্তরবিন্যাস",
    "en": "Interlocking meal tiers"
  },
  "390": {
    "bn": "স্বচ্ছ সিলিন্ডার পাত্র",
    "en": "Vitreous liquid cylinder"
  },
  "391": {
    "bn": "গ্লেজড ভোজ থালা",
    "en": "Glazed dining dish"
  },
  "392": {
    "bn": "খাদ্য সংগ্রহের চামচ",
    "en": "Concave pronged cutlery"
  },
  "393": {
    "bn": "ধারালো স্টিলের ফলক",
    "en": "Beveled utility edge"
  },
  "394": {
    "bn": "ঘর্ষণ প্রজ্বলন কাঠি",
    "en": "Phosphorus coated splinter"
  },
  "395": {
    "bn": "গলনশীল মোমের সলতে",
    "en": "Combustible tallow wick"
  },
  "396": {
    "bn": "ধূপের ধোঁয়া সুবাস",
    "en": "Smoldering aromatic resin"
  },
  "397": {
    "bn": "জানালা আবৃত পর্দা",
    "en": "Suspended fenestration drop"
  },
  "398": {
    "bn": "বহিরাগত সংকেত সুইফ্ট",
    "en": "Entry announcement chime"
  },
  "399": {
    "bn": "প্রবেশপথের পরিষ্কারক ম্যাট",
    "en": "Textured threshold fiber"
  },
  "400": {
    "bn": "ফুল ডাল রাখার পাত্র",
    "en": "Botanical display stem"
  },
  "401": {
    "bn": "দেয়ালের পর্যায়ক্রমিক ডায়াল",
    "en": "Wall pendulum escapement"
  },
  "402": {
    "bn": "তারিখের পাতলা বাঁধাই",
    "en": "Gregorian solar grid"
  },
  "403": {
    "bn": "চক মোছার বোর্ড",
    "en": "Classroom felt surface"
  },
  "404": {
    "bn": "কাউন্টারের ধাতব গম্বুজ",
    "en": "Tinkling counter chime"
  },
  "405": {
    "bn": "ভাগ্য যাচাই কুপন",
    "en": "Random chance ticket"
  },
  "406": {
    "bn": "দূরবীক্ষণ প্রিজম যুগল",
    "en": "Prismatic stereo optic"
  },
  "407": {
    "bn": "অণুবীক্ষণ ফোকাসিং নল",
    "en": "Specimen magnifying stage"
  },
  "408": {
    "bn": "জ্যোতির্বৈজ্ঞানিক দর্পণ লেন্স",
    "en": "Deep sky collector"
  },
  "409": {
    "bn": "ধ্বনি সম্প্রসারক চোঙ",
    "en": "Acoustic megaphone horn"
  },
  "410": {
    "bn": "বেতার কম্পাঙ্ক স্পিকার",
    "en": "Bluetooth acoustic woofer"
  },
  "411": {
    "bn": "প্লাগযোগ্য ফ্ল্যাশ ড্রাইভ",
    "en": "Solid state thumb"
  },
  "412": {
    "bn": "পেরিফেরাল কার্সর ইনপুট",
    "en": "Optical desktop pointer"
  },
  "413": {
    "bn": "কীবোর্ড বোতাম প্যানেল",
    "en": "Mechanical matrix switch"
  },
  "414": {
    "bn": "কালি ছিটানোর হার্ডকপি",
    "en": "Toner deposit engine"
  },
  "415": {
    "bn": "কাঁচের প্রতিফলন স্ক্যান",
    "en": "Photodiode line sensor"
  },
  "416": {
    "bn": "উজ্জ্বল আলোর অভিক্ষেপ",
    "en": "Luminous focal projector"
  },
  "417": {
    "bn": "কার্ড খোলার কাউন্টার",
    "en": "Encrypted cash dispenser"
  },
  "418": {
    "bn": "তিন রঙের সংকেত বাতি",
    "en": "Tri-state roadway beacon"
  },
  "419": {
    "bn": "চাপযুক্ত রাসায়নিক ক্যানিস্টার",
    "en": "Pressurized gas retardant"
  },
  "420": {
    "bn": "জরুরি ড্রেসিং কিট",
    "en": "Sterile emergency kit"
  },
  "501": {
    "bn": "ভয়ঙ্কর",
    "en": "fierce"
  },
  "502": {
    "bn": "সুরের শিস পাখি",
    "en": "Melodic whistler avian"
  },
  "503": {
    "bn": "রূপালী চকচকে মাছ",
    "en": "Silvery salt migrant"
  },
  "504": {
    "bn": "বিশাল শুঁড় স্তন্যপায়ী",
    "en": "Massive trunked mammal"
  },
  "505": {
    "bn": "বনের কেশর শিকারি",
    "en": "Savanna pride monarch"
  },
  "506": {
    "bn": "ধূর্ত নিশাচর শ্বাপদ",
    "en": "Cunning bush canid"
  },
  "507": {
    "bn": "দ্রুত চপল হরিণ",
    "en": "Spotted graceful browser"
  },
  "508": {
    "bn": "পানিতে থাকে",
    "en": "live in water"
  },
  "509": {
    "bn": "নদীর শান্ত স্তন্যপায়ী",
    "en": "Riverine blowhole mammal"
  },
  "510": {
    "bn": "ডুব দিয়ে মাছশিকারি",
    "en": "Underwater diving wings"
  },
  "511": {
    "bn": "রঙিন পেখমের শোভা",
    "en": "Eye-crested fanning plumage"
  },
  "512": {
    "bn": "শাখামৃগের চঞ্চল হাত",
    "en": "Arboreal primate climber"
  },
  "513": {
    "bn": "পশ্চাৎপদের উল্লম্ফন প্রাণী",
    "en": "Bipedal pouch hopper"
  },
  "514": {
    "bn": "মরুভূমির চর্বি কুঁজ",
    "en": "Fat-storing desert nomad"
  },
  "515": {
    "bn": "বরফের সাঁতারু পাখি",
    "en": "Sub-zero tuxedo diver"
  },
  "516": {
    "bn": "খুরযুক্ত দ্রুত বাহন",
    "en": "Equine galloper steed"
  },
  "517": {
    "bn": "দ্রুততম শিকারি চিতা",
    "en": "High acceleration feline"
  },
  "518": {
    "bn": "নাকের কেরাটিন বর্ম",
    "en": "Armored keratin browser"
  },
  "519": {
    "bn": "গাছের বাদাম সংগ্রাহক",
    "en": "Bushy tail hoarder"
  },
  "520": {
    "bn": "পরভৃত্যের মিষ্টি শিস",
    "en": "Brood parasite songbird"
  },
  "521": {
    "bn": "কালো বুদ্ধিমত্তার পাখি",
    "en": "Urban opportunistic corvid"
  },
  "522": {
    "bn": "শব্দ অনুকরণকারী সবুজ",
    "en": "Hooked bill mimic"
  },
  "523": {
    "bn": "বাগপটু কালো গায়ক",
    "en": "Yellow wattled mimic"
  },
  "524": {
    "bn": "ঘরোয়া খড়কুটো পাখি",
    "en": "Domestic crevice passerine"
  },
  "525": {
    "bn": "যুগল চিহ্নের পাখি",
    "en": "Subcontinental folk omen"
  },
  "526": {
    "bn": "আকাশের তীক্ষ্ণ দৃষ্টি",
    "en": "High thermals raptor"
  },
  "527": {
    "bn": "বায়ুমণ্ডলে ছোঁ মারা",
    "en": "Forked tail soarer"
  },
  "528": {
    "bn": "প্রকৃতির অবশিষ্টাংশ ভোজী",
    "en": "Scavenging thermal glider"
  },
  "529": {
    "bn": "অন্ধকারের গোল চোখ",
    "en": "Nocturnal silent flyer"
  },
  "530": {
    "bn": "পুকুরের লিপ্তপদী পাখি",
    "en": "Web footed swimmer"
  },
  "531": {
    "bn": "ভোরের ঝুঁটিধারী গৃহপালিত",
    "en": "Dawn crowing crest"
  },
  "532": {
    "bn": "শান্তির চিঠির পাখি",
    "en": "Homing message flier"
  },
  "533": {
    "bn": "পাতা সেলাই কারিগর",
    "en": "Leaf stitching passerine"
  },
  "534": {
    "bn": "ঝুলন্ত খড়ের স্থপতি",
    "en": "Intricate weaver avian"
  },
  "535": {
    "bn": "ঝুঁটি লালচে সুর",
    "en": "Crested garden warbler"
  },
  "536": {
    "bn": "পানিতে ছোঁ মারা",
    "en": "Dagger billed diver"
  },
  "537": {
    "bn": "এক পায়ে ধ্যানমগ্ন",
    "en": "Stationary water wader"
  },
  "538": {
    "bn": "উড্ডয়নহীন দ্রুততম পাখি",
    "en": "Heavyweight desert runner"
  },
  "539": {
    "bn": "লবণাক্ত হ্রদের গোলাপি",
    "en": "Filter feeding wading"
  },
  "540": {
    "bn": "শিরস্ত্রাণ চঞ্চুর বনচর",
    "en": "Casque horned forager"
  },
  "541": {
    "bn": "মহাসাগরের বৃহত্তম স্তন্যপায়ী",
    "en": "Colossal baleen mammal"
  },
  "542": {
    "bn": "ত্রিকোণ পাখনার শিকারি",
    "en": "Cartilaginous apex prowler"
  },
  "543": {
    "bn": "বহু হস্ত ও কালি",
    "en": "Cephalopod ink diver"
  },
  "544": {
    "bn": "অস্থিহীন বিষাক্ত ছাতা",
    "en": "Pulsing cnidarian bell"
  },
  "545": {
    "bn": "শক্ত খোলসে সাঁতার",
    "en": "Pelagic flippered shell"
  },
  "546": {
    "bn": "বালির দুই দাঁড়া",
    "en": "Decapod coastal pincer"
  },
  "547": {
    "bn": "সমুদ্রের পাঁচ বাহু",
    "en": "Radial tube crawler"
  },
  "548": {
    "bn": "পুরুষের ডিম বহন",
    "en": "Brood pouch marine"
  },
  "549": {
    "bn": "নিরীহ দানব মাছ",
    "en": "Gentle spotted feeder"
  },
  "550": {
    "bn": "আঁশের বল প্রাণী",
    "en": "Keratin scale roller"
  },
  "551": {
    "bn": "জলের স্থূলকায় তৃণভোজী",
    "en": "Semi-aquatic heavyweight tusks"
  },
  "552": {
    "bn": "দীর্ঘ গ্রীবার তৃণভোজী",
    "en": "Canopy browsing mammal"
  },
  "553": {
    "bn": "কালো-সাদা ডোরা প্রাণী",
    "en": "Monochrome herd equid"
  },
  "554": {
    "bn": "গভীর বনের বনমানুষ",
    "en": "Silverback dominant ape"
  },
  "555": {
    "bn": "সরঞ্জাম ব্যবহারকারী বনমানুষ",
    "en": "Tool crafting primate"
  },
  "556": {
    "bn": "বাঁশঝাড়ের শান্ত ভালুক",
    "en": "Bamboo foraging bear"
  },
  "557": {
    "bn": "উত্তর বরফের শিকারি",
    "en": "Arctic marine carnivore"
  },
  "558": {
    "bn": "বুকে বাঁকানো দাগ",
    "en": "Crescent patched forager"
  },
  "559": {
    "bn": "গাছে ঘুমন্ত নিরীহ",
    "en": "Arboreal gum dweller"
  },
  "560": {
    "bn": "ডালে ঝুলন্ত মন্থর",
    "en": "Algae coated hanger"
  },
  "561": {
    "bn": "পূর্ণিমায় সমস্বরে ডাক",
    "en": "Pack hunting tundra"
  },
  "562": {
    "bn": "হাসির শিকারি",
    "en": "Savanna scavenger"
  },
  "563": {
    "bn": "বিষাক্ত দংশন প্রতিরোধক",
    "en": "Venom resistant hunter"
  },
  "564": {
    "bn": "উত্থিত ফণার সর্পরাজ",
    "en": "Hooded ophiophagous serpent"
  },
  "565": {
    "bn": "ধানের লুকানো বিষধর",
    "en": "Camouflaged heavy viper"
  },
  "566": {
    "bn": "দম আটকানো পেঁচক",
    "en": "Massive constricting serpent"
  },
  "567": {
    "bn": "ফণার চক্ষু নকশা",
    "en": "Ocular marked hood"
  },
  "568": {
    "bn": "ছদ্মবেশের বর্ণবিকার সরীসৃপ",
    "en": "Chromatophore lizard"
  },
  "569": {
    "bn": "দেয়ালের আঠালো পদচিহ্ন",
    "en": "Vertical suction climber"
  },
  "570": {
    "bn": "জলাধারের বৃহৎ সরীসৃপ",
    "en": "Fork tongued monitor"
  },
  "571": {
    "bn": "স্যাঁতসেঁতে স্থলজ উভচর",
    "en": "Rough skinned bugger"
  },
  "572": {
    "bn": "বর্ষার গভীর কণ্ঠ",
    "en": "Monsoon aquatic croaker"
  },
  "573": {
    "bn": "গন্ধযুক্ত রাতের স্তন্যপায়ী",
    "en": "Pointed musk forager"
  },
  "574": {
    "bn": "গর্তের ধারালো দাঁত",
    "en": "Incisor chewing burrower"
  },
  "575": {
    "bn": "লম্বা কানের ক্ষিপ্র",
    "en": "Burrowing long ears"
  },
  "576": {
    "bn": "আত্মরক্ষার কাঁটা বর্ম",
    "en": "Quill armed rodent"
  },
  "577": {
    "bn": "জলজ চঞ্চল শিকারি",
    "en": "Sleek swimming carnivore"
  },
  "578": {
    "bn": "প্রতিধ্বনি শব্দে ওড়া",
    "en": "Echolocating winged flyer"
  },
  "579": {
    "bn": "ষড়ভুজ মোমের উপনিবেশ",
    "en": "Wax comb architect"
  },
  "580": {
    "bn": "উড়তে পারে",
    "en": "can fly"
  },
  "581": {
    "bn": "সবুজ ঘাসের লাফ",
    "en": "Saltatorial meadow nymph"
  },
  "582": {
    "bn": "জৈব রাসায়নিক আলো",
    "en": "Bioluminescent night beetle"
  },
  "583": {
    "bn": "আট পায়ের রেশমজাল",
    "en": "Orb weaver arachnid"
  },
  "584": {
    "bn": "অন্ধকার সহ্যকারী কীট",
    "en": "Night foraging survivor"
  },
  "585": {
    "bn": "রক্তবাহী ক্ষুদ্র শোষক",
    "en": "Vector biting pest"
  },
  "586": {
    "bn": "বহুচোখের উড়ন্ত পোকা",
    "en": "Compound eye scavenger"
  },
  "587": {
    "bn": "ইউসোশাল কলোনি সারিবদ্ধ",
    "en": "Pheromone trail forager"
  },
  "588": {
    "bn": "কাঠ বিনাশকারী পতঙ্গ",
    "en": "Cellulose tunneling colony"
  },
  "589": {
    "bn": "বহুপদী কুণ্ডলী পোকা",
    "en": "Spiral curling detritivore"
  },
  "590": {
    "bn": "বাঁকা হুলের দংশন",
    "en": "Curved caudal stinger"
  },
  "591": {
    "bn": "কাঁচের ছোট সৌন্দর্য",
    "en": "Vibrant nano tank"
  },
  "592": {
    "bn": "বায়ু গ্রহণকারী গোঁফাল",
    "en": "Accessory breathing catfish"
  },
  "593": {
    "bn": "পার্শ্বীয় কাঁটার মাছ",
    "en": "Pectoral venomous spine"
  },
  "594": {
    "bn": "আঁশবিহীন নদীর তৈলাক্ত",
    "en": "Scaleless river swimmer"
  },
  "595": {
    "bn": "নদীগর্ভের সর্বগ্রাসী মাছ",
    "en": "Wide gape benthic"
  },
  "596": {
    "bn": "পুকুর তলের বৃহদাকার",
    "en": "Heavy scaled surface"
  },
  "597": {
    "bn": "বাংলা জলাধারের প্রধান",
    "en": "River carp icon"
  },
  "598": {
    "bn": "কাদার ডোবার শিকারি",
    "en": "Mud burrowing predator"
  },
  "599": {
    "bn": "ডোরাকাটা জলাশয় শিকারি",
    "en": "Banded inland predator"
  },
  "600": {
    "bn": "বাঁকা খোলসের ক্রাস্টাসিয়ান",
    "en": "Decapod benthic meat"
  },
  "601": {
    "bn": "সুদূর সামুদ্রিক ওড়া",
    "en": "Pelagic oceanic wings"
  },
  "602": {
    "bn": "স্থির শূন্যে ওড়া",
    "en": "Rapid hovering nectar"
  },
  "603": {
    "bn": "মরু বালুর ছদ্মবেশী",
    "en": "Sidewinding horned sand"
  },
  "604": {
    "bn": "মেলানিস্টিক রাতের শিকারি",
    "en": "Melanistic shadow stalker"
  },
  "605": {
    "bn": "রিংযুক্ত হিমালয়ী লোম",
    "en": "Arboreal mountain mammal"
  },
  "606": {
    "bn": "শান্ত স্বভাবের উভচরজাতীয়",
    "en": "Docile giant rodent"
  },
  "607": {
    "bn": "উঁচু পর্বতের পশমী",
    "en": "Highland camelid fleece"
  },
  "608": {
    "bn": "বর্মাবৃত গোল বল",
    "en": "Osteoderm shielded sphere"
  },
  "609": {
    "bn": "মেরু বরফের দন্তকায়",
    "en": "Sub-polar ivory tusked"
  },
  "610": {
    "bn": "বরফজলের মসৃণ স্তন্যপায়ী",
    "en": "Pinniped coastal diver"
  },
  "611": {
    "bn": "মনোট্রিম অদ্ভুত ডিম্বজ",
    "en": "Duck billed monotreme"
  },
  "612": {
    "bn": "অস্ট্রেলীয় ডিম্বজ কাঁটা",
    "en": "Spiny oviparous anteater"
  },
  "613": {
    "bn": "পুনরুৎপাদনশীল মেক্সিকান জলজ",
    "en": "Neotenic aquatic regenerator"
  },
  "614": {
    "bn": "বিশাল গোলাকার দৃষ্টি",
    "en": "Nocturnal twig clinging"
  },
  "615": {
    "bn": "পর্দায় ভর করে",
    "en": "Patagium gliding rodent"
  },
  "616": {
    "bn": "বৃষ্টিবনের রঙিন ঠোঁট",
    "en": "Canopy oversized bill"
  },
  "617": {
    "bn": "বৃষ্টিবনের বিপজ্জনক পদ",
    "en": "Southern rainforest giant"
  },
  "618": {
    "bn": "দ্বীপাঞ্চলের দানব সরীসৃপ",
    "en": "Apex venomous monitor"
  },
  "619": {
    "bn": "বাঁকা পিঠের মিষ্টিমাছ",
    "en": "Humpbacked river predator"
  },
  "620": {
    "bn": "চেরা লেজের দুঃসাহসী",
    "en": "Aggressive fork passerine"
  }
};

export const WORD_HINTS_BY_NAME: Record<string, WordHintAssociation> = {
  "কাচ্চি বিরিয়ানি": {
    "bn": "উৎসবের দাওয়াত",
    "en": "Festive banquet"
  },
  "ফুচকা": {
    "bn": "টক স্বাদের গোল",
    "en": "Crispy tangy"
  },
  "ইলিশ পোলাও": {
    "bn": "সুগন্ধি পোলাও",
    "en": "Aromatic coastal rice"
  },
  "মিষ্টি দই": {
    "bn": "গাঁজানো দুগ্ধজাত",
    "en": "Fermented clay dairy"
  },
  "বাকরখানি": {
    "bn": "ঐতিহ্যবাহী পরত",
    "en": "Crispy heritage layer"
  },
  "রসগোল্লা": {
    "bn": "রসালো গোল",
    "en": "Spongy syrup"
  },
  "পিৎজা": {
    "bn": "ওভেনের ক্রাস্ট",
    "en": "Baked Italian crust"
  },
  "বার্গার": {
    "bn": "ফাস্টফুড বান",
    "en": "Stuffed bun fastfood"
  },
  "ঝালমুড়ি": {
    "bn": "ঝাঁঝালো নাশতা",
    "en": "Pungent street mix"
  },
  "হালিম": {
    "bn": "ধীরেসুস্থে সেদ্ধ",
    "en": "Slow cooked stew"
  },
  "সিঙাড়া": {
    "bn": "ভাজা ত্রিকোণ",
    "en": "Fried savory pastry"
  },
  "চটপটি": {
    "bn": "তেঁতুলের পদখাবার",
    "en": "Tamarind tossed snack"
  },
  "মোরগ পোলাও": {
    "bn": "সাদা পোলাও মাংস",
    "en": "Feast poultry rice"
  },
  "কালা ভুনা": {
    "bn": "কড়া কষানো মশলা",
    "en": "Dark dry roast"
  },
  "বোরহানি": {
    "bn": "ঝাল মিষ্টি ঘোল",
    "en": "Spiced mint dairy"
  },
  "রসমালাই": {
    "bn": "মিষ্টি",
    "en": "sweet"
  },
  "চমচম": {
    "bn": "ঐতিহ্যবাহী ক্ষীরসা",
    "en": "Dry coated sweet"
  },
  "ভুনা খিচুড়ি": {
    "bn": "বৃষ্টির দিনে",
    "en": "Rainy days"
  },
  "তেহারি": {
    "bn": "সরিষার চাল মাংস",
    "en": "Pungent spiced rice"
  },
  "সমুচা": {
    "bn": "পাতলা খাস্তা নাশতা",
    "en": "Flaky crisp envelope"
  },
  "পান্তা ভাত ও ইলিশ": {
    "bn": "নববর্ষের সকাল",
    "en": "New year morning"
  },
  "লুচি ও আলুর দম": {
    "bn": "সকালের ফোলা ময়দা",
    "en": "Puffed morning fry"
  },
  "হাঁসের মাংস ও চিতই পিঠা": {
    "bn": "কুয়াশার ভোর",
    "en": "Foggy winter morning"
  },
  "পাটিসাপটা পিঠা": {
    "bn": "পাতলা রোল পিঠা",
    "en": "Rolled crepe dessert"
  },
  "ভাপা পিঠা": {
    "bn": "ভাপের পিঠা",
    "en": "Steamed winter cake"
  },
  "সুশি": {
    "bn": "ভিনেগার দেওয়া চাল",
    "en": "Japanese roll"
  },
  "পাস্তা": {
    "bn": "সিদ্ধ সেমোলিনা",
    "en": "Boiled wheat sauce"
  },
  "মোমো": {
    "bn": "পার্বত্য মোড়ক",
    "en": "Himalayan steam pouch"
  },
  "ফ্রাই চিকেন": {
    "bn": "মচমচে কোটিং",
    "en": "Crispy batter fry"
  },
  "আইসক্রিম": {
    "bn": "হিমশীতল ডেজার্ট",
    "en": "Frozen sweet scoop"
  },
  "চকলেট": {
    "bn": "কোকো শুঁটি",
    "en": "Processed cocoa bar"
  },
  "চায়ের কাপ / লাল চা": {
    "bn": "গরম লিকার পেয়ালা",
    "en": "Brewed leaf cup"
  },
  "ডাবের পানি": {
    "bn": "প্রকৃতির অমল পানি",
    "en": "Natural palm water"
  },
  "আমড়া মাখা": {
    "bn": "কাসুন্দির টক",
    "en": "Mustard tossed sour"
  },
  "আমের আচার": {
    "bn": "রোদের বয়াম",
    "en": "Cured spiced jar"
  },
  "লেবুর শরবত": {
    "bn": "সাইট্রাস ঠান্ডা",
    "en": "Citrus summer chill"
  },
  "গোলাপ জাম": {
    "bn": "গাঢ় লালচে বল",
    "en": "Cardamom fried ball"
  },
  "লাড্ডু": {
    "bn": "উৎসবের গোল দানা",
    "en": "Festive yellow pearls"
  },
  "জিলাপি": {
    "bn": "প্যাঁচানো খাস্তা",
    "en": "Crisp spiral batter"
  },
  "হালুয়া": {
    "bn": "ঘিয়ের ডেজার্ট",
    "en": "Dense clarified dessert"
  },
  "ফ্রেঞ্চ ফ্রাই": {
    "bn": "লম্বা কাটা আলু",
    "en": "Golden fried batons"
  },
  "টাকো": {
    "bn": "ভুট্টার রুটি ভাঁজ",
    "en": "Folded corn tortilla"
  },
  "ডোনাট": {
    "bn": "গ্লেজড রিং",
    "en": "Glazed dough ring"
  },
  "চিকেন শাওয়ার্মা": {
    "bn": "ঘূর্ণি রোস্ট মোড়ক",
    "en": "Spit sliced wrap"
  },
  "কাবাব (শিক কাবাব)": {
    "bn": "কয়লার আঁচে পোড়া",
    "en": "Charred skewers"
  },
  "তন্দুরি চিকেন": {
    "bn": "তন্দুরের লালচে",
    "en": "Earthen roasted poultry"
  },
  "নান রুটি": {
    "bn": "ফোলা ফাঁপা রুটি",
    "en": "Leavened clay bread"
  },
  "মুগলাই পরোটা": {
    "bn": "ভাঁজ করা খাস্তা",
    "en": "Folded egg parcel"
  },
  "ডাল পুরী": {
    "bn": "ডালভরা তেলে ভাজা",
    "en": "Lentil stuffed fry"
  },
  "আলু পরোটা": {
    "bn": "তাওয়ায় সেঁকা পুর",
    "en": "Griddle stuffed bread"
  },
  "বেগুনী": {
    "bn": "বেসনের পাতলা ফালি",
    "en": "Battered purple slice"
  },
  "পিয়াজু": {
    "bn": "ডাল ও কুচানো",
    "en": "Lentil crisp fritters"
  },
  "আলুর চপ": {
    "bn": "বেসনে ডোবানো গোল",
    "en": "Fried evening patty"
  },
  "রুই মাছের ঝোল": {
    "bn": "দুপুরের তরকারি",
    "en": "River staple curry"
  },
  "চিংড়ি মালাইকারি": {
    "bn": "নারকেলের ক্ষীরসা গ্রেভি",
    "en": "Coconut creamy stew"
  },
  "শুটকি ভর্তা": {
    "bn": "তীব্র ঝাঁঝাঁলো ভর্তা",
    "en": "Intense cured relish"
  },
  "বেগুন ভর্তা": {
    "bn": "পোড়া স্মোকি ভর্তা",
    "en": "Smoky roasted pulp"
  },
  "আলু ভর্তা": {
    "bn": "বাঙালির ঘরোয়া আরাম",
    "en": "Daily comfort mash"
  },
  "মুড়িঘন্ট": {
    "bn": "বড় মাথার পদ",
    "en": "Fin head curry"
  },
  "নারকেল নাড়ু": {
    "bn": "কোড়ানো গোল মিষ্টি",
    "en": "Shredded festive balls"
  },
  "ক্ষীরসা / পায়েস": {
    "bn": "ফুটিয়ে ঘন ক্ষীর",
    "en": "Simmered dairy rice"
  },
  "পান সুপারি": {
    "bn": "ভোজের পরবর্তী চিবুক",
    "en": "After feast chew"
  },
  "ফালুদা": {
    "bn": "স্তরযুক্ত ঠান্ডা ডেজার্ট",
    "en": "Multi layered chill"
  },
  "লাচ্ছি": {
    "bn": "ফেঁটানো টক মিষ্টি",
    "en": "Churned frothy yogurt"
  },
  "কোল্ড কফি": {
    "bn": "ক্যাফিনের বরফ পানীয়",
    "en": "Blended caffeine chill"
  },
  "গ্রিন টি": {
    "bn": "ভেষজ পাতা ফুটানো",
    "en": "Unoxidized leaf infusion"
  },
  "চিকেন স্যুপ": {
    "bn": "গরম পুষ্টিকর ব্রোথ",
    "en": "Warm simmered bowl"
  },
  "হট ডগ": {
    "bn": "লম্বা বানের মিট",
    "en": "Cased meat bun"
  },
  "স্টিমড রাইস (সাদা ভাত)": {
    "bn": "প্রধান দানাদার খাদ্য",
    "en": "Daily staple boiled"
  },
  "মসুর ডাল": {
    "bn": "হলুদ পাতলা ঝোল",
    "en": "Garlic infused soup"
  },
  "লাবড়া / নিরামিষ": {
    "bn": "বহুপদী নিরামিষ",
    "en": "Temple slow medley"
  },
  "ডালনা (ফুলকপি আলুর)": {
    "bn": "মৌসুমি কপির পদ",
    "en": "Seasonal winter florets"
  },
  "সরিষা ইলিশ": {
    "bn": "তীব্র ঝাঁঝাঁলো বীজ",
    "en": "Pungent golden seed"
  },
  "দই ফুচকা": {
    "bn": "দইয়ের টপিংসহ খোল",
    "en": "Chilled yogurt shells"
  },
  "চিজ কেক": {
    "bn": "ক্রিমি চিজ স্লাইস",
    "en": "Dense cream dessert"
  },
  "ব্রাউনি": {
    "bn": "গাঢ় চকোলেট স্কয়ার",
    "en": "Dense fudgy cocoa"
  },
  "ক্রিস্পি ওয়াফেল": {
    "bn": "খাঁজকাটা ছাঁচ কেক",
    "en": "Grid batter syrup"
  },
  "প্যানকেক": {
    "bn": "তাওয়ায় উল্টানো নরম",
    "en": "Fluffy griddle disk"
  },
  "ক্রোয়াসান্ট": {
    "bn": "মাখনের বাঁকানো পেস্ট্রি",
    "en": "Flaky buttery crescent"
  },
  "বাটার চিকেন": {
    "bn": "টমেটোর মাখন গ্রেভি",
    "en": "Velvety orange gravy"
  },
  "পালক পনির": {
    "bn": "সবুজ পাতার পনির",
    "en": "Green leaf curd"
  },
  "ছোলে ভাটুরে": {
    "bn": "কড়া সেদ্ধ ছোলা",
    "en": "Dark spiced legumes"
  },
  "ঢোকলা": {
    "bn": "হলুদ স্পঞ্জের ভাপ",
    "en": "Fermented yellow sponge"
  },
  "দোসা ও সাম্বার": {
    "bn": "চালের পাতলা রোল",
    "en": "Fermented crisp batter"
  },
  "ইডলি": {
    "bn": "সাদা নরম ভাপ",
    "en": "Fluffy steamed round"
  },
  "মেদু বড়া": {
    "bn": "ডালের মুচমুচে রিং",
    "en": "Crisp donut savory"
  },
  "পপকর্ন": {
    "bn": "ফুটে ওঠা দানা",
    "en": "Heat puffed kernels"
  },
  "চিপস (আলুর চিপস)": {
    "bn": "পাতলা কুড়মুড়ে স্লাইস",
    "en": "Foil packed crunch"
  },
  "নাচো ও চিজ সস": {
    "bn": "পনিরে ডোবানো ত্রিকোণ",
    "en": "Dipped corn crisps"
  },
  "ফ্রুট সালাদ": {
    "bn": "কাটা ফলের মিশ্রণ",
    "en": "Mixed garden bowl"
  },
  "রামেন নুডুলস": {
    "bn": "পূর্বদেশীয় ব্রোথ নুডুলস",
    "en": "East Asian broth"
  },
  "চাউমিন": {
    "bn": "কড়াইয়ে নাড়া নুডুলস",
    "en": "Wok tossed ribbons"
  },
  "স্প্রিং রোল": {
    "bn": "ভাজা সিলিন্ডার রোল",
    "en": "Crispy savory scroll"
  },
  "মাটন রেজালা": {
    "bn": "বাদামের সাদা গ্রেভি",
    "en": "Aromatic white gravy"
  },
  "গরুর পায়া / নেহারি": {
    "bn": "রাতভর ফোটানো ঝোল",
    "en": "Overnight bone broth"
  },
  "মাছের কোপ্তা": {
    "bn": "বাটা কিমার বল",
    "en": "Spiced minced balls"
  },
  "ডিম ভুনা": {
    "bn": "তেলে ফোটা কুসুম",
    "en": "Caramelized boiled yolk"
  },
  "কই মাছের হরগৌরী": {
    "bn": "দ্বিমুখী স্বাদের মাছ",
    "en": "Dual taste river"
  },
  "চিংড়ি ভাজি": {
    "bn": "কড়াইয়ে নাড়া খোসা",
    "en": "Shelled quick fry"
  },
  "পালংশাক ভাজি": {
    "bn": "রসুন ফোড়ন শাক",
    "en": "Wilted garlic greens"
  },
  "লাল শাক": {
    "bn": "স্বাধীনতা ও নেতৃত্ব",
    "en": "Historic statesman"
  },
  "কলমি শাক": {
    "bn": "বিদ্রোহ ও কবিতা",
    "en": "Fiery literary rebel"
  },
  "কচু শাক ও ইলিশ মাথা": {
    "bn": "বিশ্বসাহিত্যের নোবেল",
    "en": "Universal literary master"
  },
  "টমেটো চাটনি": {
    "bn": "জনপ্রিয় কথাসাহিত্যিক",
    "en": "Iconic modern author"
  },
  "জলপাইয়ের আচার": {
    "bn": "গ্রামীণ ব্যাংকিং শান্তিতে",
    "en": "Microcredit peace"
  },
  "তেঁতুলের চাটনি": {
    "bn": "মাঠের নির্ভীক অধিনায়ক",
    "en": "Courageous cricket skipper"
  },
  "মুড়ির মোয়া": {
    "bn": "শীর্ষস্থানীয় অলরাউন্ডার",
    "en": "Premier all-rounder"
  },
  "চিঁড়া ভাজা": {
    "bn": "ফুটবলের জাদুকর",
    "en": "Argentine football icon"
  },
  "চিঁড়া দই ও কলা": {
    "bn": "পর্তুগিজ ফুটবলার",
    "en": "Iberian athletic forward"
  },
  "গুড়ের সন্দেশ": {
    "bn": "সিলিকন ভ্যালি উদ্ভাবক",
    "en": "Silicon Valley visionary"
  },
  "কালোজাম": {
    "bn": "পদার্থের স্থান-কাল",
    "en": "Theoretical spacetime genius"
  },
  "বালুশাহী": {
    "bn": "রকেট ও পরমাণু",
    "en": "Aerospace scientist leader"
  },
  "বুন্দিয়া": {
    "bn": "কালো রেখার তুলি",
    "en": "Charcoal famine canvas"
  },
  "কাঁচাগোল্লা": {
    "bn": "নারী মুক্তির কলম",
    "en": "Pioneering woman activist"
  },
  "রসমাধুরী": {
    "bn": "মরমী দর্শন সাধক",
    "en": "Spiritual mystic singer"
  },
  "পেস্তা কুলফি": {
    "bn": "তরঙ্গ ও উদ্ভিদ",
    "en": "Radio wave polymath"
  },
  "আখের রস": {
    "bn": "নারী জাগরণের দিশারী",
    "en": "Pioneer female educator"
  },
  "মালপোয়া": {
    "bn": "রেনেসাঁ নাট্যকার",
    "en": "Elizabethan playwright"
  },
  "সুজির বরফি": {
    "bn": "গতি ও মহাকর্ষ",
    "en": "Classical motion laws"
  },
  "আমপান্না": {
    "bn": "কারাগার ও সমঝোতা",
    "en": "Anti-apartheid statesman"
  },
  "বঙ্গবন্ধু শেখ মুজিবুর রহমান": {
    "bn": "স্বাধীনতা ও নেতৃত্ব",
    "en": "Historic statesman"
  },
  "কাজী নজরুল ইসলাম": {
    "bn": "বিদ্রোহ ও কবিতা",
    "en": "Fiery literary rebel"
  },
  "রবীন্দ্রনাথ ঠাকুর": {
    "bn": "বিশ্বসাহিত্যের নোবেল",
    "en": "Universal literary master"
  },
  "হুমায়ূন আহমেদ": {
    "bn": "জনপ্রিয় কথাসাহিত্যিক",
    "en": "Iconic modern author"
  },
  "ড. মুহাম্মদ ইউনূস": {
    "bn": "গ্রামীণ ব্যাংকিং শান্তিতে",
    "en": "Microcredit peace"
  },
  "মাশরাফি বিন মর্তুজা": {
    "bn": "মাঠের নির্ভীক অধিনায়ক",
    "en": "Courageous cricket skipper"
  },
  "সাকিব আল হাসান": {
    "bn": "শীর্ষস্থানীয় অলরাউন্ডার",
    "en": "Premier all-rounder"
  },
  "লিওনেল মেসি": {
    "bn": "ফুটবলের জাদুকর",
    "en": "Argentine football icon"
  },
  "ক্রিশ্চিয়ানো রোনালদো": {
    "bn": "পর্তুগিজ ফুটবলার",
    "en": "Iberian athletic forward"
  },
  "স্টিভ জবস": {
    "bn": "সিলিকন ভ্যালি উদ্ভাবক",
    "en": "Silicon Valley visionary"
  },
  "অ্যালবার্ট আইনস্টাইন": {
    "bn": "পদার্থের স্থান-কাল",
    "en": "Theoretical spacetime genius"
  },
  "এপিজে আব্দুল কালাম": {
    "bn": "রকেট ও পরমাণু",
    "en": "Aerospace scientist leader"
  },
  "জয়নুল আবেদিন": {
    "bn": "কালো রেখার তুলি",
    "en": "Charcoal famine canvas"
  },
  "সুফিয়া কামাল": {
    "bn": "নারী মুক্তির কলম",
    "en": "Pioneering woman activist"
  },
  "লালন শাহ": {
    "bn": "মরমী দর্শন সাধক",
    "en": "Spiritual mystic singer"
  },
  "জগদীশ চন্দ্র বসু": {
    "bn": "তরঙ্গ ও উদ্ভিদ",
    "en": "Radio wave polymath"
  },
  "বেগম রোকেয়া": {
    "bn": "নারী জাগরণের দিশারী",
    "en": "Pioneer female educator"
  },
  "উইলিয়াম শেক্সপিয়ার": {
    "bn": "রেনেসাঁ নাট্যকার",
    "en": "Elizabethan playwright"
  },
  "আইজ্যাক নিউটন": {
    "bn": "গতি ও মহাকর্ষ",
    "en": "Classical motion laws"
  },
  "নেলসন ম্যান্ডেলা": {
    "bn": "কারাগার ও সমঝোতা",
    "en": "Anti-apartheid statesman"
  },
  "মহাত্মা গান্ধী": {
    "bn": "অহিংস অনশন নেতা",
    "en": "Civil disobedience leader"
  },
  "মাদার তেরেসা": {
    "bn": "দুস্থদের নীল পাড়",
    "en": "Slum caregiver saint"
  },
  "মারাদোনা": {
    "bn": "মেক্সিকোর ড্রিবলিং বিতর্ক",
    "en": "Iconic Argentine number 10"
  },
  "পেলে": {
    "bn": "ব্রাজিলের ফুটবল সম্রাট",
    "en": "Brazilian football legend"
  },
  "বিল গেটস": {
    "bn": "অপারেটিং সিস্টেম নির্মাতা",
    "en": "Software foundation mogul"
  },
  "ইলন মাস্ক": {
    "bn": "মহাকাশ পরিবহন উদ্যোক্তা",
    "en": "Space commercial pioneer"
  },
  "মার্ক জাকারবার্গ": {
    "bn": "ডিজিটাল সামাজিক যোগাযোগ",
    "en": "Social network architect"
  },
  "মেরি কুরি": {
    "bn": "দ্বৈত নোবেল গবেষক",
    "en": "Pioneering radiation lab"
  },
  "স্টিফেন হকিং": {
    "bn": "মহাবিশ্ব ও ব্ল্যাকহোল",
    "en": "Cosmology wheelchair theorist"
  },
  "মাইকেল জ্যাকসন": {
    "bn": "পপ সঙ্গীত মঞ্চ",
    "en": "Glove pop performer"
  },
  "রিয়াজ (অভিনেতা)": {
    "bn": "বাংলা রোমান্টিক সিনেমা",
    "en": "Golden romantic lead"
  },
  "নায়ক রাজ রাজ্জাক": {
    "bn": "ঢালিউডের রাজা",
    "en": "Pioneer silver screen"
  },
  "সালমান শাহ": {
    "bn": "তরুণদের ফ্যাশন আইকন",
    "en": "Tragic 90s screen idol"
  },
  "শাকিব খান": {
    "bn": "সমসাময়িক শীর্ষ তারকা",
    "en": "Current screen superstar"
  },
  "জেমস (নগর বাউল)": {
    "bn": "বাংলা হার্ড রক",
    "en": "Gravelly rock guru"
  },
  "আইয়ুব বাচ্চু": {
    "bn": "তালের গিটার সুরকার",
    "en": "Electric fretboard master"
  },
  "রুনা লায়লা": {
    "bn": "উপমহাদেশীয় সুরসম্রাজ্ঞী",
    "en": "Legendary versatile melody"
  },
  "সাবিনা ইয়াসমিন": {
    "bn": "কালজয়ী দেশাত্মবোধক কণ্ঠ",
    "en": "National anthem voice"
  },
  "আতাহার আলী খান": {
    "bn": "খেলাধুলার কণ্ঠস্বর",
    "en": "Matchday commentary voice"
  },
  "তামিম ইকবাল": {
    "bn": "মারকুটে বাঁহাতি উদ্বোধনী",
    "en": "Aggressive opening bat"
  },
  "মুশফিকুর রহিম": {
    "bn": "উইকেটের বিশ্বস্ত প্রহরী",
    "en": "Resilient wicket keeper"
  },
  "মুস্তাফিজুর রহমান": {
    "bn": "গতি পরিবর্তনের বোলার",
    "en": "Deceptive seam cutters"
  },
  "মাহমুদুল্লাহ রিয়াদ": {
    "bn": "চাপের মুখে ফিনিশার",
    "en": "Calm lower-order savior"
  },
  "উসাইন বোল্ট": {
    "bn": "ট্র্যাক অ্যান্ড ফিল্ড",
    "en": "Sprint world record"
  },
  "মাইকেল ফেলপস": {
    "bn": "সাঁতারের পদক রেকর্ড",
    "en": "Freestyle pool titan"
  },
  "রজার ফেدرার": {
    "bn": "কোর্টে মসৃণ ব্যাকহ্যান্ড",
    "en": "Grass court champion"
  },
  "সেরেনা উইলিয়ামস": {
    "bn": "পাওয়ার টেনিস কোর্ট",
    "en": "Grand Slam powerhouse"
  },
  "মুহাম্মদ আলী": {
    "bn": "রিংয়ের ভারী মুষ্টি",
    "en": "Heavyweight ring artist"
  },
  "চার্লি চ্যাপলিন": {
    "bn": "নির্বাক যুগের ছড়ি",
    "en": "Silent comedy tramp"
  },
  "লিওনার্দো দা ভিঞ্চি": {
    "bn": "ইতালির রেনেসাঁ বহুবিদ্যা",
    "en": "Florentine polymath canvas"
  },
  "ভিনসেন্ট ভ্যান গগ": {
    "bn": "ঘূর্ণায়মান হলুদ তুলি",
    "en": "Post-impressionist swirling oil"
  },
  "পাবলো পিকাসো": {
    "bn": "জ্যামিতিক রূপান্তর ছবি",
    "en": "Geometric canvas pioneer"
  },
  "অমিতাভ বচ্চন": {
    "bn": "গম্ভীর কণ্ঠের শাহেনশাহ",
    "en": "Baritone Bollywood giant"
  },
  "শাহরুখ খান": {
    "bn": "রোমান্টিক হিন্দি নায়ক",
    "en": "Bollywood romance monarch"
  },
  "আমির খান": {
    "bn": "নিখুঁত বাছাই অভিনেতা",
    "en": "Methodical cinema transformer"
  },
  "সত্যজিৎ রায়": {
    "bn": "বাস্তববাদী ভারতীয় সিনেমা",
    "en": "Auteur film laureate"
  },
  "ঋত্বিক ঘটক": {
    "bn": "দেশভাগের ট্র্যাজেডি চলচ্চিত্র",
    "en": "Partition trauma auteur"
  },
  "মীর মোশাররফ হোসেন": {
    "bn": "কারবালার উপাখ্যান লেখক",
    "en": "Historical tragedy writer"
  },
  "শরৎচন্দ্র চট্টোপাধ্যায়": {
    "bn": "সামাজিক আবেগ কথাসাহিত্য",
    "en": "Sensory fiction novelist"
  },
  "বঙ্কিমচন্দ্র চট্টোপাধ্যায়": {
    "bn": "প্রারম্ভিক বাংলা গদ্যসম্রাট",
    "en": "Early nationalist prose"
  },
  "মাইকেল মধুসূদন দত্ত": {
    "bn": "ছন্দভাঙা ধ্রুপদী কাব্যাংশ",
    "en": "Subversive epic verses"
  },
  "জীবনানন্দ দাশ": {
    "bn": "নিভৃত ধূসর বাংলার",
    "en": "Solitary pastoral verses"
  },
  "জসীম উদ্‌দীন": {
    "bn": "পল্লী গাঁওয়ের আখ্যান",
    "en": "Rural folklore ballads"
  },
  "শামসুর রাহমান": {
    "bn": "শহুরে মিছিলের কবি",
    "en": "Urban barricade poet"
  },
  "নির্মলেন্দু গুণ": {
    "bn": "খোলা মাঠের কবিতা",
    "en": "Bohemian people poet"
  },
  "সৈয়দ মুজতবা আলী": {
    "bn": "হাস্যরসাত্মক ভ্রমণকাহিনি",
    "en": "Polyglot witty rambler"
  },
  "মুহম্মদ জাফর ইকবাল": {
    "bn": "কিশোর বৈজ্ঞানিক কল্পকাহিনী",
    "en": "Youth scientific tales"
  },
  "সৈয়দ শামসুল হক": {
    "bn": "মঞ্চনাটক ও বহুবিদ্যা",
    "en": "Multi-genre dramatist"
  },
  "সোহরাওয়ার্দী": {
    "bn": "উপমহাদেশীয় সংসদ নেতা",
    "en": "Constitutional parliamentarian"
  },
  "মওলানা ভাসানী": {
    "bn": "কৃষক জনতার সমাবেশ",
    "en": "Grassroots agrarian tribune"
  },
  "তাজউদ্দীন আহমদ": {
    "bn": "যুদ্ধকালীন সচিবালয় সংগঠক",
    "en": "Exile wartime architect"
  },
  "বীরশ্রেষ্ঠ মতিউর রহমান": {
    "bn": "আকাশের ককপিট প্রতিরোধ",
    "en": "Aviation cockpit martyr"
  },
  "বীরশ্রেষ্ঠ হামিদুর রহমান": {
    "bn": "সীমান্ত বাঙ্কারের আত্মদান",
    "en": "Forward trench casualty"
  },
  "বীরশ্রেষ্ঠ মোস্তফা কামাল": {
    "bn": "সঙ্গীদের পশ্চাদপসরণ ঢাল",
    "en": "Covering defense stand"
  },
  "তারেক মাসুদ": {
    "bn": "প্রামাণ্য ইতিহাস নির্মাতা",
    "en": "Folk celluloid chronicler"
  },
  "জহির রায়হান": {
    "bn": "গণহত্যা প্রামাণ্যচিত্র নিখোঁজ",
    "en": "Disappeared celluloid lens"
  },
  "তিতুমীর": {
    "bn": "ঔপনিবেশিক বিরোধী কৃষক",
    "en": "Agrarian resistance leader"
  },
  "সূর্য সেন (মাস্টারদা)": {
    "bn": "বিপ্লবী গুপ্ত শিক্ষক",
    "en": "Underground armory planner"
  },
  "প্রীতিলতা ওয়াদ্দেদার": {
    "bn": "ইউরোপীয় নিষিদ্ধ আস্তানা",
    "en": "Anti-colonial female pioneer"
  },
  "নেতাজি সুভাষচন্দ্র বসু": {
    "bn": "সশস্ত্র প্রতিরোধ বাহিনী",
    "en": "Militant freedom vanguard"
  },
  "সুকান্ত ভট্টাচার্য": {
    "bn": "অল্পবয়সী প্রতিবাদী কবিতা",
    "en": "Adolescent hunger verses"
  },
  "আব্দুল হামিদ খান ভাসানী": {
    "bn": "সংসদীয় প্রবীণ অভিভাবক",
    "en": "Veteran wetland statesman"
  },
  "ড. জামিলুর রেজা চৌধুরী": {
    "bn": "জাতীয় সেতু প্রকৌশলী",
    "en": "Monumental structural consultant"
  },
  "স্যার ফজলে হাসান আবেদ": {
    "bn": "বিশ্বমানের উন্নয়ন সংস্থা",
    "en": "Social enterprise architect"
  },
  "হানিফ সংকেত": {
    "bn": "টেলিভিশন ব্যঙ্গ উপস্থাপক",
    "en": "Broadcast satire producer"
  },
  "আব্দুল গাফফার চৌধুরী": {
    "bn": "ঐতিহাসিক শোকগাথা রচয়িতা",
    "en": "Memorial anthem writer"
  },
  "আলতাফ মাহমুদ": {
    "bn": "শহীদ সুরকার হারমোনিয়াম",
    "en": "Martyred orchestral mind"
  },
  "ফরিদপুরী জসিম": {
    "bn": "বাণিজ্যিক অ্যাকশন ডিরেক্টর",
    "en": "Action choreography pioneer"
  },
  "মিশা সওদাগর": {
    "bn": "সিনেমার প্রধান বিরোধী",
    "en": "Archetypal movie antagonist"
  },
  "চঞ্চল চৌধুরী": {
    "bn": "বহুরূপী চরিত্রাভিনেতা",
    "en": "Transformational character actor"
  },
  "মোশাররফ করিম": {
    "bn": "বাস্তবধর্মী কমেডি অভিনেতা",
    "en": "Nuanced comedy performer"
  },
  "আফরান নিশো": {
    "bn": "সাইকোলজিক্যাল ড্রামা চরিত্র",
    "en": "Intense thriller protagonist"
  },
  "মেহজাবীন চৌধুরী": {
    "bn": "পারিবারিক টেলিভিশন নাটক",
    "en": "Contemporary drama lead"
  },
  "শাবানা": {
    "bn": "পারিবারিক সিনেমার আইকন",
    "en": "Golden cinematic matriarch"
  },
  "ববিতা": {
    "bn": "আন্তর্জাতিক চলচ্চিত্র অভিনেত্রী",
    "en": "Cannes screened talent"
  },
  "কবরী": {
    "bn": "ক্লাসিক রূপালী পর্দা",
    "en": "Nostalgic cinema face"
  },
  "ওয়াসিম আকরাম": {
    "bn": "বাঁহাতি রিভার্স পেসার",
    "en": "Reverse swing legend"
  },
  "শচীন টেন্ডুলকার": {
    "bn": "বিশ্বের সর্বাধিক আন্তর্জাতিক",
    "en": "Record international runs"
  },
  "বিরাট কোহলি": {
    "bn": "ক্রিকেটার",
    "en": "cricketer"
  },
  "এম এস ধোনি": {
    "bn": "আইসিসি শিরোপাজয়ী উইকেটরক্ষক",
    "en": "Tactical trophy captain"
  },
  "ব্রায়ান লারা": {
    "bn": "স্পর্শকাতর ডিজিটাল হ্যান্ডহেল্ড",
    "en": "Handheld touchscreen portal"
  },
  "ক্রিস গেইল": {
    "bn": "পরিবহন",
    "en": "transport"
  },
  "শেন ওয়ার্ন": {
    "bn": "নলজাতীয় কোমরের কাপড়",
    "en": "Tubular casual wrap"
  },
  "কিলিয়ান এমবাপ্পে": {
    "bn": "কাঁচের চিমনি বাতি",
    "en": "Vented fuel lantern"
  },
  "নেইমার": {
    "bn": "বৃষ্টি",
    "en": "rain"
  },
  "আর্নেস্ট হেমিংওয়ে": {
    "bn": "বুনন পাতার বাতাস",
    "en": "Plaited manual cooler"
  },
  "জে কে রোলিং": {
    "bn": "গ্যাজেট",
    "en": "gadget"
  },
  "ওয়াল্ট ডিজনি": {
    "bn": "দৃষ্টির কাঁচ ফ্রেম",
    "en": "Optic corrective frames"
  },
  "আলেকজান্ডার গ্রাহাম বেল": {
    "bn": "কবজির সেকেন্ড কাঁটা",
    "en": "Dial strapped gear"
  },
  "টমাস আলভা এডিসন": {
    "bn": "কালির নিব শ্যাফট",
    "en": "Ink feed cartridge"
  },
  "নিকোলা টেসলা": {
    "bn": "আলোক সংবেদনশীল সেন্সর",
    "en": "Shutter optical sensor"
  },
  "গ্যালিলিও গ্যালিলেই": {
    "bn": "দুই চাকার থ্রটল",
    "en": "Dual wheeled throttle"
  },
  "আব্রাহাম লিঙ্কন": {
    "bn": "যাত্রার টিকিট পাস",
    "en": "Boarding carriage slip"
  },
  "মার্টিন লুথার কিং জুনিয়র": {
    "bn": "বাষ্প নির্গমনের নল",
    "en": "Spouted boiling vessel"
  },
  "চে গুয়েভারা": {
    "bn": "গোলকাকার ক্রীড়া চামড়া",
    "en": "Inflated stitched sphere"
  },
  "ফিদেল কাস্ত্রো": {
    "bn": "কাঠের চ্যাপ্টা স্ট্রাইকার",
    "en": "Pressed willow blade"
  },
  "ক্লিওপেট্রা": {
    "bn": "ঘরের সম্প্রচার পর্দা",
    "en": "Living room monitor"
  },
  "জুলিয়াস সিজার": {
    "bn": "চাকাবিশিষ্ট বহন বাক্স",
    "en": "Rolling apparel carrier"
  },
  "নেপোলিয়ন বোনাপার্ট": {
    "bn": "শ্রবণ ইন্দ্রিয়ের অ্যাকোস্টিক",
    "en": "Binaural dynamic drivers"
  },
  "চেঙ্গিস খান": {
    "bn": "নাগরিক অভিবাসন পুস্তিকা",
    "en": "Consular transit booklet"
  },
  "স্মার্টফোন": {
    "bn": "স্পর্শকাতর ডিজিটাল হ্যান্ডহেল্ড",
    "en": "Handheld touchscreen portal"
  },
  "রিকশা": {
    "bn": "পরিবহন",
    "en": "transport"
  },
  "লুঙ্গি": {
    "bn": "নলজাতীয় কোমরের কাপড়",
    "en": "Tubular casual wrap"
  },
  "হারিকেন": {
    "bn": "কাঁচের চিমনি বাতি",
    "en": "Vented fuel lantern"
  },
  "ছাতা": {
    "bn": "বৃষ্টি",
    "en": "rain"
  },
  "হাতপাখা": {
    "bn": "বুনন পাতার বাতাস",
    "en": "Plaited manual cooler"
  },
  "ল্যাপটপ": {
    "bn": "গ্যাজেট",
    "en": "gadget"
  },
  "চশমা": {
    "bn": "দৃষ্টির কাঁচ ফ্রেম",
    "en": "Optic corrective frames"
  },
  "হাতঘড়ি": {
    "bn": "কবজির সেকেন্ড কাঁটা",
    "en": "Dial strapped gear"
  },
  "কলম": {
    "bn": "কালির নিব শ্যাফট",
    "en": "Ink feed cartridge"
  },
  "ক্যামেরা": {
    "bn": "আলোক সংবেদনশীল সেন্সর",
    "en": "Shutter optical sensor"
  },
  "মোটরসাইকেল": {
    "bn": "দুই চাকার থ্রটল",
    "en": "Dual wheeled throttle"
  },
  "ট্রেনের টিকিট": {
    "bn": "যাত্রার টিকিট পাস",
    "en": "Boarding carriage slip"
  },
  "চায়ের কেটলি": {
    "bn": "বাষ্প নির্গমনের নল",
    "en": "Spouted boiling vessel"
  },
  "ফুটবল": {
    "bn": "গোলকাকার ক্রীড়া চামড়া",
    "en": "Inflated stitched sphere"
  },
  "ক্রিকেট ব্যাট": {
    "bn": "কাঠের চ্যাপ্টা স্ট্রাইকার",
    "en": "Pressed willow blade"
  },
  "টেলিভিশন": {
    "bn": "ঘরের সম্প্রচার পর্দা",
    "en": "Living room monitor"
  },
  "ট্রাভেল ব্যাগ": {
    "bn": "চাকাবিশিষ্ট বহন বাক্স",
    "en": "Rolling apparel carrier"
  },
  "হেডফোন": {
    "bn": "শ্রবণ ইন্দ্রিয়ের অ্যাকোস্টিক",
    "en": "Binaural dynamic drivers"
  },
  "পাসপোর্ট": {
    "bn": "নাগরিক অভিবাসন পুস্তিকা",
    "en": "Consular transit booklet"
  },
  "পদ্মা সেতু (মডেল/স্মারক)": {
    "bn": "জলরাশির সংযোগ মেগা",
    "en": "Spanned pylon superstructure"
  },
  "সিএনজি অটো-রিকশা": {
    "bn": "জ্বালানিচালিত সবুজ খাঁচা",
    "en": "Compressed gas trike"
  },
  "কাঁচি": {
    "bn": "জোড়া ধারালো পিভট",
    "en": "Opposing lever blades"
  },
  "সুই-সুতো": {
    "bn": "বস্ত্র মেরামতের আঁশ",
    "en": "Eyed steel thread"
  },
  "নৌকা": {
    "bn": "কাঠের হাল ভাসমান",
    "en": "Hollow wooden hull"
  },
  "তালা-চাবি": {
    "bn": "ধাতব টিউম্বলার পিন",
    "en": "Notched tumbler shackle"
  },
  "টর্চলাইট": {
    "bn": "পোর্টেবল ফোকাস আলো",
    "en": "Reflector bulb cylinder"
  },
  "থার্মোমিটার": {
    "bn": "শারীরিক ক্যালিব্রেশন পারদ",
    "en": "Thermal sensor tube"
  },
  "স্টেথোস্কোপ": {
    "bn": "অভ্যন্তরীণ শব্দ নালী",
    "en": "Acoustic chest piece"
  },
  "আয়না": {
    "bn": "রৌপ্য প্রলেপ কাচ",
    "en": "Specular reflective surface"
  },
  "চিরুনি": {
    "bn": "দাঁতওয়ালা সাজসজ্জা প্লেট",
    "en": "Toothed grooming strip"
  },
  "টুথব্রাশ": {
    "bn": "ঘর্ষণমূলক স্বাস্থ্যকর শলাকা",
    "en": "Bristle scrub wand"
  },
  "বালতি ও মগ": {
    "bn": "জলধারণ পাত্রজোড়া",
    "en": "Sanitary reservoir basin"
  },
  "সাবান": {
    "bn": "ক্ষারীয় ফেনা কেক",
    "en": "Saponified lipid block"
  },
  "তোয়ালে / গামছা": {
    "bn": "শোষণকারী সুতি বয়ন",
    "en": "Absorbent checked fabric"
  },
  "বালিশ": {
    "bn": "ঘুমানোর নরম প্যাড",
    "en": "Cushioned cranial rest"
  },
  "মশারি": {
    "bn": "সূক্ষ্ম জালের পর্দা",
    "en": "Porous nocturnal canopy"
  },
  "কম্বল": {
    "bn": "তাপ ধরে রাখা আস্তরণ",
    "en": "Insulating textile layer"
  },
  "বেডশিট (চাদর)": {
    "bn": "শয্যার সমতল বস্ত্র",
    "en": "Mattress drape cotton"
  },
  "আলমারি": {
    "bn": "ভারী খোপের আসবাব",
    "en": "Upright panel closet"
  },
  "রেফ্রিজারেটর (ফ্রিজ)": {
    "bn": "হিমশীতল খাদ্য সংরক্ষণাগার",
    "en": "Compressor thermal insulator"
  },
  "মাইক্রোওয়েভ ওভেন": {
    "bn": "উচ্চ কম্পাঙ্ক উত্তাপক",
    "en": "Radiation reheating chamber"
  },
  "ব্লেন্ডার": {
    "bn": "ঘূর্ণনশীল ধারালো পেস্ট",
    "en": "High RPM motor"
  },
  "রাইস কুকার": {
    "bn": "থার্মোস্ট্যাট সেদ্ধ হাঁড়ি",
    "en": "Automated steam chamber"
  },
  "প্রেসার কুকার": {
    "bn": "বাষ্পচাপ রিলিজ ভালভ",
    "en": "Hermetic steam regulator"
  },
  "কড়াই ও খুন্তি": {
    "bn": "আগুনের ধাতব গভীরতা",
    "en": "Concave heat vessel"
  },
  "বটি": {
    "bn": "স্থির পায়ের ব্লেড",
    "en": "Stationary bench blade"
  },
  "শিল-পাটা": {
    "bn": "ঘর্ষণের সমতল শিলা",
    "en": "Granite friction tools"
  },
  "ঝাড়ু": {
    "bn": "শলার মেঝের ঝাঁড়ু",
    "en": "Bundled fiber sweeper"
  },
  "ডাস্টবিন": {
    "bn": "বর্জ্য নিষ্কাশন খাপ",
    "en": "Waste containment drum"
  },
  "ডায়রি": {
    "bn": "কালপঞ্জি ব্যক্তিগত পাতা",
    "en": "Dated blank chronicle"
  },
  "স্টেপলার": {
    "bn": "কাগজ বাঁধাই ক্লিপ",
    "en": "Crimping wire applicator"
  },
  "ক্যালকুলেটর": {
    "bn": "গাণিতিক লজিক সার্কিট",
    "en": "Arithmetic digital matrix"
  },
  "সিলিং ফ্যান": {
    "bn": "ইলেকট্রনিক ডিভাইস",
    "en": "Electronic device"
  },
  "এয়ার কন্ডিশনার (এসি)": {
    "bn": "বায়ু নিয়ন্ত্রণকারী কনডেনসার",
    "en": "Refrigerant split exchanger"
  },
  "পাওয়ার ব্যাংক": {
    "bn": "পোর্টেবল লিথিয়াম কোষ",
    "en": "Rechargeable reserve cells"
  },
  "ওয়াইফাই রাউটার": {
    "bn": "বেতার তরঙ্গ গেটওয়ে",
    "en": "Broadband spectrum transceiver"
  },
  "গিটার": {
    "bn": "ফ্রেটবোর্ড অনুরণন খোলস",
    "en": "Resonant soundbox frets"
  },
  "হারমোনিয়াম": {
    "bn": "রিড সমন্বিত চাবি",
    "en": "Pumped brass reeds"
  },
  "তবলা": {
    "bn": "আঙ্গুলের তাল ঝিল্লি",
    "en": "Tuned skin drums"
  },
  "একতারা": {
    "bn": "একক তারের লাউ",
    "en": "Resonating gourd monochord"
  },
  "বাঁশি": {
    "bn": "বায়ুপ্রবাহ সুরনল",
    "en": "Wind acoustic chamber"
  },
  "দাবার বোর্ড": {
    "bn": "কৌশলী ছকের চাল",
    "en": "Checkered strategy field"
  },
  "ক্যারম বোর্ড": {
    "bn": "মসৃণ পাউডার স্ট্রাইক",
    "en": "Pocketed carrom boundary"
  },
  "লুডুর ছক্কা ও কোর্ট": {
    "bn": "বিন্দুময় সম্ভাব্যতা ঘনক",
    "en": "Pipped probability cube"
  },
  "ঘুড়ি ও নাটাই": {
    "bn": "বায়ুমণ্ডলে সুতার নিয়ন্ত্রণ",
    "en": "Aerodynamic spar bridling"
  },
  "মার্বেল": {
    "bn": "গোলাকার শক্ত কাঁচ",
    "en": "Spherical vitreous tokens"
  },
  "মাটির ব্যাংক": {
    "bn": "সঞ্চয়ের ছিদ্রযুক্ত পাত্র",
    "en": "Sealed deposit hollow"
  },
  "ড্রোন": {
    "bn": "রিমোট চালিত ঘূর্ণিপাখা",
    "en": "Multirotor aerial platform"
  },
  "স্মার্টওয়াচ": {
    "bn": "শারীরবৃত্তীয় সংকেত রিস্টব্যান্ড",
    "en": "Wearable biometric sensor"
  },
  "হ্যান্ড স্যানিটাইজার": {
    "bn": "ইথানল ডিসইনফেক্টেন্ট জেল",
    "en": "Volatile microbial rinse"
  },
  "ফেস মাস্ক": {
    "bn": "শ্বাসনালী ফিল্ট্রেশন প্যাড",
    "en": "Elastic looped respirator"
  },
  "হেলমেট": {
    "bn": "শিরোস্ত্রাণ প্রতিরোধী শেল",
    "en": "Impact absorbing shell"
  },
  "চাবির রিং": {
    "bn": "ধাতব চাবির গুচ্ছ",
    "en": "Key grouping fixture"
  },
  "পার্স / মানিব্যাগ": {
    "bn": "মুদ্রা ভাঁজ খাপ",
    "en": "Compartmentalized note case"
  },
  "ক্রেডিট কার্ড / এটিএম কার্ড": {
    "bn": "ইলেক্ট্রনিক লেনদেন চিপ",
    "en": "Magnetic chip card"
  },
  "সানগ্লাস": {
    "bn": "পোলারাইজড ইউভি শেড",
    "en": "Tinted solar filter"
  },
  "ক্যাপ / হ্যাট": {
    "bn": "ছায়া প্রদানকারী ক্রাউন",
    "en": "Brimmed headgear crown"
  },
  "রেনকোট": {
    "bn": "জলরোধী সিন্থেটিক কোট",
    "en": "Impermeable stitched outer"
  },
  "জুতো (স্নিকার্স)": {
    "bn": "রাবার সোলের পাদুকা",
    "en": "Treaded athletic sole"
  },
  "স্যান্ডেল (স্পঞ্জ)": {
    "bn": "খোলামেলা চটি স্ট্র্যাপ",
    "en": "Open toe thong"
  },
  "মোজা": {
    "bn": "গোড়ালির তুলার মোড়ক",
    "en": "Elasticated ankle sheath"
  },
  "বেল্ট": {
    "bn": "কোমরবন্ধ বাকল বেল্ট",
    "en": "Tension buckled strap"
  },
  "টাই": {
    "bn": "গলবন্ধ ঝুলন্ত রেশম",
    "en": "Formal draped knot"
  },
  "শাড়ি": {
    "bn": "সেলাইবিহীন দীর্ঘ বস্ত্র",
    "en": "Unstitched graceful drape"
  },
  "পাঞ্জাবি": {
    "bn": "মসজিদ",
    "en": "masjid"
  },
  "ফ্লাস্ক (থার্মাস)": {
    "bn": "দ্বিস্তর ভ্যাকুয়াম ফ্লাস্ক",
    "en": "Double walled thermos"
  },
  "পানির বোতল": {
    "bn": "পানযোগ্য তরল আধার",
    "en": "Capped hydration flask"
  },
  "টিফিন ক্যারিয়ার": {
    "bn": "কৌটার স্তরবিন্যাস",
    "en": "Interlocking meal tiers"
  },
  "কাচের গ্লাস": {
    "bn": "স্বচ্ছ সিলিন্ডার পাত্র",
    "en": "Vitreous liquid cylinder"
  },
  "সিরামিক প্লেট": {
    "bn": "গ্লেজড ভোজ থালা",
    "en": "Glazed dining dish"
  },
  "চামচ ও কাঁটাচামচ": {
    "bn": "খাদ্য সংগ্রহের চামচ",
    "en": "Concave pronged cutlery"
  },
  "ছুরি": {
    "bn": "ধারালো স্টিলের ফলক",
    "en": "Beveled utility edge"
  },
  "ম্যাচবাক্স / দিয়াশলাই": {
    "bn": "ঘর্ষণ প্রজ্বলন কাঠি",
    "en": "Phosphorus coated splinter"
  },
  "মোমবাতি": {
    "bn": "গলনশীল মোমের সলতে",
    "en": "Combustible tallow wick"
  },
  "ধূপ ও আগরবাতি": {
    "bn": "ধূপের ধোঁয়া সুবাস",
    "en": "Smoldering aromatic resin"
  },
  "পর্দা (জানালার)": {
    "bn": "জানালা আবৃত পর্দা",
    "en": "Suspended fenestration drop"
  },
  "ডোরবেল": {
    "bn": "বহিরাগত সংকেত সুইফ্ট",
    "en": "Entry announcement chime"
  },
  "পায়ের পাপোশ": {
    "bn": "প্রবেশপথের পরিষ্কারক ম্যাট",
    "en": "Textured threshold fiber"
  },
  "ফুলদানি": {
    "bn": "ফুল ডাল রাখার পাত্র",
    "en": "Botanical display stem"
  },
  "দেয়াল ঘড়ি": {
    "bn": "দেয়ালের পর্যায়ক্রমিক ডায়াল",
    "en": "Wall pendulum escapement"
  },
  "ক্যালেন্ডার": {
    "bn": "তারিখের পাতলা বাঁধাই",
    "en": "Gregorian solar grid"
  },
  "নোটবুক ও ডাস্টার": {
    "bn": "চক মোছার বোর্ড",
    "en": "Classroom felt surface"
  },
  "কলিং বেল (হাতে বাজা)": {
    "bn": "কাউন্টারের ধাতব গম্বুজ",
    "en": "Tinkling counter chime"
  },
  "লটারির টিকিট": {
    "bn": "ভাগ্য যাচাই কুপন",
    "en": "Random chance ticket"
  },
  "দূরবীন (বাইনোকুলার)": {
    "bn": "দূরবীক্ষণ প্রিজম যুগল",
    "en": "Prismatic stereo optic"
  },
  "মাইক্রোস্কোপ": {
    "bn": "অণুবীক্ষণ ফোকাসিং নল",
    "en": "Specimen magnifying stage"
  },
  "টেলিস্কোপ": {
    "bn": "জ্যোতির্বৈজ্ঞানিক দর্পণ লেন্স",
    "en": "Deep sky collector"
  },
  "লাউডস্পিকার (মাইক)": {
    "bn": "ধ্বনি সম্প্রসারক চোঙ",
    "en": "Acoustic megaphone horn"
  },
  "সাউন্ডবক্স (ব্লুটুথ স্পিকার)": {
    "bn": "বেতার কম্পাঙ্ক স্পিকার",
    "en": "Bluetooth acoustic woofer"
  },
  "পেনড্রাইভ": {
    "bn": "প্লাগযোগ্য ফ্ল্যাশ ড্রাইভ",
    "en": "Solid state thumb"
  },
  "মাউস (কম্পিউটার)": {
    "bn": "পেরিফেরাল কার্সর ইনপুট",
    "en": "Optical desktop pointer"
  },
  "কীবোর্ড": {
    "bn": "কীবোর্ড বোতাম প্যানেল",
    "en": "Mechanical matrix switch"
  },
  "প্রিন্টার": {
    "bn": "কালি ছিটানোর হার্ডকপি",
    "en": "Toner deposit engine"
  },
  "স্ক্যানার": {
    "bn": "কাঁচের প্রতিফলন স্ক্যান",
    "en": "Photodiode line sensor"
  },
  "প্রজেক্টর": {
    "bn": "উজ্জ্বল আলোর অভিক্ষেপ",
    "en": "Luminous focal projector"
  },
  "এটিএম বুথ মেশিন": {
    "bn": "কার্ড খোলার কাউন্টার",
    "en": "Encrypted cash dispenser"
  },
  "ট্রাফিক লাইট": {
    "bn": "তিন রঙের সংকেত বাতি",
    "en": "Tri-state roadway beacon"
  },
  "অগ্নি নির্বাপক সিলিন্ডার": {
    "bn": "চাপযুক্ত রাসায়নিক ক্যানিস্টার",
    "en": "Pressurized gas retardant"
  },
  "ফার্স্ট এইড বক্স": {
    "bn": "জরুরি ড্রেসিং কিট",
    "en": "Sterile emergency kit"
  },
  "রয়েল বেঙ্গল টাইগার": {
    "bn": "ভয়ঙ্কর",
    "en": "fierce"
  },
  "দোয়েল": {
    "bn": "সুরের শিস পাখি",
    "en": "Melodic whistler avian"
  },
  "ইলিশ মাছ": {
    "bn": "রূপালী চকচকে মাছ",
    "en": "Silvery salt migrant"
  },
  "হাতি": {
    "bn": "বিশাল শুঁড় স্তন্যপায়ী",
    "en": "Massive trunked mammal"
  },
  "সিংহ": {
    "bn": "বনের কেশর শিকারি",
    "en": "Savanna pride monarch"
  },
  "শিয়াল": {
    "bn": "ধূর্ত নিশাচর শ্বাপদ",
    "en": "Cunning bush canid"
  },
  "চিত্রা হরিণ": {
    "bn": "দ্রুত চপল হরিণ",
    "en": "Spotted graceful browser"
  },
  "কুমির": {
    "bn": "পানিতে থাকে",
    "en": "live in water"
  },
  "শুশুক / ডলফিন": {
    "bn": "নদীর শান্ত স্তন্যপায়ী",
    "en": "Riverine blowhole mammal"
  },
  "পানকৌড়ি": {
    "bn": "ডুব দিয়ে মাছশিকারি",
    "en": "Underwater diving wings"
  },
  "ময়ূর": {
    "bn": "রঙিন পেখমের শোভা",
    "en": "Eye-crested fanning plumage"
  },
  "বানর": {
    "bn": "শাখামৃগের চঞ্চল হাত",
    "en": "Arboreal primate climber"
  },
  "ক্যাঙ্গারু": {
    "bn": "পশ্চাৎপদের উল্লম্ফন প্রাণী",
    "en": "Bipedal pouch hopper"
  },
  "উট": {
    "bn": "মরুভূমির চর্বি কুঁজ",
    "en": "Fat-storing desert nomad"
  },
  "পেঙ্গুইন": {
    "bn": "বরফের সাঁতারু পাখি",
    "en": "Sub-zero tuxedo diver"
  },
  "ঘোড়া": {
    "bn": "খুরযুক্ত দ্রুত বাহন",
    "en": "Equine galloper steed"
  },
  "চিতাবাঘ": {
    "bn": "দ্রুততম শিকারি চিতা",
    "en": "High acceleration feline"
  },
  "গণ্ডার": {
    "bn": "নাকের কেরাটিন বর্ম",
    "en": "Armored keratin browser"
  },
  "কাঠবিড়ালি": {
    "bn": "গাছের বাদাম সংগ্রাহক",
    "en": "Bushy tail hoarder"
  },
  "কোকিল": {
    "bn": "পরভৃত্যের মিষ্টি শিস",
    "en": "Brood parasite songbird"
  },
  "কাক": {
    "bn": "কালো বুদ্ধিমত্তার পাখি",
    "en": "Urban opportunistic corvid"
  },
  "টিয়া পাখি": {
    "bn": "শব্দ অনুকরণকারী সবুজ",
    "en": "Hooked bill mimic"
  },
  "ময়না পাখি": {
    "bn": "বাগপটু কালো গায়ক",
    "en": "Yellow wattled mimic"
  },
  "চড়ুই পাখি": {
    "bn": "ঘরোয়া খড়কুটো পাখি",
    "en": "Domestic crevice passerine"
  },
  "শালিক": {
    "bn": "যুগল চিহ্নের পাখি",
    "en": "Subcontinental folk omen"
  },
  "ঈগল": {
    "bn": "আকাশের তীক্ষ্ণ দৃষ্টি",
    "en": "High thermals raptor"
  },
  "চিল": {
    "bn": "বায়ুমণ্ডলে ছোঁ মারা",
    "en": "Forked tail soarer"
  },
  "শকুন": {
    "bn": "প্রকৃতির অবশিষ্টাংশ ভোজী",
    "en": "Scavenging thermal glider"
  },
  "পেঁচা": {
    "bn": "অন্ধকারের গোল চোখ",
    "en": "Nocturnal silent flyer"
  },
  "হাঁস (পাতিহাঁস / রাজহাঁস)": {
    "bn": "পুকুরের লিপ্তপদী পাখি",
    "en": "Web footed swimmer"
  },
  "মুরগি (মোরগ)": {
    "bn": "ভোরের ঝুঁটিধারী গৃহপালিত",
    "en": "Dawn crowing crest"
  },
  "কবুতর (পায়রা)": {
    "bn": "শান্তির চিঠির পাখি",
    "en": "Homing message flier"
  },
  "টুনটুনি": {
    "bn": "পাতা সেলাই কারিগর",
    "en": "Leaf stitching passerine"
  },
  "বাবুই পাখি": {
    "bn": "ঝুলন্ত খড়ের স্থপতি",
    "en": "Intricate weaver avian"
  },
  "বুলবুলি": {
    "bn": "ঝুঁটি লালচে সুর",
    "en": "Crested garden warbler"
  },
  "মাছরাঙা": {
    "bn": "পানিতে ছোঁ মারা",
    "en": "Dagger billed diver"
  },
  "বগ / বক": {
    "bn": "এক পায়ে ধ্যানমগ্ন",
    "en": "Stationary water wader"
  },
  "উটপাখি": {
    "bn": "উড্ডয়নহীন দ্রুততম পাখি",
    "en": "Heavyweight desert runner"
  },
  "ফ্ল্যামিঙ্গো": {
    "bn": "লবণাক্ত হ্রদের গোলাপি",
    "en": "Filter feeding wading"
  },
  "হর্নবিল (ধনেশ)": {
    "bn": "শিরস্ত্রাণ চঞ্চুর বনচর",
    "en": "Casque horned forager"
  },
  "নীল তিমি": {
    "bn": "মহাসাগরের বৃহত্তম স্তন্যপায়ী",
    "en": "Colossal baleen mammal"
  },
  "হাঙর": {
    "bn": "ত্রিকোণ পাখনার শিকারি",
    "en": "Cartilaginous apex prowler"
  },
  "অক্টোপাস": {
    "bn": "বহু হস্ত ও কালি",
    "en": "Cephalopod ink diver"
  },
  "জেলিফিশ": {
    "bn": "অস্থিহীন বিষাক্ত ছাতা",
    "en": "Pulsing cnidarian bell"
  },
  "সামুদ্রিক কচ্ছপ": {
    "bn": "শক্ত খোলসে সাঁতার",
    "en": "Pelagic flippered shell"
  },
  "কাঁকড়া": {
    "bn": "বালির দুই দাঁড়া",
    "en": "Decapod coastal pincer"
  },
  "তারা মাছ (স্টারফিশ)": {
    "bn": "সমুদ্রের পাঁচ বাহু",
    "en": "Radial tube crawler"
  },
  "সী হর্স (সমুদ্র ঘোড়া)": {
    "bn": "পুরুষের ডিম বহন",
    "en": "Brood pouch marine"
  },
  "তিমি হাঙর (হোয়েল শার্ক)": {
    "bn": "নিরীহ দানব মাছ",
    "en": "Gentle spotted feeder"
  },
  "প্যাঙ্গোলিন (বনরুই)": {
    "bn": "আঁশের বল প্রাণী",
    "en": "Keratin scale roller"
  },
  "জলহস্তী (হিপ্পো)": {
    "bn": "জলের স্থূলকায় তৃণভোজী",
    "en": "Semi-aquatic heavyweight tusks"
  },
  "জিরাফ": {
    "bn": "দীর্ঘ গ্রীবার তৃণভোজী",
    "en": "Canopy browsing mammal"
  },
  "জেব্রা": {
    "bn": "কালো-সাদা ডোরা প্রাণী",
    "en": "Monochrome herd equid"
  },
  "গরিলা": {
    "bn": "গভীর বনের বনমানুষ",
    "en": "Silverback dominant ape"
  },
  "শিম্পাঞ্জি": {
    "bn": "সরঞ্জাম ব্যবহারকারী বনমানুষ",
    "en": "Tool crafting primate"
  },
  "কালো পান্ডা (জায়ান্ট পান্ডা)": {
    "bn": "বাঁশঝাড়ের শান্ত ভালুক",
    "en": "Bamboo foraging bear"
  },
  "মেরু ভালুক (পোলার বিয়ার)": {
    "bn": "উত্তর বরফের শিকারি",
    "en": "Arctic marine carnivore"
  },
  "কালো ভালুক": {
    "bn": "বুকে বাঁকানো দাগ",
    "en": "Crescent patched forager"
  },
  "কোয়ালা": {
    "bn": "গাছে ঘুমন্ত নিরীহ",
    "en": "Arboreal gum dweller"
  },
  "স্লথ": {
    "bn": "ডালে ঝুলন্ত মন্থর",
    "en": "Algae coated hanger"
  },
  "নেকড়ে": {
    "bn": "পূর্ণিমায় সমস্বরে ডাক",
    "en": "Pack hunting tundra"
  },
  "হায়েনা": {
    "bn": "হাসির শিকারি",
    "en": "Savanna scavenger"
  },
  "বেজি (মঙ্গুজ)": {
    "bn": "বিষাক্ত দংশন প্রতিরোধক",
    "en": "Venom resistant hunter"
  },
  "কিং কোবরা (শঙ্খচূড়)": {
    "bn": "উত্থিত ফণার সর্পরাজ",
    "en": "Hooded ophiophagous serpent"
  },
  "চন্দ্রবোড়া (রাসেলস ভাইপার)": {
    "bn": "ধানের লুকানো বিষধর",
    "en": "Camouflaged heavy viper"
  },
  "অজগর (পাইথন)": {
    "bn": "দম আটকানো পেঁচক",
    "en": "Massive constricting serpent"
  },
  "গোখরা সাপ": {
    "bn": "ফণার চক্ষু নকশা",
    "en": "Ocular marked hood"
  },
  "গিরগিটি": {
    "bn": "ছদ্মবেশের বর্ণবিকার সরীসৃপ",
    "en": "Chromatophore lizard"
  },
  "টিকটিকি": {
    "bn": "দেয়ালের আঠালো পদচিহ্ন",
    "en": "Vertical suction climber"
  },
  "গুইসাপ": {
    "bn": "জলাধারের বৃহৎ সরীসৃপ",
    "en": "Fork tongued monitor"
  },
  "কুনো ব্যাঙ": {
    "bn": "স্যাঁতসেঁতে স্থলজ উভচর",
    "en": "Rough skinned bugger"
  },
  "সোনা ব্যাঙ": {
    "bn": "বর্ষার গভীর কণ্ঠ",
    "en": "Monsoon aquatic croaker"
  },
  "ছুঁচো (ছুঁচো ইঁদুর)": {
    "bn": "গন্ধযুক্ত রাতের স্তন্যপায়ী",
    "en": "Pointed musk forager"
  },
  "ইঁদুর": {
    "bn": "গর্তের ধারালো দাঁত",
    "en": "Incisor chewing burrower"
  },
  "খরগোশ": {
    "bn": "লম্বা কানের ক্ষিপ্র",
    "en": "Burrowing long ears"
  },
  "সজারু": {
    "bn": "আত্মরক্ষার কাঁটা বর্ম",
    "en": "Quill armed rodent"
  },
  "ভোদড় (ওটার)": {
    "bn": "জলজ চঞ্চল শিকারি",
    "en": "Sleek swimming carnivore"
  },
  "চামচিকা / বাদুড়": {
    "bn": "প্রতিধ্বনি শব্দে ওড়া",
    "en": "Echolocating winged flyer"
  },
  "মৌমাছি": {
    "bn": "ষড়ভুজ মোমের উপনিবেশ",
    "en": "Wax comb architect"
  },
  "প্রজাপতি": {
    "bn": "উড়তে পারে",
    "en": "can fly"
  },
  "ফড়িং (ঘাসফড়িং)": {
    "bn": "সবুজ ঘাসের লাফ",
    "en": "Saltatorial meadow nymph"
  },
  "জোনাকি পোকা": {
    "bn": "জৈব রাসায়নিক আলো",
    "en": "Bioluminescent night beetle"
  },
  "মাকড়সা": {
    "bn": "আট পায়ের রেশমজাল",
    "en": "Orb weaver arachnid"
  },
  "তেলাপোকা (আরশোলা)": {
    "bn": "অন্ধকার সহ্যকারী কীট",
    "en": "Night foraging survivor"
  },
  "মশা": {
    "bn": "রক্তবাহী ক্ষুদ্র শোষক",
    "en": "Vector biting pest"
  },
  "মাছি (ঘরোয়া মাছি)": {
    "bn": "বহুচোখের উড়ন্ত পোকা",
    "en": "Compound eye scavenger"
  },
  "পিঁপড়া (লাল পিঁপড়া / কালো পিঁপড়া)": {
    "bn": "ইউসোশাল কলোনি সারিবদ্ধ",
    "en": "Pheromone trail forager"
  },
  "উইপোকা": {
    "bn": "কাঠ বিনাশকারী পতঙ্গ",
    "en": "Cellulose tunneling colony"
  },
  "কেন্নো": {
    "bn": "বহুপদী কুণ্ডলী পোকা",
    "en": "Spiral curling detritivore"
  },
  "বিচ্ছু (কাঁকড়াবিছা)": {
    "bn": "বাঁকা হুলের দংশন",
    "en": "Curved caudal stinger"
  },
  "জেব্রা ফিশ / গাপ্পি": {
    "bn": "কাঁচের ছোট সৌন্দর্য",
    "en": "Vibrant nano tank"
  },
  "মাগুর মাছ": {
    "bn": "বায়ু গ্রহণকারী গোঁফাল",
    "en": "Accessory breathing catfish"
  },
  "শিং মাছ": {
    "bn": "পার্শ্বীয় কাঁটার মাছ",
    "en": "Pectoral venomous spine"
  },
  "পাঙ্গাশ মাছ": {
    "bn": "আঁশবিহীন নদীর তৈলাক্ত",
    "en": "Scaleless river swimmer"
  },
  "বোয়াল মাছ": {
    "bn": "নদীগর্ভের সর্বগ্রাসী মাছ",
    "en": "Wide gape benthic"
  },
  "কাতলা মাছ": {
    "bn": "পুকুর তলের বৃহদাকার",
    "en": "Heavy scaled surface"
  },
  "রুই মাছ": {
    "bn": "বাংলা জলাধারের প্রধান",
    "en": "River carp icon"
  },
  "টাকি মাছ": {
    "bn": "কাদার ডোবার শিকারি",
    "en": "Mud burrowing predator"
  },
  "শোল মাছ": {
    "bn": "ডোরাকাটা জলাশয় শিকারি",
    "en": "Banded inland predator"
  },
  "চিংড়ি (গলদা / বাগদা)": {
    "bn": "বাঁকা খোলসের ক্রাস্টাসিয়ান",
    "en": "Decapod benthic meat"
  },
  "অ্যালবাট্রস": {
    "bn": "সুদূর সামুদ্রিক ওড়া",
    "en": "Pelagic oceanic wings"
  },
  "হামিংবার্ড": {
    "bn": "স্থির শূন্যে ওড়া",
    "en": "Rapid hovering nectar"
  },
  "হর্নড ভাইপার": {
    "bn": "মরু বালুর ছদ্মবেশী",
    "en": "Sidewinding horned sand"
  },
  "ব্ল্যাক প্যান্থার": {
    "bn": "মেলানিস্টিক রাতের শিকারি",
    "en": "Melanistic shadow stalker"
  },
  "লাল পান্ডা (রেড পান্ডা)": {
    "bn": "রিংযুক্ত হিমালয়ী লোম",
    "en": "Arboreal mountain mammal"
  },
  "ক্যাপিবারা": {
    "bn": "শান্ত স্বভাবের উভচরজাতীয়",
    "en": "Docile giant rodent"
  },
  "অ্যালপাকা / লামা": {
    "bn": "উঁচু পর্বতের পশমী",
    "en": "Highland camelid fleece"
  },
  "আর্মাডিলো": {
    "bn": "বর্মাবৃত গোল বল",
    "en": "Osteoderm shielded sphere"
  },
  "ওয়ালরাস": {
    "bn": "মেরু বরফের দন্তকায়",
    "en": "Sub-polar ivory tusked"
  },
  "সিল মাছ (সিল)": {
    "bn": "বরফজলের মসৃণ স্তন্যপায়ী",
    "en": "Pinniped coastal diver"
  },
  "প্লাটিপাস": {
    "bn": "মনোট্রিম অদ্ভুত ডিম্বজ",
    "en": "Duck billed monotreme"
  },
  "এক্সিডনা (কাঁটাযুক্ত প্রাণী)": {
    "bn": "অস্ট্রেলীয় ডিম্বজ কাঁটা",
    "en": "Spiny oviparous anteater"
  },
  "অ্যাক্সোলটল (মেক্সিকান সালাম্যান্ডার)": {
    "bn": "পুনরুৎপাদনশীল মেক্সিকান জলজ",
    "en": "Neotenic aquatic regenerator"
  },
  "টার্সিয়ার (বড় চোখের বানর)": {
    "bn": "বিশাল গোলাকার দৃষ্টি",
    "en": "Nocturnal twig clinging"
  },
  "উড়ন্ত কাঠবিড়ালি": {
    "bn": "পর্দায় ভর করে",
    "en": "Patagium gliding rodent"
  },
  "টুকান পাখি": {
    "bn": "বৃষ্টিবনের রঙিন ঠোঁট",
    "en": "Canopy oversized bill"
  },
  "ক্যাসোয়ারি": {
    "bn": "বৃষ্টিবনের বিপজ্জনক পদ",
    "en": "Southern rainforest giant"
  },
  "কমোডো ড্রাগন": {
    "bn": "দ্বীপাঞ্চলের দানব সরীসৃপ",
    "en": "Apex venomous monitor"
  },
  "চিতল মাছ": {
    "bn": "বাঁকা পিঠের মিষ্টিমাছ",
    "en": "Humpbacked river predator"
  },
  "মৌলভি পাখি (ফিঙে)": {
    "bn": "চেরা লেজের দুঃসাহসী",
    "en": "Aggressive fork passerine"
  }
};

export function lookupWordHint(word: WordItem): WordHintAssociation {
  if (WORD_HINTS_BY_ID[word.id]) {
    return WORD_HINTS_BY_ID[word.id];
  }
  if (WORD_HINTS_BY_NAME[word.wordBn]) {
    return WORD_HINTS_BY_NAME[word.wordBn];
  }
  if (word.shortHintBn && word.shortHintEn) {
    return {
      bn: word.shortHintBn.trim().split(/\s+/).slice(0, 3).join(' '),
      en: word.shortHintEn.trim().split(/\s+/).slice(0, 3).join(' '),
    };
  }
  return { bn: 'রহস্যময় ধারণা', en: 'Mysterious clue' };
}
