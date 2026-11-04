import { LEVELS, LEVEL_DESCRIPTIONS, type LevelId } from '../game/levels'
import { getAttempt, type GameProgress } from '../game/progress'

interface LevelMapProps {
  progress: GameProgress
  saveAvailable: boolean
  onContinue: () => void
  onSelectLevel: (level: LevelId) => void
}

export default function LevelMap({ progress, saveAvailable, onContinue, onSelectLevel }: LevelMapProps) {
  const currentAttempt = getAttempt(progress, progress.resumeLevel)
  const completedCount = progress.completedLevels.length
  const allComplete = completedCount === LEVELS.length

  return (
    <>
      <header className="app-header">
        <a className="brand" href="#home" aria-label="KeyBloom 首頁">
          <span className="brand-mark" aria-hidden="true">✿</span>
          <span>keybloom</span>
        </a>
        <SaveBadge saveAvailable={saveAvailable} />
      </header>

      <section className="hero-row">
        <div>
          <p className="eyebrow">YOUR TYPING JOURNEY</p>
          <h1>十小步，慢慢熟悉鍵盤</h1>
          <p className="intro-copy">先找到手指的位置，再逐步認識每一排字母。</p>
        </div>
        <div className="summary-card" aria-label={`已完成 ${completedCount} 個關卡，目前進度 ${currentAttempt.hits} / 20`}>
          <div><small>已完成關卡</small><strong>{completedCount} / 10</strong></div>
          <span className="summary-divider" aria-hidden="true" />
          <div><small>目前進度</small><strong>{currentAttempt.hits} / 20</strong></div>
        </div>
      </section>

      <div className="section-heading">
        <strong>新手路線 · 10 個小關卡</strong>
        <span>每關命中 20 次即可前進</span>
      </div>
      <section className="level-grid" aria-label="十個循序漸進的打字關卡">
        {LEVELS.map((level) => {
          const letterPoolCount = new Set([...level.focusLetters, ...level.reviewLetters]).size
          const isLocked = level.id > progress.unlockedThrough
          const isComplete = progress.completedLevels.includes(level.id)
          const isCurrent = level.id === progress.resumeLevel && !isComplete
          const attempt = getAttempt(progress, level.id)
          const classes = ['level-card', isLocked ? 'is-locked' : '', isComplete ? 'is-complete' : '', isCurrent ? 'is-current' : '']
            .filter(Boolean).join(' ')

          return (
            <button
              className={classes}
              type="button"
              key={level.id}
              disabled={isLocked}
              onClick={() => onSelectLevel(level.id)}
              aria-label={`第 ${level.id} 關：${level.title}${isComplete ? '，已完成，可重玩' : isLocked ? '，尚未解鎖' : `，已命中 ${attempt.hits} 次`}`}
            >
              <span className="level-topline">
                <span className="level-number">{level.id}</span>
                <span className="level-status">
                  {isComplete ? '✓ 完成' : isCurrent ? '▶ 進行中' : isLocked ? '🔒 鎖定' : `${attempt.hits} / 20`}
                </span>
              </span>
              <span className="level-title">{level.title}</span>
              <span className="level-description">{LEVEL_DESCRIPTIONS[level.id]}</span>
              <span className="letter-list" aria-hidden="true">
                {(level.id === 10 ? ['A', '…', 'Z'] : level.focusLetters).map((letter, index) => (
                  <span className="letter-chip" key={`${letter}-${index}`}>{letter}</span>
                ))}
                <span className="review-hint">
                  {level.reviewLetters.length > 0 ? `+${level.reviewLetters.length} 複習 · ` : ''}
                  共 {letterPoolCount} 個字母
                </span>
              </span>
            </button>
          )
        })}
      </section>

      <section className="continue-card">
        <div className="continue-copy-wrap">
          <span className="continue-icon" aria-hidden="true">🌱</span>
          <div className="continue-copy">
            <small>{allComplete ? '十關都完成了，真棒！' : '接續上次的練習'}</small>
            <strong>{allComplete ? '再熟悉一次全字母混合' : `第 ${progress.resumeLevel} 關：${LEVELS[progress.resumeLevel - 1].title}`}</strong>
            <span>{allComplete ? '想繼續練習時，可以重玩任何已完成的關卡。' : `已命中 ${currentAttempt.hits} 個字母；離開後會接著本關練習。`}</span>
            <div className="progress-area">
              <div className="progress-track"><span style={{ width: `${Math.min(currentAttempt.hits / 20 * 100, 100)}%` }} /></div>
              <div className="progress-caption"><span>本關進度</span><span>{currentAttempt.hits} / 20</span></div>
            </div>
          </div>
        </div>
        <button className="button button-primary continue-button" type="button" onClick={onContinue}>
          {allComplete ? '再練習一次　→' : `繼續第 ${progress.resumeLevel} 關　→`}
        </button>
      </section>

      <p className="save-note">
        <span aria-hidden="true">✓</span>
        {saveAvailable
          ? '每次命中後自動保存。解鎖狀態、目前關卡與成績都會記住；同一裝置可接續練習。'
          : '目前無法使用裝置儲存，這個分頁仍可繼續練習；關閉後進度可能不會保留。'}
      </p>
    </>
  )
}

function SaveBadge({ saveAvailable }: { saveAvailable: boolean }) {
  return (
    <span className={`save-badge ${saveAvailable ? '' : 'save-badge-session'}`}>
      <span className="save-dot" aria-hidden="true" />
      {saveAvailable ? '進度已自動保存 · 此裝置' : '僅此分頁保存'}
    </span>
  )
}
