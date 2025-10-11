import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaVolumeUp, FaHashtag, FaUsers, FaQuestionCircle } from 'react-icons/fa';

const SidebarContainer = styled.div`
  width: 280px;
  background: var(--bg-secondary);
  border: 2px solid var(--border-cyan);
  border-radius: 8px;
  margin: 0 20px 20px 20px;
  display: flex;
  flex-direction: column;
  height: calc(100% - 20px);
  box-shadow: var(--glow-cyan);
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    width: 100%;
    margin: 0 10px 10px 10px;
    height: auto;
    max-height: 40vh;
    min-height: 200px;
  }

  @media (max-width: 480px) {
    margin: 0 5px 5px 5px;
    max-height: 35vh;
    min-height: 180px;
  }
`;

const ScrollableContent = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  
  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--bg-primary);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--border-cyan);
    border-radius: 4px;
    border: 1px solid var(--bg-primary);
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: var(--border-neon);
    box-shadow: 0 0 5px var(--border-neon);
  }
  
  /* Firefox scrollbar styling */
  scrollbar-width: thin;
  scrollbar-color: var(--border-cyan) var(--bg-primary);
`;

const TerminalHeader = styled.div`
  background: linear-gradient(90deg, var(--bg-elevated) 0%, rgba(0, 255, 65, 0.1) 100%);
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-cyan);
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

const Section = styled.div`
  padding: 1.5rem 1rem;
  border-bottom: 1px solid var(--border-cyan);

  @media (max-width: 768px) {
    padding: 1rem 0.75rem;
  }

  @media (max-width: 480px) {
    padding: 0.75rem 0.5rem;
  }
`;

const SectionTitle = styled.h3`
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--fg-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-shadow: var(--glow-cyan);

  @media (max-width: 768px) {
    font-size: 0.8rem;
    margin: 0 0 0.75rem 0;
  }

  @media (max-width: 480px) {
    font-size: 0.75rem;
    margin: 0 0 0.5rem 0;
  }
`;

const ChannelList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ChannelItem = styled.div`
  padding: 0.75rem;
  border: 1px solid var(--border-cyan);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.$active ? 'var(--bg-primary)' : 'var(--bg-elevated)'};
  border-color: ${props => props.$active ? 'var(--border-neon)' : 'var(--border-cyan)'};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.1), transparent);
    transition: left 0.5s ease;
  }

  &:hover::before {
    left: 100%;
  }

  &:hover {
    border-color: var(--border-neon);
    box-shadow: var(--glow-cyan);
    transform: translateX(4px);
  }

  @media (max-width: 768px) {
    padding: 0.5rem;
    min-height: 44px;
    display: flex;
    align-items: center;
  }

  @media (max-width: 480px) {
    padding: 0.4rem;
    min-height: 40px;
  }
`;

const ChannelName = styled.div`
  font-weight: 500;
  color: var(--fg-primary);
  margin-bottom: 0.25rem;
  text-shadow: ${props => props.$active ? 'var(--glow-green)' : 'none'};
`;

const ChannelInfo = styled.div`
  font-size: 0.8rem;
  color: var(--fg-muted);
`;

const VoiceCallsSection = styled.div`
  padding: 1.5rem 1rem;
`;

const VoiceCallItem = styled.div`
  padding: 0.75rem;
  border: 1px solid var(--border-magenta);
  border-radius: 4px;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--bg-elevated);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(167, 139, 250, 0.1), transparent);
    transition: left 0.5s ease;
  }

  &:hover::before {
    left: 100%;
  }

  &:hover {
    border-color: var(--border-neon);
    box-shadow: var(--glow-magenta);
    transform: scale(1.02);
  }
`;

const OnlineUsers = styled.div`
  padding: 1rem;
  border-top: 1px solid var(--border-cyan);
`;

const OnlineUsersTitle = styled.h4`
  margin: 0 0 0.5rem 0;
  font-size: 0.8rem;
  color: var(--fg-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-shadow: var(--glow-cyan);
`;

const UserItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0;
  font-size: 0.9rem;
  color: var(--fg-primary);
  transition: all 0.3s ease;

  &:hover {
    color: var(--fg-secondary);
    text-shadow: var(--glow-cyan);
  }
`;

const UserAvatar = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--fg-primary) 0%, var(--fg-secondary) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bg-primary);
  font-size: 0.7rem;
  font-weight: bold;
  box-shadow: 0 0 5px currentColor;
`;

