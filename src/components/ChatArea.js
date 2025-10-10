import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FaPaperPlane, FaSmile, FaPaperclip, FaBroadcastTower } from 'react-icons/fa';

const ChatContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--bg-secondary);
  border: 2px solid var(--border-neon);
  border-radius: 8px;
  margin: 0 20px 20px 0;
  height: calc(100% - 20px);
  box-shadow: var(--glow-cyan);
  position: relative;
  overflow: hidden;
`;

const TerminalHeader = styled.div`
  background: linear-gradient(90deg, var(--bg-elevated) 0%, rgba(0, 255, 65, 0.1) 100%);
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-neon);
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TerminalDots = styled.div`
  display: flex;
  gap: 6px;
`;

const TerminalDot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--fg-error);
  box-shadow: 0 0 5px currentColor;
  
  &:nth-child(2) {
    background: var(--fg-warning);
  }
  
  &:nth-child(3) {
    background: var(--fg-primary);
  }
`;

const TerminalTitle = styled.div`
  margin-left: 12px;
  font-size: 12px;
  color: var(--fg-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const ChannelTitle = styled.h2`
  margin: 0;
  font-size: 1.2rem;
  color: var(--fg-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-shadow: var(--glow-green);
  font-family: inherit;
`;

const ChannelDescription = styled.p`
  margin: 0.25rem 0 0 0;
  font-size: 0.9rem;
  color: var(--fg-muted);
  font-family: inherit;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: var(--bg-primary);
  position: relative;
  z-index: 3;
  
  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--bg-secondary);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--border-neon);
    border-radius: 4px;
    border: 1px solid var(--bg-secondary);
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: var(--border-cyan);
    box-shadow: 0 0 5px var(--border-cyan);
  }
  
  /* Firefox scrollbar styling */
  scrollbar-width: thin;
  scrollbar-color: var(--border-neon) var(--bg-secondary);
`;

const Message = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  min-height: 70px;
  background: var(--bg-elevated);
  border: 1px solid ${props => {
    if (props.$isError) return 'var(--border-error)';
    if (props.$isTemporary) return 'var(--border-warning)';
    return props.$isBroadcast ? 'var(--border-magenta)' : 'var(--border-cyan)';
  }};
  border-radius: 4px;
  padding: 12px;
  border-left: 3px solid ${props => {
    if (props.$isError) return 'var(--border-error)';
    if (props.$isTemporary) return 'var(--border-warning)';
    return props.$isBroadcast ? 'var(--border-magenta)' : 'var(--border-neon)';
  }};
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  opacity: ${props => props.$isTemporary ? 0.7 : 1};

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, ${props => props.$isBroadcast ? 'rgba(167, 139, 250, 0.1)' : 'rgba(0, 255, 65, 0.1)'}, transparent);
    transition: left 0.5s ease;
  }

  &:hover::before {
    left: 100%;
  }

  &:hover {
    border-color: ${props => {
      if (props.$isError) return 'var(--border-error)';
      if (props.$isTemporary) return 'var(--border-warning)';
      return props.$isBroadcast ? 'var(--border-magenta)' : 'var(--border-neon)';
    }};
    box-shadow: ${props => {
      if (props.$isError) return 'var(--glow-red)';
      if (props.$isTemporary) return 'var(--glow-yellow)';
      return props.$isBroadcast ? 'var(--glow-magenta)' : 'var(--glow-green)';
    }};
    transform: translateX(4px);
  }
`;

const MessageAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--fg-primary) 0%, var(--fg-secondary) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bg-primary);
  font-weight: bold;
  font-size: 0.9rem;
  flex-shrink: 0;
  box-shadow: 0 0 10px currentColor;
`;

const MessageContent = styled.div`
  flex: 1;
`;

const MessageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
`;

const MessageUsername = styled.span`
  font-weight: 600;
  color: var(--fg-primary);
  font-size: 0.9rem;
  text-shadow: var(--glow-green);
  font-family: inherit;
`;

const MessageTime = styled.span`
  font-size: 0.8rem;
  color: var(--fg-dim);
  font-family: inherit;
`;

const MessageText = styled.div`
  color: var(--fg-muted);
  line-height: 1.4;
  word-wrap: break-word;
  font-family: inherit;
`;

const WelcomeMessage = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: var(--fg-muted);
`;

const WelcomeTitle = styled.h3`
  font-size: 2rem;
  margin: 0 0 1rem 0;
  color: var(--fg-primary);
  font-weight: 300;
  text-shadow: var(--glow-green);
  font-family: inherit;
`;

const WelcomeSubtitle = styled.p`
  font-size: 1.1rem;
  margin: 0;
  color: var(--fg-muted);
  font-family: inherit;
`;

