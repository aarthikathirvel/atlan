import { expect, afterEach, vi, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock ace-builds
vi.mock('ace-builds/src-noconflict/mode-sql', () => ({}));
vi.mock('ace-builds/src-noconflict/theme-monokai', () => ({}));
vi.mock('ace-builds/src-noconflict/ext-language_tools', () => ({}));

// Setup DOM container
beforeAll(() => {
  if (!document.getElementById('root')) {
    const root = document.createElement('div');
    root.id = 'root';
    document.body.appendChild(root);
  }
});

// Cleanup after each test
afterEach(() => {
  cleanup();
});

