import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { handleStructureContentRequest } from "../content/http";

const previous = {
  openai: process.env.OPENAI_API_KEY,
  localEnabled: process.env.LOCAL_AI_ENABLED,
};

beforeEach(() => {
  delete process.env.OPENAI_API_KEY;
  process.env.LOCAL_AI_ENABLED = "false";
});

afterEach(() => {
  if (previous.openai === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = previous.openai;
  if (previous.localEnabled === undefined) delete process.env.LOCAL_AI_ENABLED; else process.env.LOCAL_AI_ENABLED = previous.localEnabled;
});

function request(provider: "local" | "openai") {
  return new Request("http://localhost/api/content/structure", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ brandId: "granistone", copy: "Copy preservada", requestedFormat: "single", outputs: ["feed"], maxSlides: 8, preserveCopy: true, provider }),
  });
}

describe("fallback de providers opcionais", () => {
  it("oferece Rules Provider quando OpenAI não está configurada", async () => {
    const response = await handleStructureContentRequest(request("openai"));
    const body = await response.json();
    expect(response.status).toBe(503);
    expect(body).toMatchObject({ provider: "openai", fallbackAvailable: true });
  });

  it("oferece Rules Provider quando IA local está desativada", async () => {
    const response = await handleStructureContentRequest(request("local"));
    const body = await response.json();
    expect(response.status).toBe(503);
    expect(body).toMatchObject({ provider: "local", fallbackAvailable: true });
  });
});
