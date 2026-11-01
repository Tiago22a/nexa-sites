# NEXA BLUE — Fluxo de pagamento por plano (fase de preparação)

Atualizado em 2026-11-01. Este documento distingue a escolha visual da forma de pagamento da emissão bancária real.

## Status nesta entrega

- BARCO e IATE mostram quatro preferências: Pix anual à vista, 12 boletos mensais, cartão de crédito ou 12 Pix mensais.
- Os links nos cards da home levam diretamente à seção `#formas-de-pagamento` da página respectiva.
- SUBMARINO é sob proposta personalizada e **não tem cobrança automática** com valor padrão.
- **NÃO EXISTE emissão bancária de Pix, boleto ou cartão nesta fase.** A página gera somente minuta informativa local e abre o WhatsApp para solicitar à equipe um link individual do Asaas.
- Não inserir chave Asaas ou credenciais em HTML ou JavaScript público. Não receber número de cartão no site.
- Para contratos individuais com condição especial, o valor do contrato assinado prevalece sobre a tabela pública.

## Tabela pública

| Plano | Pix anual integral | 12 pagamentos mensais de boleto ou Pix | Cartão |
| --- | --- | --- | --- |
| BARCO | R$ 1.490,00 | 12 × R$ 139,07, total R$ 1.668,84 | Valor e parcelamento na proposta/fatura oficial |
| IATE | R$ 2.490,00 | 12 × R$ 232,40, total R$ 2.788,80 | Valor e parcelamento na proposta/fatura oficial |
| SUBMARINO | Sob consulta | Somente proposta aprovada | Somente proposta aprovada |

## Operação imediata sem API

1. A equipe envia contrato e obtém assinatura antes da primeira cobrança.
2. A equipe emite a cobrança correta na conta Asaas: Pix, carnê/parcelamento por boleto, cobrança cartão ou Pix mensal conforme elegibilidade, com valor exato do contrato.
3. A equipe compartilha o link **individual da fatura hospedada pelo Asaas** no grupo do cliente. Não usar link público fixo para valores especiais ou dados de terceiros.
4. O cliente paga na página do Asaas. A confirmação deve ser verificada no painel financeiro — foto de comprovante ou agendamento não basta.
5. O CRM só passa a status **pago** após evento/consulta reconciliado, não após clique ou retorno de URL.

## Para a futura integração Netlify / Asaas

- Conta Asaas aprovada e credenciais para sandbox/produção, nunca públicas.
- Netlify Function privada para criar/consultar cobranças, usando `ASAAS_API_KEY` e ambiente separados; autenticação e autorização vinculadas a contratos previamente assinados. Não criar cobrança aberta a qualquer usuário anônimo.
- Cada contrato precisa de identificador único, valor final, datas de vencimento e forma escolhida com trilha de aprovação, idempotência e auditoria.
- Cartão: preferir fatura/checkout hospedado pelo Asaas; não processar cartão no frontend NEXA. Exibir eventual custo/parcelamento antes da confirmação.
- Pix: emissão de cobrança e, se desejado, QR Code dinâmico; Pix Automático depende de habilitação e autorização do pagador.
- Boletos: gerar parcelas/vencimentos pelo provedor e notificar o cliente.
- Webhook validado, deduplicado, persistido com verificação posterior do status na API; não liberar serviços por callback de navegador.
- LGPD: coletar apenas dados necessários; registros protegidos no servidor e política de retenção.
- Testar integralmente no sandbox antes de habilitar em produção.

Referências oficiais:
- https://docs.asaas.com/reference/criar-nova-cobranca
- https://docs.asaas.com/reference/criar-um-link-de-pagamentos
- https://docs.asaas.com/docs/cobrancas-via-pix
- https://docs.asaas.com/reference/criar-novo-checkout