const InputContainer = styled.div`
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-cyan);
  background: var(--bg-elevated);
  position: relative;
  z-index: 3;
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-cyan);
  border-radius: 4px;
  padding: 0.5rem 1rem;
  transition: all 0.3s ease;

  &:focus-within {
    border-color: var(--border-neon);
    box-shadow: var(--glow-green);
  }
`;

const AttachmentButton = styled.button`
  background: none;
  border: none;
  color: var(--fg-muted);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.3s ease;

  &:hover {
    background: var(--bg-elevated);
    color: var(--fg-primary);
    box-shadow: var(--glow-cyan);
  }
`;

const MessageInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  font-size: 1rem;
  padding: 0.5rem 0;
  color: var(--fg-primary);
  background: transparent;
  font-family: inherit;

  &::placeholder {
    color: var(--fg-dim);
  }
`;

const EmojiButton = styled.button`
  background: none;
  border: none;
  color: var(--fg-muted);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.3s ease;

  &:hover {
    background: var(--bg-elevated);
    color: var(--fg-primary);
    box-shadow: var(--glow-cyan);
  }
`;

const SendButton = styled.button`
  background: var(--bg-elevated);
  border: 1px solid var(--border-neon);
  color: var(--fg-primary);
  padding: 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  text-shadow: var(--glow-green);

  &:hover {
    box-shadow: var(--glow-green);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const BroadcastButton = styled.button`
  background: var(--bg-elevated);
  border: 1px solid var(--border-magenta);
  color: var(--fg-primary);
  padding: 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  text-shadow: var(--glow-magenta);
  margin-left: 0.5rem;

  &:hover {
    box-shadow: var(--glow-magenta);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const TypingIndicator = styled.div`
  padding: 0.5rem 1rem;
  font-style: italic;
  color: var(--fg-muted);
  font-size: 0.9rem;
  font-family: inherit;
`;

const LoadingIndicator = styled.div`
  padding: 2rem 1rem;
  text-align: center;
  color: var(--fg-muted);
  font-size: 0.9rem;
  font-family: inherit;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-cyan);
  border-radius: 50%;
  border-top-color: var(--fg-primary);
  animation: spin 1s ease-in-out infinite;
  margin-right: 0.5rem;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

