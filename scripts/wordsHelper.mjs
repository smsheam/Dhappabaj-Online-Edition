import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const wordsDir = path.resolve(__dirname, '../src/data/words');

if (!fs.existsSync(wordsDir)) {
  fs.mkdirSync(wordsDir, { recursive: true });
}

// Helper to write a category word file
export function writeCategoryFile(fileName, varName, categoryId, items) {
  const fileContent = `import { WordItem } from '../../types/game';

export const ${varName}: WordItem[] = ${JSON.stringify(items, null, 2)};
`;
  fs.writeFileSync(path.join(wordsDir, fileName), fileContent, 'utf-8');
  console.log(`Saved ${fileName} with ${items.length} words.`);
}
