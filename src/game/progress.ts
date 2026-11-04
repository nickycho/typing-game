import { LEVELS, type LevelId } from './levels'

export interface LevelAttempt {
  hits: number
  score: number
}

export interface GameProgress {
  resumeLevel: LevelId
  unlockedThrough: LevelId
  completedLevels: readonly LevelId[]
  attempts: Partial<Record<LevelId, LevelAttempt>>
}

export const HITS_TO_COMPLETE = 20
export const POINTS_PER_HIT = 10

export function createInitialProgress(): GameProgress {
  return {
    resumeLevel: 1,
    unlockedThrough: 1,
    completedLevels: [],
    attempts: { 1: { hits: 0, score: 0 } },
  }
}

export function getAttempt(progress: GameProgress, level: LevelId): LevelAttempt {
  return progress.attempts[level] ?? { hits: 0, score: 0 }
}

export function startLevel(progress: GameProgress, level: LevelId): GameProgress {
  if (level > progress.unlockedThrough) return progress
  if (!progress.completedLevels.includes(level)) {
    if (progress.attempts[level]) return progress
    return { ...progress, attempts: { ...progress.attempts, [level]: { hits: 0, score: 0 } } }
  }

  return {
    ...progress,
    attempts: { ...progress.attempts, [level]: { hits: 0, score: 0 } },
  }
}

export function recordCorrectHit(
  progress: GameProgress,
  level: LevelId,
): { progress: GameProgress; attemptComplete: boolean } {
  const attempt = getAttempt(progress, level)
  if (attempt.hits >= HITS_TO_COMPLETE) return { progress, attemptComplete: true }

  const hits = attempt.hits + 1
  const attemptComplete = hits >= HITS_TO_COMPLETE
  const completedLevels = attemptComplete && !progress.completedLevels.includes(level)
    ? [...progress.completedLevels, level].sort((a, b) => a - b)
    : progress.completedLevels
  const unlockedThrough = attemptComplete && level < LEVELS.length
    ? Math.max(progress.unlockedThrough, (level + 1) as LevelId) as LevelId
    : progress.unlockedThrough
  const resumeLevel = attemptComplete && progress.resumeLevel === level && level < LEVELS.length
    ? (level + 1) as LevelId
    : progress.resumeLevel

  return {
    progress: {
      ...progress,
      resumeLevel,
      unlockedThrough,
      completedLevels,
      attempts: {
        ...progress.attempts,
        [level]: { hits, score: attempt.score + POINTS_PER_HIT },
      },
    },
    attemptComplete,
  }
}

export function isGameProgress(value: unknown): value is GameProgress {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const candidate = value as Record<string, unknown>
  if (!isLevelId(candidate.resumeLevel) || !isLevelId(candidate.unlockedThrough)) return false
  if (candidate.resumeLevel > candidate.unlockedThrough) return false
  const completedLevelsValue = candidate.completedLevels
  if (!Array.isArray(completedLevelsValue) || !completedLevelsValue.every(isLevelId)) return false
  const completedLevels = completedLevelsValue as LevelId[]
  if (new Set(completedLevels).size !== completedLevels.length) return false
  const unlockedThrough = candidate.unlockedThrough
  if (completedLevels.some((level) => level > unlockedThrough)) return false
  if (!candidate.attempts || typeof candidate.attempts !== 'object' || Array.isArray(candidate.attempts)) return false

  return Object.entries(candidate.attempts as Record<string, unknown>).every(([key, attempt]) => {
    const level = Number(key)
    if (!isLevelId(level) || !attempt || typeof attempt !== 'object' || Array.isArray(attempt)) return false
    const { hits, score } = attempt as Record<string, unknown>
    return Number.isInteger(hits) && Number(hits) >= 0 && Number(hits) <= HITS_TO_COMPLETE
      && Number.isInteger(score) && Number(score) === Number(hits) * POINTS_PER_HIT
      && (Number(hits) < HITS_TO_COMPLETE || completedLevels.includes(level))
  })
}

function isLevelId(value: unknown): value is LevelId {
  return Number.isInteger(value) && Number(value) >= 1 && Number(value) <= LEVELS.length
}
