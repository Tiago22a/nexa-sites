# NEXA BLUE — Arte da jornada (BARCO)

**Regra visual:** cada quadro recebe exatamente uma fotografia vertical em azul cinematográfico, sem segunda imagem no fundo.

Imagens finais geradas e entregues para integração ao repositório:
- `assets/jornada/barco-partida.webp` — pescador no barco, mar e luz solar
- `assets/jornada/barco-presenca.webp` — baleias sob raios solares
- `assets/jornada/barco-rota.webp` — submersível explorando o fundo do oceano

A aplicação dos arquivos deve usar as imagens WebP originais fornecidas no pacote `NEXA_3_CENAS_JORNADA_BARCO.zip`. **O pacote ainda precisa ser enviado ao repositório**: a integração GitHub atual só grava conteúdo textual. Não declarar substituição fotográfica concluída antes disso.

Arquivos de destino no BARCO: `planos/barco/index.html` — `.detail-gallery-tile.tile-1 img`, `.tile-2 img`, `.tile-3 img`. Substituir exclusivamente os `src`; preservar os títulos e legendas.

O CSS foi corrigido para remover a sobreposição imagem/fundo fotográfico e voltar a usar `object-fit:cover`. Assim, o site atual não apresenta mais imagens repetidas dentro dos quadros, mesmo enquanto as fotografias novas aguardam upload.

O IATE e o SUBMARINO têm galerias próprias. Manter sua identidade e não trocar indevidamente os títulos ou as imagens sem produzir 3 cenas específicas para cada um.
