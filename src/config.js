import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ENV_PATH = join(__dirname, '..', '.env');

function loadEnv() {
  if (!existsSync(ENV_PATH)) return {};
  const content = readFileSync(ENV_PATH, 'utf-8');
  const env = {};
  for (const line of content.split('\n')) {
    const match = line.match(/^\s*([\w]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let value = match[2] || '';
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      env[match[1]] = value;
    }
  }
  return env;
}

export function getConfig() {
  // Environment variables take priority (empty string means unset for testing)
  const envUrl = process.env.VITO_URL;
  const envToken = process.env.VITO_TOKEN;
  
  // If env vars are explicitly set (even empty), don't read .env file
  const fileEnv = (envUrl === undefined && envToken === undefined) ? loadEnv() : {};
  
  const url = envUrl || fileEnv.VITO_URL;
  const token = envToken || fileEnv.VITO_TOKEN;
  
  if (!url || !token) return null;
  return { url, token };
}

export function requireConfig() {
  const config = getConfig();
  if (!config) {
    console.error('❌ Not configured. Create .env file with VITO_URL and VITO_TOKEN');
    console.error('   Or set environment variables VITO_URL and VITO_TOKEN');
    process.exit(1);
  }
  return config;
}
