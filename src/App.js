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

const NetworkNodes = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 1;
  pointer-events: none;
`;

const DataStreams = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 1;
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
        console.log('Fetched all messages:', allMessages);
        
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
        column.style.animationDuration = (Math.random() * 3 + 2) + 's';
        column.style.animationDelay = Math.random() * 2 + 's';
        
        let text = '';
        for (let j = 0; j < 20; j++) {
          text += chars[Math.floor(Math.random() * chars.length)] + '\n';
        }
        column.textContent = text;
        
        matrixBg.appendChild(column);
        
        setTimeout(() => {
          if (column.parentNode) {
            column.parentNode.removeChild(column);
          }
        }, 5000);
      }
    };

    const createNetworkNodes = () => {
      const container = document.getElementById('networkNodes');
      if (!container) return;
      
      for (let i = 0; i < 15; i++) {
        const node = document.createElement('div');
        node.className = 'network-node';
        node.style.left = Math.random() * 100 + '%';
        node.style.top = Math.random() * 100 + '%';
        node.style.animationDelay = Math.random() * 8 + 's';
        container.appendChild(node);
      }
    };

    const createDataStreams = () => {
      const container = document.getElementById('dataStreams');
      if (!container) return;
      
      for (let i = 0; i < 8; i++) {
        const stream = document.createElement('div');
        stream.className = 'data-stream';
        stream.style.top = Math.random() * 100 + '%';
        stream.style.animationDelay = Math.random() * 3 + 's';
        stream.style.animationDuration = (Math.random() * 2 + 3) + 's';
        container.appendChild(stream);
      }
    };

    createMatrixRain();
    createNetworkNodes();
    createDataStreams();

    const matrixInterval = setInterval(createMatrixRain, 15000);
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

  return (
    <AppContainer>
      <MatrixBackground id="matrixBg" />
      <NetworkNodes id="networkNodes" />
      <DataStreams id="dataStreams" />
      
      <Header 
        user={user} 
        onUserLogin={handleUserLogin}
        connectedUsers={connectedUsers}
        onShowFAQ={() => setShowFAQ(true)}
      />
      <MainContent>
        <Sidebar 
          currentChannel={currentChannel}
          onChannelChange={setCurrentChannel}
          connectedUsers={connectedUsers}
          onShowFAQ={() => setShowFAQ(true)}
          onVoiceCallClick={handleVoiceCallClick}
        />
        <ChatArea 
          messages={messages}
          onSendMessage={handleSendMessage}
          onBroadcastMessage={handleBroadcastMessage}
          user={user}
          currentChannel={currentChannel}
          isLoadingMessages={isLoadingMessages}
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