import { useEffect, useRef, useState } from 'react';
import { sendChat, fetchHistory, resetSession } from '../lib/api';
import '../styles/app.scss';

type Msg = { role: 'user'|'assistant', content: string };
type Source = { idx:number, title:string, url:string, score:number };

function getOrCreateSessionId() {
  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get('sessionId');
  if (fromUrl) {
    localStorage.setItem('sessionId', fromUrl);
    return fromUrl;
  }
  const stored = localStorage.getItem('sessionId');
  if (stored) return stored;
  const id = crypto.randomUUID();
  localStorage.setItem('sessionId', id);
  return id;
}

export default function Chat() {
  const [sessionId, setSessionId] = useState(() => getOrCreateSessionId());
  const [messages, setMessages] = useState<Msg[]>([]);           // current live view (doesn't auto-load on reload)
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastSources, setLastSources] = useState<Source[]>([]);
  const [showHistory, setShowHistory] = useState(false);          // drawer open/close
  const [storedHistory, setStoredHistory] = useState<Msg[] | null>(null); // fetched on demand
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function onSend() {
    const text = input.trim();
    if (!text) return;
    setInput('');
    setLastSources([]);
    setMessages(prev => [...prev, { role: 'user', content: text }, { role: 'assistant', content: '…' }]);
    setLoading(true);
    try {
      const { answer, sources } = await sendChat(sessionId, text);
      // Faux streaming
      let acc = '';
      const tokens = answer.split(/\s+/);
      for (let i = 0; i < tokens.length; i++) {
        acc += (i ? ' ' : '') + tokens[i];
        await new Promise(r => setTimeout(r, Math.min(20, 400 / tokens.length)));
        setMessages(prev => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: 'assistant', content: acc };
          return copy;
        });
      }
      setLastSources(sources || []);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '(Error contacting server)' }]);
    } finally {
      setLoading(false);
    }
  }

  async function onReset() {
    // optional confirm
    // if (!confirm('Clear this chat and start a new session?')) return;

    await resetSession(sessionId);
    const newId = crypto.randomUUID();
    localStorage.setItem('sessionId', newId);
    setSessionId(newId);

    const url = new URL(window.location.href);
    url.searchParams.set('sessionId', newId);
    window.history.replaceState(null, '', url.toString());

    setMessages([]);
    setLastSources([]);
    setStoredHistory(null);
  }

  async function openHistory() {
    setShowHistory(true);
    // Fetch only when opening (or refresh while open)
    const { history } = await fetchHistory(sessionId);
    setStoredHistory(history || []);
  }

  function closeHistory() {
    setShowHistory(false);
  }

  return (
    <div className="chat">
      <header>
        <h3>RAG News Chatbot</h3>
        <div className="row">
          <button onClick={openHistory} title="View stored history">History</button>
          <button onClick={onReset} title="Clear this session">Reset</button>
        </div>
      </header>

      <main>
        {messages.map((m, i) => (
          <div className={`msg ${m.role}`} key={i}>
            <div className="bubble">{m.content}</div>
          </div>
        ))}

        {lastSources.length > 0 && (
          <div className="sources">
            <div className="title">Sources</div>
            <ul>
              {lastSources.map(s => (
                <li key={s.idx}>
                  <a href={s.url} target="_blank" rel="noreferrer">
                  [{s.idx}] {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div ref={bottomRef} />
      </main>

      <footer>
        <input
          placeholder="Ask something about the news…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSend()}
          disabled={loading}
        />
        <button onClick={onSend} disabled={loading}>
          {loading ? 'Thinking…' : 'Send'}
        </button>
      </footer>

      {/* Slide-in history drawer */}
      <aside className={`history-drawer ${showHistory ? 'open' : ''}`}>
        <div className="hd-header">
          <strong>Session history</strong>
          <div className="spacer" />
          <button onClick={async () => {
            // refresh history while open
            const { history } = await fetchHistory(sessionId);
            setStoredHistory(history || []);
          }}>Refresh</button>
          <button onClick={closeHistory}>Close</button>
        </div>
        <div className="hd-body">
          {storedHistory?.length ? (
            storedHistory.map((m, i) => (
              <div className={`msg ${m.role}`} key={i}>
                <div className="bubble small">{m.content}</div>
              </div>
            ))
          ) : (
            <div className="empty">No stored messages yet.</div>
          )}
        </div>
      </aside>

      {/* dim background when drawer open */}
      {showHistory && <div className="backdrop" onClick={closeHistory} />}
    </div>
  );
}
