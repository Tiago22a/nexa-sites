# NEXA BLUE · BUSINESS COMMAND

CRM independente da NEXA, acessível em \`/comando/\`. Não compartilha os bancos, sessões ou segredos do painel legado \`/admin/\`.

## Fluxo operacional
1. **Oportunidades**: cadastrar leads, etapa da negociação e próximo contato.
2. **Clientes**: cadastrar empresas e responsáveis.
3. **Propostas**: vincular cliente ou lead e acompanhar negociação, valor e validade.
4. **Projetos**: atribuir responsáveis, prazos, serviços e briefing.
5. **Tarefas**: controlar ações internas ou associadas a clientes/projetos.
6. **Entregas**: controlar peças, páginas, vídeos e aprovações por projeto.
7. **Contratos**: acompanhar vigência, valores e renovação.
8. **A receber**: registrar recebíveis, vencimentos e pagamentos **manuais**.
9. **Despesas**: acompanhar custos e contas a pagar.

Inclui indicadores operacionais, calendário de prioridades, pesquisa, filtros, exportação CSV, histórico de alterações e atribuição do usuário que alterou cada cadastro.

## Ativação obrigatória
A API é uma **Netlify Function** e depende de **Netlify Blobs** (package.json já contém @netlify/blobs). O site estático não deve guardar dados reais no navegador ou no repositório Git.

Configure, **fora do GitHub**, em Netlify > Site configuration > Environment variables:
- \`NEXA_COMMAND_SESSION_SECRET\`: segredo aleatório com pelo menos 32 caracteres. Independente do antigo NEXA_SESSION_SECRET.
- \`NEXA_COMMAND_USERS_JSON\`: JSON com **pelo menos dois** nomes de usuário e hashes individuais.

Exemplo de FORMATO, sem credenciais válidas:
\`\`\`json
{"gestor1":"SALT_HEX:HASH_HEX","gestor2":"SALT_HEX:HASH_HEX"}
\`\`\`

Gere cada hash **localmente**, com senhas fortes distintas de 14+ caracteres:
\`\`\`sh
node scripts/nexa-admin-hash.mjs "SUA-SENHA-FORTE-E-PRIVADA"
\`\`\`

O resultado \`saltHex:hashHex\` vai na variável privada; nunca no código, chat, frontend, issue ou commit. Após atualizar variáveis, faça novo deploy pela Netlify. Com menos de dois usuários ou sem segredo o servidor retorna 503 e não libera login.

## Segurança e limites da versão inicial
- Acesso por sessão assinada de até 4 horas, cookie HttpOnly + Secure + SameSite=Strict.
- Requisições de escrita exigem origem do próprio site; leitura/escrita de registros somente autenticada.
- API separada e namespace de armazenamento separado do painel antigo.
- Nenhum usuário ou senha padrão, dados fictícios ou contas criadas automaticamente.
- Cada criação/edição/exclusão registra nome do operador e data no log privado.
- Registros editados simultaneamente são protegidos por versão de atualização.
- Exclusão de clientes, contratos e lançamentos financeiros é bloqueada para resguardar histórico.
- Links externos devem usar HTTPS; campos são validados na API.
- Não existem importação automática do site/WhatsApp, cobrança Pix/boleto, conciliação bancária, assinatura eletrônica ou notificação proativa.
- **Antes de inserir dados reais**: validar LGPD, política de retenção, backups/restauração, permissões e acesso, rate limiting de login no proxy/WAF, MFA e controles de infraestrutura. Netlify Blobs é adequado para protótipo e pequenos volumes; para operação financeira crítica e uso intenso, migrar para banco transacional com backup e RBAC.
- O ícone discreto do rodapé **não é a medida de segurança**; o bloqueio real é feito no servidor.

## Checklist de aceitação
- Sem variáveis, a página mostra login, mas API retorna 503 e nenhum cadastro é exposto.
- Configurar **duas** contas independentes; login inválido retorna 401.
- Login válido: criar cliente > projeto > tarefa e entrega; recarregar e confirmar persistência.
- Confirmar segregação: dados do \`/admin/\` não aparecem no \`/comando/\`.
- Confirmar que um administrador pode atualizar após o outro, e edição desatualizada recebe 409.
- Verificar CSV e indicadores com lançamentos teste.
- Validar deploy Netlify, cabeçalhos de segurança e responsividade.
