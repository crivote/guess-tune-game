import { onMount, Switch, Match } from 'solid-js';
import { useGameStore } from './store/gameStore';
import GameModeTuneToTitle from './components/GameModeTuneToTitle';
import GameModeTitleToTune from './components/GameModeTitleToTune';
import DifficultySelector from './components/DifficultySelector';
import HistoryList from './components/HistoryList';
import SettingsPopup from './components/SettingsPopup';
import LoginPopup from './components/LoginPopup';
import DataRecoveryPopup from './components/DataRecoveryPopup';
import GameSummary from './components/GameSummary';
import { createSignal, Show } from 'solid-js';

function App() {
    const { gameState, startNewGame, startGame, loadTunes, setGameState, gameMode, userName, backToMenu, isStarting, isLoggedIn, logout, hasSavedData, persistentLogin } = useGameStore();
    const [showSettings, setShowSettings] = createSignal(false);
    const [showLogin, setShowLogin] = createSignal(false);
    const [showRecovery, setShowRecovery] = createSignal(false);

    onMount(async () => {
        await loadTunes();
        // Show recovery popup if data exists, but we aren't auto-logged in 
        // and user hasn't specifically said "don't ask again" (persistentLogin === 'false')
        if (hasSavedData() && !isLoggedIn() && persistentLogin() !== 'false') {
            setShowRecovery(true);
        }
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
                        <div class="flex items-center gap-4">
                            <Show when={isLoggedIn()}>
                                <div class="flex items-center gap-2">
                                    <span class="text-xs font-bold text-accent-sepia/70">@{userName()}</span>
                                    <button
                                        onClick={logout}
                                        class="material-symbols-outlined text-accent-sepia hover:text-red-500 transition-colors cursor-pointer"
                                        title="Logout"
                                    >
                                        logout
                                    </button>
                                </div>
                            </Show>
                            <Show when={gameState() === 'playing' || gameState() === 'answered' || gameState() === 'summary'}>
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
                </div>
            </header>

            <main class="flex-grow p-4 md:p-6 lg:p-8 flex items-start justify-center">
                <Switch>
                    <Match when={gameState() === 'menu'}>
                        <div class="max-w-4xl w-full flex flex-col items-center py-6">
                            <div class="flex flex-col items-center text-center mb-10 max-w-2xl">
                                <h2 class="text-4xl font-black text-dark-sepia-ink mb-3 capitalize">
                                    {isLoggedIn() ? `Fáilte, ${userName()}!` : 'Welcome!'}
                                </h2>
                                <p class="text-lg text-text-charcoal/70 leading-relaxed font-medium">
                                    <strong class="text-dark-sepia-ink">TradTune Guesser</strong> is a challenge for your ears and your memory.
                                    Listen to the melodies retrieved from <a class="underline font-bold" href="https://thesession.org" target="_blank" rel="noopener noreferrer">thesession.org</a> <em>most popular</em> list and identify the tunes from the rich tradition of Irish music.
                                    <br />
                                    <br />
                                    Unlock more advanced levels, track your scores and show your skills!
                                </p>

                                <Show when={!isLoggedIn()}>
                                    <div class="mt-8 relative group">
                                        <button
                                            onClick={() => setShowLogin(true)}
                                            class="bg-primary hover:bg-primary/90 text-dark-sepia-ink px-8 py-3 rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95 shadow-md flex items-center gap-2"
                                        >
                                            <span class="material-symbols-outlined">login</span>
                                            Login to Save Progress
                                        </button>

                                        <div class="absolute top-full mt-3 left-1/2 -translate-x-1/2 w-64 p-3 bg-dark-sepia-ink text-white text-[11px] rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl border border-white/10">
                                            <p class="font-bold text-primary mb-1">Why login?</p>
                                            <ul class="space-y-1 text-white/80">
                                                <li>• Save your high scores</li>
                                                <li>• Unlock higher difficulty levels</li>
                                                <li>• Keep your session history</li>
                                            </ul>
                                            <div class="absolute -top-1 left-1/2 -translate-x-1/2 border-l-4 border-l-transparent border-r-4 border-r-transparent border-b-4 border-b-dark-sepia-ink"></div>
                                        </div>
                                    </div>
                                </Show>
                            </div>

                            <div class="text-center mb-6">
                                <h2 class="text-2xl font-black text-dark-sepia-ink mb-1">Select Level</h2>
                            </div>
                            <DifficultySelector onOpenSettings={() => setShowSettings(true)} />

                            <Show when={showSettings()}>
                                <SettingsPopup onClose={() => setShowSettings(false)} />
                            </Show>

                            <Show when={showLogin()}>
                                <LoginPopup onClose={() => setShowLogin(false)} />
                            </Show>

                            <Show when={showRecovery()}>
                                <DataRecoveryPopup onClose={() => setShowRecovery(false)} />
                            </Show>

                            <div class="text-center mb-6">
                                <h2 class="text-2xl font-black text-dark-sepia-ink mb-1">Choose a Game Mode</h2>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mb-12">
                                <button
                                    onClick={() => startNewGame('tune-to-title')}
                                    class="group relative bg-surface-sepia p-6 rounded-2xl border-2 border-accent-sepia/20 hover:border-primary transition-all duration-300 ease-out text-left shadow-sm hover:shadow-xl hover:scale-[1.03] active:scale-[0.98] hover-animate-tada"
                                >
                                    <div class="size-14 rounded-xl bg-primary/20 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-dark-sepia-ink transition-colors">
                                        <span class="material-symbols-outlined text-3xl">headphones</span>
                                    </div>
                                    <h3 class="text-xl font-bold text-dark-sepia-ink mb-1">Tune to Title</h3>
                                    <p class="text-text-charcoal/60 text-sm">Listen to a melody and identify its traditional name.</p>
                                </button>

                                <button
                                    onClick={() => startNewGame('title-to-tune')}
                                    class="group relative bg-surface-sepia p-6 rounded-2xl border-2 border-accent-sepia/20 hover:border-primary transition-all duration-300 ease-out text-left shadow-sm hover:shadow-xl hover:scale-[1.03] active:scale-[0.98] hover-animate-tada"
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

            <footer class="w-full border-t border-accent-sepia/20 bg-surface-sepia/50 backdrop-blur-sm py-6 mt-auto">
                <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="text-center text-sm text-text-charcoal/60">
                        <p class="flex items-center justify-center gap-1 flex-wrap">
                            Made with
                            <span class="text-red-500 inline-block animate-pulse">❤️</span>
                            by <span class="font-semibold text-dark-sepia-ink">Victor Gomez</span>
                        </p>
                        <p class="mt-2 text-xs text-text-charcoal/50">
                            With the help of{' '}
                            <a href="https://stitch.google.com" target="_blank" rel="noopener noreferrer" class="hover:text-primary transition-colors">Google Stitch</a>,{' '}
                            <a href="https://thesession.org" target="_blank" rel="noopener noreferrer" class="hover:text-primary transition-colors">TheSession.org</a>,{' '}
                            <a href="https://abcjs.net" target="_blank" rel="noopener noreferrer" class="hover:text-primary transition-colors">ABCjs</a>,{' '}
                            <a href="https://www.solidjs.com" target="_blank" rel="noopener noreferrer" class="hover:text-primary transition-colors">SolidJS</a>{' '}
                            and{' '}
                            <a href="https://tailwindcss.com" target="_blank" rel="noopener noreferrer" class="hover:text-primary transition-colors">Tailwind CSS</a>
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default App;
