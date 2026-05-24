# AnimesDigital Fixed — Nuvio Provider

Versão **corrigida** do provider `animesdigital` originalmente publicado em
[`D3adlyRocket/Anime-Nuvio`](https://github.com/D3adlyRocket/Anime-Nuvio).

O provider oficial parou de retornar streams porque o site
`animesdigital.org` mudou a URL de busca. Este fork corrige o problema e
adiciona algumas melhorias defensivas.

---

## 📦 Instalação no Nuvio

1. Abra o app **Nuvio**.
2. Vá em **Settings → Local Scrapers**.
3. Adicione a URL deste repositório:

   ```
   https://raw.githubusercontent.com/SEU-USUARIO/NOME-DO-REPO/refs/heads/main/manifest.json
   ```

4. Habilite **AnimesDigital (Fixed)** na lista.

> ⚠️ Antes de publicar, troque `SEU-USUARIO/NOME-DO-REPO` pelo path real do
> seu fork no GitHub.

---

## 🔧 O que foi corrigido

| # | Bug | Causa raiz | Fix |
|---|---|---|---|
| 1 | **Busca retornava 0 resultados** (sintoma "No streams found") | O site mudou `https://animesdigital.org/?s=<query>` → agora retorna **HTTP 302** redirecionando para `/search/<slug>`. Em alguns ambientes React Native/Hermes o `fetch` perde o body ou o app trata o 302 como falha. | Trocar para `https://animesdigital.org/search/<slug>` (200 direto). Mantido fallback para a URL antiga caso o site volte atrás. |
| 2 | Páginas "magras" eram descartadas como 404 | Threshold de 40 KB era muito agressivo se o site enxugar o template. | Reduzido para 20 KB (página de 404 real tem ~5 KB). |
| 3 | Player travava em "carregando" mesmo com URL válida | O CDN serve o `.m3u8` com `Content-Type: application/octet-stream` (não `application/vnd.apple.mpegurl`). | Adicionado `behaviorHints.notWebReady: true` para forçar o demuxer nativo. |
| 4 | `redirect: 'follow'` implícito podia divergir entre runtimes | RN às vezes não segue automaticamente. | Explicitado nas duas chamadas `fetch`. |

---

## 🧪 Como reproduzir o diagnóstico

Os comandos abaixo mostram o bug original:

```bash
# URL antiga (a que o provider quebrado usa) — retorna 302 sem corpo
curl -sI "https://animesdigital.org/?s=demon" | head -5
# > HTTP/2 302
# > location: https://animesdigital.org/search/demon

# URL nova (a que o fix usa) — retorna 200 com o HTML certo
curl -sI "https://animesdigital.org/search/demon" | head -5
# > HTTP/2 200
```

---

## 🧰 Testando localmente

```bash
git clone <este-repo>
cd anime-nuvio-fix
node -e "
  const { getStreams } = require('./providers/animesdigital.js');
  getStreams('85937', 'tv', 1, 1).then(s => console.log(JSON.stringify(s, null, 2)));
"
```

Resultado esperado: 2-4 streams de **Demon Slayer S1E1** com URLs
`https://cdn-s01.mywallpaper-4k-image.net/.../index.m3u8`.

---

## ⚖️ Limitações conhecidas

- O CDN do AnimesDigital entrega segmentos HLS com extensão `.webp`
  (são `.ts` reais — magic byte `0x47` confirma MPEG-TS). Players modernos
  baseados em **ExoPlayer** (Android) e **AVPlayer/KSPlayer** (iOS) leem
  o conteúdo corretamente, mas players web (HTML5 `<video>`) podem
  rejeitar. Por isso o stream é entregue com `notWebReady: true`.
- Provider só roda para conteúdo com `original_language=ja` ou
  `origin_country=JP` (gate herdado do upstream para evitar matches
  estranhos com títulos não-anime).
- O `TMDB_API_KEY` embutido é o mesmo do projeto original (pode ser
  trocado por outro se você quiser auditar limites).

---

## 📜 Licença

GPL-3.0, mesma do projeto upstream `D3adlyRocket/Anime-Nuvio`.

## 🙏 Créditos

- Lógica original: **Nuvio Team** (via D3adlyRocket/Anime-Nuvio).
- Correções: este fork.
