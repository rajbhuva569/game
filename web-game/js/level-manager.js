/**
 * Level Manager
 * Manages level progression, coins, and hints.
 * Also handles difficulty adjustment.
 */

class LevelManager {
    constructor() {
        this.currentLevel = 1;
        this.coins = 100;
        this.hints = 3;
        this.difficulty = 1; // 1 = Easy, 2 = Medium, 3 = Hard
        this.loadProgress();
    }

    loadProgress() {
        const savedData = localStorage.getItem('puzzle_game_save');
        if (savedData) {
            const data = JSON.parse(savedData);
            this.currentLevel = data.level || 1;
            this.coins = data.coins || 100;
            this.hints = data.hints || 3;
            this.difficulty = data.difficulty || 1;
        }
    }

    saveProgress() {
        const data = {
            level: this.currentLevel,
            coins: this.coins,
            hints: this.hints,
            difficulty: this.difficulty
        };
        localStorage.setItem('puzzle_game_save', JSON.stringify(data));
        // Also sync with native if needed (e.g. cloud save)
        if (typeof Bridge !== 'undefined') {
            Bridge.send('sync_progress', data);
        }
    }

    completeLevel(score) {
        this.currentLevel++;
        this.coins += 10; // Base reward
        this.saveProgress();
        console.log(`Level ${this.currentLevel - 1} completed!`);

        // Difficulty Adjustment (Hidden)
        // If user completes levels quickly, increase difficulty slightly
        // If user fails repeatedly (tracked elsewhere), decrease difficulty
    }

    failLevel() {
        // Decrease difficulty slightly if user fails multiple times on same level
        // This is a simplified example
        console.log("Level Failed. Adjusting difficulty...");
    }

    useHint() {
        if (this.hints > 0) {
            this.hints--;
            this.saveProgress();
            return true;
        }
        return false;
    }

    addCoins(amount) {
        this.coins += amount;
        this.saveProgress();
    }
}

// Global instance
window.levelManager = new LevelManager();
