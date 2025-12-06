import { useState, useEffect } from 'react';

const STORAGE_KEY = 'sql_query_favorites';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const savedFavorites = localStorage.getItem(STORAGE_KEY);
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (e) {
        console.error('Failed to load favorites:', e);
      }
    }
  }, []);

  const addToFavorites = (query, name) => {
    const newFavorite = {
      id: Date.now(),
      name: name || `Query ${favorites.length + 1}`,
      query,
      timestamp: new Date().toISOString(),
    };

    setFavorites(prevFavorites => {
      const updated = [newFavorite, ...prevFavorites];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const removeFromFavorites = (id) => {
    setFavorites(prevFavorites => {
      const updated = prevFavorites.filter(fav => fav.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const isFavorite = (query) => {
    return favorites.some(fav => fav.query === query);
  };

  return {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
  };
};

