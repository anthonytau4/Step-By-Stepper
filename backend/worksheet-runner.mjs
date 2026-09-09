import { execFile } from 'node:child_process';

// execFile's async options do not accept `input`. Explicitly close stdin so
// the Python worksheet builder can read the payload instead of timing out.
export function runWorksheetProcess(scriptPath, payload, pythonBin = 'python3') {
  return new Promise((resolve, reject) => {
    const child = execFile(pythonBin, [scriptPath], {
      maxBuffer: 5 * 1024 * 1024,
      timeout: 12000
    }, (error, stdout) => {
      if (error) { reject(error); return; }
      try { resolve(JSON.parse(String(stdout || '{}'))); }
      catch (_) { reject(new Error('Worksheet builder returned invalid JSON.')); }
    });
    child.stdin.on('error', error => { if (error.code !== 'EPIPE') reject(error); });
    child.stdin.end(JSON.stringify(payload || {}));
  });
}
