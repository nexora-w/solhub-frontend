import React, { useState } from 'react';
import styled from 'styled-components';
import { FaChevronDown, FaWallet, FaComments, FaShieldAlt, FaRocket, FaInfoCircle, FaTimes } from 'react-icons/fa';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const FAQContainer = styled.div`
  background: var(--bg-secondary);
  border: 2px solid var(--border-cyan);
  border-radius: 8px;
  box-shadow: var(--glow-cyan);
  position: relative;
  overflow: hidden;
  height: 90vh;
  width: 90vw;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  animation: modalSlideIn 0.3s ease-out;
  
  @keyframes modalSlideIn {
    from {
      opacity: 0;
      transform: scale(0.9) translateY(-20px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
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

const FAQContent = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 20px;
  
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

const WelcomeSection = styled.div`
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-cyan);
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.1);
`;

const WelcomeTitle = styled.h1`
  color: var(--fg-primary);
  font-size: 28px;
  margin-bottom: 10px;
  text-shadow: var(--glow-cyan);
  font-weight: 600;
`;

const WelcomeSubtitle = styled.p`
  color: var(--fg-secondary);
  font-size: 16px;
  margin-bottom: 15px;
`;

const WelcomeDescription = styled.p`
  color: var(--fg-muted);
  font-size: 14px;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
`;

const FAQSection = styled.div`
  margin-bottom: 30px;
`;

const SectionTitle = styled.h2`
  color: var(--fg-secondary);
  font-size: 18px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  text-shadow: var(--glow-cyan);
`;

const FAQItem = styled.div`
  background: var(--bg-elevated);
  border: 1px solid var(--border-cyan);
  border-radius: 6px;
  margin-bottom: 10px;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: var(--border-neon);
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.2);
  }
`;

const Question = styled.div`
  padding: 15px 20px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${props => props.$isOpen ? 'var(--bg-primary)' : 'transparent'};
  transition: all 0.3s ease;
  
  &:hover {
    background: var(--bg-primary);
  }
`;

const QuestionText = styled.div`
  color: var(--fg-primary);
  font-weight: 500;
  font-size: 14px;
  flex: 1;
`;

const ChevronIcon = styled.div`
  color: var(--fg-secondary);
  font-size: 12px;
  transition: transform 0.3s ease;
  transform: ${props => props.$isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
`;

const Answer = styled.div`
  padding: 0 20px;
  max-height: ${props => props.$isOpen ? '200px' : '0'};
  overflow: hidden;
  transition: all 0.3s ease;
  background: var(--bg-primary);
`;

const AnswerText = styled.div`
  color: var(--fg-muted);
  font-size: 13px;
  line-height: 1.6;
  padding: 15px 0;
  border-top: 1px solid var(--border-cyan);
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin: 20px 0;
`;

const FeatureCard = styled.div`
  background: var(--bg-elevated);
  border: 1px solid var(--border-cyan);
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: var(--border-neon);
    box-shadow: var(--glow-cyan);
    transform: translateY(-2px);
  }
`;

const FeatureIcon = styled.div`
  font-size: 24px;
  color: var(--fg-secondary);
  margin-bottom: 10px;
  text-shadow: var(--glow-cyan);
`;

const FeatureTitle = styled.h3`
  color: var(--fg-primary);
  font-size: 16px;
  margin-bottom: 8px;
  font-weight: 600;
`;

const FeatureDescription = styled.p`
  color: var(--fg-muted);
  font-size: 13px;
  line-height: 1.5;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-cyan);
  color: var(--fg-primary);
  padding: 8px 16px;
  border-radius: 4px;
  font-family: inherit;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  
  &:hover {
    border-color: var(--border-neon);
    box-shadow: var(--glow-cyan);
    transform: translateY(-1px);
  }
`;

const ModalCloseButton = styled.button`
  position: absolute;
  top: 5px;
  right: 15px;
  background: var(--bg-elevated);
  border: 1px solid var(--fg-error);
  color: var(--fg-error);
  width: 30px;
  height: 30px;
  border-radius: 50%;
  font-family: inherit;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  
  &:hover {
    border-color: var(--border-neon);
    box-shadow: 0 0 15px rgba(255, 0, 0, 0.3);
    transform: scale(1.1);
  }
