# Falling Letter Typing Game Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a beginner-friendly browser game where players type falling English letters through ten saved, progressively unlocked levels.

**Architecture:** A single React page switches between the level map, active play, and level-complete view. Static level definitions describe focus and review letters; a small progress model persists the active level, per-level hits and score, and unlock state to browser local storage. A game-session hook owns target timing, keyboard matching, scoring, and progress callbacks; CSS animates each target independently so React does not rerender on every animation frame.

**Tech Stack:** Vite, React, TypeScript, CSS, browser `localStorage`; no backend or additional runtime service.

**Spec:** `docs/superpowers/specs/2026-11-02-falling-letter-typing-game-design.md`

## Global Constraints

- The interface uses Traditional Chinese, and game targets use uppercase English letters.
- The ten level focus groups are: F/J; D/K; S/L; A/P; G/H; Q/W/E/R/T; Y/U/I/O with P as review; Z/X/C/V; B/N/M; then A–Z mixed.
- Each level is completed after 20 correct hits.
- Each correct hit removes one matching letter and adds 10 points.
- Wrong keys and missed letters do not remove points or level progress.
- The game has no countdown or lives; later levels increase falling difficulty gradually while remaining beginner-friendly.
- 2026-11-03 follow-up: keep level 1 unchanged; levels 2–10 retain all previously learned letters for review, expand the practice pool from 4 to 26 letters, and progressively increase active target caps and spawn/fall speed. Level cards show the total practice-pool size.
- Progress is saved on the same browser and device after each correct hit; there is no login, cloud sync, or backend.
- Key matching uses the generated character, case-normalized; ignore key-repeat and input-method composition events.
- The game requires a physical keyboard and remains readable on narrow screens.

## Review Focus

- **IME composition and held keys:** do not treat composition or repeated `keydown` events as separate letter hits; handled by Task 3.
- **Duplicate falling letters:** remove only the matching target nearest the bottom; handled by Task 3.
- **Refresh during an unfinished level:** restore saved hits and score for the active level; handled by Tasks 2 and 4.
- **Invalid or unavailable local storage:** fall back to default in-memory progress without crashing the game; handled by Task 2.
- **Completing level 10:** show completion and replay/map actions without trying to unlock level 11; handled by Tasks 2 and 4.

---

## File Structure

- `package.json`, `index.html`, `tsconfig*.json`, `vite.config.ts` — Vite and TypeScript app setup.
- `src/main.tsx` — React entry point.
- `src/App.tsx` — app-level progress loading and level-map/game/completion flow.
- `src/styles.css` — theme, responsive layout, and shared controls.
- `src/game/levels.ts` — ten data-driven level definitions and difficulty settings.
- `src/game/progress.ts` — typed saved-progress shape and pure level-progress transitions.
- `src/game/progressStorage.ts` — versioned local-storage load/save with invalid-data and storage-error fallback.
- `src/game/useGameSession.ts` — target spawning, falling animation, keyboard input, score/streak, and session cleanup.
- `src/components/LevelMap.tsx` — level cards, lock/completion state, saved progress, and continue action.
- `src/components/GameBoard.tsx` — falling-letter playfield and live score/progress display.
- `src/components/LevelComplete.tsx` — completion results and next/replay actions.

## Task 1: Scaffold the React and TypeScript app

**Files:**
- Create: `package.json`, `index.html`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `vite.config.ts`
- Create: `src/main.tsx`, `src/App.tsx`, `src/styles.css`

**Interfaces:**
- Produces: `src/main.tsx` mounts `<App />` into `#root`; `App` is the single application shell with no router dependency.

- [x] Create the Vite React/TypeScript project configuration while preserving the existing `docs/` files.
- [x] Add `src/main.tsx` and `src/App.tsx` with a single mounted screen and semantic page structure.
- [x] Add the approved light, encouraging visual foundation in `src/styles.css`, including mobile-width layout rules.

**Deliverable:** A runnable single-page React/TypeScript shell with the approved visual direction and no unrelated dependencies.

## Task 2: Define levels and persistent progress

**Files:**
- Create: `src/game/levels.ts`
- Create: `src/game/progress.ts`
- Create: `src/game/progressStorage.ts`

