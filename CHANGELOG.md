# Changelog

## v1.1.0 — 2026-05-24

### Fixed
- **Crítico:** corrigida a busca quebrada. O site `animesdigital.org`
  passou a redirecionar `/?s=<query>` (HTTP 302) para `/search/<slug>`,
  o que fazia o provider retornar **0 resultados** em runtimes Hermes
  (sintoma "No streams found" no app).
- Page-size threshold reduzido de 40 KB para 20 KB (evita descartar
  páginas reais se o site enxugar o template).
- `redirect: "follow"` explícito nas chamadas `fetch` para garantir
  paridade entre Node e React Native.

### Changed
- Stream objects agora incluem `behaviorHints.notWebReady: true` (o
  CDN entrega o `.m3u8` com `Content-Type: application/octet-stream`,
  então o player precisa do demuxer nativo).
- Logs trazem a versão do provider para facilitar diagnóstico.

### Notes
- Compatível com o app Nuvio (Hermes engine).
- Mantido fallback para a URL antiga `?s=…` caso o site reverta.

## v1.0.0 — Original (upstream)

- Versão original publicada em
  [D3adlyRocket/Anime-Nuvio](https://github.com/D3adlyRocket/Anime-Nuvio/blob/main/providers/animesdigital.js).
