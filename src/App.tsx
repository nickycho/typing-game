import { useCallback, useRef, useState } from 'react'
import GameBoard from './components/GameBoard'
import LevelComplete from './components/LevelComplete'
import LevelMap from './components/LevelMap'
import { getLevel, LEVELS, type LevelId } from './game/levels'
import { getAttempt, recordCorrectHit, startLevel, type GameProgress } from './game/progress'
import { loadProgress, saveProgress } from './game/progressStorage'

type Screen = 'map' | 'game' | 'complete'

export default function App() {
  const [progress, setProgress] = useState<GameProgress>(loadProgress)
  const progressRef = useRef(progress)
  const [saveAvailable, setSaveAvailable] = useState(() => saveProgress(progress))
  const [screen, setScreen] = useState<Screen>('map')
  const [activeLevel, setActiveLevel] = useState<LevelId>(progress.resumeLevel)
  const [completedScore, setCompletedScore] = useState(0)
  const [sessionNumber, setSessionNumber] = useState(0)

  const persistProgress = useCallback((next: GameProgress) => {
    progressRef.current = next
    setProgress(next)
    setSaveAvailable(saveProgress(next))
  }, [])

  const handleCorrectHit = useCallback((level: LevelId) => {
    const result = recordCorrectHit(progressRef.current, level)
    persistProgress(result.progress)
    return result.attemptComplete
  }, [persistProgress])

  const handleAttemptComplete = useCallback((_level: LevelId, score: number) => {
    setCompletedScore(score)
    setScreen('complete')
  }, [])

  const openLevel = useCallback((level: LevelId) => {
    const current = progressRef.current
    if (level > current.unlockedThrough) return
    persistProgress(startLevel(current, level))
    setActiveLevel(level)
    setSessionNumber((number) => number + 1)
    setScreen('game')
  }, [persistProgress])

  const handleContinue = useCallback(() => openLevel(progressRef.current.resumeLevel), [openLevel])

  const handleMap = useCallback(() => setScreen('map'), [])

  return (
    <div className="app-shell">
      {screen === 'map' && (
        <LevelMap
          progress={progress}
          saveAvailable={saveAvailable}
          onContinue={handleContinue}
          onSelectLevel={openLevel}
        />
      )}

      {screen === 'game' && (
        <GameBoard
          key={`${activeLevel}-${sessionNumber}`}
          level={getLevel(activeLevel)}
          savedAttempt={getAttempt(progress, activeLevel)}
          onCorrectHit={handleCorrectHit}
          onAttemptComplete={handleAttemptComplete}
          onExit={handleMap}
        />
      )}

      {screen === 'complete' && (
        <LevelComplete
          level={getLevel(activeLevel)}
          score={completedScore}
          resumeLevel={progress.resumeLevel}
          onContinue={handleContinue}
          onReplay={() => openLevel(activeLevel)}
          onMap={handleMap}
        />
      )}

      <span className="visually-hidden" aria-live="polite">
        目前已解鎖 {progress.unlockedThrough} 個關卡，共完成 {progress.completedLevels.length} 個關卡。
        下一個關卡：{LEVELS[progress.resumeLevel - 1]?.title}
      </span>
    </div>
  )
}
