# Changelog

## v1.2.0 — 2026-05-24

### Fixed
- **MP4 falso eliminado.** A página de episódio tem 2 iframes: um real
  (HLS via `api.anivideo.net`) e um **decoy** com URL terminando em
  `.mp4` mas servida pelo próprio `animesdigital.org` — que na verdade
  é um wrapper HTML ofuscado e leva ao `/home` se aberto direto.
  Agora ignoramos qualquer iframe do domínio `animesdigital.org`.
- **Streams duplicados removidos.** Quando 2+ páginas candidatas
  apontam para o mesmo `.m3u8` (ex: `naruto` e `naruto-classico`
  ambos redirecionando pro mesmo CDN), agora só emitimos 1 entrada.
- **Manifest atualizado:** `formats` mudou de `["mp4","m3u8"]` para
  apenas `["m3u8"]` (o site não serve MP4 real).

### Improved
- **Títulos legíveis** ao invés de slugs brutos:
  - Antes: `kimetsu-no-yaiba-hashira-geiko-hen-dublado`
  - Depois: `Hashira Geiko Hen`
- Quando o slug é só o título principal (sem arc), não mostra nada
  extra além do nome do anime + episódio.

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
