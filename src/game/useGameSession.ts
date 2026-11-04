import { useEffect, useRef, useState } from 'react'
import type { LevelDefinition, LevelId } from './levels'
import type { LevelAttempt } from './progress'
import { HITS_TO_COMPLETE, POINTS_PER_HIT } from './progress'

export interface FallingTarget {
  id: string
  letter: string
  xPercent: number
  spawnedAt: number
}

export interface GameSession {
  targets: readonly FallingTarget[]
  hits: number
  score: number
  streak: number
  feedback: { kind: 'correct' | 'wrong' | 'missed'; text: string; id: number } | null
  handleTargetMissed(targetId: string): void
  handleKeyDown(event: KeyboardEvent): void
}

export function useGameSession(
  level: LevelDefinition,
  savedAttempt: LevelAttempt,
  onCorrectHit: (level: LevelId) => boolean,
  onAttemptComplete: (level: LevelId, score: number) => void,
): GameSession {
  const [targets, setTargets] = useState<FallingTarget[]>([])
  const targetsRef = useRef<FallingTarget[]>([])
  const targetIdRef = useRef(0)
  const [hits, setHits] = useState(savedAttempt.hits)
  const hitsRef = useRef(savedAttempt.hits)
  const [score, setScore] = useState(savedAttempt.score)
  const scoreRef = useRef(savedAttempt.score)
  const [streak, setStreak] = useState(0)
  const streakRef = useRef(0)
  const [feedback, setFeedback] = useState<GameSession['feedback']>(null)
  const completedRef = useRef(savedAttempt.hits >= HITS_TO_COMPLETE)
  const feedbackIdRef = useRef(0)
  const correctHitRef = useRef(onCorrectHit)
  const attemptCompleteRef = useRef(onAttemptComplete)
  const targetMissedRef = useRef<(targetId: string) => void>(() => undefined)
  const keyHandlerRef = useRef<(event: KeyboardEvent) => void>(() => undefined)

  correctHitRef.current = onCorrectHit
  attemptCompleteRef.current = onAttemptComplete

  useEffect(() => {
    let feedbackTimeout = 0

    const syncTargets = (update: (current: FallingTarget[]) => FallingTarget[]) => {
      const currentTargets = targetsRef.current
      const updated = update(currentTargets)
      if (updated === currentTargets) return
      const nextByLetter = new Map<string, FallingTarget>()
      for (const target of updated) {
        const current = nextByLetter.get(target.letter)
        if (!current || target.spawnedAt < current.spawnedAt) nextByLetter.set(target.letter, target)
      }
      const next = [...nextByLetter.values()]
      targetsRef.current = next
      setTargets(next)
    }

    const showFeedback = (kind: NonNullable<GameSession['feedback']>['kind'], text: string) => {
      feedbackIdRef.current += 1
      setFeedback({ kind, text, id: feedbackIdRef.current })
      window.clearTimeout(feedbackTimeout)
      feedbackTimeout = window.setTimeout(() => setFeedback(null), kind === 'wrong' ? 850 : 650)
    }

    const getTargetY = (target: FallingTarget, now: number) =>
      -4 + Math.max(0, now - target.spawnedAt) / level.fallDurationMs * 104

    const handleTargetMissed = (targetId: string) => {
      if (!targetsRef.current.some((target) => target.id === targetId)) return
      syncTargets((current) => current.filter((target) => target.id !== targetId))
      showFeedback('missed', '沒關係，下一個字母再試試看')
    }
    targetMissedRef.current = handleTargetMissed

    const spawnTarget = () => {
      if (completedRef.current) return
      syncTargets((current) => {
        if (current.length >= level.maxActiveTargets) return current
        const activeLetters = new Set(current.map((target) => target.letter))
        const availableFocusLetters = [...new Set(level.focusLetters)]
          .filter((letter) => !activeLetters.has(letter))
        const availableReviewLetters = [...new Set(level.reviewLetters)]
          .filter((letter) => !activeLetters.has(letter))
        const chooseReview = availableReviewLetters.length > 0 && Math.random() < 0.2
        const preferredPool = chooseReview ? availableReviewLetters : availableFocusLetters
        const fallbackPool = chooseReview ? availableFocusLetters : availableReviewLetters
        const letterPool = preferredPool.length > 0 ? preferredPool : fallbackPool
        if (letterPool.length === 0) return current
        const letter = letterPool[Math.floor(Math.random() * letterPool.length)] ?? 'F'
        const target: FallingTarget = {
          id: `${level.id}-${targetIdRef.current++}`,
          letter,
          xPercent: 9 + Math.random() * 82,
          spawnedAt: performance.now(),
        }
        return [...current, target]
      })
    }

    spawnTarget()
    const spawnTimer = window.setInterval(spawnTarget, level.spawnIntervalMs)

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.isComposing || completedRef.current) return
      const letter = event.key.toUpperCase()
      if (!/^[A-Z]$/.test(letter)) return

      const now = performance.now()
      const expiredIds = new Set(
        targetsRef.current
          .filter((target) => getTargetY(target, now) >= 100)
          .map((target) => target.id),
      )
      if (expiredIds.size > 0) {
        syncTargets((current) => current.filter((target) => !expiredIds.has(target.id)))
        showFeedback('missed', '沒關係，下一個字母再試試看')
      }

      const matchingTargets = targetsRef.current
        .filter((target) => target.letter === letter)
        .sort((a, b) => getTargetY(b, now) - getTargetY(a, now))

      if (matchingTargets.length === 0) {
        streakRef.current = 0
        setStreak(0)
        showFeedback('wrong', `這次沒有 ${letter}，再看看落下的字母`)
        return
      }

      const targetToRemove = matchingTargets[0]
      syncTargets((current) => current.filter((target) => target.id !== targetToRemove.id))
      const nextHits = Math.min(hitsRef.current + 1, HITS_TO_COMPLETE)
      const nextScore = scoreRef.current + POINTS_PER_HIT
      const nextStreak = streakRef.current + 1
      hitsRef.current = nextHits
      scoreRef.current = nextScore
      streakRef.current = nextStreak
      setHits(nextHits)
      setScore(nextScore)
      setStreak(nextStreak)
      showFeedback('correct', nextStreak >= 3 ? `連續命中 ${nextStreak} 次！` : '答對了，做得好！')

      const attemptComplete = correctHitRef.current(level.id)
      if (attemptComplete) {
        completedRef.current = true
        attemptCompleteRef.current(level.id, nextScore)
      }
    }

    keyHandlerRef.current = handleKeyDown
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      keyHandlerRef.current = () => undefined
      targetMissedRef.current = () => undefined
      window.clearInterval(spawnTimer)
      window.clearTimeout(feedbackTimeout)
      targetsRef.current = []
    }
  }, [level])

  return {
    targets,
    hits,
    score,
    streak,
    feedback,
    handleTargetMissed: (targetId) => targetMissedRef.current(targetId),
    handleKeyDown: (event) => keyHandlerRef.current(event),
  }
}
