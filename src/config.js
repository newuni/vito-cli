import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONFIG_DIR = join(homedir(), '.config', 'vito');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');
const ENV_PATH = join(__dirname, '..', '.env');

function loadEnvFile() {
  if (!existsSync(ENV_PATH)) return {};
  const content = readFileSync(ENV_PATH, 'utf-8');
  const env = {};
  for (const line of content.split('\n')) {
    const match = line.match(/^\s*([\w]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let value = match[2] || '';
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      env[match[1]] = value;
    }
  }
  return env;
}

function loadConfigFile() {
  if (!existsSync(CONFIG_FILE)) return {};
  try {
    return JSON.parse(readFileSync(CONFIG_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

export function saveConfig(config) {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2) + '\n');
  return CONFIG_FILE;
}

export function getConfigPath() {
  return CONFIG_FILE;
}

export function getConfig() {
  // Priority: env vars > ~/.config/vito/config.json > .env file
  const envUrl = process.env.VITO_URL;
  const envToken = process.env.VITO_TOKEN;
  
  // If env vars are explicitly set (even empty), use them
  if (envUrl !== undefined || envToken !== undefined) {
    if (!envUrl || !envToken) return null;
    return { url: envUrl, token: envToken };
  }
  
  // Try config file in home directory
  const fileConfig = loadConfigFile();
  if (fileConfig.url && fileConfig.token) {
    return { url: fileConfig.url, token: fileConfig.token };
  }
  
  // Fallback to .env in package directory (for development)
  const envFile = loadEnvFile();
  if (envFile.VITO_URL && envFile.VITO_TOKEN) {
    return { url: envFile.VITO_URL, token: envFile.VITO_TOKEN };
  }
  
  return null;
}

export function requireConfig() {
  const config = getConfig();
  if (!config) {
    console.error('❌ Not configured. Run: vito setup');
    process.exit(1);
  }
  return config;
}
