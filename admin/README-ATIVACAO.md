# NEXA BLUE — CRM administrativo (primeira versão)

## Implementado
- Painel /admin/ com login e cookie HttpOnly/Secure/SameSite=Strict.
- Clientes, projetos, cobranças, links de portfólio e alertas de vencimento.
- Hermes: GET /.netlify/functions/nexa-crm?op=hermes-summary somente contagens e somente leitura, com cabeçalho Authorization: Bearer <NEXA_HERMES_API_KEY>.
- Sem credenciais ou dados bancários públicos; sem contas administrativas habilitadas automaticamente.

**Status:** estrutura inicial. Não usar com dados reais antes de validação de segurança, privacidade, armazenamento e deploy pela equipe técnica.

## Ativar login na Netlify
Definir secretas nas variáveis de ambiente da Netlify (Functions):
1. NEXA_SESSION_SECRET: segredo aleatório forte, mínimo 32 caracteres.
2. NEXA_ADMIN_USERS_JSON: objeto JSON de logins para responsáveis, hashes independentes. Estrutura: {"gestor1":"<hash1>","gestor2":"<hash2>"} (não copie esses valores).
3. Opcional: NEXA_HERMES_API_KEY: segredo longo distinto, SOMENTE LEITURA.

No computador, para gerar o hash de cada senha: node scripts/nexa-admin-hash.mjs "SENHA-FORTE-UNICA". O resultado é saltHex:hashHex.
Não partilhe senhas no chat nem coloque segredos no GitHub.
Alternativa legada de uma conta: NEXA_ADMIN_USERNAME e NEXA_ADMIN_PASSWORD_HASH.

## Operação
O público navega normalmente no site. O acesso administrativo é pelo caminho /admin/. Sem as secretas, a função responde 503, então o login não funciona. Sessões expiram em 8 horas. O CRM usa Netlify Blobs com separação de produção e preview: suficiente para protótipo, NÃO substitui banco transacional.

Alertas de parcelas são recalculados ao abrir o painel. Não há e-mails ou notificações automáticas, Pix confirmado pelo banco ou emissão de boletos. Agendamento de Pix não é quitação.

Tolerância proposta de 3 dias corridos. Sem suspensão automática de site. Política só aplicável se aprovada em contrato e com notificação/avaliação administrativa.

## Próximas etapas
- Provedor de identidade, MFA, papéis separados para os dois administradores, logs e recuperação de acesso.
- Banco de dados transacional, backups e controle de acesso por organização.
- Upload real de imagens e arquivos privados com URLs assinadas. No protótipo guardam-se apenas links.
- Emissor de boletos e Pix + webhook de baixa e conciliação real.
- Contrato final e assinatura eletrônica com dados da prestadora, escopo e prazos.
- Hermes: aprovações explícitas, ações autorizadas e auditoria antes de qualquer automação operacional.
