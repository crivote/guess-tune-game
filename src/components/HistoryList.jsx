import { For, Show, createSignal } from 'solid-js';
import { useGameStore, DIFFICULTIES } from '../store/gameStore';

export default function HistoryList() {
    const { history, isLoggedIn } = useGameStore();
    const [activeTab, setActiveTab] = createSignal('BEGINNER');

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div class="w-full max-w-2xl mx-auto mb-10 p-6 bg-dark-sepia-ink/90 rounded-2xl border border-accent-sepia/20 shadow-xl overflow-hidden text-background-parchment">
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-3">
                    <span class="material-symbols-outlined text-primary">emoji_events</span>
                    <h2 class="text-xl font-bold">High Scores</h2>
                </div>
            </div>

            <Show when={isLoggedIn()} fallback={
                <div class="py-12 text-center flex flex-col items-center gap-4">
                    <div class="size-16 rounded-full bg-white/5 flex items-center justify-center">
                        <span class="material-symbols-outlined text-4xl text-primary/50">lock</span>
                    </div>
                    <div class="max-w-xs">
                        <h3 class="text-lg font-bold text-white mb-1">Scores are locked</h3>
                        <p class="text-sm text-white/50">Login to track your progress and compete for the top spots!</p>
                    </div>
                </div>
            }>
                <div class="flex gap-2 mb-4 overflow-x-auto pb-2">
                    <For each={Object.values(DIFFICULTIES).filter(d => d.id !== 'CUSTOM')}>
                        {(diff) => (
                            <button
                                onClick={() => setActiveTab(diff.id)}
                                class={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${activeTab() === diff.id
                                    ? 'bg-primary text-dark-sepia-ink'
                                    : 'bg-white/5 text-white/40 hover:bg-white/10'
                                    }`}
                            >
                                {diff.name}
                            </button>
                        )}
                    </For>
                </div>

                <div class="space-y-3 min-h-[200px]">
                    <For each={history()[activeTab()] || []} fallback={
                        <div class="py-10 text-center opacity-30 italic flex flex-col items-center">
                            <span class="material-symbols-outlined text-4xl mb-2 opacity-50">sports_score</span>
                            No scores for {DIFFICULTIES[activeTab()].name} yet.
                        </div>
                    }>
                        {(run, index) => (
                            <div class="bg-white/5 rounded-xl p-4 flex items-center justify-between border border-white/5 hover:bg-white/10 transition-colors group">
                                <div class="flex items-center gap-4">
                                    <div class={`size-8 rounded-full flex items-center justify-center font-black text-dark-sepia-ink ${index() === 0 ? 'bg-yellow-400' :
                                        index() === 1 ? 'bg-gray-300' :
                                            index() === 2 ? 'bg-orange-400' : 'bg-white/20 text-white'
                                        }`}>
                                        {index() + 1}
                                    </div>
                                    <div class="flex flex-col gap-1">
                                        <span class="text-xs opacity-50 font-medium">{formatDate(run.date)}</span>
                                        <div class="text-[10px] opacity-40 uppercase tracking-tight">
                                            {run.mode === 'tune-to-title' ? 'Tune to Title' : 'Title to Tune'} • Max Streak: {run.maxStreak || 0}
                                        </div>
                                    </div>
                                </div>
                                <div class="text-xl font-black text-primary">
                                    {run.score}
                                </div>
                            </div>
                        )}
                    </For>
                </div>
            </Show>
        </div>
    );
}
