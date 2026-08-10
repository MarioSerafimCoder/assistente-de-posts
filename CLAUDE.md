# Assistente de Posts

Documento de arquitetura mantido com o nome histórico do projeto-base.

## Arquitetura atual

- Next.js 16, React 19, TypeScript strict e Tailwind CSS 4.
- OpenAI Responses API server-side em `src/lib/openai/`.
- Structured Outputs com Zod; nenhuma geração livre de HTML/CSS.
- Brand Kits em `src/brands/` e assets em `public/brands/`.
- Templates determinísticos em `src/templates/`.
- `renderGenerationSlide()` combina marca, template e conteúdo.
- `wrapSlideHtml()` continua sendo o contrato compartilhado de preview/exportação.
- Dados locais usam JSON, mutex e escrita atômica em `data/`.
- Exportação usa Puppeteer, Sharp e Archiver.

## Regras

- Toda chave fica apenas em `.env.local` e no servidor.
- Nunca inserir copy como HTML; usar `escapeHtml()`.
- Feed e Story reutilizam o mesmo `StructuredPost`.
- Troca de template, logo, variante ou imagem não chama a OpenAI.
- Imagem por IA somente após ação explícita do usuário.
- Preserve `wrapSlideHtml()` como contrato único entre iframe e PNG.
- Params de rotas dinâmicas do Next.js 16 são Promises.
