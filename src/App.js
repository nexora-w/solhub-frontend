import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import io from 'socket.io-client';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import FAQ from './components/FAQ';
import './terminal-theme.css';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--bg-primary);
  color: var(--fg-primary);
  font-family: 'JetBrains Mono', monospace;
  position: relative;
  z-index: 3;
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;
  z-index: 3;
  min-height: 0;
  margin-top: 10px;

  @media (max-width: 768px) {
    flex-direction: column;
    margin-top: 5px;
  }
`;

const MatrixBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
  pointer-events: none;
`;


function App() {
  const [socket, setSocket] = useState(null);
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [currentChannel, setCurrentChannel] = useState('general');
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [showFAQ, setShowFAQ] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Function to fetch messages for a specific channel
  const fetchMessages = async (channel) => {
    try {
      setIsLoadingMessages(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/messages?channel=${channel}&limit=50`);
      if (response.ok) {
        const channelMessages = await response.json();
        console.log(`Fetched ${channelMessages.length} messages for channel ${channel}:`, channelMessages);
        
        // Update messages state, keeping messages from other channels
        setMessages(prev => {
          // Remove existing messages from this channel
          const otherChannelMessages = prev.filter(msg => msg.channel !== channel);
          // Add new messages from this channel
          return [...otherChannelMessages, ...channelMessages];
        });
      } else {
        console.error('Failed to fetch messages:', response.statusText);
        // Show error message to user
        setMessages(prev => {
          const errorMessage = {
            id: `error-${channel}-${Date.now()}`,
            username: 'System',
            text: `Failed to load messages for #${channel}. Please try again.`,
            timestamp: new Date().toISOString(),
            channel: channel,
            isError: true
          };
          const otherChannelMessages = prev.filter(msg => msg.channel !== channel && !msg.isError);
          return [...otherChannelMessages, errorMessage];
        });
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      // Show error message to user
      setMessages(prev => {
        const errorMessage = {
          id: `error-${channel}-${Date.now()}`,
          username: 'System',
          text: `Network error loading messages for #${channel}. Please check your connection.`,
          timestamp: new Date().toISOString(),
          channel: channel,
          isError: true
        };
        const otherChannelMessages = prev.filter(msg => msg.channel !== channel && !msg.isError);
        return [...otherChannelMessages, errorMessage];
      });
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Function to fetch all messages for all channels
  const fetchAllMessages = async () => {
    try {
      setIsLoadingMessages(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/messages/all?limit=50`);
      if (response.ok) {
        const allMessages = await response.json();
        
        // Flatten all messages into a single array
        const flattenedMessages = [];
        Object.keys(allMessages).forEach(channel => {
          flattenedMessages.push(...allMessages[channel]);
        });
        
        setMessages(flattenedMessages);
      } else {
        console.error('Failed to fetch all messages:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching all messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(`${process.env.REACT_APP_API_URL}`);
    setSocket(newSocket);

    // Set up event listeners
    newSocket.on('userConfirmed', (userData) => {
      console.log('User confirmed by server:', userData);
      // Update user data with role from server
      setUser(prevUser => ({
        ...prevUser,
        ...userData
      }));
    });

    newSocket.on('newMessage', (message) => {
      console.log('Received message from server:', message);
      setMessages(prev => {
        console.log('Current messages before processing:', prev);
        
        // Check if this is a confirmation of a message we already sent
        const existingTempIndex = prev.findIndex(m => 
          m.isTemporary && 
          m.username === message.username && 
          m.text === message.text && 
          m.channel === message.channel
        );
        
        console.log('Found existing temp message at index:', existingTempIndex);
        
        if (existingTempIndex !== -1) {
          // Replace temporary message with confirmed message
          const newMessages = [...prev];
          newMessages[existingTempIndex] = message;
          console.log('Replaced temp message with confirmed message');
          return newMessages;
        } else {
          // Add new message from other users
          console.log('Adding new message from other user');
          return [...prev, message];
        }
      });
    });

    newSocket.on('userJoined', (user) => {
      setConnectedUsers(prev => [...prev, user]);
    });

    newSocket.on('userLeft', (user) => {
      setConnectedUsers(prev => prev.filter(u => u.username !== user.username));
    });

    // Handle server errors
    newSocket.on('messageError', (error) => {
      console.error('Server error:', error);
      // Remove any temporary messages on error
      setMessages(prev => prev.filter(m => !m.isTemporary));
    });

    // Handle connection errors
    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarCollapsed(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch messages when component mounts
  useEffect(() => {
    fetchAllMessages();
  }, []);

  // Fetch messages when channel changes
  useEffect(() => {
    if (currentChannel) {
      fetchMessages(currentChannel);
    }
  }, [currentChannel]);

  // Matrix rain effect
  useEffect(() => {
    const createMatrixRain = () => {
      const matrixBg = document.getElementById('matrixBg');
      if (!matrixBg) return;
      
      const chars = '01ABCDEF!@#$%^&*()_+-=[]{}|;:,.<>?';
      const columns = Math.floor(window.innerWidth / 20);
      
      for (let i = 0; i < columns; i++) {
        const column = document.createElement('div');
        column.className = 'matrix-column';
        column.style.left = i * 20 + 'px';
        const duration = Math.random() * 3 + 2;
        column.style.animationDuration = duration + 's';
        column.style.animationDelay = Math.random() * 2 + 's';
        
        let text = '';
        for (let j = 0; j < 20; j++) {
          text += chars[Math.floor(Math.random() * chars.length)] + '\n';
        }
        column.textContent = text;
        
        matrixBg.appendChild(column);
        
        // Remove column after animation completes to prevent memory leaks
        setTimeout(() => {
          if (column.parentNode) {
            column.parentNode.removeChild(column);
          }
        }, (duration + 2) * 1000); // Add 2 seconds buffer
      }
    };

    // Create initial matrix rain
    createMatrixRain();

    // Create new columns more frequently for continuous effect
    const matrixInterval = setInterval(createMatrixRain, 2000);
    return () => clearInterval(matrixInterval);
  }, []);

  const handleUserLogin = (userData) => {
    console.log('Setting user:', userData);
    setUser(userData);
    if (socket) {
      console.log('Emitting join event:', userData);
      socket.emit('join', userData);
    } else {
      console.log('Socket not connected yet');
    }
  };

  const handleSendMessage = (messageText) => {
    if (socket && user) {
      const messageData = {
        text: messageText,
        channel: currentChannel
      };
      
      // Add message to local state immediately for better UX
      const tempMessage = {
        id: Date.now() + Math.random(), // Temporary ID
        username: user.username,
        walletAddress: user.walletAddress || user.username,
        role: user.role || 'user',
        text: messageText,
        timestamp: new Date().toISOString(),
        channel: currentChannel,
        isTemporary: true // Mark as temporary until confirmed by server
      };
      
      console.log('Sending message data:', messageData);
      console.log('Adding temp message:', tempMessage);
      console.log('Socket connected:', socket.connected);
      console.log('User data:', user);
      
      setMessages(prev => {
        const newMessages = [...prev, tempMessage];
        console.log('Updated messages with temp message:', newMessages);
        return newMessages;
      });
      
      // Ensure socket is connected before sending
      if (socket.connected) {
        socket.emit('sendMessage', messageData);
        
        // Set a timeout to remove temporary message if not confirmed within 10 seconds
        setTimeout(() => {
          setMessages(prev => {
            const stillTemporary = prev.find(m => m.id === tempMessage.id && m.isTemporary);
            if (stillTemporary) {
              console.log('Removing unconfirmed temporary message:', tempMessage.id);
              return prev.filter(m => m.id !== tempMessage.id);
            }
            return prev;
          });
        }, 10000);
      } else {
        console.error('Socket not connected, cannot send message');
        // Remove the temporary message if socket is not connected
        setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
      }
    } else {
      console.log('Cannot send message - socket or user not available');
      console.log('Socket:', socket);
      console.log('User:', user);
    }
  };

  const handleBroadcastMessage = (messageText) => {
    if (socket && user) {
      socket.emit('broadcastMessage', {
        text: messageText
      });
    }
  };

  const handleVoiceCallClick = (voiceCallId) => {
    setCurrentChannel(voiceCallId);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <AppContainer>
      <MatrixBackground id="matrixBg" />
      
      <Header 
        user={user} 
        onUserLogin={handleUserLogin}
        connectedUsers={connectedUsers}
        onShowFAQ={() => setShowFAQ(true)}
      />
      <MainContent>
        {(!isMobile || !sidebarCollapsed) && (
          <Sidebar 
            currentChannel={currentChannel}
            onChannelChange={(channel) => {
              setCurrentChannel(channel);
              if (isMobile) {
                setSidebarCollapsed(true);
              }
            }}
            connectedUsers={connectedUsers}
            onShowFAQ={() => setShowFAQ(true)}
            onVoiceCallClick={handleVoiceCallClick}
            user={user}
            socket={socket}
          />
        )}
        <ChatArea 
          messages={messages}
          onSendMessage={handleSendMessage}
          onBroadcastMessage={handleBroadcastMessage}
          user={user}
          currentChannel={currentChannel}
          isLoadingMessages={isLoadingMessages}
          isMobile={isMobile}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={toggleSidebar}
          socket={socket}
        />
      </MainContent>
      
      {showFAQ && (
        <FAQ onClose={() => setShowFAQ(false)} />
      )}
      
      {/* Wallet Test Component - Remove in production */}
    </AppContainer>
  );
}

export default App;