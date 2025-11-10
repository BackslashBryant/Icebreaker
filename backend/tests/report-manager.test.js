import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  addReport,
  hasReported,
  getUniqueReporterCount,
  getReportsForTarget,
  clearAllReports,
} from "../src/services/ReportManager.js";

/**
 * Report Manager Test Suite
 * 
 * Tests for report storage and management functions.
 * Covers report tracking, unique reporter counting, and metadata storage.
 */

describe("ReportManager", () => {
  beforeEach(() => {
    // Clear all reports before each test to ensure isolation
    clearAllReports();
    vi.clearAllMocks();
  });

  describe("addReport", () => {
    it("stores report metadata", () => {
      const reporterId = "reporter-123";
      const targetId = "target-456";
      const category = "harassment";

      addReport(reporterId, targetId, category);

      expect(hasReported(reporterId, targetId)).toBe(true);
      expect(getUniqueReporterCount(targetId)).toBe(1);
    });

    it("prevents duplicate reports from same reporter", () => {
      const reporterId = "reporter-123";
      const targetId = "target-456";

      // First report
      addReport(reporterId, targetId, "harassment");
      expect(getUniqueReporterCount(targetId)).toBe(1);

      // Second report from same reporter (should not increase count)
      addReport(reporterId, targetId, "spam");
      expect(getUniqueReporterCount(targetId)).toBe(1);
    });

    it("allows multiple reports from different reporters", () => {
      const targetId = "target-456";

      addReport("reporter-1", targetId, "harassment");
      addReport("reporter-2", targetId, "spam");
      addReport("reporter-3", targetId, "impersonation");

      expect(getUniqueReporterCount(targetId)).toBe(3);
    });

    it("stores report metadata with timestamp", () => {
      const reporterId = "reporter-123";
      const targetId = "target-456";
      const category = "harassment";
      
      // Capture timestamp before and after to account for execution time
      const beforeTime = Date.now();
      addReport(reporterId, targetId, category);
      const afterTime = Date.now();

      const reports = getReportsForTarget(targetId);
      expect(reports.length).toBeGreaterThan(0);

      const report = reports.find((r) => r.reporterId === reporterId);
      expect(report).toBeDefined();
      expect(report.targetId).toBe(targetId);
      expect(report.category).toBe(category);
      // Allow small tolerance for execution time
      expect(report.timestamp).toBeGreaterThanOrEqual(beforeTime - 10);
      expect(report.timestamp).toBeLessThanOrEqual(afterTime + 10);
    });
  });

  describe("hasReported", () => {
    it("returns false for non-existent report", () => {
      expect(hasReported("reporter-123", "target-456")).toBe(false);
    });

    it("returns true after report is added", () => {
      const reporterId = "reporter-123";
      const targetId = "target-456";

      addReport(reporterId, targetId, "harassment");
      expect(hasReported(reporterId, targetId)).toBe(true);
    });

    it("returns false for different reporter", () => {
      const targetId = "target-456";

      addReport("reporter-1", targetId, "harassment");
      expect(hasReported("reporter-2", targetId)).toBe(false);
    });

    it("returns false for different target", () => {
      const reporterId = "reporter-123";

      addReport(reporterId, "target-1", "harassment");
      expect(hasReported(reporterId, "target-2")).toBe(false);
    });
  });

  describe("getUniqueReporterCount", () => {
    it("returns 0 for non-existent target", () => {
      expect(getUniqueReporterCount("non-existent-target")).toBe(0);
    });

    it("returns 1 for single reporter", () => {
      const targetId = "target-456";
      addReport("reporter-1", targetId, "harassment");
      expect(getUniqueReporterCount(targetId)).toBe(1);
    });

    it("returns correct count for multiple unique reporters", () => {
      const targetId = "target-456";

      addReport("reporter-1", targetId, "harassment");
      addReport("reporter-2", targetId, "spam");
      addReport("reporter-3", targetId, "impersonation");

      expect(getUniqueReporterCount(targetId)).toBe(3);
    });

    it("does not count duplicate reports from same reporter", () => {
      const targetId = "target-456";

      addReport("reporter-1", targetId, "harassment");
      addReport("reporter-1", targetId, "spam"); // Duplicate from same reporter
      addReport("reporter-2", targetId, "impersonation");

      expect(getUniqueReporterCount(targetId)).toBe(2);
    });
  });

  describe("getReportsForTarget", () => {
    it("returns empty array for non-existent target", () => {
      expect(getReportsForTarget("non-existent-target")).toEqual([]);
    });

    it("returns all reports for a target", () => {
      const targetId = "target-456";

      addReport("reporter-1", targetId, "harassment");
      addReport("reporter-2", targetId, "spam");
      addReport("reporter-3", targetId, "impersonation");

      const reports = getReportsForTarget(targetId);
      expect(reports.length).toBe(3);
      expect(reports.every((r) => r.targetId === targetId)).toBe(true);
    });

    it("does not return reports for other targets", () => {
      addReport("reporter-1", "target-1", "harassment");
      addReport("reporter-2", "target-2", "spam");

      const reports1 = getReportsForTarget("target-1");
      expect(reports1.length).toBe(1);
      expect(reports1[0].targetId).toBe("target-1");

      const reports2 = getReportsForTarget("target-2");
      expect(reports2.length).toBe(1);
      expect(reports2[0].targetId).toBe("target-2");
    });

    it("includes report metadata (category, timestamp, reporterId)", () => {
      const reporterId = "reporter-123";
      const targetId = "target-456";
      const category = "harassment";

      addReport(reporterId, targetId, category);

      const reports = getReportsForTarget(targetId);
      expect(reports.length).toBe(1);
      expect(reports[0]).toHaveProperty("reporterId", reporterId);
      expect(reports[0]).toHaveProperty("targetId", targetId);
      expect(reports[0]).toHaveProperty("category", category);
      expect(reports[0]).toHaveProperty("timestamp");
      expect(typeof reports[0].timestamp).toBe("number");
    });
  });
});

