import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VitoClient } from '../src/client.js';

describe('VitoClient', () => {
  let client;
  let mockFetch;

  beforeEach(() => {
    client = new VitoClient('http://localhost:8080', 'test-token');
    mockFetch = vi.fn();
    global.fetch = mockFetch;
  });

  describe('constructor', () => {
    it('should remove trailing slash from baseUrl', () => {
      const c = new VitoClient('http://example.com/', 'token');
      expect(c.baseUrl).toBe('http://example.com');
    });

    it('should store token', () => {
      expect(client.token).toBe('test-token');
    });
  });

  describe('request', () => {
    it('should make request with correct headers', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('{"success":true}'),
      });

      await client.request('GET', '/api/health');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/health',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Authorization': 'Bearer test-token',
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        })
      );
    });

    it('should include body for POST requests', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('{}'),
      });

      await client.request('POST', '/api/projects', { name: 'test' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'test' }),
        })
      );
    });

    it('should throw error on non-ok response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        text: () => Promise.resolve('{"message":"Unauthorized"}'),
      });

      await expect(client.request('GET', '/api/projects'))
        .rejects.toThrow('Unauthorized');
    });

    it('should handle non-JSON responses', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('plain text'),
      });

      const result = await client.request('GET', '/api/health');
      expect(result).toBe('plain text');
    });
  });

  describe('health', () => {
    it('should call /api/health', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('{"success":true,"version":"3.19.0"}'),
      });

      const result = await client.health();

      expect(result).toEqual({ success: true, version: '3.19.0' });
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/health',
        expect.any(Object)
      );
    });
  });

  describe('projects', () => {
    it('should list projects', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('{"data":[{"id":1,"name":"test"}]}'),
      });

      const result = await client.listProjects();

      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('test');
    });

    it('should get project by id', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('{"id":1,"name":"test"}'),
      });

      const result = await client.getProject(1);

      expect(result.id).toBe(1);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/projects/1',
        expect.any(Object)
      );
    });

    it('should create project', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('{"id":1,"name":"new-project"}'),
      });

      const result = await client.createProject('new-project');

      expect(result.name).toBe('new-project');
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/projects',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'new-project' }),
        })
      );
    });

    it('should delete project', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(''),
      });

      await client.deleteProject(1);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/projects/1',
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('servers', () => {
    it('should list servers for project', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('{"data":[{"id":1,"name":"server1"}]}'),
      });

      const result = await client.listServers(1);

      expect(result.data[0].name).toBe('server1');
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/projects/1/servers',
        expect.any(Object)
      );
    });

    it('should reboot server', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(''),
      });

      await client.rebootServer(1, 2);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/projects/1/servers/2/reboot',
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('should upgrade server', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(''),
      });

      await client.upgradeServer(1, 2);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/projects/1/servers/2/upgrade',
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  describe('sites', () => {
    it('should list sites', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('{"data":[{"id":1,"domain":"example.com"}]}'),
      });

      const result = await client.listSites(1, 2);

      expect(result.data[0].domain).toBe('example.com');
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/projects/1/servers/2/sites',
        expect.any(Object)
      );
    });

    it('should deploy site', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('{"id":1}'),
      });

      await client.deploy(1, 2, 3);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/projects/1/servers/2/sites/3/deploy',
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  describe('databases', () => {
    it('should list databases', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('{"data":[{"id":1,"name":"mydb"}]}'),
      });

      const result = await client.listDatabases(1, 2);

      expect(result.data[0].name).toBe('mydb');
    });

    it('should create database', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('{"id":1,"name":"newdb"}'),
      });

      const result = await client.createDatabase(1, 2, {
        name: 'newdb',
        charset: 'utf8mb4',
        collation: 'utf8mb4_unicode_ci',
      });

      expect(result.name).toBe('newdb');
    });
  });

  describe('services', () => {
    it('should list services', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('{"data":[{"id":1,"name":"nginx"}]}'),
      });

      const result = await client.listServices(1, 2);

      expect(result.data[0].name).toBe('nginx');
    });

    it('should restart service', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(''),
      });

      await client.restartService(1, 2, 3);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/projects/1/servers/2/services/3/restart',
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  describe('firewall', () => {
    it('should list firewall rules', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('{"data":[{"id":1,"port":"22"}]}'),
      });

      const result = await client.listFirewallRules(1, 2);

      expect(result.data[0].port).toBe('22');
    });
  });

  describe('scripts', () => {
    it('should run script with default user', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('{"id":1}'),
      });

      await client.runScript(1, 2, 'echo hello');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/projects/1/servers/2/scripts',
        expect.objectContaining({
          body: JSON.stringify({ script: 'echo hello', user: 'root' }),
        })
      );
    });

    it('should run script with custom user', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('{"id":1}'),
      });

      await client.runScript(1, 2, 'whoami', 'www-data');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({ script: 'whoami', user: 'www-data' }),
        })
      );
    });
  });
});
