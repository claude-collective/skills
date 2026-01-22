import { describe, it, expect } from "vitest";
import { getStackDir } from "./skill-copier";

describe("skill-copier", () => {
  describe("getStackDir", () => {
    it("should return correct stack directory path in .claude-collective", () => {
      const result = getStackDir("/my/project", "fullstack-react");
      expect(result).toBe(
        "/my/project/.claude-collective/stacks/fullstack-react",
      );
    });

    it("should handle project paths with trailing slash", () => {
      const result = getStackDir("/my/project/", "work-stack");
      // path.join normalizes this
      expect(result).toBe("/my/project/.claude-collective/stacks/work-stack");
    });

    it("should handle stack names with special characters", () => {
      const result = getStackDir("/project", "my-stack-v2");
      expect(result).toBe("/project/.claude-collective/stacks/my-stack-v2");
    });

    it("should handle Windows-style paths", () => {
      // path.join should handle this correctly
      const result = getStackDir("C:\\Users\\dev\\project", "stack");
      expect(result).toContain("stack");
      expect(result).toContain(".claude-collective");
      expect(result).toContain("stacks");
    });
  });
});
