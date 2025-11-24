import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { swaggerSpec } from './swagger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const out = path.join(__dirname, '../docs/openapi.json');
fs.writeFileSync(out, JSON.stringify(swaggerSpec, null, 2));
console.log('Wrote', out);