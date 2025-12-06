import { useState, useEffect } from 'react';

const STORAGE_KEY = 'sql_query_history';

export const useQueryHistory = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // Load history from localStorage
    const savedHistory = localStorage.getItem(STORAGE_KEY);
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to load query history:', e);
      }
    }
  }, []);

  const addToHistory = (query, result) => {
    const newEntry = {
      id: Date.now(),
      query,
      timestamp: new Date().toISOString(),
      rowsAffected: result.rowsAffected || 0,
      executionTime: result.executionTime || 0,
    };

    setHistory(prevHistory => {
      const updatedHistory = [newEntry, ...prevHistory].slice(0, 50); // Keep last 50 queries
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
      return updatedHistory;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const removeFromHistory = (id) => {
    setHistory(prevHistory => {
      const updatedHistory = prevHistory.filter(entry => entry.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
      return updatedHistory;
    });
  };

  return {
    history,
    addToHistory,
    clearHistory,
    removeFromHistory,
  };
};

