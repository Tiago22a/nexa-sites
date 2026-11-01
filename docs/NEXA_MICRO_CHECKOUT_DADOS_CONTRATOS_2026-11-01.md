# NEXA BLUE — Micro checkout: cadastro, minuta e pagamento

Data: 01/11/2026 • Projeto: Tiago22a/nexa-sites

## Objetivo

Três planos (BARCO, IATE, SUBMARINO) com a mesma experiência:
1. Cliente informa nome, RG/documento, CPF, WhatsApp, e-mail e endereço completo.
2. Navegador gera uma **minuta PDF para conferência**, não um contrato legalmente assinado. O cliente pode baixar.
3. Após consentimento e verificação anti-robô, a cópia da minuta e o cadastro são enviados de modo criptografado para o Business Command em **MINUTAS RECEBIDAS**. A cópia pode ser baixada pela NEXA.
4. Cliente vê Pix, Cartão de Crédito e Boleto, mantendo os botões já integrados ao provedor via link individual do plano.
5. Cliente pode abrir WhatsApp e **anexar manualmente** contrato e comprovante no grupo. Anexos automáticos em grupo exigem integração oficial separada.
6. Projeto só pode ser liberado após assinatura definitiva, aprovação de escopo, confirmação bancária e recebimento dos materiais.

## Status do que foi programado

- Interface pronta nos três planos e responsiva; etapa de pagamento é mostrada diretamente para clientes com link individual `#pagar=<id>.<token>` emitido pelo Comando.
- Minuta PDF de todos os planos gerada no browser: não envia dados sem consentimento.
- Endpoint Netlify `nexa-intake.mjs` criado com AES-256-GCM (chave exclusiva), validação de campos, CPF, proteção Cloudflare Turnstile e armazenamento Netlify Blobs com consistência forte.
- Business Command com lista de minutas e download autorizado do PDF. Os dados são acessíveis **somente após login administrativo**.
- **Envio automático desativado por padrão** até configurar ambiente e proteção. A página informa honestamente a indisponibilidade.
- **Asaas não está ativado nem homologado** sem credenciais, conta aprovada e testes em Sandbox. Nenhuma cobrança real foi emitida nesta alteração.
- **Assinatura eletrônica NÃO foi integrada**: a minuta não produz vínculo de assinatura por si só. A equipe deve validar dados da CONTRATADA, termo final, escopo, pagamento e assinatura eletrônica em serviço apropriado.
- **SUBMARINO** continua sob proposta; não emitir contrato definitivo ou cobrança genérica.
- Contratos especiais como MC Gesso devem seguir o documento individual aprovado, não a minuta padrão do BARCO.

## Variáveis Netlify a serem criadas pelo Tiago

Todas secretas, exceto a chave pública Site Key:

- `NEXA_INTAKE_ENABLED=false`: manter false até tudo validado, mudar para `true` ao ativar.
- `NEXA_INTAKE_ENCRYPTION_KEY`: 64 caracteres hexadecimais aleatórios (32 bytes). **Guardar em cofre privado; sem ela não é possível recuperar minutas.**
- `NEXA_TURNSTILE_SITE_KEY`: chave pública Cloudflare Turnstile do domínio.
- `NEXA_TURNSTILE_SECRET_KEY`: chave secreta Turnstile, apenas no servidor.
- As variáveis Asaas anteriores: `ASAAS_API_KEY`, `ASAAS_BASE_URL`, `ASAAS_PAYMENTS_ENABLED`, `ASAAS_WEBHOOK_TOKEN`.
- Auth Comando: `NEXA_COMMAND_USERS_JSON`, `NEXA_COMMAND_SESSION_SECRET`.

Gerar segredo em terminal local: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.

## Segurança e operações

1. Definir responsável legal e dados completos da prestadora para os modelos de contrato. Não mostrar "contrato assinado" sem assinatura válida.
2. Configurar política de privacidade, base legal, retenção, backups, direito de exclusão e controle de acesso para RG, CPF e endereço. Atualmente a funcionalidade de envio é intencionalmente desligada.
3. Registrar site no Cloudflare Turnstile e configurar as duas chaves no Netlify. Instalar limitação de requisições/WAF e monitoramento de abuso antes de ativar o formulário público.
4. Testar em Preview/Sandbox: validação de CPF e campos, download PDF, confirmação no Comando, download do mesmo PDF, tempo de resposta, consentimento negado, token de captcha inválido, falhas de backend e dispositivo móvel.
5. Nunca inserir chaves API no repositório, HTML ou JavaScript público.
6. O PDF e os dados são armazenados criptografados, mas o acesso à sessão administrativa precisa estar corretamente ativado e protegido.
7. Integrar assinatura eletrônica usando um provedor autorizado, registrando evidências e via assinaturas antes de passar o status de contrato para aprovado.
8. Emitir cobrança bancária real via Asaas **somente** após contrato definitivo, dados e valores conferidos. Confirmar webhook/consulta bancária; comprovante do cliente é complementar.
9. O site não transmite arquivo diretamente para grupos de WhatsApp. Os links preenchem uma mensagem; o cliente precisa anexar o arquivo, ou a equipe utiliza integração oficial futura.
10. Para produção financeira intensa, migrar pedidos/documentos para armazenamento e banco transacional gerenciados com rotina de backup, controle de concorrência e auditoria.

## Links internos

- `/planos/barco/#formas-de-pagamento`
- `/planos/iate/#formas-de-pagamento`
- `/planos/submarino/#formas-de-pagamento`
- `/comando/` → "Minutas recebidas"

## Observações jurídicas

A minuta atual é um **documento preparatório** gerado com dados fornecidos pelo interessado. Não substitui contrato assinado, não garante preço especial, não confirma pagamento e não serve como comprovante. Revisar os textos com profissional jurídico antes de formalizar a versão final.
