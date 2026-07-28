import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useIsMobile } from "./use-mobile";

const MOBILE_BREAKPOINT = 768;

describe("useIsMobile", () => {
  let originalInnerWidth: number;
  let addEventListenerSpy: ReturnType<typeof vi.fn>;
  let removeEventListenerSpy: ReturnType<typeof vi.fn>;
  let listeners: Record<string, EventListener[]> = {};

  beforeEach(() => {
    originalInnerWidth = window.innerWidth;
    listeners = {};

    addEventListenerSpy = vi.fn((event: string, callback: EventListener) => {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(callback);
    });

    removeEventListenerSpy = vi.fn((event: string, callback: EventListener) => {
      if (!listeners[event]) return;
      listeners[event] = listeners[event].filter((cb) => cb !== callback);
    });

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // Deprecated
        removeListener: vi.fn(), // Deprecated
        addEventListener: addEventListenerSpy,
        removeEventListener: removeEventListenerSpy,
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
    vi.restoreAllMocks();
  });

  const setInnerWidth = (width: number) => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: width,
    });
  };

  const triggerMatchMediaChange = () => {
    if (listeners["change"]) {
      listeners["change"].forEach((cb) => cb(new Event("change")));
    }
  };

  it("should return false when window.innerWidth is >= 768", () => {
    setInnerWidth(800);
    const { result } = renderHook(() => useIsMobile());

    // Initially undefined, but hook returns !!isMobile (false)
    expect(result.current).toBe(false);
  });

  it("should return true when window.innerWidth is < 768", () => {
    setInnerWidth(500);
    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
  });

  it("should update when the matchMedia triggers a change event", () => {
    // Start with desktop width
    setInnerWidth(1024);
    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);

    // Simulate resizing to mobile width
    act(() => {
      setInnerWidth(375);
      triggerMatchMediaChange();
    });

    expect(result.current).toBe(true);

    // Simulate resizing back to desktop width
    act(() => {
      setInnerWidth(1200);
      triggerMatchMediaChange();
    });

    expect(result.current).toBe(false);
  });

  it("should clean up event listeners on unmount", () => {
    setInnerWidth(1024);
    const { unmount } = renderHook(() => useIsMobile());

    expect(addEventListenerSpy).toHaveBeenCalledWith("change", expect.any(Function));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith("change", expect.any(Function));
  });
});
