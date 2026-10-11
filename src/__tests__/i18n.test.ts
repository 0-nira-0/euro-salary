import { describe, it, expect } from 'vitest'
import en from '../locales/en.json'
import fr from '../locales/fr.json'
import de from '../locales/de.json'
import es from '../locales/es.json'
import it_ from '../locales/it.json'
import pl from '../locales/pl.json'

type Tree = { [key: string]: string | Tree }
const locales: Record<string, Tree> = { en, fr, de, es, it: it_, pl }

function flatten(tree: Tree, prefix = ''): string[] {
  return Object.entries(tree).flatMap(([k, v]) =>
    typeof v === 'string' ? [prefix + k] : flatten(v, `${prefix}${k}.`)
  )
}

// Raw source of every app file (tests excluded), bundled by Vite at test time.
const sources = Object.entries(
  import.meta.glob<string>('../**/*.{ts,tsx}', { query: '?raw', import: 'default', eager: true })
).filter(([path]) => !path.includes('__tests__'))

describe('i18n', () => {
  const reference = flatten(en).sort()

  for (const [lang, tree] of Object.entries(locales)) {
    it(`${lang} has exactly the same keys as en`, () => {
      expect(flatten(tree).sort()).toEqual(reference)
    })
  }

  it('has no empty translations', () => {
    for (const [lang, tree] of Object.entries(locales)) {
      const empty = flatten(tree).filter((key) => {
        const value = key.split('.').reduce<unknown>((node, part) => (node as Tree)[part], tree)
        return typeof value !== 'string' || value.trim() === ''
      })
      expect(empty, lang).toEqual([])
    }
  })

  it('translates every static t("…") key used in the source', () => {
    const known = new Set(reference)
    const missing: string[] = []
    for (const [file, code] of sources) {
      for (const match of code.matchAll(/\bt\(\s*'([\w.]+)'/g)) {
        if (!known.has(match[1])) missing.push(`${file}: ${match[1]}`)
      }
    }
    expect(missing).toEqual([])
  })

  it('translates every labelKey emitted by the tax engine', () => {
    const known = new Set(reference)
    const missing: string[] = []
    for (const [file, code] of sources.filter(([path]) => path.includes('/countries/'))) {
      for (const match of code.matchAll(/labelKey:\s*'([\w.]+)'/g)) {
        if (!known.has(match[1])) missing.push(`${file}: ${match[1]}`)
      }
    }
    expect(missing).toEqual([])
    expect(sources.some(([path]) => path.includes('/countries/'))).toBe(true)
  })

  it('has a disclaimer and a short description for every country', () => {
    for (const code of ['FR', 'DE', 'ES', 'IT', 'BE', 'PL']) {
      expect(reference).toContain(`legal.disclaimer_${code}`)
      expect(reference).toContain(`about.notes.${code}`)
      expect(reference).toContain(`country.${code}`)
    }
  })
})