`;

const faqData = [
  {
    section: "Getting Started",
    icon: <FaRocket />,
    questions: [
      {
        question: "What is USERHUB?",
        answer: "USERHUB is your central hub for Solana projects and coins. It's a decentralized platform where you can create dedicated channels for your own projects, build and engage with your community, and promote your tokens or services. With Web3 wallet integration and real-time chat, USERHUB gives every project creator the tools to establish their presence in the Solana ecosystem."
      },
      {
        question: "How do I connect my wallet?",
        answer: "Click the 'Connect Wallet' button in the header. USERHUB supports popular Solana wallets like Phantom, Solflare, and others. Once connected, your wallet address becomes your unique identifier in the chat."
      },
      {
        question: "Do I need SOL tokens to use USERHUB?",
        answer: "No, you don't need SOL tokens to chat and participate in discussions. However, having SOL in your wallet may be required for future premium features."
      },
      {
        question: "Can I use USERHUB as a hub for my own coin or project?",
        answer: "Absolutely! That's exactly what USERHUB is built for. Create your own channel to serve as the central hub for your project, engage with your community in real-time, make announcements, and build a loyal following. Whether you're launching a memecoin, building a DeFi protocol, or creating an NFT collection, USERHUB provides the infrastructure to connect with your audience directly on the blockchain."
      }
    ]
  },
  {
    section: "Chat Features",
    icon: <FaComments />,
    questions: [
      {
        question: "What channels are available?",
        answer: "USERHUB features default channels like General, Trading, NFT, DeFi, and Announcements. But the real power lies in creating your own! Every project owner can establish their dedicated channel as a hub for their coin or project. This is where you build your community, share updates, and engage directly with your supporters on the Solana blockchain."
      },
      {
        question: "How can I create a channel for my project or coin?",
        answer: "Creating your own project hub is easy! Connect your wallet and click the 'Create Channel' button in the sidebar. Give your channel a unique name (your project/coin name), add a compelling description, and your dedicated space is ready. Channel names can contain letters, numbers, and hyphens. Once created, your channel becomes instantly available to the entire USERHUB community, giving your project immediate visibility!"
      },
      {
        question: "How do I send messages?",
        answer: "Simply type your message in the input field at the bottom of the chat area and press Enter or click Send. Your messages will appear with your wallet address as the username, ensuring transparency and authenticity."
      },
      {
        question: "Can I see who's online?",
        answer: "Yes! The sidebar shows all currently connected users. Wallet-connected users are marked with [W] and their addresses are shortened for readability. You can see real-time updates when users join or leave."
      }
    ]
  },
  {
    section: "Security & Privacy",
    icon: <FaShieldAlt />,
    questions: [
      {
        question: "Is my wallet information secure?",
        answer: "Yes, USERHUB only reads your public wallet address and balance. We never request access to your private keys or the ability to sign transactions. Your wallet connection is handled securely through standard Web3 protocols."
      },
      {
        question: "Are my messages encrypted?",
        answer: "Messages are transmitted securely over encrypted connections. While the chat is public within channels, your wallet connection and personal data remain protected through standard Web3 security practices."
      },
      {
        question: "Can I disconnect my wallet?",
        answer: "Absolutely! Click the 'Disconnect' button in the header at any time. This will remove your wallet connection and you can continue using USERHUB with a temporary username if needed."
      }
    ]
  },
  {
    section: "Technical",
    icon: <FaInfoCircle />,
    questions: [
      {
        question: "What blockchain does USERHUB use?",
        answer: "USERHUB is built on the Solana blockchain, known for its high-speed transactions and low fees. This ensures fast, efficient communication while maintaining the benefits of blockchain technology."
      },
      {
        question: "How does the real-time chat work?",
        answer: "USERHUB uses WebSocket technology for real-time communication. Messages are instantly delivered to all connected users in the same channel, creating a seamless chat experience."
      },
      {
        question: "What browsers are supported?",
        answer: "USERHUB works on all modern browsers that support Web3 wallet extensions. We recommend Chrome, Firefox, or Brave for the best experience with wallet connectivity."
      }
    ]
  }
];

function FAQ({ onClose }) {
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (sectionIndex, questionIndex) => {
    const key = `${sectionIndex}-${questionIndex}`;
    setOpenItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <FAQContainer>
        <ModalCloseButton onClick={onClose}>
          <FaTimes />
        </ModalCloseButton>
        
        <TerminalHeader>
          <TerminalDots>
            <TerminalDot />
            <TerminalDot />
            <TerminalDot />
          </TerminalDots>
          <TerminalTitle>USERHUB_FAQ_TERMINAL</TerminalTitle>
        </TerminalHeader>

      <FAQContent>
        <WelcomeSection>
          <WelcomeTitle>Welcome to USERHUB</WelcomeTitle>
          <WelcomeSubtitle>Your Hub for Solana Projects & Coins</WelcomeSubtitle>
          <WelcomeDescription>
            USERHUB is your central hub for building, promoting, and managing your own Solana projects and coins. 
            Create dedicated channels for your project, connect with your community, and leverage Web3 technology 
            to grow your ecosystem. Whether you're launching a new token or building a community, USERHUB provides 
            the platform where your project can thrive.
          </WelcomeDescription>
        </WelcomeSection>

        <FeatureGrid>
          <FeatureCard>
            <FeatureIcon><FaRocket /></FeatureIcon>
            <FeatureTitle>Launch Your Project</FeatureTitle>
            <FeatureDescription>
              Create dedicated channels for your coins and projects with instant community access
            </FeatureDescription>
          </FeatureCard>
          <FeatureCard>
            <FeatureIcon><FaComments /></FeatureIcon>
            <FeatureTitle>Real-time Engagement</FeatureTitle>
            <FeatureDescription>
              Connect with your community instantly through Web3-powered chat
            </FeatureDescription>
          </FeatureCard>
          <FeatureCard>
            <FeatureIcon><FaWallet /></FeatureIcon>
            <FeatureTitle>Blockchain Identity</FeatureTitle>
            <FeatureDescription>
              Wallet integration ensures transparent, verified communication with your users
            </FeatureDescription>
          </FeatureCard>
        </FeatureGrid>

        {faqData.map((section, sectionIndex) => (
          <FAQSection key={sectionIndex}>
            <SectionTitle>
              {section.icon}
              {section.section}
            </SectionTitle>
            {section.questions.map((item, questionIndex) => {
              const key = `${sectionIndex}-${questionIndex}`;
              const isOpen = openItems[key];
              
              return (
                <FAQItem key={questionIndex}>
                  <Question 
                    $isOpen={isOpen}
                    onClick={() => toggleItem(sectionIndex, questionIndex)}
                  >
                    <QuestionText>{item.question}</QuestionText>
                    <ChevronIcon $isOpen={isOpen}>
                      <FaChevronDown />
                    </ChevronIcon>
                  </Question>
                  <Answer $isOpen={isOpen}>
                    <AnswerText>{item.answer}</AnswerText>
                  </Answer>
                </FAQItem>
              );
            })}
          </FAQSection>
        ))}
      </FAQContent>
    </FAQContainer>
    </ModalOverlay>
  );
}

export default FAQ;
