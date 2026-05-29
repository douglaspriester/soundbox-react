# SOUNDBOX — Speaker & Room Designer

App interativo para projetar o sistema de som de um **listening bar de vinil** (Bar Rio, RJ).
Rebuild em React + TypeScript + Vite de um calculador single-file.

## O que faz
- **Thiele-Small / gabinete**: Qtc, Fc, F3 (fórmula correta de caixa selada), volume sugerido por Qtc-alvo, dimensões.
- **Acústica da sala**: RT60 (nu vs tratado), Schroeder, modos axiais, mapa modal. Sala default **15 × 4,5 × 6 m**.
- **Sistema**: SPL máx, headroom, watts necessários, nota.
- **DSP**: crossovers, limiter, calculadora de delay dos fills.
- **Posição → "Layout do local"**: mapa de **cobertura sonora interativo** — arraste/gire/adicione caixas (mains, fills, sub) e veja o heatmap de SPL (dourado = bom, vermelho = quente, azul = buraco) recalcular ao vivo. Usa SPL máx real do woofer (sensibilidade + potência) e cobertura do driver. Fundo opcional: `public/venue-bg.png`.
- **Orçamento**: completo vs cap R$50k (Bar Rio v5).
- **Comparar A/B**, persistência (localStorage), URL compartilhável, export PDF (print).

## Rodar
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc + vite build -> dist/
```

## Estrutura
- `src/physics/` — funções puras (thiele-small, acoustics, spl, coverage, rules, derive).
- `src/charts/` — desenho Canvas 2D puro (sem libs de gráfico).
- `src/components/` — UI, abas (`tabs/`), `InteractiveVenue.tsx` (mapa de cobertura).
- `src/store/useStore.ts` — Zustand + persist (config serializável + layout das caixas).
- `src/data/` — presets de woofers/drivers, orçamento, fills, tratamentos.
- `qa/` — probes Playwright headless (`node qa/probe.mjs <aba>`, `qa/maptest.mjs`).

## QA
`node qa/probe.mjs all` carrega cada aba em Chromium headless, checa console, valida canvases e tira screenshots em `qa/out/`.

Manual de construção das caixas DIY: ver `../manual_caixa_diy.md`.
