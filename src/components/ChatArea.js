import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FaPaperPlane, FaSmile, FaPaperclip, FaBroadcastTower, FaBars } from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';

// API base URL - you might want to move this to a config file
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

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

  @media (max-width: 768px) {
    margin: 0 10px 10px 10px;
    height: calc(100% - 10px);
  }

  @media (max-width: 480px) {
    margin: 0 5px 5px 5px;
    height: calc(100% - 5px);
  }
`;

const TerminalHeader = styled.div`
  background: linear-gradient(90deg, var(--bg-elevated) 0%, rgba(0, 255, 65, 0.1) 100%);
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-neon);
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 768px) {
    padding: 8px 12px;
  }

  @media (max-width: 480px) {
    padding: 6px 10px;
  }
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

  @media (max-width: 768px) {
    padding: 0.75rem;
    gap: 0.75rem;
  }

  @media (max-width: 480px) {
    padding: 0.5rem;
    gap: 0.5rem;
  }
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

  @media (max-width: 768px) {
    gap: 0.5rem;
    padding: 10px;
    min-height: 60px;
  }

  @media (max-width: 480px) {
    gap: 0.4rem;
    padding: 8px;
    min-height: 50px;
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

  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
    font-size: 0.8rem;
  }

  @media (max-width: 480px) {
    width: 28px;
    height: 28px;
    font-size: 0.7rem;
  }
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

  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
  }

  @media (max-width: 480px) {
    padding: 0.5rem 0.75rem;
  }
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

  @media (max-width: 768px) {
    gap: 0.5rem;
    padding: 0.4rem 0.75rem;
  }

  @media (max-width: 480px) {
    gap: 0.4rem;
    padding: 0.3rem 0.5rem;
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
  min-height: 44px;
  min-width: 44px;

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

  @media (max-width: 768px) {
    padding: 0.6rem;
    min-height: 40px;
    min-width: 40px;
  }

  @media (max-width: 480px) {
    padding: 0.5rem;
    min-height: 36px;
    min-width: 36px;
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
  min-height: 44px;
  min-width: 44px;

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

  @media (max-width: 768px) {
    padding: 0.6rem;
    margin-left: 0.25rem;
    min-height: 40px;
    min-width: 40px;
  }

  @media (max-width: 480px) {
    padding: 0.5rem;
    margin-left: 0.2rem;
    min-height: 36px;
    min-width: 36px;
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

const MobileMenuButton = styled.button`
  background: var(--bg-elevated);
  border: 1px solid var(--border-cyan);
  color: var(--fg-primary);
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  margin-left: auto;
  min-height: 36px;
  min-width: 36px;

  &:hover {
    border-color: var(--border-neon);
    box-shadow: var(--glow-cyan);
  }

  @media (min-width: 769px) {
    display: none;
  }
`;

const EmojiPickerContainer = styled.div`
  position: absolute;
  bottom: 100%;
  right: 0;
  margin-bottom: 8px;
  z-index: 1000;
  background: var(--bg-elevated);
  border: 1px solid var(--border-cyan);
  border-radius: 8px;
  box-shadow: var(--glow-cyan);
  overflow: hidden;

  @media (max-width: 768px) {
    right: -50px;
  }

  @media (max-width: 480px) {
    right: -100px;
  }
`;

function ChatArea({ messages, onSendMessage, onBroadcastMessage, user, currentChannel, isLoadingMessages, isMobile, sidebarCollapsed, onToggleSidebar, socket }) {
  const [channels, setChannels] = useState([]);
  const [voiceChannels, setVoiceChannels] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const emojiPickerRef = useRef(null);

  // Format wallet address for display - minimized version
  const formatWalletAddress = (address) => {
    if (!address) return '';
    
    // Check if it's a wallet address (44 characters, base58)
    if (address.length === 44 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(address)) {
      const formatted = `${address.slice(0, 4)}...${address.slice(-4)}`;
      return formatted;
    }
    
    // If it's not a standard wallet address but looks like one, still format it
    if (address.length > 8 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(address)) {
      const formatted = `${address.slice(0, 4)}...${address.slice(-4)}`;
      return formatted;
    }
    
    console.log('Returning address as-is:', address);
    return address;
  };

  // Check if username is a wallet address
  const isWalletAddress = (username) => {
    return username && username.length === 44 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(username);
  };

  // Check if user is a developer (can send broadcast messages)
  const isDeveloper = (user) => {
    return user && (user.role === 'developer' || user.role === 'admin' || user.role === 'dev');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle click outside to close emoji picker
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  // Fetch channels and voice channels from API
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const [channelsResponse, voiceChannelsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/channels`),
          fetch(`${API_BASE_URL}/api/voice-channels`)
        ]);

        if (channelsResponse.ok) {
          const channelsData = await channelsResponse.json();
          setChannels(channelsData);
        }

        if (voiceChannelsResponse.ok) {
          const voiceChannelsData = await voiceChannelsResponse.json();
          setVoiceChannels(voiceChannelsData);
        }
      } catch (error) {
        console.error('Error fetching channel data:', error);
      }
    };

    fetchChannels();
  }, []);

  // Listen for new channel creation via socket
  useEffect(() => {
    if (!socket) return;

    const handleChannelCreated = (newChannel) => {
      console.log('New channel created (ChatArea):', newChannel);
      setChannels(prev => [...prev, newChannel]);
    };

    socket.on('channelCreated', handleChannelCreated);

    return () => {
      socket.off('channelCreated', handleChannelCreated);
    };
  }, [socket]);

  // Listen for typing indicators from other users
  useEffect(() => {
    if (!socket) return;

    const handleUserTyping = (data) => {
      // Only show typing indicators for the current channel
      if (data.channel === currentChannel) {
        setTypingUsers(prev => {
          if (data.isTyping) {
            // Add user to typing list if not already there
            const userExists = prev.find(u => u.userId === data.userId);
            if (!userExists) {
              return [...prev, { userId: data.userId, username: data.username }];
            }
            return prev;
          } else {
            // Remove user from typing list
            return prev.filter(u => u.userId !== data.userId);
          }
        });
      }
    };

    socket.on('userTyping', handleUserTyping);

    return () => {
      socket.off('userTyping', handleUserTyping);
    };
  }, [socket, currentChannel]);

  const handleSendMessage = () => {
    if (messageText.trim() && user) {
      // Stop typing indicator when sending message
      if (socket) {
        socket.emit('typing', { isTyping: false, channel: currentChannel });
      }
      clearTimeout(typingTimeoutRef.current);
      
      onSendMessage(messageText.trim());
      setMessageText('');
    }
  };

  const handleBroadcastMessage = () => {
    if (messageText.trim() && user && isDeveloper(user)) {
      // Show confirmation for broadcast
      if (window.confirm('Are you sure you want to broadcast this message to all channels?')) {
        // Stop typing indicator when sending broadcast
        if (socket) {
          socket.emit('typing', { isTyping: false, channel: currentChannel });
        }
        clearTimeout(typingTimeoutRef.current);
        
        onBroadcastMessage(messageText.trim());
        setMessageText('');
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (e.ctrlKey) {
        // Direct broadcast without confirmation for keyboard shortcut - only for developers
        if (messageText.trim() && user && isDeveloper(user)) {
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
    
    // Send typing indicator to other users
    if (socket && user && e.target.value.trim()) {
      socket.emit('typing', { isTyping: true, channel: currentChannel });
      
      // Clear existing timeout
      clearTimeout(typingTimeoutRef.current);
      
      // Set timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        if (socket && user) {
          socket.emit('typing', { isTyping: false, channel: currentChannel });
        }
      }, 1000);
    } else if (socket && user && !e.target.value.trim()) {
      // Stop typing if input is empty
      socket.emit('typing', { isTyping: false, channel: currentChannel });
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleEmojiClick = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleEmojiSelect = (emojiData) => {
    setMessageText(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getChannelInfo = (channelId) => {
    // First check if it's a voice channel
    const voiceChannel = voiceChannels.find(vc => vc._id === channelId);
    if (voiceChannel) {
      return { 
        name: voiceChannel.name, 
        description: voiceChannel.description || 'Voice call channel' 
      };
    }

    // Then check regular channels
    const channel = channels.find(c => c.name === channelId);
    if (channel) {
      return { 
        name: channel.name.toUpperCase(), 
        description: channel.description || 'Channel' 
      };
    }

    // Fallback for unknown channels
    return { name: 'UNKNOWN', description: 'Unknown channel' };
  };

  const channelInfo = getChannelInfo(currentChannel);
  const isVoiceCallChannel = voiceChannels.some(vc => vc._id === currentChannel);

  // Clear typing indicators when channel changes
  useEffect(() => {
    setTypingUsers([]);
    // Stop typing indicator when changing channels
    if (socket && user) {
      socket.emit('typing', { isTyping: false, channel: currentChannel });
    }
    clearTimeout(typingTimeoutRef.current);
  }, [currentChannel, socket, user]);

  return (
    <ChatContainer>
      <TerminalHeader>
        <TerminalDots>
          <TerminalDot />
          <TerminalDot />
          <TerminalDot />
        </TerminalDots>
        <TerminalTitle>CHAT_TERMINAL</TerminalTitle>
        {isMobile && (
          <MobileMenuButton onClick={onToggleSidebar}>
            <FaBars />
          </MobileMenuButton>
        )}
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
            filteredMessages.map((message) => {
              return (
            <Message key={message.id} $isBroadcast={message.isBroadcast} $isTemporary={message.isTemporary} $isError={message.isError}>
              <MessageAvatar>
                {message.isError ? '!' : 'W'}
              </MessageAvatar>
              <MessageContent>
                <MessageHeader>
                  <MessageUsername>
                    <span className={message.isError ? "ansi-red" : (message.isBroadcast ? "ansi-magenta" : "ansi-green")}>
                      {!message.isError && (() => {
                        const addressToFormat = message.walletAddress || message.username;
                        return formatWalletAddress(addressToFormat);
                      })()}
                      {!message.isError && !message.isBroadcast && (message.role === 'developer' || message.role === 'admin' || message.role === 'dev') && <span className="ansi-cyan"> [DEV]</span>}
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
            );
            })
          );
        })()}
        <div ref={messagesEndRef} />
      </MessagesContainer>

      {typingUsers.length > 0 && (
        <TypingIndicator>
          <span className="ansi-yellow">
            {typingUsers.length === 1 
              ? `${formatWalletAddress(typingUsers[0].username)} is typing`
              : typingUsers.length === 2
              ? `${formatWalletAddress(typingUsers[0].username)} and ${formatWalletAddress(typingUsers[1].username)} are typing`
              : `${formatWalletAddress(typingUsers[0].username)} and ${typingUsers.length - 1} others are typing`
            }
          </span>
          <span className="cursor-blink">█</span>
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
              placeholder={user ? (isDeveloper(user) ? "Type a message... (Enter to send, Ctrl+Enter to broadcast)" : "Type a message... (Enter to send)") : "Connect to start chatting..."}
              value={messageText}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              disabled={!user}
            />
            <div style={{ position: 'relative' }} ref={emojiPickerRef}>
              <EmojiButton onClick={handleEmojiClick}>
                <FaSmile />
              </EmojiButton>
              {showEmojiPicker && (
                <EmojiPickerContainer>
                  <EmojiPicker
                    onEmojiClick={handleEmojiSelect}
                    theme="dark"
                    width={300}
                    height={400}
                    searchDisabled={false}
                    skinTonesDisabled={false}
                    previewConfig={{
                      showPreview: true,
                      defaultEmoji: '1f60a',
                      defaultCaption: 'Choose your emoji!'
                    }}
                  />
                </EmojiPickerContainer>
              )}
            </div>
            <SendButton 
              onClick={handleSendMessage}
              disabled={!messageText.trim() || !user}
              title="Send to current channel (Enter)"
            >
              <FaPaperPlane />
            </SendButton>
            {isDeveloper(user) && (
              <BroadcastButton 
                onClick={handleBroadcastMessage}
                disabled={!messageText.trim() || !user}
                title="Broadcast to all channels (Ctrl+Enter) - Developer only"
              >
                <FaBroadcastTower />
              </BroadcastButton>
            )}
          </InputWrapper>
        </InputContainer>
      )}
    </ChatContainer>
  );
}

export default ChatArea;
