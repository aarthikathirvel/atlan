import { useState, useEffect, useRef } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-sql';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/ext-language_tools';

const QueryEditor = ({ value, onChange, onExecute, isLoading }) => {
  const [localValue, setLocalValue] = useState(value || '');
  const editorRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  useEffect(() => {
    // Add global keyboard event listener as fallback
    const handleKeyDown = (e) => {
      // Check if the editor container is focused or contains the active element
      // Also check if Ace editor is focused by checking for ace editor classes
      const isEditorFocused = containerRef.current && (
        containerRef.current.contains(document.activeElement) ||
        containerRef.current === document.activeElement ||
        document.activeElement?.closest('.ace_editor') ||
        document.querySelector('.ace_editor.ace_focus')
      );

      if (isEditorFocused && (e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        if (!isLoading && localValue.trim()) {
          onExecute();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [onExecute, isLoading, localValue]);

  const handleChange = (newValue) => {
    setLocalValue(newValue);
    onChange(newValue);
  };

  const handleCopyQuery = async () => {
    if (localValue.trim()) {
      try {
        await navigator.clipboard.writeText(localValue);
        // Show temporary feedback
        const button = document.querySelector('.btn-copy');
        if (button) {
          const originalText = button.textContent;
          button.textContent = '✓ Copied!';
          button.style.backgroundColor = '#48bb78';
          setTimeout(() => {
            button.textContent = originalText;
            button.style.backgroundColor = '';
          }, 2000);
        }
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const handleFormatQuery = () => {
    if (!localValue.trim()) return;
    
    // Simple SQL formatting
    let formatted = localValue
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\s*,\s*/g, ', ') // Format commas
      .replace(/\s*\(\s*/g, ' (') // Format opening parentheses
      .replace(/\s*\)\s*/g, ') ') // Format closing parentheses
      .replace(/\s*=\s*/g, ' = ') // Format equals
      .replace(/\s*SELECT\s+/gi, '\nSELECT ')
      .replace(/\s*FROM\s+/gi, '\nFROM ')
      .replace(/\s*WHERE\s+/gi, '\nWHERE ')
      .replace(/\s*JOIN\s+/gi, '\nJOIN ')
      .replace(/\s*LEFT JOIN\s+/gi, '\nLEFT JOIN ')
      .replace(/\s*RIGHT JOIN\s+/gi, '\nRIGHT JOIN ')
      .replace(/\s*INNER JOIN\s+/gi, '\nINNER JOIN ')
      .replace(/\s*GROUP BY\s+/gi, '\nGROUP BY ')
      .replace(/\s*ORDER BY\s+/gi, '\nORDER BY ')
      .replace(/\s*HAVING\s+/gi, '\nHAVING ')
      .trim();
    
    setLocalValue(formatted);
    onChange(formatted);
  };

  const onLoad = (editor) => {
    editorRef.current = { editor };
    
    // Register Ace Editor command for Ctrl/Cmd + Enter
    editor.commands.addCommand({
      name: 'executeQuery',
      bindKey: { win: 'Ctrl-Enter', mac: 'Cmd-Enter' },
      exec: () => {
        if (!isLoading && localValue.trim()) {
          onExecute();
        }
      },
      readOnly: false,
    });
  };

  return (
    <div className="query-editor-container" ref={containerRef} tabIndex={-1}>
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
            className="btn btn-secondary btn-copy"
            onClick={handleCopyQuery}
            disabled={isLoading || !localValue.trim()}
            title="Copy query to clipboard"
          >
            📋 Copy
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleFormatQuery}
            disabled={isLoading || !localValue.trim()}
            title="Format SQL query"
          >
            ✨ Format
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
        onLoad={onLoad}
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
          enableSnippets: false,
          showLineNumbers: true,
          tabSize: 2,
        }}
        editorProps={{ $blockScrolling: true }}
      />
    </div>
  );
};

export default QueryEditor;

