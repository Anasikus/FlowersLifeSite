import { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../../components/Header';
import '../../styles/FeedbackPage.css'; // Добавим стили

interface FeedbackThread {
  id: number;
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

const FeedbackPage = () => {
  const [threads, setThreads] = useState<FeedbackThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [mail, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [selectedThread, setSelectedThread] = useState<FeedbackThread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newReply, setNewReply] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const isGuest = !token;


  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    setToken(savedToken);
  }, []);

  const fetchThreads = () => {
    if (!token) return;

    axios
      .get('/api/feedback', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (Array.isArray(res.data)) {
          setThreads(res.data);
        } else {
          setThreads([]);
        }
      })
      .catch((err) => {
        console.error('Ошибка получения обращений:', err);
      });
  };

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    axios
      .get('/api/profile', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data = res.data;
        setName(data.name ?? '');
        setEmail(data.mail ?? '');
        fetchThreads();
      })
      .catch((err) => {
        console.error('Ошибка получения профиля:', err);
        setName('');
        setEmail('');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject || !message) {
      setError('Заполните тему и сообщение');
      return;
    }

    const payload = { subject, message, name, mail };

    setSubmitting(true);
    setError(null);

    try {
      await axios.post('/api/feedback', payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      setSubject('');
      setMessage('');
      fetchThreads();
    } catch (err) {
      console.error('Ошибка отправки обращения:', err);
      setError('Ошибка отправки обращения');
    } finally {
      setSubmitting(false);
    }
  };

  const openThreadModal = (thread: FeedbackThread) => {
    setSelectedThread(thread);
    setModalOpen(true);
    fetchMessages(thread.id);
  };

  const fetchMessages = (threadId: number) => {
    axios
      .get(`/api/feedback/${threadId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setMessages(res.data);
      })
      .catch((err) => {
        console.error('Ошибка загрузки сообщений:', err);
      });
  };

  const sendReply = () => {
    if (!selectedThread || !newReply.trim()) return;

    axios
      .post(
        `/api/feedback/${selectedThread.id}/messages`,
        { threadId: selectedThread.id, message: newReply },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then(() => {
        setNewReply('');
        fetchMessages(selectedThread.id);
      })
      .catch((err) => {
        console.error('Ошибка отправки сообщения:', err);
      });
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <>
      <Header />
      <div className="feedback-container">
        <form onSubmit={handleSubmit} className="feedback-form">
          <h2>Создать обращение</h2>
          <input
            type="text"
            placeholder="Имя"
            value={name}
            onChange={(e) => setName(e.target.value)}
            readOnly={!isGuest}
          />
          <input
            type="email"
            placeholder="Email"
            value={mail}
            onChange={(e) => setEmail(e.target.value)}
            readOnly={!isGuest}
          />

          <input
            type="text"
            placeholder="Тема"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
          <textarea
            placeholder="Сообщение"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={submitting}>
            {submitting ? 'Отправка...' : 'Отправить'}
          </button>
        </form>

        <div className="thread-list">
          <h3>Мои обращения:</h3>
          {threads.length === 0 ? (
            <p>Обращений нет</p>
          ) : (
            <div className="thread-cards">
              {threads.map((t) => (
                <div
                  className="thread-card"
                  key={t.id}
                  onClick={() => openThreadModal(t)}
                >
                  <h4>{t.subject}</h4>
                  <p>Статус: {t.status}</p>
                  <span>{new Date(t.created_at).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {modalOpen && selectedThread && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Переписка: {selectedThread.subject}</h3>
            <div className="chat-box">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`chat-message ${
                    m.sender === 'user' ? 'user-msg' : 'admin-msg'
                  }`}
                >
                  <div>{m.text}</div>
                  <small>{new Date(m.created_at).toLocaleString()}</small>
                </div>
              ))}
            </div>
            <div className="chat-input">
              <textarea
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                placeholder="Введите сообщение..."
              />
              <button onClick={sendReply}>Отправить</button>
            </div>
            <button className="close-btn" onClick={() => setModalOpen(false)}>
              Закрыть
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackPage;
