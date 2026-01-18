import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { existsSync, unlinkSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

describe('config', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe('getConfig', () => {
    it('should return config from environment variables', async () => {
      process.env.VITO_URL = 'http://test:8080';
      process.env.VITO_TOKEN = 'test-token';
      
      const { getConfig } = await import('../src/config.js');
      const config = getConfig();

      expect(config).toEqual({
        url: 'http://test:8080',
        token: 'test-token',
      });
    });

    it('should return null if URL is missing', async () => {
      process.env.VITO_URL = '';
      process.env.VITO_TOKEN = 'test-token';

      const { getConfig } = await import('../src/config.js');
      const config = getConfig();

      expect(config).toBeNull();
    });

    it('should return null if token is missing', async () => {
      process.env.VITO_URL = 'http://test:8080';
      process.env.VITO_TOKEN = '';

      const { getConfig } = await import('../src/config.js');
      const config = getConfig();

      expect(config).toBeNull();
    });

    it('should return null if both are missing', async () => {
      process.env.VITO_URL = '';
      process.env.VITO_TOKEN = '';

      const { getConfig } = await import('../src/config.js');
      const config = getConfig();

      expect(config).toBeNull();
    });
  });

  describe('requireConfig', () => {
    it('should return config when valid', async () => {
      process.env.VITO_URL = 'http://test:8080';
      process.env.VITO_TOKEN = 'test-token';

      const { requireConfig } = await import('../src/config.js');
      const config = requireConfig();

      expect(config.url).toBe('http://test:8080');
      expect(config.token).toBe('test-token');
    });

    it('should exit process when config is missing', async () => {
      process.env.VITO_URL = '';
      process.env.VITO_TOKEN = '';

      const mockExit = vi.spyOn(process, 'exit').mockImplementation((code) => {
        throw new Error(`process.exit(${code})`);
      });
      const mockError = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { requireConfig } = await import('../src/config.js');

      expect(() => requireConfig()).toThrow('process.exit(1)');
      expect(mockExit).toHaveBeenCalledWith(1);
      expect(mockError).toHaveBeenCalled();

      mockExit.mockRestore();
      mockError.mockRestore();
    });
  });

  describe('saveConfig', () => {
    const testConfigPath = join(homedir(), '.config', 'vito', 'config.json');

    afterEach(() => {
      // Cleanup test config if created
      if (existsSync(testConfigPath)) {
        try { unlinkSync(testConfigPath); } catch {}
      }
    });

    it('should save config to ~/.config/vito/config.json', async () => {
      process.env.VITO_URL = '';
      process.env.VITO_TOKEN = '';

      const { saveConfig, getConfigPath } = await import('../src/config.js');
      
      const path = saveConfig({ url: 'http://saved:8080', token: 'saved-token' });
      
      expect(path).toContain('.config/vito/config.json');
      expect(existsSync(path)).toBe(true);
    });

    it('should return correct config path', async () => {
      const { getConfigPath } = await import('../src/config.js');
      
      const path = getConfigPath();
      
      expect(path).toContain('.config/vito/config.json');
    });
  });
});
