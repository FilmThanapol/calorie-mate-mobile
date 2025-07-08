import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

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

// Mock FileReader
global.FileReader = vi.fn().mockImplementation(() => ({
  readAsDataURL: vi.fn(),
  onload: null,
  onerror: null,
  result: 'data:image/jpeg;base64,mock-data',
}));

// Mock Notification API
global.Notification = vi.fn().mockImplementation(() => ({
  close: vi.fn(),
  onclick: null,
}));

Object.defineProperty(Notification, 'permission', {
  value: 'default',
  writable: true,
});

Object.defineProperty(Notification, 'requestPermission', {
  value: vi.fn().mockResolvedValue('granted'),
  writable: true,
});

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
  Line: vi.fn().mockImplementation(({ data, options }) => (
    <div data-testid="line-chart" data-chart-data={JSON.stringify(data)} />
  )),
  Bar: vi.fn().mockImplementation(({ data, options }) => (
    <div data-testid="bar-chart" data-chart-data={JSON.stringify(data)} />
  )),
  Doughnut: vi.fn().mockImplementation(({ data, options }) => (
    <div data-testid="doughnut-chart" data-chart-data={JSON.stringify(data)} />
  )),
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

  const mockIcons = {};
  icons.forEach(icon => {
    mockIcons[icon] = vi.fn().mockImplementation(({ className, ...props }) => (
      <svg className={className} data-testid={`${icon.toLowerCase()}-icon`} {...props} />
    ));
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
  const { I18nProvider } = require('@/components/I18nProvider');

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const AllTheProviders = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <ThemeProvider>
          <BrowserRouter>
            {children}
          </BrowserRouter>
        </ThemeProvider>
      </I18nProvider>
    </QueryClientProvider>
  );

  return require('@testing-library/react').render(ui, {
    wrapper: AllTheProviders,
    ...options,
  });
};

// Export commonly used testing utilities
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
