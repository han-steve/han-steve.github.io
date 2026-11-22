import { spawn } from 'node:child_process';
import { watch } from 'node:fs';
import { access } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const children = new Set();
let interrupted = false;
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    if (interrupted) return;
    interrupted = true;
    for (const child of children) child.kill('SIGTERM');
  });
}

/** @param {string} command @param {string[]} argv @param {{ input?: string, capture?: boolean }} [options] @returns {Promise<string>} */
function run(command, argv, options = {}) {
  return new Promise((resolveRun, reject) => {
    const child = spawn(command, argv, {
      cwd: root,
      env: { ...process.env, COPYFILE_DISABLE: '1' },
      stdio: ['pipe', 'pipe', 'inherit']
    });
    children.add(child);
    let output = '';
    child.stdout.on('data', chunk => {
      if (options.capture) output += chunk;
      else process.stdout.write(chunk);
    });
    child.on('error', reject);
    child.on('close', code => {
      children.delete(child);
      if (code === 0) resolveRun(output.trim());
      else reject(new Error(`${command} exited ${code ?? 'after interruption'}`));
    });
    child.stdin.on('error', () => {}); // The SSH error/exit reports an early close.
    child.stdin.end(options.input);
  });
}

/** @param {string} script @param {boolean} [capture] */
const ssh = (script, capture = false) => run('ssh', [
  '-o', 'BatchMode=yes', '-o', 'ConnectTimeout=15', 'homelab', 'bash -s'
], { input: script, capture });

// Explicit public source paths. Excluded files are protected from rsync deletion.
const sourcePaths = [
  'src', 'static', 'package.json', 'package-lock.json', 'svelte.config.js',
  'vite.config.ts', 'tsconfig.json', 'tailwind.config.cjs', 'postcss.config.cjs'
];

async function main() {
  if (process.platform !== 'darwin') {
    const vite = resolve(root, 'node_modules/vite/bin/vite.js');
    try { await access(vite); }
    catch { throw new Error('Dependencies are missing. Run npm ci on M2, then npm run dev.'); }
    await run(process.execPath, [vite, 'dev', ...args]);
    return;
  }

  let port = 5173;
  if (args.length) {
    if (args.length !== 2 || args[0] !== '--port' || !/^\d+$/.test(args[1])) {
      throw new Error('Usage: npm run dev [-- --port 5173]');
    }
    port = Number(args[1]);
    if (port < 1024 || port > 65535) throw new Error('Choose a port from 1024 through 65535.');
  }
  const nonce = randomUUID().replaceAll('-', '');
  const unit = `hansteve-site-dev-${nonce}`;
  const installUnit = `${unit}-install`;
  let workspace = '';
  /** @type {import('node:fs').FSWatcher | undefined} */
  let watcher;
  /** @type {ReturnType<typeof setTimeout> | undefined} */
  let timer;
  let pending = Promise.resolve();

  try {
    console.log('Preparing a bounded development workspace on M2…');
    workspace = await ssh(`set -eu
command -v rsync >/dev/null
command -v node >/dev/null
test "$(stat -f -c %T /tmp)" = tmpfs || { echo '/tmp must be memory-backed' >&2; exit 1; }
awk '/MemAvailable:/ { if ($2 < 3145728) exit 1 }' /proc/meminfo || { echo 'M2 needs at least 3 GiB available RAM' >&2; exit 1; }
test "$(df -Pk /tmp | awk 'NR==2 {print $4}')" -ge 1048576 || { echo 'M2 /tmp needs 1 GiB free' >&2; exit 1; }
directory=$(mktemp -d /tmp/hansteve-site-dev.XXXXXXXX)
chmod 700 "$directory"
printf '%s' '${nonce}' > "$directory/.dev-owner"
printf '%s' "$directory"
`, true);
    if (!/^\/tmp\/hansteve-site-dev\.[A-Za-z0-9]+$/.test(workspace)) {
      throw new Error('M2 returned an unexpected workspace path; nothing will be removed.');
    }
    const sync = () => run('rsync', [
      '-rltz', '--delete', '--exclude=.DS_Store', '--exclude=._*', '--exclude=.env*',
      '--exclude=node_modules', '--exclude=.git', '--exclude=.svelte-kit', '--exclude=build', '--exclude=.cache',
      ...sourcePaths.map(path => `--include=/${path}${['src', 'static'].includes(path) ? '/***' : ''}`),
      '--exclude=*', '-e', 'ssh -o BatchMode=yes -o ConnectTimeout=15',
      './', `homelab:${workspace}/`
    ]);
    await sync();
    if (interrupted) return;
    await ssh(`set -eu
cd '${workspace}'
mkdir tooling npm-cache
printf 'engine-strict=true\\n' > .npmrc
curl -fsSL --max-time 60 --max-filesize 16777216 https://registry.npmjs.org/npm/-/npm-10.9.2.tgz | tar xz -C tooling
sudo -n systemd-run --quiet --wait --pipe --collect --unit='${installUnit}' -p User="$(id -un)" -p WorkingDirectory='${workspace}' -p MemoryMax=1G -p MemorySwapMax=0 -p CPUQuota=150% -p RuntimeMaxSec=600 /usr/bin/node tooling/package/bin/npm-cli.js ci --userconfig=/dev/null --cache='${workspace}/npm-cache' --no-audit --no-fund
`);
    if (interrupted) return;

    console.log(`\nDevelopment preview: http://127.0.0.1:${port}/`);
    console.log('Vite and dependencies run on M2. Public source edits sync automatically. Ctrl+C stops and removes this workspace.\n');
    watcher = watch(root, { recursive: true }, (_event, filename) => {
      const path = String(filename || '').replaceAll('\\', '/');
      if (!sourcePaths.some(source => path === source || (['src', 'static'].includes(source) && path.startsWith(source + '/')))) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        pending = pending.then(async () => {
          if (interrupted) return;
          await sync();
          if (['package.json', 'package-lock.json'].includes(path)) {
            console.log('Dependencies changed; restart npm run dev to reinstall on M2.');
          }
        }).catch(error => console.error('Source sync failed:', error.message));
      }, 250);
    });
    await run('ssh', [
      '-o', 'BatchMode=yes', '-o', 'ConnectTimeout=15', '-o', 'ExitOnForwardFailure=yes',
      '-L', `127.0.0.1:${port}:127.0.0.1:${port}`, 'homelab',
      `sudo -n systemd-run --quiet --wait --pipe --collect --unit=${unit} -p User=$(id -un) -p WorkingDirectory=${workspace} -p MemoryMax=1G -p MemorySwapMax=0 -p CPUQuota=150% -p RuntimeMaxSec=43200 -p ProtectHome=true -p NoNewPrivileges=true /usr/bin/node node_modules/vite/bin/vite.js dev --host 127.0.0.1 --port ${port} --strictPort`
    ]);
  } finally {
    watcher?.close();
    clearTimeout(timer);
    await pending;
    if (/^\/tmp\/hansteve-site-dev\.[A-Za-z0-9]+$/.test(workspace)) {
      await ssh(`set -eu
sudo -n systemctl stop '${unit}.service' '${installUnit}.service' 2>/dev/null || true
if test "$(cat '${workspace}/.dev-owner' 2>/dev/null)" = '${nonce}'; then rm -rf -- '${workspace}'; fi
`).catch(error => console.error(`Cleanup needs attention for ${workspace}: ${error.message}`));
    }
  }
}

main().catch(error => {
  if (!interrupted) console.error(error.message);
  process.exitCode = interrupted ? 130 : 1;
});
