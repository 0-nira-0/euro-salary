# EuroSalary

A minimalist web calculator that turns gross salary into net (and net back into gross) for six European countries, with country-specific contributions and income tax.

**Live demo:** https://0-nira-0.github.io/euro-salary/

## Features

- France, Germany, Spain, Italy, Belgium and Poland, using 2024 tax rules
- Gross → net and net → gross, annual or monthly
- Household options (family status, children) — greyed out where a country module does not use them
- Side-by-side comparison of any two countries with animated bars
- Full breakdown of employee contributions, income tax and employer cost, with legal references
- Shareable link that restores country, salary, options, period and language
- Six languages (EN, FR, DE, ES, IT, PL) — every label, number format and disclaimer follows the selected language
- Responsive from 320 px phones to desktop, with a compact language menu on small screens
- Smooth transitions for the donut chart, figures, tabs and panels (respects `prefers-reduced-motion`)
- Everything runs in the browser; the salary is never sent anywhere

## Tech stack

React 18 · TypeScript · Vite · Tailwind CSS · Zustand · i18next · Vitest

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm test         # run the test suite
npm run build    # type-check and build into docs/ (served by GitHub Pages)
```

## Project structure

```
src/
  tax-engine/   pure calculation modules per country + golden tests
  store/        Zustand store (input, result, comparison, period)
  lib/          share-link parsing/building, language and country helpers
  hooks/        number formatting, animated numbers, debounce, share
  components/   calculator, layout and reusable UI pieces
  locales/      translation files, one per language
```

## Disclaimer

Figures are indicative estimates based on 2024 rules and are not tax advice.
