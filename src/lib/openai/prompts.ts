import type { StructureContentRequest } from "@/types/content";
import type { TemplateDefinition } from "@/types/template";

export const CONTENT_EDITOR_PROMPT = `Você é um editor de conteúdo para social media.
Sua função não é criar design, mas transformar a copy em conteúdo estruturado para templates aprovados.
Nunca invente fatos, números, nomes, datas, produtos ou alegações. Preserve informações técnicas.
Quando preserveCopy=true, mantenha mensagem e significado; faça apenas hierarquia, cortes e adequações indispensáveis.
Quando preserveCopy=false, melhore concisão e ritmo sem alterar fatos.
requestedFormat=single exige um slide. requestedFormat=carousel divide o conteúdo logicamente. Em auto, use um slide quando a mensagem couber com clareza e carrossel quando houver múltiplas ideias.
Em carrossel, o primeiro slide é capa/hook; não repita ideias; use CTA somente quando explícito ou claramente justificado.
Não preencha uma quantidade artificial de slides. Respeite os limites fornecidos. Retorne somente o schema solicitado.`;

export function buildContentRequestPrompt(request: StructureContentRequest, templates: TemplateDefinition[]): string {
  const limits = templates.slice(0, 3).map((template) => ({ id: template.id, textLimits: template.textLimits }));
  return JSON.stringify({
    task: "Estruture a copy para o Content Engine",
    brandId: request.brandId,
    requestedFormat: request.requestedFormat,
    maxSlides: request.maxSlides,
    preserveCopy: request.preserveCopy,
    copy: request.copy,
    availableTemplateLimits: limits,
    hardRules: [
      `slides deve ter no máximo ${request.maxSlides} itens`,
      request.requestedFormat === "single" ? "slides deve ter exatamente 1 item" : "não force quantidade de slides",
      "originalCopy deve reproduzir exatamente a copy recebida",
    ],
  });
}
