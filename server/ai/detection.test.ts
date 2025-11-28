import { describe, expect, it } from "vitest";
import { detectOffline } from "./detection";

describe("Offline Detection", () => {
  it("should detect harassment keywords", () => {
    const result = detectOffline("You are a stupid woman and worthless");
    
    expect(result.isHarmful).toBe(true);
    expect(result.detectionType).toContain("harassment");
    expect(result.severity).toBe("medium");
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.aiModel).toBe("offline");
  });

  it("should detect threats", () => {
    const result = detectOffline("I will kill you and hurt your family");
    
    expect(result.isHarmful).toBe(true);
    expect(result.detectionType).toContain("threats");
    expect(result.severity).toBe("critical");
    expect(result.confidence).toBeGreaterThan(0);
  });

  it("should detect doxxing patterns", () => {
    const result = detectOffline("Her address is 123 Main Street and phone number is 555-123-4567");
    
    expect(result.isHarmful).toBe(true);
    expect(result.detectionType).toContain("doxxing");
    expect(result.severity).toBe("high");
  });

  it("should detect financial control", () => {
    const result = detectOffline("You must give me all your money and I control your bank account");
    
    expect(result.isHarmful).toBe(true);
    expect(result.detectionType).toContain("financialControl");
    expect(result.detectionType).toContain("coercion");
  });

  it("should detect coercion", () => {
    const result = detectOffline("You have to do this or else you will regret it");
    
    expect(result.isHarmful).toBe(true);
    expect(result.detectionType).toContain("coercion");
  });

  it("should detect sexual harassment", () => {
    const result = detectOffline("Send me your nudes and show me your body");
    
    expect(result.isHarmful).toBe(true);
    expect(result.detectionType).toContain("sexualHarassment");
    expect(result.severity).toBe("high");
  });

  it("should detect African slang", () => {
    const result = detectOffline("She is just an ashawo and runs girl");
    
    expect(result.isHarmful).toBe(true);
    expect(result.detectionType).toContain("africanSlang");
  });

  it("should detect gaslighting", () => {
    const result = detectOffline("You are crazy and imagining things, stop being so dramatic");
    
    expect(result.isHarmful).toBe(true);
    expect(result.detectionType).toContain("gaslighting");
  });

  it("should not flag benign content", () => {
    const result = detectOffline("Hello, how are you today? The weather is nice.");
    
    expect(result.isHarmful).toBe(false);
    expect(result.detectionType).toHaveLength(0);
    expect(result.severity).toBe("low");
    expect(result.confidence).toBe(0);
  });

  it("should handle short text", () => {
    const result = detectOffline("Hi");
    
    expect(result.isHarmful).toBe(false);
    expect(result.explanation).toContain("too short");
  });

  it("should detect multiple threat types", () => {
    const result = detectOffline(
      "You stupid bitch, I will kill you and everyone will know your address at 123 Main St"
    );
    
    expect(result.isHarmful).toBe(true);
    expect(result.detectionType.length).toBeGreaterThan(1);
    expect(result.detectionType).toContain("harassment");
    expect(result.detectionType).toContain("threats");
    expect(result.detectionType).toContain("doxxing");
    expect(result.severity).toBe("critical");
  });

  it("should have confidence proportional to threat level", () => {
    const mild = detectOffline("You are stupid");
    const severe = detectOffline("I will kill you and hurt your family, you worthless bitch");
    
    expect(severe.confidence).toBeGreaterThan(mild.confidence);
  });
});
