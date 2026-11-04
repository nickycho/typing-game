import type { LevelDefinition, LevelId } from '../game/levels'

interface LevelCompleteProps {
  level: LevelDefinition
  score: number
  resumeLevel: LevelId
  onContinue: () => void
  onReplay: () => void
  onMap: () => void
}

export default function LevelComplete({ level, score, resumeLevel, onContinue, onReplay, onMap }: LevelCompleteProps) {
  const isFinalLevel = level.id === 10

  return (
    <main className="completion-screen">
      <header className="app-header">
        <a className="brand" href="#home" aria-label="KeyBloom 首頁" onClick={(event) => { event.preventDefault(); onMap() }}>
          <span className="brand-mark" aria-hidden="true">✿</span>
          <span>keybloom</span>
        </a>
      </header>
      <section className="completion-card">
        <div className="completion-sparkle" aria-hidden="true">✦</div>
        <p className="eyebrow">{isFinalLevel ? 'JOURNEY COMPLETE' : `LEVEL ${level.id} COMPLETE`}</p>
        <h1>{isFinalLevel ? '十關都完成了！' : '太棒了，本關完成！'}</h1>
        <p className="completion-copy">
          {isFinalLevel ? '你已經把 26 個英文字母都練過一遍，繼續保持這份好手感。' : `你已經熟悉「${level.title}」的字母位置，可以慢慢前進到下一小步。`}
        </p>
        <div className="result-score"><strong>{score}</strong><span>本關分數</span></div>
        {!isFinalLevel && (
          <p className="unlock-message"><span aria-hidden="true">🔓</span> 第 {level.id + 1} 關已解鎖！下次可以從第 {resumeLevel} 關接著練習。</p>
        )}
        <div className="completion-actions">
          {!isFinalLevel && <button className="button button-primary" type="button" onClick={onContinue}>繼續第 {resumeLevel} 關　→</button>}
          <button className="button button-secondary" type="button" onClick={onReplay}>再玩一次</button>
          <button className="button button-quiet" type="button" onClick={onMap}>回到關卡地圖</button>
        </div>
      </section>
    </main>
  )
}
