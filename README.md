# Vito CLI

CLI client for Vito Deploy API.

## Setup

```bash
cd .
npm install
npm link  # Makes 'vito' command available globally
```

## Configuration

First, generate an API token in Vito Deploy (Settings → API Tokens).

```bash
vito config --url http://YOUR_VITO_HOST:8080 --token YOUR_TOKEN
vito config --show  # Verify config
```

Config is stored in `~/.vitocli.json`.

### Quick Setup

Copy the example config and edit with your credentials:

```bash
cp .vitocli.example.json ~/.vitocli.json
# Edit ~/.vitocli.json with your URL and token
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

const client = new VitoClient('http://YOUR_VITO_HOST:8080', 'your-token');
const projects = await client.listProjects();
```
