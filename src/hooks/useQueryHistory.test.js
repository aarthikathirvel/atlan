import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useQueryHistory } from './useQueryHistory';

describe('useQueryHistory', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with empty history', () => {
    const { result } = renderHook(() => useQueryHistory());
    expect(result.current.history).toEqual([]);
  });

  it('should load history from localStorage', () => {
    const savedHistory = [
      { id: 1, query: 'SELECT * FROM users', timestamp: '2024-01-01', rowsAffected: 10, executionTime: 100 },
    ];
    localStorage.setItem('sql_query_history', JSON.stringify(savedHistory));

    const { result } = renderHook(() => useQueryHistory());
    expect(result.current.history).toEqual(savedHistory);
  });

  it('should add query to history', () => {
    const { result } = renderHook(() => useQueryHistory());

    act(() => {
      result.current.addToHistory('SELECT * FROM users', {
        rowsAffected: 10,
        executionTime: 100,
      });
    });

    expect(result.current.history.length).toBe(1);
    expect(result.current.history[0].query).toBe('SELECT * FROM users');
    expect(result.current.history[0].rowsAffected).toBe(10);
    expect(result.current.history[0].executionTime).toBe(100);
  });

  it('should limit history to 50 entries', async () => {
    const { result } = renderHook(() => useQueryHistory());

    act(() => {
      for (let i = 0; i < 60; i++) {
        result.current.addToHistory(`SELECT * FROM table${i}`, {
          rowsAffected: i,
          executionTime: 100,
        });
      }
    });

    await waitFor(() => {
      expect(result.current.history.length).toBe(50);
    });
  });

  it('should clear history', () => {
    const { result } = renderHook(() => useQueryHistory());

    act(() => {
      result.current.addToHistory('SELECT * FROM users', {
        rowsAffected: 10,
        executionTime: 100,
      });
    });

    expect(result.current.history.length).toBe(1);

    act(() => {
      result.current.clearHistory();
    });

    expect(result.current.history.length).toBe(0);
    expect(localStorage.getItem('sql_query_history')).toBeNull();
  });

  it('should remove specific item from history', async () => {
    const { result } = renderHook(() => useQueryHistory());

    act(() => {
      result.current.addToHistory('SELECT * FROM users', {
        rowsAffected: 10,
        executionTime: 100,
      });
    });

    await waitFor(() => {
      expect(result.current.history.length).toBe(1);
    });

    act(() => {
      result.current.addToHistory('SELECT * FROM orders', {
        rowsAffected: 20,
        executionTime: 200,
      });
    });

    await waitFor(() => {
      expect(result.current.history.length).toBe(2);
    });

    const ordersId = result.current.history.find(h => h.query === 'SELECT * FROM orders')?.id;
    expect(ordersId).toBeDefined();

    act(() => {
      result.current.removeFromHistory(ordersId);
    });

    await waitFor(() => {
      expect(result.current.history.length).toBe(1);
      expect(result.current.history[0].query).toBe('SELECT * FROM users');
    });
  });

  it('should persist history to localStorage', () => {
    const { result } = renderHook(() => useQueryHistory());

    act(() => {
      result.current.addToHistory('SELECT * FROM users', {
        rowsAffected: 10,
        executionTime: 100,
      });
    });

    const saved = JSON.parse(localStorage.getItem('sql_query_history'));
    expect(saved.length).toBe(1);
    expect(saved[0].query).toBe('SELECT * FROM users');
  });
});

