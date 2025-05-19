import { AutocompleteInput } from './components/AutocompleteInput';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <div className="app-content">
        <div className="app-header">
          <h1>Word Autocomplete</h1>
          <p>Start typing to see word suggestions</p>
        </div>
        
        <AutocompleteInput 
          placeholder="Type to search for words..." 
        />
        
        <div className="app-footer">
          <p>Try using keyboard navigation: arrow keys to navigate, Enter to select</p>
        </div>
      </div>
    </div>
  );
}

export default App;