**Interfaces:**
- `export type LevelId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10`.
- `export interface LevelDefinition { id: LevelId; title: string; focusLetters: readonly string[]; reviewLetters: readonly string[]; targetHits: 20; fallDurationMs: number; spawnIntervalMs: number; maxActiveTargets: number; }`.
- `export const LEVELS: readonly LevelDefinition[]` contains exactly the ten focus groups from the spec. Earlier letters can appear for review; level 7 treats P as review, not new content.
- `export interface GameProgress { resumeLevel: LevelId; unlockedThrough: LevelId; completedLevels: readonly LevelId[]; attempts: Partial<Record<LevelId, { hits: number; score: number }>>; }`.
- `createInitialProgress(): GameProgress` returns resume level 1, 1 unlocked, no completed levels, and zero hits/score.
- `startLevel(progress: GameProgress, level: LevelId): GameProgress` preserves an unfinished attempt and starts a completed level replay at 0 hits/score without changing unlocks or resume level.
- `recordCorrectHit(progress: GameProgress, level: LevelId): { progress: GameProgress; attemptComplete: boolean }` adds one hit and 10 points, marks completion at 20, unlocks the next level up to level 10, and advances `resumeLevel` only when the player first completes the current resume level.
- `loadProgress(): GameProgress` reads versioned key `keybloom.progress.v1`, validates its shape, and returns initial progress if missing or invalid.
- `saveProgress(progress: GameProgress): boolean` saves JSON and returns `false` if browser storage is unavailable.

- [x] Define the level groups and a gentle difficulty curve: levels 1–3 use a 12-second fall and 2.4-second spawn interval with at most 3 targets; levels 4–5 use 11 seconds and 2.2 seconds with at most 4 targets; levels 6–9 use 10 seconds and 2.0 seconds with at most 4 targets; level 10 uses 9 seconds and 1.8 seconds with at most 5 targets.
- [x] Define `GameProgress`, `startLevel`, and `recordCorrectHit` so replaying completed levels does not erase an unfinished level, 20-hit completion unlocks at most the next level, and level 10 does not produce level 11.
- [x] Implement versioned local-storage loading and saving, including invalid JSON and storage exceptions; the app should retain in-memory play if saving is unavailable.

**Deliverable:** A data-driven ten-level curriculum and a local progress model that can resume an unfinished level and unlock the next level without a server.

## Task 3: Implement the falling-letter game session

**Files:**
- Create: `src/game/useGameSession.ts`

**Interfaces:**
- `export interface FallingTarget { id: string; letter: string; xPercent: number; y: number; }`.
- `export interface GameSession { targets: readonly FallingTarget[]; hits: number; score: number; streak: number; handleKeyDown(event: KeyboardEvent): void; }`.
- `useGameSession(level: LevelDefinition, savedAttempt: { hits: number; score: number }, onCorrectHit: (level: LevelId) => boolean, onAttemptComplete: (level: LevelId, score: number) => void): GameSession` owns only the active level's transient targets and live streak; `onCorrectHit` returns whether this hit completed the attempt.

- [x] Animate each target with CSS and use an interval for spawning; remove missed targets on animation end and clean up timers when the level changes or the component unmounts.
- [x] Normalize `KeyboardEvent.key` to uppercase, ignore non-letter keys, `event.repeat`, and `event.isComposing`, then remove one matching target nearest the bottom.
- [x] On a correct hit, add 10 points, increment hit/streak, and call `onCorrectHit` once so progress is saved after every hit; on a wrong key, reset streak and show a gentle cue without changing score or hits.
- [x] Remove targets that reach the bottom without reducing score or progress; stop spawning after the level reaches 20 hits.

**Deliverable:** A game-session hook that supports live falling letters, precise key matching, saved hit progress, and clean level transitions.

## Task 4: Assemble the level, game, and completion screens

**Files:**
- Create: `src/components/LevelMap.tsx`
- Create: `src/components/GameBoard.tsx`
- Create: `src/components/LevelComplete.tsx`
- Modify: `src/App.tsx`, `src/styles.css`

**Interfaces:**
- `LevelMap({ progress, saveAvailable, onContinue, onSelectLevel })` renders ten stages, the active saved count, completion/lock state, and only permits selecting unlocked levels; its save label distinguishes saved-on-device from session-only fallback.
- `GameBoard({ level, savedAttempt, onCorrectHit, onAttemptComplete, onExit })` displays the playfield, current score, streak, and `hits / 20`, and forwards the session callbacks unchanged.
- `LevelComplete({ level, score, resumeLevel, onContinue, onReplay, onMap })` displays results and shows a final completion state after level 10.
- `App` loads progress once, passes progress transitions to the session, persists each correct hit and unlock, and tracks whether local persistence is available.

- [x] Build the ten-card level map with current progress, completed/locked states, a clear continue action, and accurate save-status text from `saveAvailable`.
- [x] Build the active game screen around `useGameSession`, including large letter targets, Traditional Chinese instructions, score, streak, and progress; open completion when the session reaches 20 correct hits.
- [x] Build the completion screen with replay and map actions; show the next level when available and a final completion state after level 10.
- [x] Connect screen transitions and progress storage in `App`, then apply the same responsive light theme across the level map, game, and completion screens.

**Deliverable:** The complete single-page game flow, including saved progress, ten locked/unlocked levels, active play, and the final completion state.
