import { SuggestionPrompt } from '../types';
import './SuggestionList.css';

interface SuggestionListProps {
  suggestions: SuggestionPrompt[];
  onSelectSuggestion: (suggestion: string) => void;
}

const SuggestionList = ({ suggestions, onSelectSuggestion }: SuggestionListProps) => {
  return (
    <div className="suggestion-list">
      {suggestions.map(suggestion => (
        <button
          key={suggestion.id}
          className="suggestion-item"
          onClick={() => onSelectSuggestion(suggestion.text)}
        >
          {suggestion.text}
        </button>
      ))}
    </div>
  );
};

export default SuggestionList;