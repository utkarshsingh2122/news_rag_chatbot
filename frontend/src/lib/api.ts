export const API = import.meta.env.VITE_API_BASE!;
export const WS_URL = import.meta.env.VITE_WS_URL!;

export async function sendChat(sessionId: string, message: string) {
  const res = await fetch(`${API}/chat`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ sessionId, message })
  });
  if (!res.ok) throw new Error('API error');
  return res.json(); // {answer, sources}
}

export async function fetchHistory(sessionId: string) {
  const res = await fetch(`${API}/sessions/${sessionId}`);
  return res.json();
}

export async function resetSession(sessionId: string) {
  await fetch(`${API}/sessions/${sessionId}`, { method: 'DELETE' });
}
console.log('API base =', API, 'WS =', WS_URL);


