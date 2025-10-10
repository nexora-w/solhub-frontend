import React, { useState } from 'react';
import styled from 'styled-components';
import { FaChevronDown, FaChevronUp, FaWallet, FaComments, FaShieldAlt, FaRocket, FaQuestionCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

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
        question: "What is SOLHUB?",
        answer: "SOLHUB is a decentralized communication platform built on the Solana blockchain. It combines real-time chat functionality with Web3 wallet integration, allowing users to communicate securely while maintaining their blockchain identity."
      },
      {
        question: "How do I connect my wallet?",
        answer: "Click the 'Connect Wallet' button in the header. SOLHUB supports popular Solana wallets like Phantom, Solflare, and others. Once connected, your wallet address becomes your unique identifier in the chat."
      },
      {
        question: "Do I need SOL tokens to use SOLHUB?",
        answer: "No, you don't need SOL tokens to chat and participate in discussions. However, having SOL in your wallet allows you to see your balance in the interface and may be required for future premium features."
      }
    ]
  },
  {
    section: "Chat Features",
    icon: <FaComments />,
    questions: [
      {
        question: "What channels are available?",
        answer: "SOLHUB offers several specialized channels: General (general discussion), Trading (crypto trading discussions), NFT (NFT marketplace and discussions), DeFi (DeFi protocols and strategies), and Announcements (important updates and news)."
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
        answer: "Yes, SOLHUB only reads your public wallet address and balance. We never request access to your private keys or the ability to sign transactions. Your wallet connection is handled securely through standard Web3 protocols."
      },
      {
        question: "Are my messages encrypted?",
        answer: "Messages are transmitted securely over encrypted connections. While the chat is public within channels, your wallet connection and personal data remain protected through standard Web3 security practices."
      },
      {
        question: "Can I disconnect my wallet?",
        answer: "Absolutely! Click the 'Disconnect' button in the header at any time. This will remove your wallet connection and you can continue using SOLHUB with a temporary username if needed."
      }
    ]
  },
  {
    section: "Technical",
    icon: <FaInfoCircle />,
    questions: [
      {
        question: "What blockchain does SOLHUB use?",
        answer: "SOLHUB is built on the Solana blockchain, known for its high-speed transactions and low fees. This ensures fast, efficient communication while maintaining the benefits of blockchain technology."
      },
      {
        question: "How does the real-time chat work?",
        answer: "SOLHUB uses WebSocket technology for real-time communication. Messages are instantly delivered to all connected users in the same channel, creating a seamless chat experience."
      },
      {
        question: "What browsers are supported?",
        answer: "SOLHUB works on all modern browsers that support Web3 wallet extensions. We recommend Chrome, Firefox, or Brave for the best experience with wallet connectivity."
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
          <TerminalTitle>SOLHUB_FAQ_TERMINAL</TerminalTitle>
        </TerminalHeader>

      <FAQContent>
        <WelcomeSection>
          <WelcomeTitle>Welcome to SOLHUB</WelcomeTitle>
          <WelcomeSubtitle>The Future of Decentralized Communication</WelcomeSubtitle>
          <WelcomeDescription>
            SOLHUB bridges the gap between traditional chat platforms and Web3 technology. 
            Connect your Solana wallet to join a secure, transparent, and blockchain-powered 
            communication network where your digital identity is truly yours.
          </WelcomeDescription>
        </WelcomeSection>

        <FeatureGrid>
          <FeatureCard>
            <FeatureIcon><FaWallet /></FeatureIcon>
            <FeatureTitle>Wallet Integration</FeatureTitle>
            <FeatureDescription>
              Connect your Solana wallet to use your blockchain identity in chat
            </FeatureDescription>
          </FeatureCard>
          <FeatureCard>
            <FeatureIcon><FaComments /></FeatureIcon>
            <FeatureTitle>Real-time Chat</FeatureTitle>
            <FeatureDescription>
              Instant messaging across multiple specialized channels
            </FeatureDescription>
          </FeatureCard>
          <FeatureCard>
            <FeatureIcon><FaShieldAlt /></FeatureIcon>
            <FeatureTitle>Secure & Transparent</FeatureTitle>
            <FeatureDescription>
              Blockchain-powered security with public wallet verification
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
