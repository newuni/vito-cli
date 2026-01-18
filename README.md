# Vito CLI

> ⚠️ **Unofficial project** — This CLI is NOT affiliated with, endorsed by, or related to [Vito Deploy](https://vitodeploy.com) in any way. It's an independent tool that uses their public API.

CLI client for Vito Deploy API.

## Installation

```bash
npm install -g vito-cli
```

### From source

```bash
git clone https://github.com/newuni/vito-cli.git
cd vito-cli
npm install
npm link
```

## Configuration

Run the interactive setup:

```bash
vito setup
```

This will prompt for your Vito URL and API token, validate the connection, and save credentials to `~/.config/vito/config.json`.

### Alternative: Environment Variables

```bash
export VITO_URL=https://your-vito:8080
export VITO_TOKEN=your-token
```

### Verify config

```bash
vito config
```

## Usage

```bash
# Health check
vito health

# Quick status overview
vito status

# Projects
vito projects list
vito projects get <id>
vito projects create <name>
vito projects delete <id>

# Servers
vito servers list <projectId>
vito servers get <projectId> <serverId>
vito servers reboot <projectId> <serverId>
vito servers upgrade <projectId> <serverId>

# Sites
vito sites list <projectId> <serverId>
vito sites get <projectId> <serverId> <siteId>
vito sites deploy <projectId> <serverId> <siteId>

# Databases
vito db list <projectId> <serverId>

# Services
vito services list <projectId> <serverId>
vito services restart <projectId> <serverId> <serviceId>

# Firewall
vito firewall list <projectId> <serverId>

# SSH Keys
vito ssh-keys list <projectId> <serverId>

# Cron Jobs
vito cron list <projectId> <serverId>

# Run script
vito run-script <projectId> <serverId> "echo hello"
vito run-script <projectId> <serverId> "apt update" --user root
```

## Output

All commands output JSON for easy parsing with `jq`:

```bash
vito projects list | jq '.data[].name'
vito status  # Human-readable overview
```

## Programmatic Usage

```javascript
import { VitoClient } from './src/client.js';

const client = new VitoClient('http://your-vito:8080', 'your-token');
const projects = await client.listProjects();
```
