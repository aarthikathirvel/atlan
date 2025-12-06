import { useState } from 'react';

const QueryFavorites = ({ favorites, onSelectQuery, onRemoveFavorite, onAddFavorite, currentQuery, isFavorite }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [favoriteName, setFavoriteName] = useState('');

  const handleAddFavorite = () => {
    if (currentQuery.trim() && favoriteName.trim()) {
      onAddFavorite(currentQuery, favoriteName);
      setFavoriteName('');
      setShowAddForm(false);
    }
  };

  if (favorites.length === 0 && !showAddForm) {
    return (
      <div className="query-favorites">
        <div className="query-favorites-header">
          <h3>⭐ Saved Queries</h3>
          {currentQuery.trim() && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setShowAddForm(true)}
            >
              + Save Query
            </button>
          )}
        </div>
        <div className="query-favorites-empty">
          <p>No saved queries yet. Save frequently used queries for quick access.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="query-favorites">
      <div className="query-favorites-header">
        <h3>⭐ Saved Queries ({favorites.length})</h3>
        {currentQuery.trim() && !isFavorite && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowAddForm(true)}
          >
            + Save Current
          </button>
        )}
      </div>
      {showAddForm && (
        <div className="query-favorites-add">
          <input
            type="text"
            placeholder="Query name..."
            value={favoriteName}
            onChange={(e) => setFavoriteName(e.target.value)}
            className="query-favorites-input"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddFavorite();
              if (e.key === 'Escape') {
                setShowAddForm(false);
                setFavoriteName('');
              }
            }}
            autoFocus
          />
          <div className="query-favorites-add-actions">
            <button
              className="btn btn-primary btn-sm"
              onClick={handleAddFavorite}
              disabled={!favoriteName.trim()}
            >
              Save
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setShowAddForm(false);
                setFavoriteName('');
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      <div className="query-favorites-list">
        {favorites.map((favorite) => (
          <div
            key={favorite.id}
            className="query-favorites-item"
            onClick={() => onSelectQuery(favorite.query)}
          >
            <div className="query-favorites-item-content">
              <div className="query-favorites-name">{favorite.name}</div>
              <div className="query-favorites-query">
                <code>{favorite.query}</code>
              </div>
            </div>
            <button
              className="btn btn-icon"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveFavorite(favorite.id);
              }}
              title="Remove from saved queries"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QueryFavorites;

