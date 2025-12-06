import { useState, useEffect } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-sql';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/ext-language_tools';

const QueryEditor = ({ value, onChange, onExecute, isLoading }) => {
  const [localValue, setLocalValue] = useState(value || '');

  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  const handleChange = (newValue) => {
    setLocalValue(newValue);
    onChange(newValue);
  };

  const handleKeyDown = (e) => {
    // Ctrl/Cmd + Enter to execute
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onExecute();
    }
  };

  return (
    <div className="query-editor-container">
      <div className="query-editor-header">
        <h3>SQL Query Editor</h3>
        <div className="query-editor-actions">
          <button
            className="btn btn-primary"
            onClick={onExecute}
            disabled={isLoading || !localValue.trim()}
          >
            {isLoading ? 'Executing...' : 'Execute Query (Ctrl+Enter)'}
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setLocalValue('');
              onChange('');
            }}
            disabled={isLoading}
          >
            Clear
          </button>
        </div>
      </div>
      <AceEditor
        mode="sql"
        theme="monokai"
        value={localValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        name="sql-editor"
        width="100%"
        height="300px"
        fontSize={14}
        showPrintMargin={true}
        showGutter={true}
        highlightActiveLine={true}
        setOptions={{
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true,
          enableSnippets: true,
          showLineNumbers: true,
          tabSize: 2,
        }}
        editorProps={{ $blockScrolling: true }}
      />
    </div>
  );
};

export default QueryEditor;