const FAQButton = styled.div`
  padding: 0.75rem;
  border: 1px solid var(--border-cyan);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--bg-elevated);
  position: relative;
  overflow: hidden;
  margin-bottom: 0.5rem;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.1), transparent);
    transition: left 0.5s ease;
  }

  &:hover::before {
    left: 100%;
  }

  &:hover {
    border-color: var(--border-neon);
    box-shadow: var(--glow-cyan);
    transform: translateX(4px);
  }
`;

const FAQButtonContent = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--fg-primary);
  font-weight: 500;
  font-size: 0.9rem;
`;

// API base URL - you might want to move this to a config file
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Sidebar({ currentChannel, onChannelChange, connectedUsers, onShowFAQ, onVoiceCallClick }) {
  const [channels, setChannels] = useState([]);
  const [voiceChannels, setVoiceChannels] = useState([]);
  const [isLoadingChannels, setIsLoadingChannels] = useState(true);
  const [isLoadingVoiceChannels, setIsLoadingVoiceChannels] = useState(true);

  // Fetch channels from API
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/channels`);
        if (response.ok) {
          const data = await response.json();
          setChannels(data);
        } else {
          console.error('Failed to fetch channels');
        }
      } catch (error) {
        console.error('Error fetching channels:', error);
      } finally {
        setIsLoadingChannels(false);
      }
    };

    fetchChannels();
  }, []);

  // Fetch voice channels from API
  useEffect(() => {
    const fetchVoiceChannels = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/voice-channels`);
        if (response.ok) {
          const data = await response.json();
          setVoiceChannels(data);
        } else {
          console.error('Failed to fetch voice channels');
        }
      } catch (error) {
        console.error('Error fetching voice channels:', error);
      } finally {
        setIsLoadingVoiceChannels(false);
      }
    };

    fetchVoiceChannels();
  }, []);

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
  return (
    <SidebarContainer>
      <TerminalHeader>
        <TerminalDots>
          <TerminalDot />
          <TerminalDot />
          <TerminalDot />
        </TerminalDots>
        <TerminalTitle>NAVIGATION_TERMINAL</TerminalTitle>
      </TerminalHeader>
      
      <ScrollableContent>
        <Section>
          <FAQButton onClick={onShowFAQ}>
            <FAQButtonContent>
              <FaQuestionCircle />
              <span>FAQ & Help</span>
            </FAQButtonContent>
          </FAQButton>
          <SectionTitle>
            <FaHashtag />
            CHANNELS
          </SectionTitle>
          <ChannelList>
            {isLoadingChannels ? (
              <ChannelInfo>Loading channels...</ChannelInfo>
            ) : (
              channels.map(channel => (
                <ChannelItem
                  key={channel._id}
                  $active={currentChannel === channel.name}
                  onClick={() => onChannelChange(channel.name)}
                >
                  <ChannelName $active={currentChannel === channel.name}>
                    <span className="ansi-cyan">#</span>{channel.name.toUpperCase()}
                  </ChannelName>
                  <ChannelInfo>{channel.description}</ChannelInfo>
                </ChannelItem>
              ))
            )}
          </ChannelList>
        </Section>

        <VoiceCallsSection>
          <SectionTitle>
            <FaVolumeUp />
            VOICE_CALLS*
          </SectionTitle>
          {isLoadingVoiceChannels ? (
            <ChannelInfo>Loading voice channels...</ChannelInfo>
          ) : (
            voiceChannels.map(call => (
              <VoiceCallItem key={call._id} onClick={() => onVoiceCallClick(call._id)}>
                <ChannelName>
                  <span className="ansi-magenta">&gt;</span> {call.name}
                </ChannelName>
                <ChannelInfo>{call.participantCount || 0} participants</ChannelInfo>
              </VoiceCallItem>
            ))
          )}
        </VoiceCallsSection>

        {connectedUsers.length > 0 && (
          <OnlineUsers>
            <OnlineUsersTitle>
              <FaUsers />
              ONLINE_USERS
            </OnlineUsersTitle>
            {connectedUsers.map(user => (
              <UserItem key={user.id}>
                <UserAvatar>
                  {isWalletAddress(user.username) ? 'W' : user.username.charAt(0).toUpperCase()}
                </UserAvatar>
                <span className="ansi-green">
                  {isWalletAddress(user.username) ? formatWalletAddress(user.username) : user.username}
                  {isWalletAddress(user.username) && <span className="ansi-cyan"> [W]</span>}
                </span>
              </UserItem>
            ))}
          </OnlineUsers>
        )}
      </ScrollableContent>
    </SidebarContainer>
  );
}

export default Sidebar;
