# IA local opcional

A aplicação não exige IA local. Use esta integração somente se quiser reorganizar ou otimizar texto com um modelo executado no seu computador.

## LM Studio

1. Instale o LM Studio por conta própria.
2. Carregue um modelo compatível com geração de JSON.
3. Ative o servidor OpenAI-compatible.
4. Configure `.env.local`:

```env
LOCAL_AI_ENABLED=true
LOCAL_AI_BASE_URL=http://127.0.0.1:1234/v1
LOCAL_AI_MODEL=nome-do-modelo-carregado
```

5. Reinicie a aplicação e escolha **Configurações → Inteligência → IA local**.

O endereço padrão é `127.0.0.1:1234/v1`. Nenhum modelo específico é obrigatório ou definido no código.

## Estados de indisponibilidade

Se o LM Studio estiver fechado, o servidor não responder ou nenhum modelo estiver informado, a interface mostra **IA local indisponível**. A copy permanece no formulário e o botão **Continuar sem IA** usa o Rules Provider local.
