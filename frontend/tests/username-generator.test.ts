import { describe, it, expect } from "vitest";
import { generateUsername } from "../src/lib/username-generator";

describe("generateUsername", () => {
  it("generates username with vibe", () => {
    const username = generateUsername("banter", []);
    expect(username).toMatch(/^[A-Z][a-z]+(Wit|Spark|Chat|Banter|Quip)\d{2}$/);
  });

  it("generates username with tags", () => {
    const username = generateUsername(undefined, ["Quietly Curious"]);
    expect(username).toMatch(/^[A-Z][a-z]+Observer\d{2}$/);
  });

  it("generates username with vibe and tags (prefers vibe)", () => {
    const username = generateUsername("intros", ["Quietly Curious"]);
    expect(username).toMatch(/^[A-Z][a-z]+(Friend|Connector|Mixer|Greeter|Buddy)\d{2}$/);
  });

  it("generates username with fallback to Soul", () => {
    const username = generateUsername(undefined, []);
    expect(username).toMatch(/^[A-Z][a-z]+Soul\d{2}$/);
  });

  it("generates unique usernames", () => {
    const usernames = new Set();
    for (let i = 0; i < 100; i++) {
      usernames.add(generateUsername("banter", []));
    }
    // Should have some variation (not all identical)
    expect(usernames.size).toBeGreaterThan(1);
  });
});
