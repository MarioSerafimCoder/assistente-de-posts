# Content Engine

O Content Engine transforma uma copy em um único formato compartilhado, `StructuredPost`. Brand Engine, Template Engine, renderer e exportação não precisam saber qual provider foi usado.

## Providers

### Rules Provider (`rules`)

É o padrão e está sempre disponível. Normaliza a copy, reconhece campos explícitos, headline, CTA, listas e citações, classifica o conteúdo, extrai palavras-chave presentes no texto e divide carrosséis sem chamadas de rede. Não cria frases, fatos ou CTAs.

### Local AI Provider (`local`)

Opcional. Usa um servidor OpenAI-compatible configurado por ambiente. O health check possui timeout curto e só consulta o endereço local quando `LOCAL_AI_ENABLED=true`.

### OpenAI Provider (`openai`)

Opcional. Usa Responses API, Structured Outputs e Zod. Só é chamado quando o usuário seleciona OpenAI. Falhas de autenticação, quota ou rede não bloqueiam o Rule Engine.

## Seleção e fallback

O padrão é `rules`. A preferência explícita fica no `localStorage` do navegador. A API nunca tenta OpenAI automaticamente. Quando `local` ou `openai` falha, a resposta informa `fallbackAvailable` e a interface oferece **Continuar sem IA**, preservando o formulário e a copy.

## API

`POST /api/content/structure` recebe:

```json
{
  "brandId": "granistone",
  "copy": "...",
  "requestedFormat": "auto",
  "outputs": ["feed", "story"],
  "maxSlides": 8,
  "preserveCopy": true,
  "provider": "rules"
}
```

O retorno inclui `post`, `providerUsed` e `cached`. A rota antiga `/api/ai/structure-content` permanece como alias temporário.

## Cache e histórico

A chave do cache inclui marca, copy, formato, preservação, limite de slides e provider. O histórico registra `providerUsed`; gerações antigas sem o campo continuam sendo interpretadas como processamento local.

## Adicionar um provider

1. Implemente `ContentProvider` em `src/lib/content/providers/`.
2. Garanta que `isAvailable()` seja rápido e não gere efeitos colaterais.
3. Retorne o mesmo `StructuredPost` validado pelo schema independente.
4. Registre o provider em `content-engine.ts` e adicione seu identificador ao tipo/schema.
5. Adicione testes de indisponibilidade, validação e fallback.
