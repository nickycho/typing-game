export type LevelId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

export interface LevelDefinition {
  id: LevelId
  title: string
  focusLetters: readonly string[]
  reviewLetters: readonly string[]
  targetHits: 20
  fallDurationMs: number
  spawnIntervalMs: number
  maxActiveTargets: number
}

export const LEVEL_DESCRIPTIONS: Readonly<Record<LevelId, string>> = {
  1: '先找到兩個食指按鍵',
  2: '加入中指鍵，累積練習 4 個字母',
  3: '加入無名指鍵，累積練習 6 個字母',
  4: '加入小指鍵，累積練習 8 個字母',
  5: '加入食指鍵，累積練習 10 個字母',
  6: '加入左手上排，累積練習 15 個字母',
  7: '加入右手上排，累積練習 19 個字母',
  8: '加入左手下排，累積練習 23 個字母',
  9: '加入右手下排，練習全部 26 個字母',
  10: '全字母加速混合挑戰',
}

export const LEVELS: readonly LevelDefinition[] = [
  { id: 1, title: '定位鍵', focusLetters: ['F', 'J'], reviewLetters: [], targetHits: 20, fallDurationMs: 12000, spawnIntervalMs: 2400, maxActiveTargets: 3 },
  { id: 2, title: '中指練習', focusLetters: ['D', 'K'], reviewLetters: ['F', 'J'], targetHits: 20, fallDurationMs: 11000, spawnIntervalMs: 2300, maxActiveTargets: 4 },
  { id: 3, title: '無名指練習', focusLetters: ['S', 'L'], reviewLetters: ['F', 'J', 'D', 'K'], targetHits: 20, fallDurationMs: 10000, spawnIntervalMs: 2000, maxActiveTargets: 5 },
  { id: 4, title: '小指練習', focusLetters: ['A', 'P'], reviewLetters: ['F', 'J', 'D', 'K', 'S', 'L'], targetHits: 20, fallDurationMs: 9500, spawnIntervalMs: 1800, maxActiveTargets: 5 },
  { id: 5, title: '食指伸展', focusLetters: ['G', 'H'], reviewLetters: ['F', 'J', 'D', 'K', 'S', 'L', 'A', 'P'], targetHits: 20, fallDurationMs: 9000, spawnIntervalMs: 1600, maxActiveTargets: 6 },
  { id: 6, title: '上排左手', focusLetters: ['Q', 'W', 'E', 'R', 'T'], reviewLetters: ['F', 'J', 'D', 'K', 'S', 'L', 'A', 'P', 'G', 'H'], targetHits: 20, fallDurationMs: 8500, spawnIntervalMs: 1500, maxActiveTargets: 6 },
  { id: 7, title: '上排右手', focusLetters: ['Y', 'U', 'I', 'O'], reviewLetters: ['F', 'J', 'D', 'K', 'S', 'L', 'A', 'P', 'G', 'H', 'Q', 'W', 'E', 'R', 'T'], targetHits: 20, fallDurationMs: 8000, spawnIntervalMs: 1300, maxActiveTargets: 7 },
  { id: 8, title: '下排左手', focusLetters: ['Z', 'X', 'C', 'V'], reviewLetters: ['F', 'J', 'D', 'K', 'S', 'L', 'A', 'P', 'G', 'H', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O'], targetHits: 20, fallDurationMs: 7500, spawnIntervalMs: 1100, maxActiveTargets: 7 },
  { id: 9, title: '下排右手', focusLetters: ['B', 'N', 'M'], reviewLetters: ['F', 'J', 'D', 'K', 'S', 'L', 'A', 'P', 'G', 'H', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'Z', 'X', 'C', 'V'], targetHits: 20, fallDurationMs: 7000, spawnIntervalMs: 1000, maxActiveTargets: 8 },
  { id: 10, title: '全字母混合', focusLetters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''), reviewLetters: [], targetHits: 20, fallDurationMs: 6500, spawnIntervalMs: 800, maxActiveTargets: 9 },
]

export function getLevel(levelId: LevelId): LevelDefinition {
  return LEVELS[levelId - 1]
}
