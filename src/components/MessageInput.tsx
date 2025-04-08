import { useState, useRef, useEffect } from 'react';
import './MessageInput.css';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isDisabled: boolean;
}

const MessageInput = ({ onSendMessage, isDisabled }: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isDisabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isDisabled]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isDisabled && inputRef.current && document.activeElement !== inputRef.current) {
        inputRef.current.focus();
        e.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDisabled]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isDisabled) {
      onSendMessage(message);
      setMessage('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  return (
    <form className="message-input-form" onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        type="text"
        className="message-input"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message here..."
        disabled={isDisabled}
      />
      <button 
        type="submit" 
        className="send-button"
        disabled={!message.trim() || isDisabled}
      >
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
        </svg>
      </button>
    </form>
  );
};

export default MessageInput;