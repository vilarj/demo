import '@testing-library/jest-dom';

if (typeof globalThis.structuredClone === 'undefined') {
  globalThis.structuredClone = <T>(obj: T): T => {
    return JSON.parse(JSON.stringify(obj));
  };
}

// Setup DOM
beforeEach(() => {
  document.body.innerHTML = '';
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock getComputedStyle to prevent JSDOM errors
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: () => '0px',
    getPropertyPriority: () => '',
    setProperty: () => {},
    removeProperty: () => '',
    cssText: '',
    length: 0,
    parentRule: null,
    item: () => '',
  }),
});

// Mock scrollTo to prevent JSDOM errors
Object.defineProperty(window, 'scrollTo', {
  value: () => {},
  writable: true,
});

jest.mock('dayjs', () => {
  const actualDayjs: typeof import('dayjs') = jest.requireActual('dayjs');
  const mockDayjs = ((date?: string | number | Date | null | undefined) => {
    if (date) {
      return actualDayjs(date);
    }
    return actualDayjs('2025-06-08T00:00:00.000Z');
  }) as typeof actualDayjs;
  Object.assign(mockDayjs, actualDayjs);
  return mockDayjs;
});

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveClass(className: string): R;
      toHaveTextContent(text: string): R;
    }
  }
}
