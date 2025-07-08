import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import React from 'react';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Clean up after each test case
afterEach(() => {
  cleanup();
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock navigator.clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn().mockResolvedValue(''),
  },
  writable: true,
});

// Mock navigator.mediaDevices
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: vi.fn().mockResolvedValue({
      getTracks: () => [{ stop: vi.fn() }],
    }),
    enumerateDevices: vi.fn().mockResolvedValue([]),
  },
  writable: true,
});

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = vi.fn().mockReturnValue('mock-url');
global.URL.revokeObjectURL = vi.fn();

// Mock FileReader with proper constructor and static properties
class MockFileReader {
  static readonly EMPTY = 0;
  static readonly LOADING = 1;
  static readonly DONE = 2;
  
  readAsDataURL = vi.fn();
  onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
  onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
  result: string | ArrayBuffer | null = 'data:image/jpeg;base64,mock-data';
  readyState = 0;
  abort = vi.fn();
  addEventListener = vi.fn();
  dispatchEvent = vi.fn();
  removeEventListener = vi.fn();
  readAsArrayBuffer = vi.fn();
  readAsBinaryString = vi.fn();
  readAsText = vi.fn();
  onabort = null;
  onloadend = null;
  onloadstart = null;
  onprogress = null;
  error = null;
}

global.FileReader = MockFileReader as any;

// Mock Notification API with proper constructor and static properties
class MockNotification {
  static permission: NotificationPermission = 'default';
  static requestPermission = vi.fn().mockResolvedValue('granted' as NotificationPermission);
  
  constructor(title: string, options?: NotificationOptions) {
    // Mock implementation
  }
  
  close = vi.fn();
  onclick: ((this: Notification, ev: Event) => any) | null = null;
  onclose: ((this: Notification, ev: Event) => any) | null = null;
  onerror: ((this: Notification, ev: Event) => any) | null = null;
  onshow: ((this: Notification, ev: Event) => any) | null = null;
  
  readonly actions: readonly any[] = [];
  readonly badge = '';
  readonly body = '';
  readonly data: any = null;
  readonly dir: NotificationDirection = 'auto';
  readonly icon = '';
  readonly image = '';
  readonly lang = '';
  readonly renotify = false;
  readonly requireInteraction = false;
  readonly silent = false;
  readonly tag = '';
  readonly timestamp = Date.now();
  readonly title = '';
  readonly vibrate: readonly number[] = [];
  
  addEventListener = vi.fn();
  dispatchEvent = vi.fn();
  removeEventListener = vi.fn();
}

global.Notification = MockNotification as any;

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    protocol: 'http:',
    host: 'localhost:3000',
    hostname: 'localhost',
    port: '3000',
    pathname: '/',
    search: '',
    hash: '',
    reload: vi.fn(),
    assign: vi.fn(),
    replace: vi.fn(),
  },
  writable: true,
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
  log: vi.fn(),
};

// Mock environment variables
vi.stubEnv('VITE_GOOGLE_SHEETS_API_URL', 'https://script.google.com/macros/s/test/exec');

// Mock Chart.js
vi.mock('chart.js', () => ({
  Chart: vi.fn().mockImplementation(() => ({
    destroy: vi.fn(),
    update: vi.fn(),
    resize: vi.fn(),
  })),
  registerables: [],
}));

// Mock react-chartjs-2
vi.mock('react-chartjs-2', () => ({
  Line: vi.fn().mockImplementation(({ data }) => 
    React.createElement('div', { 
      'data-testid': 'line-chart', 
      'data-chart-data': JSON.stringify(data) 
    })
  ),
  Bar: vi.fn().mockImplementation(({ data }) => 
    React.createElement('div', { 
      'data-testid': 'bar-chart', 
      'data-chart-data': JSON.stringify(data) 
    })
  ),
  Doughnut: vi.fn().mockImplementation(({ data }) => 
    React.createElement('div', { 
      'data-testid': 'doughnut-chart', 
      'data-chart-data': JSON.stringify(data) 
    })
  ),
}));

// Mock Lucide React icons
vi.mock('lucide-react', () => {
  const icons = [
    'Camera', 'Plus', 'Settings', 'Target', 'TrendingUp', 'History',
    'X', 'Upload', 'Loader2', 'AlertCircle', 'CheckCircle2', 'Bell',
    'BellOff', 'Wifi', 'WifiOff', 'RefreshCw', 'Home', 'Bug',
    'Moon', 'Sun', 'Globe', 'Languages', 'Calculator', 'Info',
    'Save', 'User', 'Smartphone', 'Droplets', 'Clock', 'Search',
    'Filter', 'ArrowUpDown', 'Image', 'Download', 'Calendar'
  ];

  const mockIcons: any = {};
  icons.forEach(icon => {
    mockIcons[icon] = vi.fn().mockImplementation(({ className, ...props }) =>
      React.createElement('svg', { 
        className, 
        'data-testid': `${icon.toLowerCase()}-icon`, 
        ...props 
      })
    );
  });

  return mockIcons;
});

// Helper function to create mock file
export const createMockFile = (name: string, type: string, size: number = 1024) => {
  const file = new File(['mock content'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

// Helper function to mock successful API response
export const mockApiSuccess = (data: any) => ({
  success: true,
  data,
});

// Helper function to mock API error
export const mockApiError = (error: string) => ({
  success: false,
  error,
});

// Helper function to wait for async operations
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

// Custom render function with providers
export const renderWithProviders = (ui: React.ReactElement, options = {}) => {
  const { QueryClient, QueryClientProvider } = require('@tanstack/react-query');
  const { BrowserRouter } = require('react-router-dom');
  const { ThemeProvider } = require('@/components/ThemeProvider');
  const { DataProvider } = require('@/contexts/DataContext');

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const AllTheProviders = ({ children }: { children: React.ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient },
      React.createElement(DataProvider, {},
        React.createElement(ThemeProvider, {},
          React.createElement(BrowserRouter, {},
            children
          )
        )
      )
    )
  );

  return require('@testing-library/react').render(ui, {
    wrapper: AllTheProviders,
    ...options,
  });
};

// Export commonly used testing utilities
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
