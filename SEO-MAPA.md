# Mapa SEO — NEXA BLUE

Domínio canônico: `https://nexablue.com.br/`

Este mapa foi montado a partir de pesquisas atuais de SERP e padrões repetidos nos resultados brasileiros. **Não representa volume de busca pago/estimado**; o objetivo é organizar intenção e arquitetura sem criar páginas vazias ou duplicadas.

## Onda 1 — termos genéricos
| Palavra-chave principal | Intenção | URL |
|---|---|---|
| criação de sites | Comercial / contratação | `/criacao-de-sites/` |
| site profissional para empresa | Comercial / contratação | `/site-profissional-para-empresas/` |
| site para negócios locais | Comercial / contratação | `/sites-para-negocios-locais/` |
| criação de landing page | Comercial / contratação | `/landing-pages/` |
| SEO local para empresas | Comercial / contratação | `/seo-local/` |

## Onda 2 — termos específicos por nicho/subnicho
| Palavra-chave principal | Intenção | URL |
|---|---|---|
| site para clínica com agendamento no WhatsApp | Comercial / problema específico | `/site-para-clinica-com-agendamento-no-whatsapp/` |
| site para clínica de estética com agendamento | Comercial / problema específico | `/site-para-clinica-de-estetica-com-agendamento/` |
| site para dentista com agendamento | Comercial / problema específico | `/site-para-dentista-com-agendamento/` |
| site para oficina mecânica com orçamento no WhatsApp | Comercial / problema específico | `/site-para-oficina-mecanica-com-orcamento-no-whatsapp/` |
| site para restaurante com cardápio e WhatsApp | Comercial / problema específico | `/site-para-restaurante-com-cardapio-e-whatsapp/` |
| site para imobiliária com captação de leads | Comercial / problema específico | `/site-para-imobiliaria-com-captacao-de-leads/` |
| site para contabilidade para aparecer no Google | Comercial / problema específico | `/site-para-contabilidade-para-aparecer-no-google/` |
| site para vidraçaria com orçamento | Comercial / problema específico | `/site-para-vidracaria-com-orcamento/` |
| site para dedetizadora com orçamento | Comercial / problema específico | `/site-para-dedetizadora-com-orcamento/` |
| landing page para energia solar | Comercial / problema específico | `/landing-page-para-energia-solar/` |
| site para salão de beleza com agendamento | Comercial / problema específico | `/site-para-salao-de-beleza-com-agendamento/` |

## Padrões observados nas buscas
- Negócios locais respondem melhor a páginas que deixam **serviço + região + WhatsApp** claros.
- Clínicas, estética e odontologia concentram intenção em **especialidade/procedimento + agendamento**.
- Oficinas concentram intenção em **serviço/sintoma + orçamento + confiança**.
- Restaurantes concentram intenção em **cardápio + horário + pedido/reserva**.
- Imobiliárias concentram intenção em **imóvel/filtro + lead + WhatsApp/CRM**.
- Contabilidade concentra intenção em **necessidade concreta** (abrir empresa, trocar contador, regularizar).
- Vidraçarias e serviços visuais precisam de **galeria de obra + orçamento**.
- Dedetizadoras se beneficiam de **página por praga + segurança/licenças + orçamento**.
- Energia solar combina melhor com **landing page de benefício, prova e pedido de simulação/orçamento**.

## Implementação técnica
- Canonical absoluto em todas as páginas.
- Sitemap XML contendo apenas URLs canônicas.
- `robots.txt` com referência ao sitemap.
- `Organization` + `WebSite` + `WebPage` na home.
- `Service` + `BreadcrumbList` + `WebPage` nas páginas de intenção.
- Open Graph/Twitter Cards.
- Lazy loading em imagens abaixo da dobra; hero com `fetchpriority="high"`.
- Links internos entre serviços, segmentos e home.
- `_redirects` preparado para consolidar HTTP/WWW no host canônico em Netlify.

## Atualização técnica — 04/11/2026

- Instagram oficial: https://www.instagram.com/nexablue.agencia/
- Domínio unificado em canonical, Open Graph, Twitter Cards, JSON-LD e links do Shop.
- Schemas Organization e WebSite com IDs consistentes; WebPage e breadcrumbs nas páginas públicas.
- Sitemap inclui páginas públicas indexáveis de serviços, planos, Shop, privacidade e como funciona.
- Redirecionamentos 301 de HTTP, WWW e domínios anteriores, preservando os caminhos.
- A ativação do domínio, certificado HTTPS e apontamentos DNS devem ser realizados no provedor de hospedagem. Redirecionamentos de domínios antigos dependem de eles continuarem associados à mesma hospedagem.
- A verificação de propriedade e o envio do sitemap no Search Console dependem de acesso à conta e ao DNS; nenhum código de verificação foi inventado.
