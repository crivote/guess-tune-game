import { onMount, Switch, Match } from 'solid-js';
import { useGameStore } from './store/gameStore';
import GameModeTuneToTitle from './components/GameModeTuneToTitle';
import GameModeTitleToTune from './components/GameModeTitleToTune';
import DifficultySelector from './components/DifficultySelector';
import HistoryList from './components/HistoryList';
import SettingsPopup from './components/SettingsPopup';
import GameSummary from './components/GameSummary';
import { createSignal, Show } from 'solid-js';

function App() {
    const { gameState, startNewGame, startGame, loadTunes, setGameState, gameMode, userName, backToMenu, isStarting } = useGameStore();
    const [showSettings, setShowSettings] = createSignal(false);

    onMount(async () => {
        await loadTunes();
    });

    return (
        <div class="bg-background-parchment text-text-charcoal font-display min-h-screen flex flex-col">
            <header class="sticky top-0 z-50 w-full border-b border-accent-sepia/20 bg-surface-sepia/95 backdrop-blur-md shadow-sm">
                <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex h-16 items-center justify-between">
                        <div
                            class="flex items-center gap-3 cursor-pointer"
                            onClick={backToMenu}
                        >
                            <div class="flex items-center justify-center size-9 rounded-lg bg-primary text-dark-sepia-ink shadow-sm">
                                <span class="material-symbols-outlined text-[24px]">music_note</span>
                            </div>
                            <h1 class="text-2xl font-bold tracking-tight text-dark-sepia-ink">TradTune Guesser</h1>
                        </div>
                        <Show when={gameState() === 'playing' || gameState() === 'answered'}>
                            <button
                                onClick={backToMenu}
                                class="flex items-center gap-2 text-accent-sepia hover:text-dark-sepia-ink font-bold transition-all"
                            >
                                <span class="material-symbols-outlined">menu</span>
                                <span class="hidden sm:inline">Menu</span>
                            </button>
                        </Show>
                    </div>
                </div>
            </header>

            <main class="flex-grow p-4 md:p-6 lg:p-8 flex items-start justify-center">
                <Switch>
                    <Match when={gameState() === 'menu'}>
                        <div class="max-w-4xl w-full flex flex-col items-center py-6">
                            <div class="flex flex-col items-center text-center mb-10 max-w-2xl">
                                <h2 class="text-4xl font-black text-dark-sepia-ink mb-3 capitalize">
                                    Welcome, {userName()}!
                                </h2>
                                <p class="text-lg text-text-charcoal/70 leading-relaxed font-medium">
                                    TradTune Guesser is a challenge for your ears and your memory.
                                    Listen to the melodies and identify the tunes from the rich tradition of Irish music.
                                </p>
                            </div>

                            <DifficultySelector onOpenSettings={() => setShowSettings(true)} />

                            <Show when={showSettings()}>
                                <SettingsPopup onClose={() => setShowSettings(false)} />
                            </Show>

                            <div class="text-center mb-6">
                                <h2 class="text-3xl font-black text-dark-sepia-ink mb-1">Modes</h2>
                                <p class="text-text-charcoal/60 text-sm">Choose your path</p>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl mb-12">
                                <button
                                    onClick={() => startNewGame('tune-to-title')}
                                    class="group relative bg-surface-sepia p-6 rounded-2xl border-2 border-accent-sepia/20 hover:border-primary transition-all text-left shadow-sm hover:shadow-xl active:scale-[0.98]"
                                >
                                    <div class="size-14 rounded-xl bg-primary/20 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-dark-sepia-ink transition-colors">
                                        <span class="material-symbols-outlined text-3xl">headphones</span>
                                    </div>
                                    <h3 class="text-xl font-bold text-dark-sepia-ink mb-1">Tune to Title</h3>
                                    <p class="text-text-charcoal/60 text-sm">Listen to a melody and identify its traditional name.</p>
                                </button>

                                <button
                                    onClick={() => startNewGame('title-to-tune')}
                                    class="group relative bg-surface-sepia p-6 rounded-2xl border-2 border-accent-sepia/20 hover:border-primary transition-all text-left shadow-sm hover:shadow-xl active:scale-[0.98]"
                                >
                                    <div class="size-14 rounded-xl bg-accent-sepia/20 text-accent-sepia flex items-center justify-center mb-4 group-hover:bg-accent-sepia group-hover:text-white transition-colors">
                                        <span class="material-symbols-outlined text-3xl">menu_book</span>
                                    </div>
                                    <h3 class="text-xl font-bold text-dark-sepia-ink mb-1">Title to Tune</h3>
                                    <p class="text-text-charcoal/60 text-sm">Given a name, pick the correct melody from audio choices.</p>
                                </button>
                            </div>

                            <HistoryList />
                        </div>
                    </Match>

                    <Match when={gameState() === 'ready'}>
                        <div class="flex flex-col items-center justify-center min-h-[400px] gap-8">
                            <div class={`size-24 rounded-full bg-primary/20 text-primary flex items-center justify-center ${isStarting() ? 'animate-ping duration-1000' : 'animate-pulse'}`}>
                                <span class="material-symbols-outlined text-6xl">graphic_eq</span>
                            </div>
                            <div class="text-center">
                                <Show when={!isStarting()} fallback={<h2 class="text-4xl font-black text-primary animate-bounce">GET READY...</h2>}>
                                    <h2 class="text-3xl font-black text-dark-sepia-ink mb-2">Ready?</h2>
                                    <p class="text-text-charcoal/60">Click start to enable audio.</p>
                                </Show>
                            </div>
                            <Show when={!isStarting()}>
                                <button
                                    onClick={startGame}
                                    class="bg-primary text-dark-sepia-ink text-xl font-bold py-4 px-12 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all"
                                >
                                    START GAME
                                </button>
                            </Show>
                        </div>
                    </Match>

                    <Match when={gameState() === 'playing' || gameState() === 'answered'}>
                        <Switch>
                            <Match when={gameMode() === 'tune-to-title'}>
                                <GameModeTuneToTitle />
                            </Match>
                            <Match when={gameMode() === 'title-to-tune'}>
                                <GameModeTitleToTune />
                            </Match>
                        </Switch>
                    </Match>

                    <Match when={gameState() === 'summary'}>
                        <GameSummary />
                    </Match>
                </Switch>
            </main>
        </div>
    );
}

export default App;
