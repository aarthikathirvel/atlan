import { describe, it, expect } from 'vitest';
import { executeQuery, mockQueries, queryTemplates } from './mockData';

describe('mockData', () => {
  describe('executeQuery', () => {
    it('should return data for SELECT * FROM users query', () => {
      const result = executeQuery('SELECT * FROM users');
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.columns).toEqual(['id', 'name', 'email', 'age', 'city', 'created_at']);
      expect(result.data.rows.length).toBeGreaterThan(0);
      expect(result.executionTime).toBeGreaterThan(0);
      expect(result.rowsAffected).toBeGreaterThan(0);
    });

    it('should return data for SELECT * FROM orders query', () => {
      const result = executeQuery('SELECT * FROM orders');
      expect(result.success).toBe(true);
      expect(result.data.columns).toEqual(['order_id', 'customer_id', 'product', 'quantity', 'price', 'order_date', 'status']);
      expect(result.data.rows.length).toBeGreaterThan(0);
    });

    it('should return data for SELECT * FROM products query', () => {
      const result = executeQuery('SELECT * FROM products');
      expect(result.success).toBe(true);
      expect(result.data.columns).toEqual(['product_id', 'name', 'category', 'price', 'stock', 'supplier']);
      expect(result.data.rows.length).toBeGreaterThan(0);
    });

    it('should return data for SELECT * FROM employees query', () => {
      const result = executeQuery('SELECT * FROM employees');
      expect(result.success).toBe(true);
      expect(result.data.columns).toEqual(['emp_id', 'first_name', 'last_name', 'department', 'salary', 'hire_date']);
      expect(result.data.rows.length).toBeGreaterThan(0);
    });

    it('should return data for SELECT * FROM transactions query', () => {
      const result = executeQuery('SELECT * FROM transactions');
      expect(result.success).toBe(true);
      expect(result.data.columns).toEqual(['transaction_id', 'account_id', 'type', 'amount', 'balance', 'timestamp']);
      expect(result.data.rows.length).toBeGreaterThan(0);
    });

    it('should handle case-insensitive queries', () => {
      const result = executeQuery('select * from users');
      expect(result.success).toBe(true);
      expect(result.data.columns).toEqual(['id', 'name', 'email', 'age', 'city', 'created_at']);
    });

    it('should handle queries with extra whitespace', () => {
      const result = executeQuery('  SELECT * FROM users  ');
      expect(result.success).toBe(true);
      expect(result.data.columns).toEqual(['id', 'name', 'email', 'age', 'city', 'created_at']);
    });

    it('should return default response for unmatched queries', () => {
      const result = executeQuery('SELECT * FROM unknown_table');
      expect(result.success).toBe(true);
      expect(result.data.columns).toEqual([]);
      expect(result.data.rows.length).toBe(0);
      expect(result.rowsAffected).toBe(0);
      expect(result.message).toBeDefined();
    });

    it('should return execution time for all queries', () => {
      const result = executeQuery('SELECT * FROM users');
      expect(result.executionTime).toBeGreaterThan(0);
      expect(typeof result.executionTime).toBe('number');
    });

    it('should return empty result for queries with WHERE clause that filters everything', () => {
      const result = executeQuery('SELECT * FROM users WHERE id = 999999');
      expect(result.success).toBe(true);
      expect(result.data.columns.length).toBeGreaterThan(0);
      expect(result.data.rows.length).toBe(0);
      expect(result.rowsAffected).toBe(0);
      expect(result.message).toBeDefined();
    });

    it('should return empty result for queries with impossible WHERE conditions', () => {
      const result = executeQuery('SELECT * FROM orders WHERE 1 = 0');
      expect(result.success).toBe(true);
      expect(result.data.rows.length).toBe(0);
      expect(result.rowsAffected).toBe(0);
    });
  });

  describe('mockQueries', () => {
    it('should have all expected query keys', () => {
      expect(mockQueries).toHaveProperty('SELECT * FROM users');
      expect(mockQueries).toHaveProperty('SELECT * FROM orders');
      expect(mockQueries).toHaveProperty('SELECT * FROM products');
      expect(mockQueries).toHaveProperty('SELECT * FROM employees');
      expect(mockQueries).toHaveProperty('SELECT * FROM transactions');
    });

    it('should have correct structure for each query', () => {
      Object.values(mockQueries).forEach(queryData => {
        expect(queryData).toHaveProperty('columns');
        expect(queryData).toHaveProperty('rows');
        expect(Array.isArray(queryData.columns)).toBe(true);
        expect(Array.isArray(queryData.rows)).toBe(true);
        expect(queryData.columns.length).toBeGreaterThan(0);
        expect(queryData.rows.length).toBeGreaterThan(0);
      });
    });
  });

  describe('queryTemplates', () => {
    it('should have query templates', () => {
      expect(queryTemplates.length).toBeGreaterThan(0);
    });

    it('should have correct structure for each template', () => {
      queryTemplates.forEach(template => {
        expect(template).toHaveProperty('name');
        expect(template).toHaveProperty('query');
        expect(typeof template.name).toBe('string');
        expect(typeof template.query).toBe('string');
      });
    });
  });
});

