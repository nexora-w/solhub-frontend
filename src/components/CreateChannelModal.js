import React, { useState } from 'react';
import styled from 'styled-components';
import { FaTimes, FaHashtag } from 'react-icons/fa';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const ModalContainer = styled.div`
  background: var(--bg-secondary);
  border: 2px solid var(--border-cyan);
  border-radius: 8px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  box-shadow: var(--glow-cyan), 0 0 50px rgba(0, 255, 255, 0.3);
  position: relative;
  animation: slideIn 0.3s ease;

  @keyframes slideIn {
    from {
      transform: translateY(-50px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
    max-width: 90%;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-cyan);
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  color: var(--fg-primary);
  text-shadow: var(--glow-cyan);
  display: flex;
  align-items: center;
  gap: 0.5rem;

  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: var(--fg-muted);
  cursor: pointer;
  font-size: 1.5rem;
  transition: all 0.3s ease;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: var(--fg-error);
    transform: rotate(90deg);
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.9rem;
  color: var(--fg-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
`;

const Input = styled.input`
  background: var(--bg-primary);
  border: 1px solid var(--border-cyan);
  border-radius: 4px;
  padding: 0.75rem;
  color: var(--fg-primary);
  font-family: 'JetBrains Mono', monospace;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--border-neon);
    box-shadow: var(--glow-cyan);
  }

  &::placeholder {
    color: var(--fg-muted);
  }
`;

const TextArea = styled.textarea`
  background: var(--bg-primary);
  border: 1px solid var(--border-cyan);
  border-radius: 4px;
  padding: 0.75rem;
  color: var(--fg-primary);
  font-family: 'JetBrains Mono', monospace;
  font-size: 1rem;
  transition: all 0.3s ease;
  resize: vertical;
  min-height: 80px;

  &:focus {
    outline: none;
    border-color: var(--border-neon);
    box-shadow: var(--glow-cyan);
  }

  &::placeholder {
    color: var(--fg-muted);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: 1px solid var(--border-cyan);
  border-radius: 4px;
  background: ${props => props.$primary ? 'var(--bg-elevated)' : 'transparent'};
  color: var(--fg-primary);
  font-family: 'JetBrains Mono', monospace;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;

  &:hover {
    border-color: var(--border-neon);
    box-shadow: var(--glow-cyan);
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const ErrorMessage = styled.div`
  color: var(--fg-error);
  font-size: 0.9rem;
  padding: 0.75rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--fg-error);
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const SuccessMessage = styled.div`
  color: var(--fg-primary);
  font-size: 0.9rem;
  padding: 0.75rem;
  background: rgba(0, 255, 65, 0.1);
  border: 1px solid var(--fg-primary);
  border-radius: 4px;
  margin-bottom: 1rem;
`;

function CreateChannelModal({ onClose, onChannelCreated, user }) {
  const [channelName, setChannelName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validate channel name
    if (!channelName.trim()) {
      setError('Channel name is required');
      return;
    }

    // Validate channel name format (only alphanumeric and hyphens)
    if (!/^[a-zA-Z0-9-]+$/.test(channelName.trim())) {
      setError('Channel name can only contain letters, numbers, and hyphens');
      return;
    }

    setIsSubmitting(true);

    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${API_BASE_URL}/api/channels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: channelName.trim(),
          description: description.trim() || `Channel for ${channelName}`,
          userId: user?._id || user?.id,
          username: user?.username,
          walletAddress: user?.walletAddress || user?.publicKey
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setChannelName('');
        setDescription('');
        
        // Call the callback to refresh channels list
        if (onChannelCreated) {
          onChannelCreated(data);
        }

        // Close modal after a short delay
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError(data.error || 'Failed to create channel');
      }
    } catch (err) {
      console.error('Error creating channel:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContainer>
        <ModalHeader>
          <ModalTitle>
            <FaHashtag />
            Create New Channel
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>Channel created successfully!</SuccessMessage>}

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="channelName">Channel Name *</Label>
            <Input
              id="channelName"
              type="text"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              placeholder="e.g., trading-strategies"
              maxLength={50}
              disabled={isSubmitting || success}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="description">Description</Label>
            <TextArea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this channel is for..."
              maxLength={200}
              disabled={isSubmitting || success}
            />
          </FormGroup>

          <ButtonGroup>
            <Button type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" $primary disabled={isSubmitting || success}>
              {isSubmitting ? 'Creating...' : 'Create Channel'}
            </Button>
          </ButtonGroup>
        </Form>
      </ModalContainer>
    </ModalOverlay>
  );
}

export default CreateChannelModal;

