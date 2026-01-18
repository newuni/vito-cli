#!/usr/bin/env node
import { Command } from 'commander';
import { VitoClient } from './client.js';
import { getConfig, requireConfig } from './config.js';

const program = new Command();

function out(data) {
  console.log(JSON.stringify(data, null, 2));
}

function err(e) {
  console.error('❌', e.message);
  if (e.data?.errors) console.error(e.data.errors);
  process.exit(1);
}

function client() {
  const cfg = requireConfig();
  return new VitoClient(cfg.url, cfg.token);
}

program
  .name('vito')
  .description('CLI for Vito Deploy API')
  .version('1.0.0');

// Config
program
  .command('config')
  .description('Show current configuration')
  .action(() => {
    const cfg = getConfig();
    if (cfg) {
      console.log('URL:', cfg.url);
      console.log('Token:', cfg.token ? '***' + cfg.token.slice(-4) : 'not set');
    } else {
      console.log('Not configured. Create .env file or set VITO_URL and VITO_TOKEN env vars.');
    }
  });

// Health
program
  .command('health')
  .description('Check API health')
  .action(async () => {
    try {
      out(await client().health());
    } catch (e) { err(e); }
  });

// Projects
const projects = program.command('projects').description('Manage projects');

projects
  .command('list')
  .description('List all projects')
  .action(async () => {
    try {
      out(await client().listProjects());
    } catch (e) { err(e); }
  });

projects
  .command('get <id>')
  .description('Get project by ID')
  .action(async (id) => {
    try {
      out(await client().getProject(id));
    } catch (e) { err(e); }
  });

projects
  .command('create <name>')
  .description('Create a project')
  .action(async (name) => {
    try {
      out(await client().createProject(name));
    } catch (e) { err(e); }
  });

projects
  .command('delete <id>')
  .description('Delete a project')
  .action(async (id) => {
    try {
      await client().deleteProject(id);
      console.log('✅ Deleted');
    } catch (e) { err(e); }
  });

// Servers
const servers = program.command('servers').description('Manage servers');

servers
  .command('list <projectId>')
  .description('List servers in a project')
  .action(async (projectId) => {
    try {
      out(await client().listServers(projectId));
    } catch (e) { err(e); }
  });

servers
  .command('get <projectId> <serverId>')
  .description('Get server details')
  .action(async (projectId, serverId) => {
    try {
      out(await client().getServer(projectId, serverId));
    } catch (e) { err(e); }
  });

servers
  .command('reboot <projectId> <serverId>')
  .description('Reboot a server')
  .action(async (projectId, serverId) => {
    try {
      await client().rebootServer(projectId, serverId);
      console.log('✅ Reboot initiated');
    } catch (e) { err(e); }
  });

servers
  .command('upgrade <projectId> <serverId>')
  .description('Upgrade server packages')
  .action(async (projectId, serverId) => {
    try {
      await client().upgradeServer(projectId, serverId);
      console.log('✅ Upgrade initiated');
    } catch (e) { err(e); }
  });

// Sites
const sites = program.command('sites').description('Manage sites');

sites
  .command('list <projectId> <serverId>')
  .description('List sites on a server')
  .action(async (projectId, serverId) => {
    try {
      out(await client().listSites(projectId, serverId));
    } catch (e) { err(e); }
  });

sites
  .command('get <projectId> <serverId> <siteId>')
  .description('Get site details')
  .action(async (projectId, serverId, siteId) => {
    try {
      out(await client().getSite(projectId, serverId, siteId));
    } catch (e) { err(e); }
  });

sites
  .command('deploy <projectId> <serverId> <siteId>')
  .description('Trigger deployment for a site')
  .action(async (projectId, serverId, siteId) => {
    try {
      out(await client().deploy(projectId, serverId, siteId));
    } catch (e) { err(e); }
  });

// Databases
const databases = program.command('databases').alias('db').description('Manage databases');

databases
  .command('list <projectId> <serverId>')
  .description('List databases on a server')
  .action(async (projectId, serverId) => {
    try {
      out(await client().listDatabases(projectId, serverId));
    } catch (e) { err(e); }
  });

// Services
const services = program.command('services').description('Manage services');

services
  .command('list <projectId> <serverId>')
  .description('List services on a server')
  .action(async (projectId, serverId) => {
    try {
      out(await client().listServices(projectId, serverId));
    } catch (e) { err(e); }
  });

services
  .command('restart <projectId> <serverId> <serviceId>')
  .description('Restart a service')
  .action(async (projectId, serverId, serviceId) => {
    try {
      await client().restartService(projectId, serverId, serviceId);
      console.log('✅ Service restarting');
    } catch (e) { err(e); }
  });

// Firewall
const firewall = program.command('firewall').description('Manage firewall rules');

firewall
  .command('list <projectId> <serverId>')
  .description('List firewall rules')
  .action(async (projectId, serverId) => {
    try {
      out(await client().listFirewallRules(projectId, serverId));
    } catch (e) { err(e); }
  });

// SSH Keys
const sshkeys = program.command('ssh-keys').description('Manage SSH keys');

sshkeys
  .command('list <projectId> <serverId>')
  .description('List SSH keys')
  .action(async (projectId, serverId) => {
    try {
      out(await client().listSshKeys(projectId, serverId));
    } catch (e) { err(e); }
  });

// Cron
const cron = program.command('cron').description('Manage cron jobs');

cron
  .command('list <projectId> <serverId>')
  .description('List cron jobs')
  .action(async (projectId, serverId) => {
    try {
      out(await client().listCronJobs(projectId, serverId));
    } catch (e) { err(e); }
  });

// Scripts
program
  .command('run-script <projectId> <serverId> <script>')
  .description('Run a script on a server')
  .option('-u, --user <user>', 'User to run as', 'root')
  .action(async (projectId, serverId, script, opts) => {
    try {
      out(await client().runScript(projectId, serverId, script, opts.user));
    } catch (e) { err(e); }
  });

// Quick status
program
  .command('status')
  .description('Quick overview: projects, servers, sites')
  .action(async () => {
    try {
      const c = client();
      const projects = await c.listProjects();
      console.log('\n📁 Projects:', projects.data?.length || 0);
      
      for (const p of (projects.data || [])) {
        console.log(`\n  [${p.id}] ${p.name}`);
        const servers = await c.listServers(p.id);
        for (const s of (servers.data || [])) {
          console.log(`    🖥️  [${s.id}] ${s.name} (${s.ip}) - ${s.status}`);
          const sites = await c.listSites(p.id, s.id);
          for (const site of (sites.data || [])) {
            console.log(`      🌐 [${site.id}] ${site.domain} - ${site.status}`);
          }
        }
      }
      console.log('');
    } catch (e) { err(e); }
  });

program.parse();
