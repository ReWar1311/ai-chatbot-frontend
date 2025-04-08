import { useState, useEffect } from 'react';
import Header from './components/Header';
import ChatContainer from './components/ChatContainer';
import Sidebar from './components/Sidebar';
import { Conversation } from './types';
import './App.css';

const STORAGE_KEYS = {
  CONVERSATIONS: 'chat_app_conversations',
  CURRENT_CONVERSATION: 'chat_app_current_conversation'
};

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  useEffect(() => {
    const storedConversations = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    const storedCurrentId = localStorage.getItem(STORAGE_KEYS.CURRENT_CONVERSATION);
    
    if (storedConversations) {
      try {
        const parsedConversations = JSON.parse(storedConversations) as Conversation[];
        
        const conversationsWithDates = parsedConversations.map(conv => ({
          ...conv,
          createdAt: new Date(conv.createdAt),
          messages: conv.messages.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        
        setConversations(conversationsWithDates);
        
        if (storedCurrentId && parsedConversations.some(conv => conv.id === storedCurrentId)) {
          setCurrentConversationId(storedCurrentId);
        } else if (conversationsWithDates.length > 0) {
          setCurrentConversationId(conversationsWithDates[0].id);
        }
      } catch (error) {
        console.error('Error parsing stored conversations:', error);
        createInitialConversation();
      }
    } else {
      createInitialConversation();
    }
  }, []);

  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
    }
  }, [conversations]);

  useEffect(() => {
    if (currentConversationId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_CONVERSATION, currentConversationId);
    }
  }, [currentConversationId]);

  const createInitialConversation = () => {
    const newConversation = createNewConversationObject();
    setConversations([newConversation]);
    setCurrentConversationId(newConversation.id);
  };

  const createNewConversationObject = (): Conversation => ({
    id: Date.now().toString(),
    title: 'New conversation',
    messages: [],
    createdAt: new Date()
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleNewConversation = () => {
    const newConversation = createNewConversationObject();
    setConversations([...conversations, newConversation]);
    setCurrentConversationId(newConversation.id);
  };

  const getCurrentConversation = () => {
    return conversations.find(conv => conv.id === currentConversationId) || conversations[0];
  };

  const updateConversation = (updatedConversation: Conversation) => {
    setConversations(conversations.map(conv => 
      conv.id === updatedConversation.id ? updatedConversation : conv
    ));
  };

  const deleteConversation = (id: string) => {
    const updatedConversations = conversations.filter(conv => conv.id !== id);
    setConversations(updatedConversations);
    
    if (currentConversationId === id) {
      setCurrentConversationId(updatedConversations[0]?.id || null);
    }
    
    if (updatedConversations.length === 0) {
      createInitialConversation();
    }
  };

  return (
    <div className="app">
      <Sidebar 
        isOpen={isSidebarOpen}
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={setCurrentConversationId}
        onNewConversation={handleNewConversation}
        onDeleteConversation={deleteConversation}
        toggleSidebar={toggleSidebar} 
      />
      <main className={`main-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <Header toggleSidebar={toggleSidebar} />
        <ChatContainer 
          conversation={getCurrentConversation()}
          updateConversation={updateConversation}
        />
      </main>
    </div>
  );
}

export default App;
