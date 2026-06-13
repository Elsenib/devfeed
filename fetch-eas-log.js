const fs = require('fs');
const https = require('https');
const zlib = require('zlib');
const { execSync } = require('child_process');

const buildId = process.argv[2] || '05043132-44f7-488a-859a-a43ac617c910';
const json = execSync(`npx eas build:view ${buildId} --json`, { encoding: 'utf8' });
const obj = JSON.parse(json);
const url = obj.logFiles?.[0];
if (!url) {
  console.error('No logFiles URL found');
  process.exit(1);
}
console.error('LOG_URL=' + url);
https.get(url, (res) => {
  console.error('STATUS=' + res.statusCode);
  console.error('HEADERS=' + JSON.stringify(res.headers));
  const chunks = [];
  res.on('data', (chunk) => chunks.push(chunk));
  res.on('end', () => {
    const buf = Buffer.concat(chunks);
    const first = buf.slice(0, 16);
    console.error('MAGIC=' + first.toString('hex'));
    let text = null;
    if (buf.length > 2 && buf[0] === 0x1f && buf[1] === 0x8b) {
      console.error('Detected gzip');
      try {
        text = zlib.gunzipSync(buf).toString('utf8');
      } catch (e) {
        console.error('GUNZIP_ERROR', e.message);
      }
    } else if (buf.length > 3 && buf[0] === 0x8b && buf[1] === 0x1f) {
      console.error('Detected possible Brotli or gzip');
    }
    if (text === null) {
      try {
        text = zlib.brotliDecompressSync(buf).toString('utf8');
        console.error('Detected brotli and decompressed successfully');
      } catch (e) {
        console.error('BROTLI_ERROR', e.message);
      }
    }
    if (text === null) {
      try {
        text = buf.toString('utf8');
      } catch (e) {
        console.error('UTF8_ERROR', e.message);
        text = buf.toString('latin1');
      }
    }
    fs.writeFileSync('eas-log-dump.txt', text, 'utf8');
    const lines = text.split(/\r?\n/);
    console.error('TOTAL_LINES=' + lines.length);
    const print = lines.slice(-120);
    print.forEach((line) => console.log(line));
  });
}).on('error', (err) => {
  console.error('download error', err);
  process.exit(1);
});
