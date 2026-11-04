import { LEVEL_DESCRIPTIONS, type LevelDefinition, type LevelId } from '../game/levels'
import type { LevelAttempt } from '../game/progress'
import { useGameSession } from '../game/useGameSession'

interface GameBoardProps {
  level: LevelDefinition
  savedAttempt: LevelAttempt
  onCorrectHit: (level: LevelId) => boolean
  onAttemptComplete: (level: LevelId, score: number) => void
  onExit: () => void
}

export default function GameBoard({ level, savedAttempt, onCorrectHit, onAttemptComplete, onExit }: GameBoardProps) {
  const session = useGameSession(level, savedAttempt, onCorrectHit, onAttemptComplete)
  const progress = Math.min(session.hits / level.targetHits * 100, 100)

  return (
    <main className="game-screen">
      <header className="game-header">
        <button className="back-button" type="button" onClick={onExit} aria-label="回到關卡地圖">
          <span aria-hidden="true">←</span><span>關卡地圖</span>
        </button>
        <a className="brand brand-compact" href="#home" aria-label="KeyBloom">
          <span className="brand-mark" aria-hidden="true">✿</span><span>keybloom</span>
        </a>
        <div className="level-label">第 {level.id} 關 <span>·</span> {level.title}</div>
      </header>

      <section className="game-heading">
        <div>
          <p className="eyebrow">{LEVEL_DESCRIPTIONS[level.id]}</p>
          <h1>找到落下的字母</h1>
          <p className="intro-copy">按下鍵盤上相同的英文字母，慢慢來就可以。</p>
        </div>
        <div className="game-stats" aria-label={`分數 ${session.score}，命中 ${session.hits} 次，連續 ${session.streak} 次`}>
          <div className="stat-card"><small>分數</small><strong>{session.score}</strong></div>
          <div className="stat-card"><small>連續命中</small><strong>{session.streak}<span className="stat-unit"> 次</span></strong></div>
        </div>
      </section>

      <section className="game-progress" aria-label={`本關進度 ${session.hits} / ${level.targetHits}`}>
        <div className="game-progress-copy"><strong>本關進度</strong><span>{session.hits} <i>/</i> {level.targetHits}</span></div>
        <div className="progress-track game-progress-track"><span style={{ width: `${progress}%` }} /></div>
      </section>

      <section className="playfield" aria-label="落下字母的遊戲區">
        <div className="playfield-cloud cloud-one" aria-hidden="true" />
        <div className="playfield-cloud cloud-two" aria-hidden="true" />
        <div className="playfield-hint"><span className="hint-key">⌨</span>看見字母後，在鍵盤上按下相同的按鍵</div>
        {session.targets.map((target) => (
          <span
            className="falling-letter-track"
            key={target.id}
            style={{ left: `${target.xPercent}%`, animationDuration: `${level.fallDurationMs}ms` }}
            onAnimationEnd={() => session.handleTargetMissed(target.id)}
            aria-label={`字母 ${target.letter}`}
          >
            <span className="falling-letter" aria-hidden="true">{target.letter}</span>
          </span>
        ))}
        <div className="playfield-ground" aria-hidden="true"><span>慢慢打，沒關係</span></div>
        <div className="feedback-slot" aria-live="polite" aria-atomic="true">
          {session.feedback && (
            <span className={`feedback-message feedback-${session.feedback.kind}`} key={session.feedback.id}>
              {session.feedback.kind === 'correct' ? '✦ ' : session.feedback.kind === 'missed' ? '☁ ' : '↻ '}
              {session.feedback.text}
            </span>
          )}
        </div>
      </section>

      <footer className="game-footer">
        <div className="focus-letters">
          <span>本關練習</span>
          {[...level.focusLetters, ...level.reviewLetters].map((letter, index) => (
            <span className={`focus-chip ${level.reviewLetters.includes(letter) ? 'focus-review' : ''}`} key={`${letter}-${index}`}>{letter}</span>
          ))}
          {level.id === 7 && <small>P 是複習字母</small>}
        </div>
        <p>按錯或漏接都不扣分，繼續練習就好。</p>
      </footer>
    </main>
  )
}
