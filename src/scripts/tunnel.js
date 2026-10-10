import { spawn } from 'child_process';
import fs from 'fs';

const paths = [
  'C:\\Program Files (x86)\\cloudflared\\cloudflared.exe',
  'C:\\Program Files\\cloudflared\\cloudflared.exe',
  'cloudflared',
];

const binary = paths.find(p => p === 'cloudflared' || fs.existsSync(p)) || 'cloudflared';

function startTunnel() {
  console.log(`\n🚀 Starting Cloudflare Tunnel for http://localhost:3000 ...`);

  const child = spawn(binary, ['tunnel', '--url', 'http://localhost:3000'], {
    stdio: 'inherit',
    shell: false,
  });

  child.on('error', (err) => {
    console.error('Failed to start cloudflared:', err.message);
    console.log('Retrying in 3 seconds...');
    setTimeout(startTunnel, 3000);
  });

  child.on('close', (code) => {
    if (code !== 0) {
      console.warn(`\n⚠️ Tunnel exited with code ${code}. Reconnecting in 3 seconds...`);
      setTimeout(startTunnel, 3000);
    }
  });

  const handleShutdown = () => {
    child.kill();
    process.exit(0);
  };

  process.on('SIGINT', handleShutdown);
  process.on('SIGTERM', handleShutdown);
}

startTunnel();
