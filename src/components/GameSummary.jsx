import { useGameStore } from '../store/gameStore';

export default function GameSummary() {
    const { score, maxStreak, settings, backToMenu, startNewGame, gameMode } = useGameStore();

    return (
        <div class="max-w-2xl w-full flex flex-col items-center py-10 animate-in fade-in zoom-in-95 duration-500">
            <div class="relative mb-8">
                <div class="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
                <div class="relative bg-dark-sepia-ink size-32 rounded-full flex items-center justify-center border-4 border-primary shadow-2xl">
                    <span class="material-symbols-outlined text-primary text-7xl fill-current" style="font-variation-settings: 'FILL' 1;">
                        emoji_events
                    </span>
                </div>
            </div>

            <h1 class="text-5xl font-black text-dark-sepia-ink mb-2">Game Over!</h1>
            <p class="text-text-charcoal/60 text-lg mb-10 tracking-wide uppercase font-bold">Excellent Performance</p>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-12">
                <div class="bg-surface-sepia border-2 border-accent-sepia/20 p-8 rounded-3xl flex flex-col items-center text-center shadow-sm">
                    <span class="text-xs font-black text-accent-sepia uppercase tracking-widest mb-1">Final Score</span>
                    <span class="text-6xl font-black text-dark-sepia-ink tabular-nums">{score()}</span>
                </div>
                <div class="bg-surface-sepia border-2 border-accent-sepia/20 p-8 rounded-3xl flex flex-col items-center text-center shadow-sm">
                    <span class="text-xs font-black text-accent-sepia uppercase tracking-widest mb-1">Best Streak</span>
                    <span class="text-6xl font-black text-dark-sepia-ink tabular-nums">{maxStreak()}</span>
                </div>
            </div>

            <div class="w-full bg-dark-sepia-ink border border-white/10 rounded-3xl p-8 mb-12 flex items-center justify-between text-background-parchment shadow-xl">
                <div>
                    <p class="text-primary/60 text-xs font-bold uppercase tracking-widest mb-1">Difficulty</p>
                    <p class="text-4xl font-black">{settings().name}</p>
                </div>
                <div class="text-right">
                    <p class="text-primary/60 text-xs font-bold uppercase tracking-widest mb-1">Mode</p>
                    <p class="text-2xl font-bold capitalize">{gameMode().replace(/-/g, ' ')}</p>
                </div>
            </div>

            <div class="flex flex-col sm:flex-row gap-4 w-full">
                <button
                    onClick={() => startNewGame(gameMode())}
                    class="flex-[2] bg-primary hover:bg-primary/90 text-dark-sepia-ink font-black text-xl py-6 rounded-2xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
                >
                    <span class="material-symbols-outlined font-bold">replay</span>
                    Play Again
                </button>
                <button
                    onClick={backToMenu}
                    class="flex-1 bg-surface-sepia border-2 border-accent-sepia/20 text-accent-sepia font-black text-xl py-6 rounded-2xl hover:bg-white/50 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
                >
                    <span class="material-symbols-outlined font-bold">menu</span>
                    Menu
                </button>
            </div>
        </div >
    );
}
