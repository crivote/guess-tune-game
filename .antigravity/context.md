# TradTune Guesser - Project Context

## Project Overview
TradTune Guesser is a gamified music education app for learning and identifying Irish traditional tunes. It uses audio clips and ABC notation (likely handled via `abcjs`) to challenge users.

## Technology Stack
- **Framework:** SolidJS
- **Styling:** Tailwind CSS (Vanilla CSS in `index.css`)
- **Build Tool:** Vite
- **Deployment:** GitHub Pages (Requires `BASE_URL` awareness)
- **State Management:** Custom Store in `src/store/gameStore.js` using SolidJS signals and effects.

## UI/UX Guidelines
- **Theme:** "Rich Parchment" aesthetic.
  - Background: `bg-background-parchment`
  - Primary Content: `bg-surface-sepia`, `text-text-charcoal`
  - Accents: `dark-sepia-ink`, `primary` (golden/yellow), `accent-sepia`
- **Iconography:** Material Symbols Outlined.
- **Animations:** Subtle transitions, scale effects on buttons, and pulse animations for interactive states.

## Architecture & Design Patterns
- **Global Store:** Centralized logic in `gameStore.js`. Avoid local state for data that needs to persist or influence the global game loop.
- **LocalStorage:** Used for `userName`, `hasConsent`, `persistentLogin`, `gameHistory`, and `highScore`.
- **Difficulty System:** 
  - Progression-based unlocking.
  - Scores are gated by login status (unlogged users can only play BEGINNER and scores aren't saved).
  - High scores and history are capped (e.g., top 5).
  - **Scoring Formulas:**
    - `BasePoints = 350`
    - `RoundScore = Base * (options/4) * (poolSize/1000) * TimeWeight * TryBonus`
    - `TimeWeight`: 
      - With limit: `1 + (timeLeft / limit)`
      - No limit: `1 + max(0, 1 - (elapsed / 5))`
    - `StreakBonus`: Compounding bonus starts at 5% of round score.
      - Each new guess adds 10% to the multiplier: `Bonus = RoundScore * 0.5 * (1.1^streak - 1)`.
      - **Streak is lost on ANY incorrect try**, not just at the end of the round.

## Common Pitfalls & Rules
- **Asset Paths:** Always use `${import.meta.env.BASE_URL}tunes.json` or similar for assets to ensure compatibility with GitHub Pages paths.
- **Login Requirements:** Many features (saving history, unlocking higher difficulties) require `isLoggedIn()`. Always verify this before allowing state changes.
- **Difficulty Sanitization:** Always ensure the selected difficulty is unlocked. If a user logs out or has no history, reset to `BEGINNER`.
- **Persistent Login:** Check for `hasSavedData()` and `persistentLogin` status on mount to show the `DataRecoveryPopup` or auto-fill user credentials.

## Deployment Note
The app is designed to run on a subpath (e.g., `/guess-tune-game/`). Keep URLs relative to the base path.
