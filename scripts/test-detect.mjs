// Simple test script for /api/ai/detect
// Usage (PowerShell):
//   node scripts/test-detect.mjs
//   $env:BASE_URL="http://localhost:3000"; node scripts/test-detect.mjs

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

function timeout(ms) {
  return new Promise((_, reject) => setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms));
}

async function main() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await Promise.race([
      fetch(`${BASE_URL}/api/ai/detect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'test message' }),
        signal: controller.signal,
      }),
      timeout(12_000),
    ]);

    if (!res || !res.ok) {
      const status = res ? res.status : 'NO_RESPONSE';
      throw new Error(`Request failed: ${status}`);
    }

    const json = await res.json();
    console.log('Response:', json);

    if (typeof json !== 'object' || json === null) {
      throw new Error('Invalid JSON response');
    }

    console.log('Detect endpoint OK');
  } catch (err) {
    console.error('Test failed:', err);
    process.exitCode = 1;
  } finally {
    clearTimeout(timer);
  }
}

main();