function ChatArea({ messages, onSendMessage, onBroadcastMessage, user, currentChannel, isLoadingMessages }) {
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Format wallet address for display
  const formatWalletAddress = (address) => {
    if (!address) return '';
    // Check if it's a wallet address (44 characters, base58)
    if (address.length === 44 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(address)) {
      return `${address.slice(0, 4)}...${address.slice(-4)}`;
    }
    return address;
  };

  // Check if username is a wallet address
  const isWalletAddress = (username) => {
    return username && username.length === 44 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(username);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (messageText.trim() && user) {
      onSendMessage(messageText.trim());
      setMessageText('');
    }
  };

  const handleBroadcastMessage = () => {
    if (messageText.trim() && user) {
      // Show confirmation for broadcast
      if (window.confirm('Are you sure you want to broadcast this message to all channels?')) {
        onBroadcastMessage(messageText.trim());
        setMessageText('');
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (e.ctrlKey) {
        // Direct broadcast without confirmation for keyboard shortcut
        if (messageText.trim() && user) {
          onBroadcastMessage(messageText.trim());
          setMessageText('');
        }
      } else {
        handleSendMessage();
      }
    }
  };

  const handleInputChange = (e) => {
    setMessageText(e.target.value);
    
    // Typing indicator logic
    if (!isTyping) {
      setIsTyping(true);
    }
    
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getChannelInfo = (channelId) => {
    const channelMap = {
      general: { name: 'GENERAL', description: 'General discussion channel' },
      trading: { name: 'TRADING', description: 'Trading discussions and market analysis' },
      nft: { name: 'NFT', description: 'NFT marketplace and collections' },
      defi: { name: 'DEFI', description: 'DeFi protocols and yield farming' },
      announcements: { name: 'ANNOUNCEMENTS', description: 'Important updates and news' },
      voice1: { name: 'VOICE_CALL_#1*', description: 'Voice call channel' },
      voice2: { name: 'VOICE_CALL_#2*', description: 'Voice call channel' },
      voice3: { name: 'VOICE_CALL_#3*', description: 'Voice call channel' }
    };
    return channelMap[channelId] || { name: 'UNKNOWN', description: 'Unknown channel' };
  };

  const channelInfo = getChannelInfo(currentChannel);
  const isVoiceCallChannel = currentChannel.startsWith('voice');

  return (
    <ChatContainer>
      <TerminalHeader>
        <TerminalDots>
          <TerminalDot />
          <TerminalDot />
          <TerminalDot />
        </TerminalDots>
        <TerminalTitle>CHAT_TERMINAL</TerminalTitle>
      </TerminalHeader>
      
      <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-cyan)', background: 'var(--bg-elevated)' }}>
        <ChannelTitle>
          <span className="ansi-cyan">#</span>{channelInfo.name}
        </ChannelTitle>
        <ChannelDescription>{channelInfo.description}</ChannelDescription>
      </div>

      <MessagesContainer>
        {(() => {
          // Show "Coming soon" message for voice call channels
          if (isVoiceCallChannel) {
            return (
              <WelcomeMessage>
                <WelcomeTitle>
                  <span className="ansi-magenta">VOICE_CALL</span> <span className="ansi-cyan">FEATURE</span>
                </WelcomeTitle>
                <WelcomeSubtitle>
                  <span className="ansi-yellow">Coming Soon!</span> Voice calling functionality is currently under development.
                </WelcomeSubtitle>
              </WelcomeMessage>
            );
          }

          const filteredMessages = messages.filter(message => message.channel === currentChannel);
          
          if (isLoadingMessages) {
            return (
              <LoadingIndicator>
                <LoadingSpinner />
                <span className="ansi-cyan">LOADING MESSAGES</span> <span className="ansi-yellow">FOR #{channelInfo.name}...</span>
              </LoadingIndicator>
            );
          }
          
          return filteredMessages.length === 0 ? (
            <WelcomeMessage>
              <WelcomeTitle>
                <span className="ansi-green">INITIALIZING</span> <span className="ansi-cyan">CHAT_TERMINAL</span>
              </WelcomeTitle>
              <WelcomeSubtitle>
                <span className="ansi-yellow">Welcome to #{channelInfo.name}!</span> Start a conversation below.
              </WelcomeSubtitle>
            </WelcomeMessage>
          ) : (
            filteredMessages.map((message) => (
            <Message key={message.id} $isBroadcast={message.isBroadcast} $isTemporary={message.isTemporary} $isError={message.isError}>
              <MessageAvatar>
                {message.isError ? '!' : (isWalletAddress(message.username) ? 'W' : message.username.charAt(0).toUpperCase())}
              </MessageAvatar>
              <MessageContent>
                <MessageHeader>
                  <MessageUsername>
                    <span className={message.isError ? "ansi-red" : (message.isBroadcast ? "ansi-magenta" : "ansi-green")}>
                      {message.isError ? 'SYSTEM' : (isWalletAddress(message.username) ? formatWalletAddress(message.username) : message.username)}
                      {isWalletAddress(message.username) && !message.isError && <span className="ansi-cyan"> [WALLET]</span>}
                      {message.isBroadcast && <span className="ansi-magenta"> [BROADCAST]</span>}
                      {message.isTemporary && <span className="ansi-yellow"> [SENDING...]</span>}
                      {message.isError && <span className="ansi-red"> [ERROR]</span>}
                    </span>
                  </MessageUsername>
                  <MessageTime>
                    <span className="ansi-dim">[{formatTime(message.timestamp)}]</span>
                  </MessageTime>
                </MessageHeader>
                <MessageText className={message.isError ? "ansi-red" : ""}>
                  {message.text}
                  {message.isError && (
                    <button 
                      onClick={() => window.location.reload()} 
                      style={{
                        marginLeft: '10px',
                        padding: '4px 8px',
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-error)',
                        color: 'var(--fg-primary)',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      Retry
                    </button>
                  )}
                </MessageText>
              </MessageContent>
            </Message>
          ))
          );
        })()}
        <div ref={messagesEndRef} />
      </MessagesContainer>

      {isTyping && (
        <TypingIndicator>
          <span className="ansi-yellow">Someone is typing</span><span className="cursor-blink">█</span>
        </TypingIndicator>
      )}

      {!isVoiceCallChannel && (
        <InputContainer>
          <InputWrapper>
            <AttachmentButton>
              <FaPaperclip />
            </AttachmentButton>
            <MessageInput
              type="text"
              placeholder={user ? "Type a message... (Enter to send, Ctrl+Enter to broadcast)" : "Connect to start chatting..."}
              value={messageText}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              disabled={!user}
            />
            <EmojiButton>
              <FaSmile />
            </EmojiButton>
            <SendButton 
              onClick={handleSendMessage}
              disabled={!messageText.trim() || !user}
              title="Send to current channel (Enter)"
            >
              <FaPaperPlane />
            </SendButton>
            <BroadcastButton 
              onClick={handleBroadcastMessage}
              disabled={!messageText.trim() || !user}
              title="Broadcast to all channels (Ctrl+Enter)"
            >
              <FaBroadcastTower />
            </BroadcastButton>
          </InputWrapper>
        </InputContainer>
      )}
    </ChatContainer>
  );
}

export default ChatArea;
