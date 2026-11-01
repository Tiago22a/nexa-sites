# NEXA BLUE — Checkout compacto com Asaas (01/11/2026)

## Implementação
- Três botões públicos (Pix, cartão, boleto) nos planos BARCO, IATE, SUBMARINO, sem formulários do cliente.
- No /comando/ a equipe gera link individual somente após verificar contrato assinado, cliente, valores e dados bancários.
- O URL do cliente usa fragmento #pagar=id.token; não publica CPF/CNPJ ou credenciais do Asaas.
- O backend chama a API Asaas e gera cobrança única, vinculada ao cliente; reuso e bloqueio de cobrança duplicada por chave de pedido.
- Em caso de timeout/erro, interrompe tentativas para reconciliação manual; nunca emitir novamente às cegas.
- O pagamento só aparece confirmado após webhook autenticado e consulta de status da API Asaas.
- O comprovante é enviado no WhatsApp pelo cliente, mas não altera status financeiro.

## Valores fixos internos
- BARCO: Pix R$ 1.490,00; boleto 12 x R$ 139,07; cartão R$ 1.490,00 à vista.
- IATE: Pix R$ 2.490,00; boleto 12 x R$ 232,40; cartão R$ 2.490,00 à vista.
- SUBMARINO: valores e quantidade de boletos definidos na proposta individual aprovada.
- Cartão: parcelamento no cartão não foi prometido; só após condições específicas no contrato.
- Contratos especiais (ex.: MC Gesso) não modificam os preços do público; conferir condição antes de emitir.

## Configuração privada no Netlify
- ASAAS_API_KEY: chave da conta Asaas no ambiente selecionado, só no servidor.
- ASAAS_BASE_URL: https://api-sandbox.asaas.com/v3 inicialmente; produção https://api.asaas.com/v3.
- ASAAS_PAYMENTS_ENABLED: true APENAS após concluir testes, aprovação da conta e titularidade do recebimento.
- ASAAS_WEBHOOK_TOKEN: token separado de 32+ caracteres; configurar no painel Asaas.
- NEXA_COMMAND_SESSION_SECRET, NEXA_COMMAND_USERS_JSON: autenticação dos administradores já usada pelo Comando.
- Webhook: https://SEU-DOMINIO/.netlify/functions/nexa-asaas?op=webhook
- Habilitar PAYMENT_CONFIRMED e PAYMENT_RECEIVED; endpoint não deve redirecionar.

## Antes de produção
1. Configurar e habilitar a conta Asaas, dados legais do recebedor e notas fiscais.
2. Homologar no Sandbox cadastro, Pix, boleto PDF, carnê 12x, cartão, webhooks duplicados e contrato SUBMARINO.
3. Conferir que boletos de 12 parcelas têm 12 cobranças e total correto, e que 1º boleto pode ser pago por Pix se disponível.
4. Ativar autenticação e proteção contra abuso no Netlify/WAF; validar LGPD, retenção, backups e conciliação manual.
5. Não usar recibo ou agendamento como prova de pagamento; não liberar início do projeto sem confirmação bancária e contrato.
6. Os links expiram após 30 dias; troca de método depois de cobrança emitida deve passar pela equipe.

Documentação: https://docs.asaas.com/reference/criar-nova-cobranca
Documentação: https://docs.asaas.com/docs/receba-eventos-do-asaas-no-seu-endpoint-de-webhook