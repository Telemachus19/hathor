import { useState, useRef, useEffect } from 'react';
import {
  Wand2,
  Send,
  X,
  RotateCcw,
  Check,
  Eye,
  EyeOff,
  Sparkles,
  Loader2,
  Bot,
  User,
  CheckCircle2,
  Flame,
  Zap,
  Layers,
  Palette,
  Code2,
  Copy,
} from 'lucide-react';
import { sendDesignerChat } from '../../../../services/api/index';
import { useAuth } from '../../../../context/AuthContext';
import styles from '../../DesignerPage.module.css';

interface Message {
  id: string;
  role: 'user' | 'agent';
  text: string;
  actionsTaken?: string[];
  proposal?: any;
  changeSummary?: string[];
  timestamp: string;
}

interface AiAssistantSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  gameId: string;
  currentTheme: { sections: any[]; pageSettings: any };
  onPreviewTheme: (theme: any | null) => void;
  onAcceptTheme: (theme: any) => void;
}

const PRESET_PROMPTS = [
  {
    label: 'Neon Cyberpunk',
    icon: Zap,
    prompt:
      'Redesign this store page with a high-contrast Neon Cyberpunk aesthetic: deep dark background (#08090d), glowing cyan (#00f0ff) and magenta (#ff0055) accents, Space Grotesk font, and dynamic layout sections.',
  },
  {
    label: 'Dark Gothic Fantasy',
    icon: Flame,
    prompt:
      'Create a dark gothic fantasy atmosphere with obsidian black background, blood-crimson (#c92a2a) and gold (#ffd43b) accents, Cinzel serif typography, and an epic hero layout.',
  },
  {
    label: 'Sci-Fi Holo',
    icon: Layers,
    prompt:
      'Give this game page a futuristic deep-space sci-fi theme with deep navy background (#060a12), emerald green (#38d39f) and azure blue (#58a6ff) accents, and clean modern card structures.',
  },
  {
    label: 'Clean Minimalist',
    icon: Palette,
    prompt:
      'Refine this page to be clean, elegant, and minimalist with subtle dark grey background (#0e1117), crisp typography (Inter), and high-legibility layout.',
  },
];

