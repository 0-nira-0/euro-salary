import type { Country } from './types'

// Which household options actually change the result of each country module.
// Kept next to the engine so the UI can tell users when an option is ignored.
export const SUPPORTED_OPTIONS: Record<Country, { family: boolean; children: boolean }> = {
  FR: { family: true, children: true },
  DE: { family: true, children: true },
  ES: { family: false, children: true },
  IT: { family: false, children: false },
  BE: { family: false, children: true },
  PL: { family: false, children: false },
}
