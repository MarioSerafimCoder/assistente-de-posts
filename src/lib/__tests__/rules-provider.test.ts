import { describe, expect, it } from "vitest";
import { RulesContentProvider } from "../content/providers/rules-provider";
import type { StructureContentRequest } from "../../types/content";

const provider = new RulesContentProvider();
const request = (copy: string, requestedFormat: StructureContentRequest["requestedFormat"] = "auto"): StructureContentRequest => ({
  brandId: "granistone", copy, requestedFormat, outputs: ["feed", "story"], maxSlides: 8, preserveCopy: true, provider: "rules",
});

describe("Rules Content Provider", () => {
  it("detecta headline sem reescrever", async () => {
    const post = await provider.structureContent(request("Nova coleção\n\nConheça os novos materiais."));
    expect(post.slides[0].headline).toBe("Nova coleção");
    expect(post.originalCopy).toBe("Nova coleção\n\nConheça os novos materiais.");
  });

  it("detecta CTA conservador no último slide", async () => {
    const post = await provider.structureContent(request("Conheça nossa coleção.\n\nFale com nossa equipe.", "carousel"));
    expect(post.slides.at(-1)?.role).toBe("cta");
    expect(post.slides.at(-1)?.cta).toBe("Fale com nossa equipe.");
  });

  it("preserva lista e usa role list", async () => {
    const post = await provider.structureContent(request("3 benefícios:\n\n- resistência\n- versatilidade\n- estética", "carousel"));
    expect(post.slides.some((slide) => slide.role === "list" && slide.body?.includes("- resistência"))).toBe(true);
  });

  it("prioriza campos explícitos e mantém a ordem do body", async () => {
    const post = await provider.structureContent(request("Título: Coleção Atemporal\nSubtítulo: Matéria e permanência\nTexto: Primeiro parágrafo.\n\nSegundo parágrafo.\nCTA: Fale conosco.", "single"));
    expect(post.slides[0]).toMatchObject({ headline: "Coleção Atemporal", subheadline: "Matéria e permanência", cta: "Fale conosco." });
    expect(post.slides[0].body).toBe("Primeiro parágrafo.\n\nSegundo parágrafo.");
  });

  it("retorna exatamente um slide quando solicitado", async () => {
    const post = await provider.structureContent(request("Título\n\nTexto principal.\n\nOutro parágrafo que também deve ser preservado.", "single"));
    expect(post.slides).toHaveLength(1);
    expect(post.slides[0].body).toContain("Outro parágrafo");
  });

  it("gera carrossel determinístico com múltiplos parágrafos", async () => {
    const input = request("Primeiro tema\n\nPrimeiro parágrafo completo.\n\nSegundo parágrafo completo.\n\nTerceiro parágrafo completo.", "carousel");
    const first = await provider.structureContent(input);
    const second = await provider.structureContent(input);
    expect(first.slides.length).toBeGreaterThanOrEqual(2);
    expect(second).toEqual(first);
  });

  it("reagrupa no maxSlides sem apagar conteúdo", async () => {
    const input = { ...request("Título principal\n\nBloco alfa completo.\n\nBloco beta completo.\n\nBloco gama completo.\n\nBloco delta completo.\n\nFale conosco.", "carousel"), maxSlides: 2 };
    const post = await provider.structureContent(input);
    const renderedText = JSON.stringify(post.slides);
    expect(post.slides).toHaveLength(2);
    expect(post.contentOverflow).toBe(true);
    for (const marker of ["alfa", "beta", "gama", "delta", "Fale conosco"]) expect(renderedText).toContain(marker);
  });

  it("reconhece citação sem alterar o texto", async () => {
    const post = await provider.structureContent(request("Manifesto\n\n“Matéria que atravessa o tempo.”\n\nTexto de apoio completo.", "carousel"));
    expect(post.slides.some((item) => item.role === "quote" && item.body === "“Matéria que atravessa o tempo.”")).toBe(true);
  });

  it("funciona sem qualquer configuração externa", async () => {
    const previous = { openai: process.env.OPENAI_API_KEY, local: process.env.LOCAL_AI_ENABLED, pexels: process.env.PEXELS_API_KEY };
    delete process.env.OPENAI_API_KEY; delete process.env.PEXELS_API_KEY; process.env.LOCAL_AI_ENABLED = "false";
    try {
      const post = await provider.structureContent(request("Olá mundo", "single"));
      expect(post.slides).toHaveLength(1);
      expect(post.originalCopy).toBe("Olá mundo");
    } finally {
      if (previous.openai === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = previous.openai;
      if (previous.local === undefined) delete process.env.LOCAL_AI_ENABLED; else process.env.LOCAL_AI_ENABLED = previous.local;
      if (previous.pexels === undefined) delete process.env.PEXELS_API_KEY; else process.env.PEXELS_API_KEY = previous.pexels;
    }
  });
});