export function AiAssistantSidebar({
  isOpen,
  onClose,
  gameId,
  currentTheme,
  onPreviewTheme,
  onAcceptTheme,
}: AiAssistantSidebarProps) {
  const { accessToken } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'agent',
      text: "Hello! I'm your AI Storefront Designer. Describe how you want your game page styled, or pick a style preset below.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<'auto' | 'gemini' | 'glm'>('auto');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null);
  const [viewingJsonId, setViewingJsonId] = useState<string | null>(null);
  const [copiedJsonId, setCopiedJsonId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleCopyJson = (id: string, obj: any) => {
    try {
      navigator.clipboard.writeText(JSON.stringify(obj, null, 2));
      setCopiedJsonId(id);
      setTimeout(() => setCopiedJsonId(null), 2000);
    } catch {
      // ignore
    }
  };

  const LOADING_STEPS = [
    'Consulting Storefront Architect...',
    'Generating color harmonies & typography...',
    'Structuring layout sections & components...',
    'Validating against Hathor design schema...',
  ];

  useEffect(() => {
    let interval: any;
    if (isLoading) {
      setLoadingPhase(0);
      interval = setInterval(() => {
        setLoadingPhase((prev) => (prev + 1) % LOADING_STEPS.length);
      }, 2400);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  useEffect(() => {
    if (!isOpen && activePreviewId) {
      onPreviewTheme(null);
      setActivePreviewId(null);
    }
  }, [isOpen, activePreviewId, onPreviewTheme]);

  const handleSendMessage = async (promptToSend?: string) => {
    const text = (promptToSend || inputPrompt).trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const historyPayload = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: (m.role === 'user' ? 'user' : 'model') as 'user' | 'model',
          content: m.text,
        }));

      const res = await sendDesignerChat({
        gameId: gameId || 'draft',
        message: text,
        currentTheme,
        conversationHistory: historyPayload,
        provider: selectedProvider,
        token: accessToken || undefined,
      });

      if (res.success && res.data) {
        const agentResponse = res.data;
        const proposalObj = agentResponse.proposedTheme || (agentResponse as any).proposal;
        let replyText = agentResponse.reply || '';

        // If the reply contains raw JSON markdown, replace with friendly conversational text
        if (proposalObj && (replyText.includes('```json') || replyText.trim().startsWith('{'))) {
          replyText = `Here is the custom theme layout crafted for your game based on your request! You can live-preview the changes on your canvas, accept, or reject the proposal below.`;
        } else if (!proposalObj && (replyText.includes('```json') || replyText.trim().startsWith('{'))) {
          const jsonMatch = replyText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) || replyText.match(/(\{[\s\S]*"pageSettings"[\s\S]*\})/);
          if (jsonMatch) {
            try {
              const extracted = JSON.parse(jsonMatch[1]);
              if (extracted.sections || extracted.pageSettings) {
                replyText = `Here is the custom theme layout crafted for your game! You can preview, accept, or reject the proposal below.`;
                agentResponse.proposedTheme = extracted;
              }
            } catch {
              // ignore
            }
          }
        }

        const agentMessage: Message = {
          id: `agent-${Date.now()}`,
          role: 'agent',
          text: replyText,
          actionsTaken: agentResponse.actionsTaken,
          proposal: agentResponse.proposedTheme || (agentResponse as any).proposal,
          changeSummary: agentResponse.changeSummary,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, agentMessage]);

        if (agentResponse.proposedTheme || (agentResponse as any).proposal) {
          setActivePreviewId(agentMessage.id);
          onPreviewTheme(agentResponse.proposedTheme || (agentResponse as any).proposal);
        }
      } else {
        const rawErr = res.error?.message || JSON.stringify(res.error) || 'Failed to generate theme';
        let friendlyMsg = rawErr;
        if (rawErr.includes('429') || rawErr.includes('RESOURCE_EXHAUSTED') || rawErr.includes('credits are depleted')) {
          friendlyMsg = 'Google API Quota reached (429 / Credits depleted). If you recently added/removed billing in Google Cloud, please ensure your project has the Free Tier enabled or check your Google AI Studio key.';
        }
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'agent',
            text: friendlyMsg,
            actionsTaken: [`Error: ${friendlyMsg.slice(0, 40)}...`],
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err: any) {
      let friendlyMsg = err.message || 'Connection error';
      if (friendlyMsg.includes('Failed to fetch') || friendlyMsg.includes('NetworkError')) {
        friendlyMsg = 'The request took longer than expected or was interrupted. The backend is processing; please retry shortly.';
      }
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'agent',
          text: friendlyMsg,
          actionsTaken: [`Error: ${err.message || 'network_error'}`],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePreview = (msg: Message) => {
    if (!msg.proposal) return;
    if (activePreviewId === msg.id) {
      onPreviewTheme(null);
      setActivePreviewId(null);
    } else {
      onPreviewTheme(msg.proposal);
      setActivePreviewId(msg.id);
    }
  };

  const handleApplyProposal = (msg: Message) => {
    if (!msg.proposal) return;
    onAcceptTheme(msg.proposal);
    onPreviewTheme(null);
    setActivePreviewId(null);

    setMessages((prev) => [
      ...prev,
      {
        id: `sys-${Date.now()}`,
        role: 'agent',
        text: 'Theme applied to canvas! You can fine-tune individual blocks in the inspector or use Undo if needed.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleRejectProposal = (msg: Message) => {
    if (activePreviewId === msg.id) {
      onPreviewTheme(null);
      setActivePreviewId(null);
    }
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, proposal: null, changeSummary: undefined } : m))
    );
    setMessages((prev) => [
      ...prev,
      {
        id: `sys-${Date.now()}`,
        role: 'agent',
        text: 'Theme proposal rejected. Tell me what changes or other styles you would prefer.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleDiscardPreview = () => {
    onPreviewTheme(null);
    setActivePreviewId(null);
  };

  const handleResetChat = () => {
    onPreviewTheme(null);
    setActivePreviewId(null);
    setMessages([
      {
        id: 'welcome',
        role: 'agent',
        text: "Conversation reset. Tell me how you'd like your store page to look or pick a preset below.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  if (!isOpen) return null;

  return (
    <aside
      className={styles.rightSidebar}
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: '300px',
        backgroundColor: '#1c2028',
        borderLeft: '1px solid #393e46',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        zIndex: 100,
        boxShadow: '-6px 0 24px rgba(0, 0, 0, 0.65)',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid #393e46',
          backgroundColor: '#181c24',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 4,
              backgroundColor: 'rgba(253, 112, 20, 0.15)',
              border: '1px solid rgba(253, 112, 20, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fd7014',
            }}
          >
            <Wand2 size={15} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: '#eeeeee',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  fontFamily: 'monospace',
                }}
              >
                AI Storefront Assistant
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value as any)}
                title="Select AI Agent Engine"
                style={{
                  backgroundColor: '#121620',
                  border: '1px solid #393e46',
                  borderRadius: 3,
                  color: selectedProvider === 'glm' ? '#00f3ff' : selectedProvider === 'gemini' ? '#fd7014' : '#eeeeee',
                  fontSize: 9,
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  padding: '2px 4px',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="auto">⚡ Auto (Best Engine)</option>
                <option value="gemini">✨ Gemini 2.5</option>
                <option value="glm">🚀 GLM 5.2</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            onClick={handleResetChat}
            title="Reset Chat"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#8c9aaa',
              cursor: 'pointer',
              padding: 6,
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#eeeeee')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#8c9aaa')}
          >
            <RotateCcw size={14} />
          </button>
          <button
            onClick={onClose}
            title="Close Sidebar"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#8c9aaa',
              cursor: 'pointer',
              padding: 6,
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#eeeeee')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#8c9aaa')}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {activePreviewId && (
        <div
          style={{
            padding: '8px 14px',
            backgroundColor: 'rgba(253, 112, 20, 0.1)',
            borderBottom: '1px solid rgba(253, 112, 20, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 11,
            color: '#fd7014',
            fontWeight: 700,
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Eye size={13} /> Live Preview on Canvas
          </span>
          <button
            onClick={handleDiscardPreview}
            style={{
              background: 'transparent',
              border: '1px solid rgba(253, 112, 20, 0.35)',
              color: '#fd7014',
              fontSize: 10,
              padding: '2px 8px',
              borderRadius: 3,
              cursor: 'pointer',
              fontWeight: 700,
              fontFamily: 'monospace',
            }}
          >
            Revert
          </button>
        </div>
      )}
      <style>{`
        @keyframes hathorAiSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes hathorAiPulseGlow {
          0%, 100% { border-color: rgba(253, 112, 20, 0.3); box-shadow: 0 0 8px rgba(253, 112, 20, 0.1); }
          50% { border-color: rgba(253, 112, 20, 0.6); box-shadow: 0 0 14px rgba(253, 112, 20, 0.25); }
        }
        @keyframes hathorProgressBar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
      `}</style>

      {/* Messages Scroll Area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
              gap: 4,
            }}
          >
            {/* Sender Label */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 10,
                color: '#8c9aaa',
                fontFamily: 'monospace',
                padding: '0 2px',
              }}
            >
              {msg.role === 'user' ? (
                <>
                  <span>You</span>
                  <User size={10} />
                </>
              ) : (
                <>
                  <Bot size={10} style={{ color: '#fd7014' }} />
                  <span style={{ color: '#d0d8e4', fontWeight: 700 }}>AI Assistant</span>
                </>
              )}
              <span>• {msg.timestamp}</span>
            </div>

            {/* Message Bubble */}
            <div
              style={{
                maxWidth: '92%',
                padding: '10px 13px',
                borderRadius: msg.role === 'user' ? '8px 8px 2px 8px' : '8px 8px 8px 2px',
                backgroundColor: msg.role === 'user' ? '#2d3340' : '#181c24',
                color: '#eeeeee',
                fontSize: 12,
                lineHeight: 1.55,
                border: msg.role === 'user' ? '1px solid rgba(253, 112, 20, 0.4)' : '1px solid #393e46',
                wordBreak: 'break-word',
              }}
            >
              {msg.text}
            </div>

            {/* Proposal Card */}
            {msg.proposal && (
              <div
                style={{
                  marginTop: 6,
                  width: '100%',
                  backgroundColor: '#181c24',
                  border: '1px solid rgba(253, 112, 20, 0.4)',
                  borderRadius: 6,
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  boxSizing: 'border-box',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    color: '#fd7014',
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    fontFamily: 'monospace',
                  }}
                >
                  <Sparkles size={13} /> Theme Proposal
                </div>

                {msg.changeSummary && msg.changeSummary.length > 0 && (
                  <div style={{ fontSize: 11, color: '#c0ccdb', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span
                      style={{
                        fontSize: 10,
                        color: '#8c9aaa',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        fontFamily: 'monospace',
                      }}
                    >
                      Changes:
                    </span>
                    {msg.changeSummary.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 11 }}>
                        <CheckCircle2 size={12} style={{ color: '#fd7014', marginTop: 2, flexShrink: 0 }} />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Controls */}
                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  <button
                    onClick={() => handleTogglePreview(msg)}
                    title={activePreviewId === msg.id ? 'Hide canvas preview' : 'Preview theme live on canvas'}
                    style={{
                      flex: 1,
                      padding: '7px 8px',
                      borderRadius: 4,
                      border: activePreviewId === msg.id ? '1px solid #fd7014' : '1px solid #393e46',
                      backgroundColor: activePreviewId === msg.id ? 'rgba(253, 112, 20, 0.15)' : 'transparent',
                      color: activePreviewId === msg.id ? '#fd7014' : '#eeeeee',
                      fontSize: 10,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                      transition: 'all 0.15s',
                    }}
                  >
                    {activePreviewId === msg.id ? (
                      <>
                        <EyeOff size={12} /> Hide
                      </>
                    ) : (
                      <>
                        <Eye size={12} /> Preview
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleApplyProposal(msg)}
                    title="Accept and apply theme to canvas"
                    style={{
                      flex: 1,
                      padding: '7px 8px',
                      borderRadius: 4,
                      border: 'none',
                      backgroundColor: '#fd7014',
                      color: '#1c2028',
                      fontSize: 10,
                      fontWeight: 900,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                      transition: 'background-color 0.15s',
                    }}
                  >
                    <Check size={12} /> Accept
                  </button>

                  <button
                    onClick={() => handleRejectProposal(msg)}
                    title="Reject proposal and revert canvas"
                    style={{
                      padding: '7px 8px',
                      borderRadius: 4,
                      border: '1px solid #393e46',
                      backgroundColor: 'transparent',
                      color: '#8c9aaa',
                      fontSize: 10,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#c92a2a';
                      e.currentTarget.style.color = '#ff6b6b';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#393e46';
                      e.currentTarget.style.color = '#8c9aaa';
                    }}
                  >
                    <X size={12} /> Reject
                  </button>
                </div>

                {/* View Raw JSON Toggle */}
                <div style={{ marginTop: 2, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <button
                    onClick={() => setViewingJsonId((prev) => (prev === msg.id ? null : msg.id))}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#8c9aaa',
                      fontSize: 10,
                      fontFamily: 'monospace',
                      cursor: 'pointer',
                      padding: '4px 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    <Code2 size={11} style={{ color: '#fd7014' }} />
                    <span>{viewingJsonId === msg.id ? 'Hide Raw JSON' : 'View Raw Theme JSON'}</span>
                  </button>

                  {viewingJsonId === msg.id && (
                    <div
                      style={{
                        position: 'relative',
                        backgroundColor: '#111419',
                        border: '1px solid #282f3a',
                        borderRadius: 4,
                        padding: '10px',
                        maxHeight: 240,
                        overflowY: 'auto',
                        fontFamily: 'monospace',
                        fontSize: 10,
                        color: '#9cdcfe',
                      }}
                    >
                      <button
                        onClick={() => handleCopyJson(msg.id, msg.proposal)}
                        style={{
                          position: 'sticky',
                          top: 0,
                          float: 'right',
                          backgroundColor: copiedJsonId === msg.id ? '#2b8a3e' : '#1f2530',
                          color: '#eeeeee',
                          border: '1px solid #393e46',
                          borderRadius: 3,
                          padding: '2px 6px',
                          fontSize: 9,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 3,
                          zIndex: 10,
                        }}
                      >
                        {copiedJsonId === msg.id ? (
                          <>
                            <Check size={10} /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy size={10} /> Copy JSON
                          </>
                        )}
                      </button>
                      <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                        {JSON.stringify(msg.proposal, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Dynamic Loading Indicator with Animated Spinner & Progress Track */}
        {isLoading && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              padding: '11px 14px',
              backgroundColor: '#181c24',
              borderRadius: '8px 8px 8px 2px',
              color: '#d0d8e4',
              fontSize: 11,
              width: 'fit-content',
              maxWidth: '92%',
              border: '1px solid rgba(253, 112, 20, 0.4)',
              animation: 'hathorAiPulseGlow 2s infinite ease-in-out',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Loader2
                size={14}
                style={{
                  color: '#fd7014',
                  animation: 'hathorAiSpin 0.9s linear infinite',
                  flexShrink: 0,
                }}
              />
              <span style={{ fontWeight: 600, color: '#eeeeee' }}>
                {LOADING_STEPS[loadingPhase]}
              </span>
            </div>

            <div
              style={{
                height: 3,
                width: '100%',
                backgroundColor: '#282f3a',
                borderRadius: 2,
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: '50%',
                  backgroundColor: '#fd7014',
                  borderRadius: 2,
                  animation: 'hathorProgressBar 1.8s infinite ease-in-out',
                }}
              />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {messages.length <= 2 && (
        <div
          style={{
            padding: '10px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            backgroundColor: '#181c24',
            borderTop: '1px solid #393e46',
          }}
        >
          <span
            style={{
              fontSize: 9,
              color: '#8c9aaa',
              fontWeight: 800,
              textTransform: 'uppercase',
              fontFamily: 'monospace',
            }}
          >
            Style Presets:
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {PRESET_PROMPTS.map((p, idx) => {
              const Icon = p.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(p.prompt)}
                  disabled={isLoading}
                  style={{
                    padding: '5px 9px',
                    borderRadius: 3,
                    backgroundColor: '#222831',
                    border: '1px solid #393e46',
                    color: '#d0d8e4',
                    fontSize: 10,
                    fontWeight: 700,
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(253, 112, 20, 0.5)';
                    e.currentTarget.style.color = '#eeeeee';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#393e46';
                    e.currentTarget.style.color = '#d0d8e4';
                  }}
                >
                  <Icon size={11} style={{ color: '#fd7014' }} />
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid #393e46',
          backgroundColor: '#181c24',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          flexShrink: 0,
        }}
      >
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <textarea
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Describe the aesthetic or style for your game page..."
            rows={2}
            disabled={isLoading}
            style={{
              width: '100%',
              backgroundColor: '#15181e',
              border: '1px solid #393e46',
              borderRadius: 4,
              color: '#eeeeee',
              fontSize: 11,
              padding: '8px 36px 8px 10px',
              outline: 'none',
              resize: 'none',
              fontFamily: 'inherit',
              lineHeight: 1.45,
              boxSizing: 'border-box',
            }}
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !inputPrompt.trim()}
            style={{
              position: 'absolute',
              right: 6,
              bottom: 8,
              width: 26,
              height: 26,
              borderRadius: 3,
              backgroundColor: inputPrompt.trim() && !isLoading ? '#fd7014' : '#282f3a',
              color: inputPrompt.trim() && !isLoading ? '#1c2028' : '#8c9aaa',
              border: 'none',
              cursor: inputPrompt.trim() && !isLoading ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s',
            }}
          >
            {isLoading ? (
              <Loader2
                size={13}
                style={{
                  color: '#8c9aaa',
                  animation: 'hathorAiSpin 0.9s linear infinite',
                }}
              />
            ) : (
              <Send size={12} />
            )}
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
          <span style={{ fontSize: 9, color: '#8c9aaa', fontFamily: 'monospace' }}>
            Press Enter to send • Shift+Enter for new line
          </span>
        </div>
      </div>
    </aside>
  );
}
