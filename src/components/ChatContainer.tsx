import { useState, useEffect, useRef } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import SuggestionList from './SuggestionList';
import { Conversation, Message, SuggestionPrompt } from '../types';
import './ChatContainer.css';

interface ChatContainerProps {
  conversation: Conversation;
  updateConversation: (conversation: Conversation) => void;
}

interface ChatState {
  role: string;
  content: string | {
      type: string;
      output?: string;
      function?: string;
      args?: string;
  };
}

const CHAT_STATES_STORAGE_KEY = 'chat_app_chat_states';

const chatApiService = async (chatState: ChatState[], userMessage: Message): Promise<ChatState[]> => {
  try {
    console.log("Chat state before API call:", chatState);
    const response = await fetch('https://server-next-alpha.vercel.app/api/chat', { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        msgss: [...chatState, { role: 'user', content: userMessage.content }]
      })
    });
    
    if (!response.ok) {
      throw new Error(`Network error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

const SUGGESTION_SETS = {
  DEFAULT: [
    { id: '1', text: 'How can I connect with Prashant Rewar' },
    { id: '2', text: 'Tell me something about his top projects' },
    { id: '3', text: 'Explain a Random Project' },
  ],
  FOLLOW_UP: [
    { id: '1', text: 'Can you explain that differently?' },
    { id: '2', text: 'Does Prashant Rewar have any prior experience in web-scraping?' },
    { id: '3', text: 'Tell me more details about it?' },
  ],
  OPINION: [
    { id: '4', text: 'Whats your opinion on this?' },
    { id: '5', text: 'How does he made you?' },
    { id: '6', text: 'What else can you tell me?' },
  ]
};

const ChatContainer = ({ conversation, updateConversation }: ChatContainerProps) => {
  if (!conversation) {
    return <div className="loading">Loading conversation...</div>;
  }

  const [isLoading, setIsLoading] = useState(false);
  const [chatState, setChatState] = useState<ChatState[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestionPrompt[]>(SUGGESTION_SETS.DEFAULT);
  const currentConversationIdRef = useRef<string>(conversation.id);
  
  useEffect(() => {
    currentConversationIdRef.current = conversation.id;
    loadChatState();
  }, [conversation.id]);

  useEffect(() => {
    if (chatState.length > 0) {
      saveChatState();
    }
  }, [chatState]);

  const loadChatState = () => {
    try {
      const storedChatStates = localStorage.getItem(CHAT_STATES_STORAGE_KEY);
      
      if (storedChatStates) {
        const parsedChatStates = JSON.parse(storedChatStates);
        const conversationChatState = parsedChatStates[conversation.id];
        
        if (conversationChatState) {
          setChatState(conversationChatState);
        } else {
          setChatState([]);
        }
      } else {
        setChatState([]);
      }
    } catch (error) {
      console.error('Error loading chat state:', error);
      setChatState([]);
    }
  };

  const saveChatState = () => {
    try {
      const storedChatStates = localStorage.getItem(CHAT_STATES_STORAGE_KEY);
      let chatStates = storedChatStates ? JSON.parse(storedChatStates) : {};
      
      chatStates[conversation.id] = chatState;
      
      localStorage.setItem(CHAT_STATES_STORAGE_KEY, JSON.stringify(chatStates));
    } catch (error) {
      console.error('Error saving chat state:', error);
    }
  };

  // const getCurrentConversation = () => {
  //   return conversation;
  // };

  const updateBOT = (chatStateInput: ChatState[], latestMessages: Message[]) => {
    const lastMessage = chatStateInput[chatStateInput.length - 1];
    
    if (!lastMessage || lastMessage.role !== 'assistant') {
      return;
    }
    
    try {
      const content = lastMessage.content;
      let finalOutput: string;
      
      if (typeof content === 'string') {
        try {
          const parsedContent = JSON.parse(content);
          finalOutput = parsedContent?.output || content;
        } catch {
          finalOutput = content;
        }
      } else {
        finalOutput = content.output || JSON.stringify(content);
      }

      const botMessage: Message = {
        id: Date.now().toString(),
        content: finalOutput,
        sender: 'bot',
        timestamp: new Date()
      };

      const updatedMessages = [...latestMessages, botMessage];
      
      const updatedConversation = {
        ...conversation,
        messages: updatedMessages,
      };

      updateConversation(updatedConversation);
      setSuggestions(generateSuggestions());
    } catch (error) {
      console.error('Error processing bot response:', error);
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date()
    };
    
    const updatedMessages = [...conversation.messages, userMessage];
    const updatedConversation = {
      ...conversation,
      messages: updatedMessages,
      title: updatedMessages.length === 1 ? content.substring(0, 30) : conversation.title
    };
    
    updateConversation(updatedConversation);
    
    const conversationIdForThisMessage = conversation.id;
    
    try {
      setIsLoading(true);
      const botResponse = await chatApiService(chatState, userMessage);
      
      if (currentConversationIdRef.current === conversationIdForThisMessage) {
        setChatState(botResponse);
        updateBOT(botResponse, updatedMessages);
      }
    } catch (error) {
      console.error('Failed to get bot response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSuggestions = (): SuggestionPrompt[] => {
    const messageCount = conversation.messages.length;
    
    if (messageCount % 3 === 1) {
      return SUGGESTION_SETS.FOLLOW_UP;
    } else if (messageCount % 3 === 2) {
      return SUGGESTION_SETS.OPINION;
    } else {
      return SUGGESTION_SETS.DEFAULT;
    }
  };

  return (
    <div className="chat-container">
      {conversation.messages.length === 0 ? (
        <div className="empty-chat">
          <h2>Start a new conversation</h2>
          <p>Ask me anything or try one of the suggestions below</p>
          <SuggestionList suggestions={suggestions} onSelectSuggestion={sendMessage} />
        </div>
      ) : (
        <MessageList messages={conversation.messages} isLoading={isLoading} />
      )}
      <div className="input-area">
        {conversation.messages.length > 0 && !isLoading && (
          <SuggestionList suggestions={suggestions} onSelectSuggestion={sendMessage} />
        )}
        <MessageInput onSendMessage={sendMessage} isDisabled={isLoading} />
      </div>
    </div>
  );
};

export default ChatContainer;