# AnimesDigital Fixed — Nuvio Provider

![Tests](https://github.com/SEU-USUARIO/NOME-DO-REPO/actions/workflows/test.yml/badge.svg)
![Version](https://img.shields.io/badge/version-1.2.0-blue)
![License](https://img.shields.io/badge/license-GPL--3.0-green)

Versão **corrigida** do provider `animesdigital` originalmente publicado em
[`D3adlyRocket/Anime-Nuvio`](https://github.com/D3adlyRocket/Anime-Nuvio).

O provider oficial parou de funcionar porque o site `animesdigital.org`
mudou a URL de busca e passou a embedar um iframe "MP4 falso" pra
confundir scrapers. Este fork corrige tudo isso e adiciona melhorias
de qualidade de vida.

---

## 📦 Instalação no Nuvio

1. Abra o app **Nuvio**.
2. Vá em **Settings → Local Scrapers**.
3. Adicione a URL deste repositório:

   ```
   https://raw.githubusercontent.com/SEU-USUARIO/NOME-DO-REPO/refs/heads/main/manifest.json
   ```

4. Habilite **AnimesDigital (Fixed)** na lista.

> ⚠️ Antes de publicar, troque `SEU-USUARIO/NOME-DO-REPO` pelo path real
> do seu fork no GitHub (também no badge `Tests` lá no topo).

---

## 🔧 O que foi corrigido

### v1.2.0 (atual)

| # | Bug | Causa raiz | Fix |
|---|---|---|---|
| 5 | "Stream MP4" aparecia mas não tocava (redirecionava pra `/home` no navegador) | A página de episódio tem um **iframe falso** no domínio `animesdigital.org` com URL terminando em `.mp4` — é só um wrapper HTML ofuscado, não vídeo real. O regex pegava como se fosse stream. | Ignorar qualquer iframe cujo host seja `animesdigital.org`. |
| 6 | Streams duplicados (ex: Naruto aparecia 4 vezes com mesma URL) | Múltiplas páginas candidatas (`naruto`, `naruto-classico`, etc.) muitas vezes redirecionam pro mesmo `.m3u8`. | Dedup por URL final antes de devolver a lista. |
| 7 | Título mostrava slug bruto (`kimetsu-no-yaiba-hashira-geiko-hen-dublado`) | A versão antiga concatenava o slug sem tratamento. | Strip do título principal + title-case → "Hashira Geiko Hen". |

### v1.1.0

| # | Bug | Causa raiz | Fix |
|---|---|---|---|
| 1 | **Busca retornava 0 resultados** ("No streams found") | O site mudou `https://animesdigital.org/?s=<query>` → agora **HTTP 302** redirecionando para `/search/<slug>`. Em alguns ambientes React Native/Hermes o `fetch` perde o body ou trata o 302 como falha. | Trocar para `https://animesdigital.org/search/<slug>` (200 direto). Mantido fallback. |
| 2 | Páginas "magras" eram descartadas como 404 | Threshold de 40 KB era agressivo demais. | Reduzido para 20 KB. |
| 3 | Player travava em "carregando" | O CDN serve o `.m3u8` com `Content-Type: application/octet-stream`. | Adicionado `behaviorHints.notWebReady: true`. |
| 4 | Comportamento divergente Node × RN | `redirect` implícito. | Explicitado em todas as chamadas `fetch`. |

---

## 🧪 Como reproduzir o diagnóstico

```bash
# URL antiga (que o provider quebrado usa) — retorna 302 sem body
curl -sI "https://animesdigital.org/?s=demon" | head -2
# > HTTP/2 302
# > location: https://animesdigital.org/search/demon

# URL nova (que o fix usa) — retorna 200 com o HTML certo
curl -sI "https://animesdigital.org/search/demon" | head -2
# > HTTP/2 200
```

Sobre o "MP4 falso" da v1.2.0:

```bash
# A página de cada episódio tem 2 iframes — só o primeiro é real:
curl -sL "https://animesdigital.org/video/a/16158/" | grep -oE '<iframe[^>]+src="[^"]+"'
# 1) https://api.anivideo.net/videohls.php?d=https://cdn-s01..../index.m3u8   ← real
# 2) https://animesdigital.org/<base64>/0/25/bg.mp4?...                       ← FALSO
```

---

## 🧰 Testando localmente

```bash
git clone <este-repo>
cd nuvio-animesdigital-fixed
node test.js
```

Resultado esperado:

```
=== Demon Slayer S1E1 ===
  ✓ Demon Slayer: Kimetsu no Yaiba (2019) · EP1 [PT-BR LEG]
  ✓ Demon Slayer: Kimetsu no Yaiba (2019) · EP1 · Hashira Geiko Hen [PT-BR DUB]
  ✓ Demon Slayer: Kimetsu no Yaiba (2019) · EP1 · Hashira Geiko Hen [PT-BR LEG]

=== One Piece S1E1 ===
  ✓ One Piece (1999) · EP1 [PT-BR DUB]
  ✓ One Piece (1999) · EP1 [PT-BR LEG]

=== Naruto S1E1 ===
  ✓ Naruto (2002) · EP1 [PT-BR LEG]
  ✓ Naruto (2002) · EP1 · Classico [PT-BR DUB]

=== Attack on Titan S1E1 ===
  ✓ Attack on Titan (2013) · EP1 · Shingeki No Kyojin [PT-BR DUB]
  ✓ Attack on Titan (2013) · EP1 · Shingeki No Kyojin [PT-BR LEG]
```

---

## 🤖 CI / GitHub Actions

Este repo tem um workflow que roda em:

- ✅ **Cada push** na branch `main`
- ✅ **Cada pull request**
- ⏰ **Todo dia às 13:00 UTC** (10h BRT) — pra detectar se o site quebrou sozinho
- 🖱️ **Manualmente** pelo botão "Run workflow" na aba Actions

O workflow:
1. Valida que o `manifest.json` é JSON válido
2. Verifica que o provider carrega sem erros de sintaxe
3. Roda `node test.js` e exige pelo menos **5 streams** entre todos os animes
4. Faz um GET em `/search/demon` pra confirmar que o site não mudou de novo

Se algo quebrar, você recebe um e-mail do GitHub e o badge no topo do
README fica vermelho. Daí é só ver o log da Action pra saber o que mudou.

---

## ⚖️ Limitações conhecidas

- O CDN do AnimesDigital entrega segmentos HLS com extensão `.webp`
  (são `.ts` reais — magic byte `0x47` confirma MPEG-TS). Players modernos
  baseados em **ExoPlayer** (Android) e **AVPlayer/KSPlayer** (iOS) leem
  o conteúdo corretamente. Por isso o stream é entregue com `notWebReady: true`.
- Provider só roda para conteúdo com `original_language=ja` ou
  `origin_country=JP` (gate herdado do upstream).
- Filmes anime nem sempre são encontrados (o site cataloga eles em
  `/filme/f/` e os slugs não seguem padrão previsível).
- O `TMDB_API_KEY` embutido é o mesmo do projeto original.

---

## 📜 Licença

GPL-3.0, mesma do projeto upstream `D3adlyRocket/Anime-Nuvio`.

## 🙏 Créditos

- Lógica original: **Nuvio Team** (via D3adlyRocket/Anime-Nuvio).
- Correções v1.1.0 e v1.2.0: este fork.
