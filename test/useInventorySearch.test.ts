import { act, renderHook, waitFor } from '@testing-library/react';
import { useInventorySearch } from '../src/components/hooks/useInventorySearch';

// Mock setTimeout to control timing in tests
jest.useFakeTimers();

describe('useInventorySearch', () => {
  beforeEach(() => {
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useInventorySearch());

    expect(result.current.activeTab).toBe('all');
    expect(result.current.searchText).toBe('');
    expect(result.current.debouncedSearchText).toBe('');
  });

  it('should update active tab', () => {
    const { result } = renderHook(() => useInventorySearch());

    act(() => {
      result.current.setActiveTab('assigned');
    });

    expect(result.current.activeTab).toBe('assigned');

    act(() => {
      result.current.setActiveTab('available');
    });

    expect(result.current.activeTab).toBe('available');
  });

  it('should update search text immediately', () => {
    const { result } = renderHook(() => useInventorySearch());

    act(() => {
      result.current.setSearchText('test search');
    });

    expect(result.current.searchText).toBe('test search');
    // Debounced text should not change immediately
    expect(result.current.debouncedSearchText).toBe('');
  });

  it('should debounce search text after 300ms', async () => {
    const { result } = renderHook(() => useInventorySearch());

    act(() => {
      result.current.setSearchText('debounced text');
    });

    expect(result.current.searchText).toBe('debounced text');
    expect(result.current.debouncedSearchText).toBe('');

    // Fast-forward time by 300ms
    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(result.current.debouncedSearchText).toBe('debounced text');
    });
  });

  it('should reset debounce timer when search text changes rapidly', async () => {
    const { result } = renderHook(() => useInventorySearch());

    // First change
    act(() => {
      result.current.setSearchText('first');
    });

    // Advance time partially (less than 300ms)
    act(() => {
      jest.advanceTimersByTime(150);
    });

    expect(result.current.debouncedSearchText).toBe('');

    // Second change before debounce completes
    act(() => {
      result.current.setSearchText('second');
    });

    // Advance time partially again
    act(() => {
      jest.advanceTimersByTime(150);
    });

    expect(result.current.debouncedSearchText).toBe('');

    // Complete the debounce period for the second change
    act(() => {
      jest.advanceTimersByTime(150);
    });

    await waitFor(() => {
      expect(result.current.debouncedSearchText).toBe('second');
    });
  });

  it('should handle empty search text', () => {
    const { result } = renderHook(() => useInventorySearch());

    act(() => {
      result.current.setSearchText('some text');
    });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    act(() => {
      result.current.setSearchText('');
    });

    expect(result.current.searchText).toBe('');

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current.debouncedSearchText).toBe('');
  });

  it('should handle multiple rapid changes and only apply the last one', async () => {
    const { result } = renderHook(() => useInventorySearch());

    const searchTexts = ['a', 'ab', 'abc', 'abcd', 'final text'];

    searchTexts.forEach((text, index) => {
      act(() => {
        result.current.setSearchText(text);
        if (index < searchTexts.length - 1) {
          jest.advanceTimersByTime(50); // Advance by less than debounce time
        }
      });
    });

    expect(result.current.searchText).toBe('final text');
    expect(result.current.debouncedSearchText).toBe('');

    // Complete the debounce period
    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(result.current.debouncedSearchText).toBe('final text');
    });
  });

  it('should provide stable function references', () => {
    const { result, rerender } = renderHook(() => useInventorySearch());

    const firstRender = {
      setActiveTab: result.current.setActiveTab,
      setSearchText: result.current.setSearchText,
    };

    rerender();

    expect(result.current.setActiveTab).toBe(firstRender.setActiveTab);
    expect(result.current.setSearchText).toBe(firstRender.setSearchText);
  });

  it('should maintain independent state for tab and search', () => {
    const { result } = renderHook(() => useInventorySearch());

    act(() => {
      result.current.setActiveTab('assigned');
      result.current.setSearchText('test');
    });

    expect(result.current.activeTab).toBe('assigned');
    expect(result.current.searchText).toBe('test');

    act(() => {
      result.current.setActiveTab('available');
    });

    expect(result.current.activeTab).toBe('available');
    expect(result.current.searchText).toBe('test'); // Should remain unchanged
  });

  it('should handle long search text', async () => {
    const { result } = renderHook(() => useInventorySearch());
    const longText = 'a'.repeat(1000);

    act(() => {
      result.current.setSearchText(longText);
    });

    expect(result.current.searchText).toBe(longText);

    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(result.current.debouncedSearchText).toBe(longText);
    });
  });

  it('should handle special characters in search text', async () => {
    const { result } = renderHook(() => useInventorySearch());
    const specialText = '!@#$%^&*()_+-={}[]|\\:";\'<>?,./ 中文 🎉';

    act(() => {
      result.current.setSearchText(specialText);
    });

    expect(result.current.searchText).toBe(specialText);

    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(result.current.debouncedSearchText).toBe(specialText);
    });
  });
});
