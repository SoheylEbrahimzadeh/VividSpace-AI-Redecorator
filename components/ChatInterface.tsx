
import React, { useState, useContext } from 'react';
import { TranslationsContext } from '../context/TranslationsContext';

interface ChatInterfaceProps {
  onMessageSubmit: (message: string) => void;
  disabled: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onMessageSubmit, disabled }) => {
  const { t } = useContext(TranslationsContext);
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onMessageSubmit(message.trim());
      setMessage('');
    }
  };

  return (
    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
      <h3 className="font-semibold mb-3 text-rose-400">{t('chatTitle')}</h3>
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t('chatPlaceholder')}
          disabled={disabled}
          className="flex-grow bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled || !message.trim()}
          className="px-4 py-2 bg-rose-600 text-white font-semibold rounded-md hover:bg-rose-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
        >
          {t('sendButton')}
        </button>
      </form>
    </div>
  );
};