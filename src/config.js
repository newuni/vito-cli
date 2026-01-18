import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const CONFIG_PATH = join(homedir(), '.vitocli.json');

export function getConfig() {
  if (!existsSync(CONFIG_PATH)) {
    return null;
  }
  try {
    return JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
  } catch {
    return null;
  }
}

export function saveConfig(config) {
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

export function requireConfig() {
  const config = getConfig();
  if (!config || !config.url || !config.token) {
    console.error('❌ Not configured. Run: vito config --url <URL> --token <TOKEN>');
    process.exit(1);
  }
  return config;
}
