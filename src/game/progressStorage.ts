import { createInitialProgress, isGameProgress, type GameProgress } from './progress'

const STORAGE_KEY = 'keybloom.progress.v1'
const STORAGE_VERSION = 1

export function loadProgress(): GameProgress {
  try {
    const serialized = window.localStorage.getItem(STORAGE_KEY)
    if (!serialized) return createInitialProgress()

    const stored: unknown = JSON.parse(serialized)
    if (!stored || typeof stored !== 'object' || Array.isArray(stored)) return createInitialProgress()
    const envelope = stored as { version?: unknown; progress?: unknown }
    if (envelope.version !== STORAGE_VERSION || !isGameProgress(envelope.progress)) return createInitialProgress()
    return envelope.progress
  } catch {
    return createInitialProgress()
  }
}

export function saveProgress(progress: GameProgress): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: STORAGE_VERSION, progress }))
    return true
  } catch {
    return false
  }
}
