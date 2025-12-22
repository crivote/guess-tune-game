import { Show, onMount, onCleanup, createSignal } from 'solid-js';
import { animate } from "motion";
import { useGameStore } from '../store/gameStore';

export default function FeedbackPopup(props) {
    // props: result { correct, points, name, type, key, ... }, onNext
    const { round, settings } = useGameStore();
    const [timeLeft, setTimeLeft] = createSignal(10);
    let timer;

    const isLastRound = () => round() === settings().roundsCount;

    onMount(() => {
        // Animation sequence using delays instead of timeline
        animate(".feedback-backdrop", { opacity: [0, 1] }, { duration: 0.3 });

        animate(
            ".feedback-popup",
            { transform: ["scale(0.8)", "scale(1)"], opacity: [0, 1] },
            { delay: 0.1, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" }
        );

        animate(
            ".feedback-icon",
            { transform: ["scale(0)", "scale(1)"] },
            { delay: 0.2, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" }
        );

        timer = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    clearInterval(timer);
                    props.onNext();
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
    });

    onCleanup(() => clearInterval(timer));

    return (
        <div class="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                class="feedback-backdrop opacity-0 absolute inset-0 bg-dark-sepia-ink/80 backdrop-blur-sm"
                onClick={() => props.onNext()}
            ></div>

            {/* Popup Content */}
            <div
                class={`feedback-popup opacity-0 relative w-full max-w-sm ${props.result.correct ? 'bg-dark-sepia-ink' : 'bg-[#4A1212]'} border border-accent-sepia/20 rounded-2xl shadow-2xl overflow-hidden transform p-8 flex flex-col items-center text-center`}
            >
                {/* Auto-next progress bar */}
                <div class="absolute top-0 left-0 w-full h-1 bg-white/10">
                    <div
                        class="h-full bg-primary transition-all duration-1000 ease-linear"
                        style={{ width: `${(timeLeft() / 10) * 100}%` }}
                    ></div>
                </div>

                {/* Decorative elements from mock */}
                <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div class="absolute top-10 left-10 size-3 bg-primary rounded-full opacity-40"></div>
                    <div class="absolute top-16 right-8 size-2 bg-accent-sepia rotate-45 opacity-50"></div>
                    <div class="absolute bottom-20 left-6 size-4 bg-primary/20 rounded-sm rotate-12"></div>
                </div>

                <div class="feedback-icon relative mb-4 z-10">
                    <div class={`absolute inset-0 ${props.result.correct ? 'bg-primary/20' : 'bg-red-500/10'} blur-xl rounded-full scale-150`}></div>
                    <span class={`material-symbols-outlined ${props.result.correct ? 'text-primary' : 'text-red-400'} text-7xl fill-current drop-shadow-md relative z-10`} style="font-variation-settings: 'FILL' 1;">
                        {props.result.correct ? 'star' : 'close'}
                    </span>
                </div>

                <h2 class="text-3xl font-bold text-background-parchment mb-1 relative z-10">
                    {props.result.correct ? 'Correct!' : 'Incorrect'}
                </h2>

                <p class={`${props.result.correct ? 'text-primary' : 'text-red-400'} font-bold text-xl mb-8 relative z-10`}>
                    {props.result.correct ? `+${props.result.points} Points` : `That's not the right tune.`}
                </p>

                <div class="w-full bg-white/5 border border-white/10 rounded-xl p-5 mb-8 relative z-10 backdrop-blur-sm text-left">
                    <p class="text-accent-sepia text-[10px] uppercase tracking-widest font-bold mb-2">
                        {props.result.correct ? 'You identified' : 'The correct tune was'}
                    </p>
                    <p class="text-xl font-bold text-background-parchment leading-tight">
                        {props.result.name}
                    </p>
                    <p class="text-white/40 text-sm mt-1 mb-3">
                        <span class="text-sm font-bold text-background-parchment capitalize">{props.result.type}</span> {props.result.key ? `- Key: ${props.result.key}` : ''}
                    </p>

                    <div class="flex flex-wrap items-center justify-around gap-4 mt-2 pt-3 border-t border-white/10">
                        <div class="flex flex-col">
                            <span class="text-[9px] text-accent-sepia font-bold uppercase tracking-wider">Time</span>
                            <span class="text-sm font-medium text-background-parchment">{props.result.timeTaken}s</span>
                        </div>
                        <div class="w-px h-6 bg-white/10"></div>
                        <div class="flex flex-col">
                            <span class="text-[9px] text-accent-sepia font-bold uppercase tracking-wider">Speed</span>
                            <span class={`text-sm font-black ${props.result.speedBonus > 0 ? 'text-primary' : 'text-white/40'}`}>
                                +{props.result.speedBonus}%
                            </span>
                        </div>
                        <div class="w-px h-6 bg-white/10"></div>
                        <div class="flex flex-col">
                            <span class="text-[9px] text-accent-sepia font-bold uppercase tracking-wider">Streak</span>
                            <span class="text-sm font-black text-orange-400">+{props.result.bonus}</span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => props.onNext()}
                    class="w-full bg-primary hover:bg-primary/90 text-dark-sepia-ink font-bold text-lg py-4 rounded-xl shadow-[0_4px_14px_0_rgba(214,163,80,0.39)] transition-all hover:scale-[1.02] active:scale-[0.98] relative z-10 flex items-center justify-center gap-2"
                >
                    <span>{isLastRound() ? 'Finish Game' : 'Next Round'} ({timeLeft()}s)</span>
                    <span class="material-symbols-outlined">
                        {isLastRound() ? 'celebration' : (props.result.correct ? 'arrow_forward' : 'replay')}
                    </span>
                </button>
            </div>
        </div>
    );
}
