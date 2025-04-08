import './Header.css';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header = ({ toggleSidebar }: HeaderProps) => {
  return (
    <header className="header">
      <button className="menu-button" onClick={toggleSidebar}>
        <span className="menu-icon">☰</span>
      </button>
      <h1 className="app-title">ReWar's AI Assistant</h1>
      <div className="header-actions">
        <button className="settings-button">⚙️</button>
      </div>
    </header>
  );
};

export default Header;