const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function run() {
  const base = process.env.API_BASE || 'http://localhost:4000';

  async function login(email, pass) {
    const res = await fetch(base + '/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass })
    });
    return res.json();
  }

  async function createConversation(token, email) {
    const res = await fetch(base + '/conversations', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ email })
    });
    return res.json();
  }

  async function sendMessage(token, convoId, text) {
    const res = await fetch(base + `/conversations/${convoId}/messages`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ text })
    });
    return res.json();
  }

  async function getConversation(token, convoId) {
    const res = await fetch(base + `/conversations/${convoId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  }

  try {
    const a = await login('usera@test.local','pass1234');
    const b = await login('userb@test.local','pass1234');
    console.log('A token length', !!a.token);

    const convo = await createConversation(a.token, 'userb@test.local');
    console.log('created convo', convo);

    const msg = await sendMessage(a.token, convo.id, 'Salam, bu test mesajıdır');
    console.log('sent message', msg);

    const convoDetail = await getConversation(a.token, convo.id);
    console.log('conversation detail:', JSON.stringify(convoDetail, null, 2));
  } catch (err) {
    console.error(err);
  }
}

run();
