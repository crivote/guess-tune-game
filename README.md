# 🎻 TradTune Guesser

A dynamic music trivia game for traditional folk music enthusiasts. Test your knowledge of jigs, reels, polkas, and various traditional tunes using real data and dynamic audio rendering.

## 🎮 Game Modes

The game features two distinct ways to play, testing both your ears and your memory:

### 1. Tune-to-Title
*   **The Challenge**: Hear a mystery tune played via synthesized ABC notation.
*   **Your Goal**: Identify the correct name of the tune from a set of options.
*   **Visuals**: The tune's metadata (key, rhythm) is hidden until you answer to keep you guessing.

### 2. Title-to-Tune
*   **The Challenge**: You are given a tune title.
*   **Your Goal**: Listen to several short audio clips and select the one that matches the given title.
*   **Visuals**: High-fidelity ABC notation rendering helps visual musicians identify the music.

---

## 📈 Difficulty & Progression

TradTune Guesser features a sequential unlocking system. You must prove your mastery at each level to progress to more challenging tiers.

| Level | Options | Rounds | Time Limit | Penalty | Requirements |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Beginner** | 3 | 10 | ♾️ | 0 | Starting Level |
| **Basic** | 4 | 20 | 60s | -10 pts | 1,800 Total Pts |
| **Medium** | 5 | 30 | 40s | -25 pts | 6,300 Total Pts |
| **Hard** | 6 | 40 | 30s | -50 pts | 21,600 Total Pts |

*   **Cumulative Mastery**: Unlocking isn't just about one lucky game. It's based on the sum of your **Top 5 Scores** per mode, rewarding consistent performance.
*   **Custom Mode**: Configure your own rules, including tune pools, number of rounds, and time limits.

---

## 🏆 Scoring Mechanics

Points are awarded based on two main factors:
1.  **Speed**: The faster you identify the tune, the higher your bonus points.
2.  **Accuracy**: Correct answers maintain your **Streak**, which acts as a multiplier for subsequent round points.
3.  **Risk**: In higher difficulties, wrong answers will deduct points from your current score.

---

## 🛠️ Technical Details

*   **Framework**: [SolidJS](https://www.solidjs.com/) for a high-performance, reactive UI.
*   **Audio Engine**: [abcjs](https://www.abcjs.net/) for dynamic MIDI synthesis and sheet music rendering.
*   **Styling**: Vanilla CSS with modern aesthetics (Dark Sepia Ink & Parchment theme).
*   **Animations**: Hand-crafted CSS keyframes and [Animate.css](https://animate.style/) for tactile feedback.
*   **Persistence**: Secure local storage for high scores, user progress, and settings.

---

## 📜 Credits & Data

All tune data (ABC notation, rhythm types, and keys) is sourced from the incredible community at **[TheSession.org](https://thesession.org)**.

---

## 🚀 Getting Started

1.  Clone the repository.
2.  Run `npm install` to install dependencies.
3.  Run `npm run dev` to start the local development server.
4.  Open your browser and start guessing!

---

*Enjoy the session!* 🍻
