# Como adicionar um template

1. Crie uma `TemplateDefinition` em `src/templates/<marca>/`.
2. Defina `id`, `brandId`, nome, categoria, papéis de slide e tags.
3. Declare variantes independentes em `variants.feed` e `variants.story`.
4. Escolha o layout determinístico de cada variante: `split`, `editorial`, `centered`, `numbered`, `image-led` ou `cta`.
5. Declare limites para headline, subheadline, body e CTA: caracteres recomendados/máximos, linhas e faixa de fonte.
6. Associe elementos visuais apenas por regras explícitas do template.
7. Registre a definição em `src/templates/registry.ts`.
8. Abra o Brand Manager para revisar miniaturas Feed e Story.
9. Rode os testes e exporte PNGs reais para verificar dimensões e fit.

## Exemplo mínimo

```ts
const template: TemplateDefinition = {
  id: "editorial-02",
  brandId: "nova-marca",
  name: "Editorial 02",
  category: "editorial",
  slideRoles: ["cover", "content", "quote"],
  tags: ["editorial", "conteúdo"],
  variants: {
    feed: [{ id: "editorial-02-feed-light", name: "light", output: "feed", background: "light", layout: "editorial" }],
    story: [{ id: "editorial-02-story-light", name: "light", output: "story", background: "light", layout: "editorial" }],
  },
  textLimits: {
    headline: { recommendedChars: 45, maxChars: 80, maxLines: 3, minFontSize: 42, preferredFontSize: 68, maxFontSize: 82 },
  },
};
```

Feed e Story devem pertencer ao mesmo sistema visual, mas não ser meros redimensionamentos. O renderer atual muda distribuição, escala, espaçamento e posições conforme a saída.
