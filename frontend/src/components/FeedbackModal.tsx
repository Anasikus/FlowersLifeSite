import React, { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";


interface FeedbackModalProps {
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ onClose }) => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [sending, setSending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.trim()) {
      setError("Пожалуйста, напишите сообщение.");
      return;
    }
    setError(null);
    setSending(true);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      if (response.ok) {
        setSuccess(true);
      } else {
        throw new Error("Ошибка сервера");
      }
    } catch {
      setError("Ошибка при отправке. Попробуйте позже.");
    } finally {
      setSending(false);
    }
  };

  if (success) {
    return (
      <div style={modalOverlayStyle}>
        <div style={modalStyle}>
          <h2>Спасибо за ваш отзыв!</h2>
          <button onClick={onClose}>Закрыть</button>
        </div>
      </div>
    );
  }

  return (
    <div style={modalOverlayStyle}>
      <div style={modalStyle}>
        <h2>Обратная связь</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Имя (необязательно)
            <input
              type="text"
              value={name}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            />
          </label>
          <br />
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            />
          </label>
          <br />
          <label>
            Сообщение*
            <textarea
              value={message}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
              required
              rows={5}
              style={{ width: "100%" }}
            />
          </label>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <button type="submit" disabled={sending}>
            {sending ? "Отправка..." : "Отправить"}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={sending}
            style={{ marginLeft: 10 }}
          >
            Отмена
          </button>
        </form>
      </div>
    </div>
  );
};

const modalOverlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 10000,
};

const modalStyle: React.CSSProperties = {
  backgroundColor: "#fff",
  padding: "20px",
  borderRadius: "8px",
  width: "90%",
  maxWidth: "400px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
};

export default FeedbackModal;
