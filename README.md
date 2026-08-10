# Assistente de Posts

Aplicação local-first e multimarca para transformar uma copy em post único ou carrossel, adaptar a mesma estrutura para Feed 4:5 e Stories 9:16, visualizar, ajustar e exportar PNG/ZIP.

O projeto usa templates determinísticos para preservar a identidade. A OpenAI interpreta e hierarquiza o conteúdo; ela não gera HTML/CSS nem inventa a direção de arte.

Baseado no projeto MIT [Open Carrusel](https://github.com/Hainrixz/open-carrusel), de Enrique Rocha / tododeia. A licença e os créditos do upstream permanecem preservados em `LICENSE` e no histórico Git.

## Funcionalidades

- OpenAI Responses API com Structured Outputs e Zod.
- Uma chamada de conteúdo por geração; Feed e Stories reutilizam o mesmo resultado.
- Cache determinístico por marca, copy, formato, modo de preservação e limite de slides.
- Brand Kits nativos, regras de logo, fontes locais e biblioteca de assets.
- Seis templates demonstrativos por marca, com composições Feed e Story.
- Preview seguro em iframe usando o mesmo renderer lógico da exportação.
- Edição de headline, subheadline, body, CTA, template, variante, logo e imagem.
- Filmstrip com duplicação, exclusão e drag-and-drop.
- Upload PNG/JPG/WebP com validação, Sharp e remoção de metadados.
- Busca opcional no Pexels e geração opcional com `gpt-image-2`.
- Exportação via Chromium/Puppeteer em 1080×1350 e 1080×1920.
- Histórico local e Brand Manager.

## Executar neste computador sem administrador

Dê dois cliques em:

```text
INICIAR_ASSISTENTE.bat
```

O atalho usa o Node.js portátil já presente no perfil do usuário. Não instala componentes globais, não altera o Windows e não pede elevação de privilégios.

Para reinstalar dependências locais, use:

```text
INSTALAR_LOCAL.bat
```

## Execução padrão

Em uma máquina que já tenha Node.js 20 ou superior:

```bash
npm install
npm run dev
```

Abra `http://localhost:3000/create`.

## Ambiente

Copie `.env.example` para `.env.local` e preencha somente os segredos locais:

```env
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.6-terra
OPENAI_REASONING_EFFORT=low
OPENAI_IMAGE_MODEL=gpt-image-2
PEXELS_API_KEY=
```

`.env.local` é ignorado pelo Git. A chave da OpenAI é lida apenas em módulos server-side e nunca é enviada ao browser.

Pexels é opcional. Quando `PEXELS_API_KEY` está vazio, a aplicação continua funcionando e usa upload/biblioteca local.

## Arquitetura

```text
Copy
  → OpenAI Responses API
  → StructuredPost validado
  → Content Engine
  → Brand Engine
  → Template Engine
  → Visual Engine
  → HTML/CSS confiável
  → iframe de preview / Puppeteer
  → PNG / ZIP
```

Dados gerados ficam em `data/` e uploads em `public/uploads/`. Ambos são locais e ignorados pelo Git.

## Brand Kits

Configuração:

```text
src/brands/<slug>/brand.config.ts
```

Assets reais:

```text
public/brands/<slug>/
  logos/
  fonts/
  elements/
  textures/
  patterns/
  icons/
  images/
```

Os assets atuais são placeholders explicitamente identificados. Para cadastrar uma marca, consulte [docs/ADDING_A_BRAND.md](docs/ADDING_A_BRAND.md).

## Templates

O registry fica em `src/templates/registry.ts`. As definições demonstrativas estão em `src/templates/granistone/definitions.ts` e são aplicadas às marcas de exemplo.

Cada template declara papéis de slide, tags, limites de texto e variantes separadas de Feed e Story. Consulte [docs/ADDING_A_TEMPLATE.md](docs/ADDING_A_TEMPLATE.md).

## Exportação

- Feed: 1080×1350 (`4:5`).
- Stories: 1080×1920 (`9:16`).
- Um único arquivo retorna PNG.
- Múltiplos slides ou “Baixar tudo” retornam ZIP com pastas `feed/` e `stories/`.
- A ordem acompanha o filmstrip.

## Qualidade

```bash
npm run lint
npm test
npm run build
npm run test:export
```

Os testes cobrem schema de marca, resolução de logo, ranking de templates, StructuredPost, cache key, nomes de arquivo, variantes Feed/Story, integração do renderer e dimensões reais de exportação.

## Licença e upstream

MIT. Este fork preserva `LICENSE` e reconhece o Open Carrusel, tododeia e seu autor original. A integração funcional com Claude CLI foi removida; o fluxo principal usa exclusivamente o SDK oficial `openai` no servidor.
