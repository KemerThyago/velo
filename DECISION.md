# ADR 001: Separação de Builds no CI/CD para Ambientes Isolados

**Data:** 06 de Junho de 2026  
**Status:** ✅ Aceito  
**Contexto:** Vêlo Web / Pipeline de Deploy Automático (CI/CD)

---

## 1. O Problema

No **Vêlo**, nós utilizamos o **Vite** como nosso empacotador de frontend. Uma característica técnica fundamental do Vite é que ele realiza o *inline* (embute) das variáveis de ambiente com o prefixo `VITE_*` diretamente no código estático (`bundle`) gerado durante a etapa de build.

No design anterior da nossa pipeline, utilizávamos o comando `vercel promote`. Esse recurso pega o mesmo código que acabou de ser gerado e testado no ambiente de **Preview** e simplesmente re-aponta a URL oficial de Produção para ele, sem compilar um novo build.

**O Risco Crítico:** Como as chaves de acesso ao nosso Supabase de Preview (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`) ficam literalmente "chumbadas" no código compilado de Preview, promover esse bundle para a Produção resultava em **nossa aplicação oficial apontando e salvando dados no banco de dados de Preview.** Em um sistema lida com dados sensíveis de usuários (análises de crédito, faturamento), essa quebra de isolamento de ambientes é inaceitável.

## 2. Alternativas Consideradas

1. **`vercel promote` + Rebuild de Variáveis**
   - *Descrição:* Tentar buscar variáveis dinamicamente no frontend ao invés de usar o `.env` no tempo de build, mantendo o promote rápido do Vercel.
   - *Veredito:* Rejeitado. Isso fere as práticas recomendadas de injeção estática do Vite, diminui a performance e deixa a aplicação dependente de chamadas externas de infraestrutura antes de renderizar a interface.

2. **Dois Builds Independentes no GitHub Actions (Escolhida)**
   - *Descrição:* Remover totalmente a etapa de `promote` e dividir a pipeline em fluxos rígidos e independentes: um `build-preview` e, posteriormente, um `build-production`.
   - *Veredito:* Aceito. Abordagem limpa, extremamente auditável e garante isolamento total sem dar espaço para ambiguidades.

## 3. Decisão e Resultado

Optamos pela **separação arquitetural com dois builds (Alternativa 2)**. A esteira de Continuous Deployment (`cd.yml`) do Vêlo agora obedece o seguinte rigor de segurança:

1. **Ambiente Isolado (Preview):** Injeta rigorosamente as credenciais do **Supabase Preview**. O build e o deploy do frontend são feitos nessa "bolha".
2. **Homologação Segura:** O pipeline executa as `migrations` exclusivas de Preview e aciona o **Playwright** para rodar a suíte completa de testes E2E.
3. **Build Exclusivo (Produção):** **Somente** se os testes de Preview passarem com 100% de sucesso, o pipeline faz checkout do código novamente, cria um novo build limpo injetando estritamente os secrets oficiais de **Produção**, e faz o deploy final.

**Consequência:** Essa decisão adiciona cerca de 1 a 2 minutos ao tempo total da pipeline (devido ao duplo build), mas nos blinda contra qualquer tipo de vazamento de dados de teste na produção e nos garante que o sistema que está em produção foi gerado sob um contexto puramente isolado.
