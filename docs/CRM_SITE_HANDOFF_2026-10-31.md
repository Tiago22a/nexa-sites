# NEXA BLUE — Handoff do site para Business Command
Data: 31/10/2026. Repositório: Tiago22a/nexa-sites.

## Estado confirmado
- Site público: homepage, páginas BARCO/ IATE/ SUBMARINO, NEXA SHOP, contato WhatsApp.
- `/comando/` tem código de CRM próprio, com autenticação configurável e registros; **não há integração funcional de checkout bancário, assinatura eletrônica ou cobrança recorrente**. `/admin/` é legado e possui armazenamento separado.
- `assets/nexa-checkout.js` gera **minuta preliminar no navegador**, não documento contratual assinado nem boleto. A página pública informa isso.
- Página `/como-funciona/` explica jornada e limites com linguagem transparente.
- BARCO R$ 1.490 à vista (12 × R$ 139,07 parcelado). Até seis artes iniciais e legendas; não inclui gestão contínua/publicação recorrente. Eventual publicação para primeiro cliente: condição especial documentada.
- IATE R$ 2.490 à vista (12 × R$ 232,40). BARCO + quatro conteúdos-base estáticos mensais em até dois perfis (não quatro por perfil). Capacidade e margem precisam de cálculo antes de preço novo.
- SUBMARINO somente após orçamento/escopo individual.
- Domínio, hospedagem e terceiros separados e autorizados. Parcelamento anual **não** constitui serviço mensal autônomo.

## Sequência técnica planejada (NÃO implementada)
1. Auditar `/comando/` e `/admin/`; selecionar base oficial e planejar migração sem perda de dados.
2. Homologar dois usuários individuais, permissões, MFA quando disponível, backup e restauração; nenhum segredo no repositório.
3. Modelar `client → proposal → contract_version → signature → checkout → invoice/payment → project → task → deliverable`.
4. Implementar modelo contratual juridicamente revisado e PDF servidor, assinatura eletrônica verificável, download autenticado e histórico de versões.
5. Criar URL individual com token imprevisível, expiração, autorização do contratante e proteção LGPD; não expor CPF, RG ou contrato em URL aberta.
6. Integrar provedor financeiro em sandbox para Pix/boleto/cartão nas condições aprovadas; idempotência de solicitações; validar autenticidade de webhooks; conferir status no provedor. Comprovante/print não é quitação.
7. Separar contrato anual parcelado e assinatura recorrente de hospedagem/serviço gerenciado. Cobranças e inadimplência com prazos contratuais.
8. Hospedagem gerenciada: notificação, análise de elegibilidade, suspensão restrita ao serviço da NEXA sem apagar arquivos, restauração após confirmação, logs e mecanismo de reversão; preservar titularidade e portabilidade de domínio e contas do cliente.
9. Criar Deep Flow com partes independentes e handoff entre direção criativa e Tiago; limites automáticos por plano; aprovações e entrega parcial.
10. Depois conectar Hermes ao chat do site e WhatsApp por integração aprovada, com atendimento rastreável e transferência humana; agentes especializados somente com permissões e aprovação humana para publicação/financeiro.

## O que NÃO fazer
- Não apresentar minuta gerada no navegador como contrato definitivo.
- Não criar QR Pix fictício, boleto visual ou link de pagamento que não gere cobrança real.
- Não suspender Instagram, alterar senhas do cliente nem reter domínio para pressionar pagamento.
- Não expor env vars, tokens ou dados privados em site público ou GitHub.
- Não alterar a identidade aprovada do site nem misturar a agência NEXA com os demais negócios do grupo.
- Não automatizar suspensão de websites antes de validar contrato, avisos, contestação, condições do provedor e salvaguardas.

## Teste de aceitação futuro
Em sandbox: dois logins → lead → proposta aprovada → contrato assinado → checkout compartilhado → pagamento confirmado pelo banco → projeto liberado → handoff criativo/técnico → QA → publicação → entrega → cobrança seguinte → atraso simulado → aviso → suspensão controlada de site fictício → regularização → reativação. Validar eventos duplicados, falha do provedor, estorno, logs, restrições por usuário e backup/restauração.

## Comando para Tiago / agente de programação
> Analise o repositório existente da NEXA BLUE na branch principal. Leia `comando/README.md`, este handoff, `assets/nexa-checkout.js`, o backend em `netlify/functions/` e as páginas dos planos. Diagnostique o que já funciona e o que é protótipo; NÃO presuma checkout, assinatura ou Hermes implementados. Produza um plano incremental, verificando segurança e integridade do banco antes de programar. Implemente primeiro base única de clientes, contrato/assinatura e checkout em ambiente de testes, com provedor real e webhooks validados. Separe commits por módulo, execute testes, publique somente após homologação. Preserve preços, identidade visual e exceções de escopo. Não adicione credenciais ao GitHub.
