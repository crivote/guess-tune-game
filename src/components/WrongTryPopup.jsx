import { onMount } from 'solid-js';
import { animate } from "motion";

export default function WrongTryPopup(props) {
    // props: onClose, triesLeft

    onMount(() => {
        animate(
            ".wrong-popup",
            { transform: ["scale(0.8) translateX(0)", "scale(1) translateX(-10px)", "scale(1) translateX(10px)", "scale(1) translateX(-10px)", "scale(1) translateX(0)"], opacity: [0, 1] },
            { duration: 0.5, easing: "cubic-bezier(0.36, 0, 0.66, -0.56)" } // Shake-like bezier if possible or just standard
        );
    });

    return (
        <div class="fixed inset-0 z-[110] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                class="absolute inset-0 bg-dark-sepia-ink/90 backdrop-blur-sm transition-opacity"
                onClick={props.onClose}
            ></div>

            {/* Popup Content */}
            <div
                class="wrong-popup opacity-0 relative w-full max-w-sm bg-[#4A1212] border-2 border-red-500/30 rounded-2xl shadow-2xl overflow-hidden p-8 flex flex-col items-center text-center"
            >
                <div class="absolute top-0 left-0 w-full h-1 bg-red-500/20"></div>

                <div class="relative mb-6">
                    <div class="absolute inset-0 bg-red-500/20 blur-2xl rounded-full scale-150"></div>
                    <span class="material-symbols-outlined text-red-400 text-8xl fill-current drop-shadow-md relative z-10" style="font-variation-settings: 'FILL' 1;">
                        warning
                    </span>
                </div>

                <h2 class="text-3xl font-black text-background-parchment mb-2 relative z-10">
                    Not Quite!
                </h2>

                <p class="text-red-200/80 font-medium text-lg mb-8 relative z-10">
                    That's not the right tune. You have <span class="text-red-400 font-black">{props.triesLeft}</span> {props.triesLeft === 1 ? 'try' : 'tries'} remaining for this round.
                </p>

                <button
                    onClick={props.onClose}
                    class="w-full bg-background-parchment hover:bg-white text-[#4A1212] font-black text-xl py-4 rounded-xl shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] relative z-10 flex items-center justify-center gap-3"
                >
                    <span class="material-symbols-outlined">replay</span>
                    Try Again
                </button>
            </div>
        </div>
    );
}
