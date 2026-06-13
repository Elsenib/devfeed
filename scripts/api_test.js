const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function run() {
  const base = 'http://localhost:4000';
  async function register(name, email, pass) {
    const res = await fetch(base + '/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password: pass })
    });
    const data = await res.json();
    console.log('register', email, JSON.stringify(data));
    return data;
  }

  async function login(email, pass) {
    const res = await fetch(base + '/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass })
    });
    const data = await res.json();
    console.log('login', email, JSON.stringify(data));
    return data;
  }

  try {
    await register('UserA','usera@test.local','pass1234');
  } catch (e) { console.warn('register A failed', e.message); }
  try {
    await register('UserB','userb@test.local','pass1234');
  } catch (e) { console.warn('register B failed', e.message); }

  try { await login('usera@test.local','pass1234'); } catch (e) { console.warn('login A failed', e.message); }
  try { await login('userb@test.local','pass1234'); } catch (e) { console.warn('login B failed', e.message); }
}

run().catch(err => { console.error(err); process.exit(1); });
