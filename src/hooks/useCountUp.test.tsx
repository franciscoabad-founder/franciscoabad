import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useCountUp from './useCountUp';

describe('useCountUp', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(0));

    let time = 0;
    vi.stubGlobal('performance', {
      now: () => time
    });

    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      return setTimeout(() => {
        time += 16;
        cb(time);
      }, 16);
    });
    vi.stubGlobal('cancelAnimationFrame', (id: number) => {
      clearTimeout(id);
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('should return 0 initially', () => {
    const { result } = renderHook(() => useCountUp(100));
    expect(result.current).toBe(0);
  });

  it('should not start counting if start is false', () => {
    const { result } = renderHook(() => useCountUp(100, 1000, false));

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe(0);
  });

  it('should count up to target over default duration (2000ms)', () => {
    const { result } = renderHook(() => useCountUp(100, undefined, true));

    // At start
    expect(result.current).toBe(0);

    // Near halfway through (1008ms because of 16ms increments)
    act(() => {
      vi.advanceTimersByTime(1008);
    });

    // Value will be > 0 and < 100
    expect(result.current).toBeGreaterThan(0);
    expect(result.current).toBeLessThan(100);

    // Complete (2000ms total)
    act(() => {
      vi.advanceTimersByTime(1050); // Little extra to ensure completion
    });

    expect(result.current).toBe(100);
  });

  it('should respect custom duration', () => {
    const { result } = renderHook(() => useCountUp(100, 500, true));

    act(() => {
      vi.advanceTimersByTime(256); // 16 * 16
    });

    expect(result.current).toBeGreaterThan(0);
    expect(result.current).toBeLessThan(100);

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe(100);
  });

  it('should only run once even if rerendered', () => {
    const { result, rerender } = renderHook((props) => useCountUp(props.target, 1000, props.start), {
      initialProps: { target: 100, start: true }
    });

    // Let it finish
    act(() => {
      vi.advanceTimersByTime(1050);
    });
    expect(result.current).toBe(100);

    // Rerender with different target, should not restart because hasRun is true
    rerender({ target: 200, start: true });

    act(() => {
      vi.advanceTimersByTime(1050);
    });

    // Still 100 because effect returns early
    expect(result.current).toBe(100);
  });
});
