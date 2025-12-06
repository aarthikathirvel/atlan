import { useState } from 'react';

const KeyboardShortcuts = () => {
  const [isOpen, setIsOpen] = useState(false);

  const shortcuts = [
    { key: 'Ctrl/Cmd + Enter', description: 'Execute query', category: 'Query' },
    { key: 'Ctrl/Cmd + /', description: 'Toggle comment', category: 'Editor' },
    { key: 'Ctrl/Cmd + K', description: 'Clear editor', category: 'Editor' },
    { key: 'Ctrl/Cmd + F', description: 'Find in editor', category: 'Editor' },
    { key: 'Ctrl/Cmd + H', description: 'Replace in editor', category: 'Editor' },
    { key: 'Ctrl/Cmd + S', description: 'Save query to favorites', category: 'Query' },
    { key: 'Esc', description: 'Close modals/dialogs', category: 'Navigation' },
    { key: 'Click cell', description: 'Copy cell value', category: 'Results' },
    { key: 'Click header', description: 'Sort column', category: 'Results' },
    { key: 'Ctrl/Cmd + Click', description: 'Select multiple rows', category: 'Results' },
  ];

  const shortcutsByCategory = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {});

  if (!isOpen) {
    return (
      <button
        className="btn btn-secondary btn-sm keyboard-shortcuts-btn"
        onClick={() => setIsOpen(true)}
        title="Keyboard Shortcuts"
      >
        ⌨️ Shortcuts
      </button>
    );
  }

  return (
    <>
      <div className="modal-overlay" onClick={() => setIsOpen(false)}></div>
      <div className="keyboard-shortcuts-modal">
        <div className="modal-header">
          <h2>⌨️ Keyboard Shortcuts</h2>
          <button
            className="btn btn-icon"
            onClick={() => setIsOpen(false)}
            title="Close"
          >
            ×
          </button>
        </div>
        <div className="shortcuts-content">
          {Object.entries(shortcutsByCategory).map(([category, items]) => (
            <div key={category} className="shortcuts-category">
              <h3>{category}</h3>
              <div className="shortcuts-list">
                {items.map((shortcut, index) => (
                  <div key={index} className="shortcut-item">
                    <kbd className="shortcut-key">{shortcut.key}</kbd>
                    <span className="shortcut-description">{shortcut.description}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={() => setIsOpen(false)}>
            Got it!
          </button>
        </div>
      </div>
    </>
  );
};

export default KeyboardShortcuts;

