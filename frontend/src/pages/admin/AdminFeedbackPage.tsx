import { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/AdminFeedbackPage.css';
import AdminHeader from '../../components/AdminHeader';

interface FeedbackThread {
  id: number;
  name: string;
  mail: string;
  subject: string;
  status: string;
  created_at: string;
}

interface Message {
  id: number;
  sender: 'admin' | 'user';
  text: string;
  created_at: string;
}

const AdminFeedbackPage = () => {
  const [threads, setThreads] = useState<FeedbackThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<FeedbackThread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState('');
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem('token');
    setToken(t);
    if (t) fetchThreads(t);
  }, []);

  const fetchThreads = async (token: string) => {
    try {
      const res = await axios.get('/api/admin/feedback/threads', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setThreads(res.data);
    } catch (err) {
      console.error('Ошибка загрузки обращений:', err);
    }
  };

  const fetchMessages = async (threadId: number) => {
    try {
      const res = await axios.get(`/api/admin/feedback/threads/${threadId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data);
    } catch (err) {
      console.error('Ошибка загрузки сообщений:', err);
    }
  };

  const handleThreadClick = (thread: FeedbackThread) => {
    setSelectedThread(thread);
    fetchMessages(thread.id);
  };

  const sendReply = async () => {
    if (!reply.trim() || !selectedThread) return;

    try {
      await axios.post(
        `/api/admin/feedback/threads/${selectedThread.id}/reply`,
        { text: reply },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReply('');
      fetchMessages(selectedThread.id);
    } catch (err) {
      console.error('Ошибка отправки ответа:', err);
    }
  };

  const closeThread = async () => {
    if (!selectedThread) return;

    try {
      await axios.post(
        `/api/admin/feedback/threads/${selectedThread.id}/close`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedThread(null);
      fetchThreads(token!);
    } catch (err) {
      console.error('Ошибка закрытия:', err);
    }
  };

  const reopenThread = async () => {
    if (!selectedThread) return;

    try {
      await axios.post(
        `/api/admin/feedback/threads/${selectedThread.id}/reopen`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchThreads(token!);
      setSelectedThread({ ...selectedThread, status: 'open' }); // локально обновляем статус
    } catch (err) {
      console.error('Ошибка при повторном открытии обращения:', err);
    }
  };

  const closeChatView = () => {
    setSelectedThread(null);
  };

  return (
    <>
      <AdminHeader />
      <div className="admin-feedback-page">
        <div className="admin-feedback">
          <h2>Обращения пользователей</h2>
          <div className="admin-layout">
            <div className="thread-list">
              {threads.map((t) => (
                <div
                  key={t.id}
                  className={`thread-item ${selectedThread?.id === t.id ? 'active' : ''}`}
                  onClick={() => handleThreadClick(t)}
                >
                  <h4>{t.subject}</h4>
                  <p>{t.name} ({t.mail})</p>
                  <span>Статус: {t.status}</span>
                  <small>{new Date(t.created_at).toLocaleString()}</small>
                </div>
              ))}
            </div>

            {selectedThread && (
              <div className="thread-detail">
                <h3>{selectedThread.subject}</h3>
                <div className="chat-box">
                  {messages.map((m) => (
                    <div key={m.id} className={`msg ${m.sender}`}>
                      <div>{m.text}</div>
                      <small>{new Date(m.created_at).toLocaleString()}</small>
                    </div>
                  ))}
                </div>
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Ваш ответ..."
                />
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button onClick={sendReply}>Ответить</button>
                  <button onClick={closeChatView}>Закрыть чат</button>
                  {selectedThread.status === 'closed' ? (
                    <button onClick={reopenThread}>Открыть обращение</button>
                  ) : (
                    <button onClick={closeThread} className="close-btn">
                      Закрыть обращение
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );

};

export default AdminFeedbackPage;
