import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("merges standard class names", () => {
    expect(cn("class1", "class2")).toBe("class1 class2");
  });

  it("handles conditional classes correctly", () => {
    expect(cn("class1", true && "class2", false && "class3")).toBe("class1 class2");
    expect(cn("class1", undefined, null, "", "class2")).toBe("class1 class2");
  });

  it("handles object syntax from clsx", () => {
    expect(cn({ class1: true, class2: false, class3: true })).toBe("class1 class3");
  });

  it("handles array syntax from clsx", () => {
    expect(cn(["class1", "class2"])).toBe("class1 class2");
  });

  it("merges tailwind classes using tailwind-merge", () => {
    // p-2 overrides p-4
    expect(cn("p-4", "p-2")).toBe("p-2");
    // p-4 overrides both px-2 and py-1
    expect(cn("px-2 py-1", "p-4")).toBe("p-4");
    // text-blue-500 overrides text-red-500
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("handles a mix of complex inputs with tailwind classes", () => {
    expect(
      cn("bg-red-500 px-4", ["text-white", { "bg-blue-500": true, "px-2": false }], undefined, null)
    ).toBe("px-4 text-white bg-blue-500");
  });
});
