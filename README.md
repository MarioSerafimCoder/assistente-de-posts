# Assistente de Posts

Aplicação local-first e multimarca para transformar uma copy em post único ou carrossel, adaptar o conteúdo para Feed 4:5 e Stories 9:16, editar e exportar PNG/ZIP.

> **A aplicação não exige API de IA.** O fluxo principal funciona offline, sem chave, créditos, LM Studio, Ollama, Pexels ou qualquer serviço externo.

Baseado no projeto MIT [Open Carrusel](https://github.com/Hainrixz/open-carrusel), de Enrique Rocha / tododeia. A licença e os créditos do upstream permanecem preservados em `LICENSE` e no histórico Git.

## Funcionalidades

- Rule Engine determinístico e offline como motor padrão.
- Providers opcionais para LM Studio/OpenAI-compatible e OpenAI.
- Post único, carrossel e escolha automática baseada em estrutura.
- Brand Kits, templates aprovados e limites reais de texto.
- Feed 1080×1350 e Stories 1080×1920 a partir do mesmo `StructuredPost`.
- Preview, filmstrip, edição, upload e biblioteca local de imagens.
- Busca opcional no Pexels e geração opcional de imagem com OpenAI.
- Exportação PNG/ZIP via Chromium/Puppeteer e histórico local.

## Funcionamento offline

Sem nenhuma variável configurada:

- posts únicos funcionam;
- carrosséis funcionam;
- Feed e Stories funcionam;
- upload e Brand Kits funcionam;
- preview, edição e histórico funcionam;
- exportação PNG/ZIP funciona.

No modo **Sem IA**, a copy é processada localmente e não é enviada a OpenAI, analytics, telemetria, Pexels ou qualquer serviço remoto. O Pexels só é consultado quando o usuário pesquisa imagens e possui uma chave configurada.

## Executar sem administrador

Dê dois cliques em `INICIAR_ASSISTENTE.bat`. Para reinstalar dependências locais, use `INSTALAR_LOCAL.bat`. Os atalhos usam o runtime disponível no perfil do usuário e não exigem elevação de privilégio.

Em uma máquina com Node.js 20 ou superior:

```bash
npm install
npm run dev
```

Abra `http://localhost:3000/create`. Não é necessário criar `.env.local` para gerar posts.

## Integrações opcionais

Copie `.env.example` para `.env.local` somente se desejar ativar integrações:

```env
LOCAL_AI_ENABLED=false
LOCAL_AI_BASE_URL=http://127.0.0.1:1234/v1
LOCAL_AI_MODEL=

OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.6-terra
OPENAI_REASONING_EFFORT=low
OPENAI_IMAGE_MODEL=

PEXELS_API_KEY=
```

A preferência do motor fica no navegador em **Configurações → Inteligência**. Nenhum provider pago é selecionado automaticamente. Consulte [Content Engine](docs/CONTENT_ENGINE.md) e [IA local](docs/LOCAL_AI.md).

## Arquitetura

```text
Copy
  → Content Engine
      → Rule Engine [padrão, offline]
      → Local AI [opcional]
      → OpenAI [opcional]
  → StructuredPost validado com Zod
  → Brand Engine
  → Template Engine
  → Visual Engine
  → HTML/CSS
  → preview / Puppeteer
  → PNG / ZIP
```

Dados gerados ficam em `data/` e uploads em `public/uploads/`. Ambos são locais e ignorados pelo Git.

## Brand Kits e templates

As marcas ficam em `src/brands/<slug>/brand.config.ts` e seus assets em `public/brands/<slug>/`. Consulte [docs/ADDING_A_BRAND.md](docs/ADDING_A_BRAND.md).

O registry de templates fica em `src/templates/registry.ts`. Cada template declara papéis de slide, tags, limites de texto e variantes Feed/Story. Consulte [docs/ADDING_A_TEMPLATE.md](docs/ADDING_A_TEMPLATE.md).

## Qualidade

```bash
npm run lint
npm test
npm run build
npm run test:export
```

Os testes cobrem parsers e heurísticas locais, determinismo, fluxo sem APIs, schemas, engines, renderer e dimensões reais de exportação.

## Licença

MIT. Este fork preserva `LICENSE` e os créditos do Open Carrusel.
