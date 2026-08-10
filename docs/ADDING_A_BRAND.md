# Como adicionar uma marca

1. Escolha um `slug` em minúsculas, sem espaços, por exemplo `nova-marca`.
2. Crie `src/brands/nova-marca/brand.config.ts` implementando `BrandDefinition`.
3. Crie `public/brands/nova-marca/` com `logos`, `fonts`, `elements`, `textures`, `patterns`, `icons` e `images`.
4. Coloque os logos reais na pasta `logos/` e atualize todos os caminhos da configuração.
5. Coloque WOFF2/TTF em `fonts/` e declare `localSources` na tipografia. Fontes locais têm prioridade.
6. Cadastre elementos visuais com tipo, contextos, posições, cores e opacidade permitidas.
7. Cadastre imagens com tags e categorias; a biblioteca local tem prioridade sobre provedores externos.
8. Crie ou associe templates próprios da marca.
9. Importe a configuração em `src/brands/index.ts` e adicione-a à lista `candidates`.
10. Rode `npm test`, `npm run lint` e `npm run build`.

O schema Zod rejeita cores inválidas, slugs inadequados e definições incompletas sem derrubar as demais marcas. Enquanto um asset oficial não existir, marque `placeholder: true` e nomeie-o claramente como demonstrativo.

## Checklist visual

- Confirme logo branca em fundos escuros e logo principal/preta em fundos claros.
- Verifique licenças das fontes e imagens.
- Teste Feed e Story, inclusive textos próximos ao limite.
- Abra `/settings/brands/<slug>` para auditar o kit.
