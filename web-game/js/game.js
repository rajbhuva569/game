/**
 * game.js
 * Main Phaser game logic for the Casual Puzzle Game.
 */

// Global configuration
const config = {
    type: Phaser.AUTO,
    width: window.innerWidth, // Responsive width
    height: window.innerHeight, // Responsive height
    parent: 'game-container',
    backgroundColor: '#3498db',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let score = 0;
let levelText;
let timerText;
let timeRemaining = 60; // 60 seconds per level
let timerEvent;

function preload() {
    // In a real game, load images here.
    // this.load.image('block', 'assets/block.png');
    // this.load.image('slot', 'assets/slot.png');

    // Using generated graphics for this example to work without assets
}

function create() {
    // 1. Setup UI
    this.cameras.main.setBackgroundColor('#2c3e50'); // Dark blue background

    levelText = this.add.text(20, 20, 'Level: ' + window.levelManager.currentLevel, { fontSize: '24px', fill: '#fff' });
    timerText = this.add.text(config.width - 150, 20, 'Time: ' + timeRemaining, { fontSize: '24px', fill: '#e74c3c' });

    // 2. Create Game Objects (Drag and Drop)
    // Create drop zones (Slots)
    const slotZone = this.add.zone(config.width / 2, config.height - 150, 200, 200).setRectangleDropZone(200, 200);

    // Visualize the drop zone
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0xffff00);
    graphics.strokeRect(slotZone.x - slotZone.input.dropZone.width / 2, slotZone.y - slotZone.input.dropZone.height / 2, slotZone.input.dropZone.width, slotZone.input.dropZone.height);
    this.add.text(slotZone.x - 40, slotZone.y - 10, 'DROP HERE', { fontSize: '16px', fill: '#ffff00' });

    // Create draggable items
    const item = this.add.rectangle(config.width / 2, 150, 100, 100, 0xe67e22).setInteractive();
    this.input.setDraggable(item);

    this.add.text(item.x - 30, item.y - 10, 'DRAG ME', { fontSize: '16px', fill: '#fff' });

    // 3. Event Listeners
    this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
        gameObject.x = dragX;
        gameObject.y = dragY;
    });

    this.input.on('dragenter', function (pointer, gameObject, dropZone) {
        graphics.clear();
        graphics.lineStyle(2, 0x00ff00); // Green when hovering
        graphics.strokeRect(dropZone.x - dropZone.input.dropZone.width / 2, dropZone.y - dropZone.input.dropZone.height / 2, dropZone.input.dropZone.width, dropZone.input.dropZone.height);
    });

    this.input.on('dragleave', function (pointer, gameObject, dropZone) {
        graphics.clear();
        graphics.lineStyle(2, 0xffff00); // Yellow normally
        graphics.strokeRect(dropZone.x - dropZone.input.dropZone.width / 2, dropZone.y - dropZone.input.dropZone.height / 2, dropZone.input.dropZone.width, dropZone.input.dropZone.height);
    });

    this.input.on('drop', function (pointer, gameObject, dropZone) {
        gameObject.x = dropZone.x;
        gameObject.y = dropZone.y;
        gameObject.input.enabled = false; // Disable dragging once placed

        graphics.clear();
        graphics.lineStyle(2, 0x00ff00);
        graphics.strokeRect(dropZone.x - dropZone.input.dropZone.width / 2, dropZone.y - dropZone.input.dropZone.height / 2, dropZone.input.dropZone.width, dropZone.input.dropZone.height);

        completeLevel();
    });

    this.input.on('dragend', function (pointer, gameObject, dropped) {
        if (!dropped) {
            gameObject.x = gameObject.input.dragStartX;
            gameObject.y = gameObject.input.dragStartY;
        }
    });

    // 4. Timer
    timerEvent = this.time.addEvent({ delay: 1000, callback: onTimerTick, callbackScope: this, loop: true });

    // 5. Native Bridge Listeners
    if (window.Bridge) {
        window.Bridge.on('ad_rewarded', (payload) => {
            console.log("Reward received from Native: " + payload.amount);
            window.levelManager.addCoins(payload.amount);
            // Show some UI feedback
            this.add.text(config.width / 2, config.height / 2, `+${payload.amount} Coins!`, { fontSize: '32px', fill: '#f1c40f' }).setOrigin(0.5);
        });
    }
}

function update() {
    // Game loop logic if needed
}

function onTimerTick() {
    timeRemaining--;
    timerText.setText('Time: ' + timeRemaining);
    if (timeRemaining <= 0) {
        timerEvent.remove();
        gameOver();
    }
}

function completeLevel() {
    timerEvent.remove();

    // Call Level Manager
    window.levelManager.completeLevel();

    // Show Interstitial Ad via Bridge
    if (window.Bridge) {
        window.Bridge.send('show_interstitial_ad', { placement: 'level_complete' });
    }

    // Restart level (simulating progression)
    setTimeout(() => {
        // Reload scene for next level (in real game, load new data)
        timeRemaining = 60;
        game.scene.scenes[0].scene.restart();
    }, 2000);
}

function gameOver() {
    console.log("Game Over");
    // Show 'Watch Ad to Continue' button?
    // In this simple example, just restart
    game.scene.scenes[0].scene.restart();
    timeRemaining = 60;
}
