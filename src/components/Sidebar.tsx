import { Conversation } from '../types';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  toggleSidebar: () => void;
  onDeleteConversation: (id: string) => void; // New prop for delete functionality
}

const Sidebar = ({ 
  isOpen, 
  conversations, 
  currentConversationId, 
  onSelectConversation, 
  onNewConversation,
  onDeleteConversation,
  toggleSidebar
}: SidebarProps) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <button className="new-chat-button" onClick={onNewConversation}>
          + New Chat
        </button>
        <h2>Conversations</h2>
      <button className="close-sidebar" onClick={toggleSidebar}>
        <span className="menu-icon">x</span>
      </button>
      </div>
      <div className="conversation-list">
        {conversations.map(conversation => (
          <div 
            key={conversation.id}
            className={`conversation-item ${conversation.id === currentConversationId ? 'active' : ''}`}
            onClick={() => onSelectConversation(conversation.id)}
          >
            <div className="conversation-content">
              <div className="conversation-title">
                {conversation.title}
              </div>
              <div className="conversation-date">
                {formatDate(conversation.createdAt)}
              </div>
            </div>
            <button 
              className="delete-button" 
              onClick={(e) => {
                e.stopPropagation(); 
                onDeleteConversation(conversation.id);
              }}
              aria-label="Delete conversation"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18"></path>
                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"></path>
                <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
              </svg>
            </button>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;