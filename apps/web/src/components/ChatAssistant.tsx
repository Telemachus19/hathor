import React, { useState } from 'react';
import { Send, X } from 'lucide-react';
import { AnkhIcon, PharaohIcon } from '../assets';

import { fetchRecommendations, RecommendationItem } from '../services/api/assistant';
import { useUserLibrary } from '../services/api/library';
import { useNavigate } from '@tanstack/react-router';
import styles from '../styles/ChatAssistant.module.css';

interface Message {
  id: string;
  sender: 'user' | 'oracle';
  text: string;
  items?: RecommendationItem[];
  source?: string;
}

interface HathorChatAssistantProps {
  userOwnedGameIds?: string[];
}

export const HathorChatAssistant: React.FC<HathorChatAssistantProps> = ({
  userOwnedGameIds = [],
}) => {
  const libraryQuery = useUserLibrary();
  const effectiveOwnedIds =
    userOwnedGameIds.length > 0
      ? userOwnedGameIds
      : (libraryQuery.data || []).map((lic) => lic.gameId);

  const [isOpen, setIsOpen] = useState(false);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'oracle',
      text: 'Hello! I am your Hathor AI assistant. Ask me anything about games, genres, or get personalized recommendations based on your library!',
    },
  ]);

  const navigate = useNavigate();

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsgId = `user-${Date.now()}`;
    const userMsg: Message = { id: userMsgId, sender: 'user', text: textToSend };

    const currentHistory = messages.map((m) => ({ sender: m.sender, text: m.text }));

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    console.log('[Hathor AI Chatbot] Sending user prompt & history to AI engine:', textToSend);

    try {
      const response = await fetchRecommendations({
        prompt: textToSend,
        ownedGameIds: effectiveOwnedIds,
        limit: 4,
        chatHistory: currentHistory,
      });

      console.log('[Hathor AI Chatbot] Received API response:', response);

      const items = response?.data?.items || [];
      const source = response?.data?.source || 'curated_fallback';
      const conversationalReply = response?.data?.conversationalReply;

      let replyText =
        conversationalReply ||
        `I retrieved ${items.length} titles from the Hathor catalog matching "${textToSend}".`;
      if (items.length === 0 && !conversationalReply) {
        replyText = `No exact matches found for "${textToSend}". Try searching for categories like RPG, Cyberpunk, Strategy, or Indie!`;
      }

      const oracleMsg: Message = {
        id: `oracle-${Date.now()}`,
        sender: 'oracle',
        text: replyText,
        items,
        source,
      };

      setMessages((prev) => [...prev, oracleMsg]);
    } catch (error) {
      console.error('[Hathor AI Chatbot] Error communicating with recommendation service:', error);
      const errorMsg: Message = {
        id: `oracle-err-${Date.now()}`,
        sender: 'oracle',
        text: 'Forgive me, traveler. An anomaly interrupted the search. Please try again!',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputPrompt);
  };

  const handleQuickPrompt = (promptText: string) => {
    handleSendMessage(promptText);
  };

  const handleNavigateToGame = (slug: string) => {
    try {
      navigate({ to: `/store/games/$slug`, params: { slug } });
    } catch {
      window.location.href = `/store/${slug}`;
    }
  };

  return (
    <>
      {/* Floating Action Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={styles.floatingTrigger}
        type="button"
        title="Hathor AI Assistant"
      >
        <div className={styles.pulseRing} />
        {isOpen ? <X size={26} /> : <AnkhIcon size={26} />}
      </button>

      {/* Expanding Chat Panel */}
      {isOpen && (
        <div className={styles.chatContainer}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <AnkhIcon size={22} className={styles.headerIcon} />
              <h3 className={styles.title}>
                HATHOR <span className={styles.titleAccent}>AI ASSISTANT</span>
              </h3>
            </div>
          </div>

          {/* Messages List */}
          <div className={styles.messagesList}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`${styles.messageRow} ${msg.sender === 'user' ? styles.userRow : ''}`}
              >
                <div
                  className={`${styles.avatar} ${
                    msg.sender === 'oracle' ? styles.oracleAvatar : styles.userAvatar
                  }`}
                >
                  {msg.sender === 'oracle' ? <AnkhIcon size={22} /> : <PharaohIcon size={28} />}
                </div>

                <div
                  className={`${styles.bubble} ${
                    msg.sender === 'oracle' ? styles.oracleBubble : styles.userBubble
                  }`}
                >
                  <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>

                  {/* Render Mini Game Cards inside Oracle Response */}
                  {msg.items && msg.items.length > 0 && (
                    <div style={{ marginTop: '0.75rem' }}>
                      {msg.items.map((game) => (
                        <div
                          key={game.gameId}
                          onClick={() => handleNavigateToGame(game.slug)}
                          className={styles.gameCardMini}
                        >
                          <div className={styles.miniTitle}>{game.title}</div>
                          <div className={styles.miniPrice}>{game.priceEgp} EGP</div>
                          <div className={styles.miniReason}>✨ {game.reason}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className={styles.messageRow}>
                <div className={`${styles.avatar} ${styles.oracleAvatar}`}>
                  <AnkhIcon size={22} />
                </div>
                <div className={`${styles.bubble} ${styles.oracleBubble}`}>Thinking...</div>
              </div>
            )}
          </div>

          {/* Quick Prompts & Form Footer */}
          <div className={styles.footer}>
            <div className={styles.quickPrompts}>
              {[
                'Dark Sci-Fi RPG',
                'Cyberpunk Action',
                'Games like what I play',
                'Top Indie Highlights',
              ].map((qp) => (
                <button
                  key={qp}
                  type="button"
                  onClick={() => handleQuickPrompt(qp)}
                  className={styles.promptPill}
                >
                  {qp}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className={styles.inputForm}>
              <input
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder="Ask Hathor AI..."
                className={styles.chatInput}
              />
              <button type="submit" className={styles.sendBtn} disabled={isLoading}>
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
