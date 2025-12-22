import { For } from 'solid-js';
import { useGameStore, DIFFICULTIES } from '../store/gameStore';

export default function DifficultySelector(props) {
    const { settings, applyPreset, isDifficultyUnlocked, getUnlockProgress, isLoggedIn } = useGameStore();

    // Only show main progression difficulties (exclude CUSTOM)
    const mainDifficulties = [
        DIFFICULTIES.BEGINNER,
        DIFFICULTIES.BASIC,
        DIFFICULTIES.MEDIUM,
        DIFFICULTIES.HARD
    ];

    const getDifficultyIcon = (diffId) => {
        switch (diffId) {
            case 'BEGINNER': return 'school';
            case 'BASIC': return 'thumb_up';
            case 'MEDIUM': return 'bolt';
            case 'HARD': return 'whatshot';
            default: return 'settings';
        }
    };

    console.log(settings());
    return (
        <div class="w-full max-w-2xl mx-auto mb-10 p-6 bg-surface-sepia/30 rounded-2xl border border-accent-sepia/20 backdrop-blur-sm">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <For each={mainDifficulties}>
                    {(diff) => {
                        return (
                            <button
                                onClick={() => isDifficultyUnlocked(diff.id) && applyPreset(diff.id)}
                                disabled={!isDifficultyUnlocked(diff.id)}
                                class={`relative p-4 rounded-xl border-2 transition-all flex flex-col items-center text-center group ${!isDifficultyUnlocked(diff.id)
                                    ? 'bg-white/5 border-transparent cursor-not-allowed'
                                    : settings().id === diff.id
                                        ? 'bg-primary/10 border-primary ring-1 ring-primary/20'
                                        : 'bg-white/35 border-transparent hover:bg-white/10 hover:border-accent-sepia/30'
                                    }`}
                            >
                                {/* Lock overlay for locked difficulties */}
                                <Show when={!isDifficultyUnlocked(diff.id)}>
                                    <>
                                        {/* White blur background */}
                                        <div class="absolute inset-0 bg-white/75 rounded-xl z-10 drop-shadow-md" />
                                        {/* Golden lock icon on top */}
                                        <div class="absolute -translate-y-4 inset-0 flex flex-col items-center justify-center z-20 gap-1">
                                            <span class="material-symbols-outlined text-4xl text-yellow-600" style="font-variation-settings: 'FILL' 1, 'wght' 600">
                                                lock
                                            </span>
                                        </div>
                                    </>
                                </Show>

                                <div class={`size-10 rounded-lg flex items-center justify-center mb-3 ${settings().id === diff.id ? 'bg-primary text-dark-sepia-ink' : 'bg-surface-sepia text-accent-sepia'
                                    }`}>
                                    <span class="material-symbols-outlined text-2xl">
                                        {getDifficultyIcon(diff.id)}
                                    </span>
                                </div>
                                <h3 class="font-bold text-dark-sepia-ink mb-1">{diff.name}</h3>
                                <div class="text-[10px] uppercase tracking-wider font-bold text-accent-sepia/60">
                                    {diff.numOptions} Options
                                    <br />
                                    {diff.roundsCount} Rounds
                                </div>

                                {/* Progress bar or Login badge for locked difficulties */}
                                <Show when={!isDifficultyUnlocked(diff.id)}>
                                    <div class="w-full mt-3 relative z-30">
                                        <Show when={isLoggedIn()} fallback={
                                            <div class="flex flex-col items-center">
                                                <span class="text-[9px] font-black text-dark-sepia-ink uppercase tracking-tighter bg-primary px-2 py-1 rounded shadow-sm">
                                                    Login to Unlock
                                                </span>
                                            </div>
                                        }>
                                            <div class="h-1.5 bg-dark-sepia-ink/10 rounded-full overflow-hidden">
                                                <div
                                                    class="h-full bg-gradient-to-r from-accent-sepia to-primary transition-all duration-300"
                                                    style={{ width: `${getUnlockProgress(diff.id)}%` }}
                                                />
                                            </div>
                                            <div class="text-[9px] text-dark-sepia-ink/70 mt-1 font-semibold">
                                                {Math.round(getUnlockProgress(diff.id))}% to unlock
                                            </div>
                                        </Show>
                                    </div>
                                </Show>

                                {/* Unlocked badge */}
                                <Show when={isDifficultyUnlocked(diff.id) && getUnlockProgress(diff.id) >= 100 && diff.id !== 'BEGINNER'}>
                                    <div class="text-[9px] text-primary/70 mt-2 font-semibold">
                                        ✓ Unlocked
                                    </div>
                                </Show>

                                <Show when={settings().id === diff.id}>
                                    <div class="absolute -top-2 -right-2 bg-primary text-dark-sepia-ink size-5 rounded-full flex items-center justify-center animate-in zoom-in-0 duration-200">
                                        <span class="material-symbols-outlined text-xs font-bold">check</span>
                                    </div>
                                </Show>
                            </button>
                        );
                    }}
                </For>
            </div>

            <div class="mt-6 p-4 bg-dark-sepia-ink/5 rounded-lg border border-dark-sepia-ink/5">
                <div class="flex flex-wrap justify-between gap-4 text-xs font-medium text-text-charcoal/60">
                    <div class="flex items-center gap-1.5">
                        <span class="material-symbols-outlined text-sm">psychology</span>
                        <span>{settings().maxTries} {settings().maxTries === 1 ? 'Try' : 'Tries'} per round</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                        <span class="material-symbols-outlined text-sm">timer</span>
                        <span>{settings().timeLimit > 0 ? `${settings().timeLimit}s` : 'No'} limit</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                        <span class="material-symbols-outlined text-sm">list</span>
                        <span>{settings().poolFilters?.topN ? `Top ${settings().poolFilters.topN} tunes` : '1500 tunes'}</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                        <span class="material-symbols-outlined text-sm">rule</span>
                        <span>Penalty: {settings().penalty || 0} pts</span>
                    </div>
                </div>
            </div>

        </div>
    );
}
