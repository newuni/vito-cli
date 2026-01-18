/**
 * Vito Deploy API Client
 */

export class VitoClient {
  constructor(baseUrl, token) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.token = token;
  }

  async request(method, path, body = null) {
    const url = `${this.baseUrl}${path}`;
    const opts = {
      method,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    };
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(url, opts);
    const text = await res.text();
    
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    if (!res.ok) {
      const err = new Error(data?.message || `HTTP ${res.status}`);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  // Health
  async health() {
    return this.request('GET', '/api/health');
  }

  // Projects
  async listProjects() {
    return this.request('GET', '/api/projects');
  }

  async getProject(id) {
    return this.request('GET', `/api/projects/${id}`);
  }

  async createProject(name) {
    return this.request('POST', '/api/projects', { name });
  }

  async deleteProject(id) {
    return this.request('DELETE', `/api/projects/${id}`);
  }

  // Servers
  async listServers(projectId) {
    return this.request('GET', `/api/projects/${projectId}/servers`);
  }

  async getServer(projectId, serverId) {
    return this.request('GET', `/api/projects/${projectId}/servers/${serverId}`);
  }

  async createServer(projectId, data) {
    return this.request('POST', `/api/projects/${projectId}/servers`, data);
  }

  async deleteServer(projectId, serverId) {
    return this.request('DELETE', `/api/projects/${projectId}/servers/${serverId}`);
  }

  async rebootServer(projectId, serverId) {
    return this.request('POST', `/api/projects/${projectId}/servers/${serverId}/reboot`);
  }

  async upgradeServer(projectId, serverId) {
    return this.request('POST', `/api/projects/${projectId}/servers/${serverId}/upgrade`);
  }

  // Sites
  async listSites(projectId, serverId) {
    return this.request('GET', `/api/projects/${projectId}/servers/${serverId}/sites`);
  }

  async getSite(projectId, serverId, siteId) {
    return this.request('GET', `/api/projects/${projectId}/servers/${serverId}/sites/${siteId}`);
  }

  async createSite(projectId, serverId, data) {
    return this.request('POST', `/api/projects/${projectId}/servers/${serverId}/sites`, data);
  }

  async deleteSite(projectId, serverId, siteId) {
    return this.request('DELETE', `/api/projects/${projectId}/servers/${serverId}/sites/${siteId}`);
  }

  // Databases
  async listDatabases(projectId, serverId) {
    return this.request('GET', `/api/projects/${projectId}/servers/${serverId}/databases`);
  }

  async getDatabase(projectId, serverId, dbId) {
    return this.request('GET', `/api/projects/${projectId}/servers/${serverId}/databases/${dbId}`);
  }

  async createDatabase(projectId, serverId, data) {
    return this.request('POST', `/api/projects/${projectId}/servers/${serverId}/databases`, data);
  }

  async deleteDatabase(projectId, serverId, dbId) {
    return this.request('DELETE', `/api/projects/${projectId}/servers/${serverId}/databases/${dbId}`);
  }

  // Database Users
  async listDbUsers(projectId, serverId) {
    return this.request('GET', `/api/projects/${projectId}/servers/${serverId}/database-users`);
  }

  async createDbUser(projectId, serverId, data) {
    return this.request('POST', `/api/projects/${projectId}/servers/${serverId}/database-users`, data);
  }

  async deleteDbUser(projectId, serverId, userId) {
    return this.request('DELETE', `/api/projects/${projectId}/servers/${serverId}/database-users/${userId}`);
  }

  async linkDbUser(projectId, serverId, userId, databases) {
    return this.request('POST', `/api/projects/${projectId}/servers/${serverId}/database-users/${userId}`, { databases });
  }

  // Services
  async listServices(projectId, serverId) {
    return this.request('GET', `/api/projects/${projectId}/servers/${serverId}/services`);
  }

  async restartService(projectId, serverId, serviceId) {
    return this.request('POST', `/api/projects/${projectId}/servers/${serverId}/services/${serviceId}/restart`);
  }

  async startService(projectId, serverId, serviceId) {
    return this.request('POST', `/api/projects/${projectId}/servers/${serverId}/services/${serviceId}/start`);
  }

  async stopService(projectId, serverId, serviceId) {
    return this.request('POST', `/api/projects/${projectId}/servers/${serverId}/services/${serviceId}/stop`);
  }

  // Firewall
  async listFirewallRules(projectId, serverId) {
    return this.request('GET', `/api/projects/${projectId}/servers/${serverId}/firewall-rules`);
  }

  async createFirewallRule(projectId, serverId, data) {
    return this.request('POST', `/api/projects/${projectId}/servers/${serverId}/firewall-rules`, data);
  }

  async deleteFirewallRule(projectId, serverId, ruleId) {
    return this.request('DELETE', `/api/projects/${projectId}/servers/${serverId}/firewall-rules/${ruleId}`);
  }

  // SSH Keys
  async listSshKeys(projectId, serverId) {
    return this.request('GET', `/api/projects/${projectId}/servers/${serverId}/ssh-keys`);
  }

  async createSshKey(projectId, serverId, data) {
    return this.request('POST', `/api/projects/${projectId}/servers/${serverId}/ssh-keys`, data);
  }

  async deleteSshKey(projectId, serverId, keyId) {
    return this.request('DELETE', `/api/projects/${projectId}/servers/${serverId}/ssh-keys/${keyId}`);
  }

  // Cron Jobs
  async listCronJobs(projectId, serverId) {
    return this.request('GET', `/api/projects/${projectId}/servers/${serverId}/cron-jobs`);
  }

  async createCronJob(projectId, serverId, data) {
    return this.request('POST', `/api/projects/${projectId}/servers/${serverId}/cron-jobs`, data);
  }

  async deleteCronJob(projectId, serverId, jobId) {
    return this.request('DELETE', `/api/projects/${projectId}/servers/${serverId}/cron-jobs/${jobId}`);
  }

  // SSL
  async listSslCerts(projectId, serverId, siteId) {
    return this.request('GET', `/api/projects/${projectId}/servers/${serverId}/sites/${siteId}/ssls`);
  }

  async createSsl(projectId, serverId, siteId, data) {
    return this.request('POST', `/api/projects/${projectId}/servers/${serverId}/sites/${siteId}/ssls`, data);
  }

  // Deployments
  async listDeployments(projectId, serverId, siteId) {
    return this.request('GET', `/api/projects/${projectId}/servers/${serverId}/sites/${siteId}/deployments`);
  }

  async deploy(projectId, serverId, siteId) {
    return this.request('POST', `/api/projects/${projectId}/servers/${serverId}/sites/${siteId}/deploy`);
  }

  // Scripts
  async runScript(projectId, serverId, script, user = 'root') {
    return this.request('POST', `/api/projects/${projectId}/servers/${serverId}/scripts`, { script, user });
  }
}
