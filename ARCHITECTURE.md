# System Architecture: WebView + Native Wrapper Casual Game

This document outlines the architecture for a casual puzzle game built using Phaser.js (Web) and Flutter (Mobile App Wrapper).

## 1. High-Level Architecture

The system follows a **Hybrid App Architecture**. The core game logic resides in a web application (HTML5/JS), while the mobile app serves as a native container providing access to device features (AdMob, IAP, etc.).

```mermaid
graph TD
    User[User] -->|Interacts| MobileApp[Mobile App (Flutter)]
    MobileApp -->|Loads| WebView[WebView (Local HTML/JS)]
    WebView -->|Runs| PhaserGame[Phaser.js Game Engine]

    subgraph "Native Side (Flutter)"
        MobileApp
        AdManager[Ad Manager (AdMob)]
        IAPManager[IAP Manager]
        BridgeManager[Bridge Manager]
    end

    subgraph "Web Side (WebView)"
        PhaserGame
        LevelManager[Level & Progression]
        WebBridge[JS Bridge Interface]
    end

    PhaserGame -->|Events (Level End, Buy Item)| WebBridge
    WebBridge -->|JSON Message| BridgeManager
    BridgeManager -->|Trigger| AdManager
    BridgeManager -->|Trigger| IAPManager

    AdManager -->|Callback (Ad Watched)| BridgeManager
    IAPManager -->|Callback (Purchase Success)| BridgeManager
    BridgeManager -->|Execute JS| WebBridge
    WebBridge -->|Update State| PhaserGame
```

## 2. File & Folder Structure

### Root Directory
*   `ARCHITECTURE.md`: This architecture document.
*   `GUIDE.md`: Comprehensive guide for ads, IAP, and deployment.
*   `web-game/`: Contains the HTML5 game source code.
*   `mobile-app/`: Contains the Flutter mobile application source code.

### Web Game (`web-game/`)
*   `index.html`: Entry point. Loads Phaser and game scripts.
*   `assets/`: Images, audio, and JSON data.
*   `js/`:
    *   `game.js`: Main game loop, scenes, and drag-and-drop logic.
    *   `level-manager.js`: Handles level generation, difficulty adjustment, and persistence (localStorage).
    *   `bridge.js`: Handles communication with the Flutter app.

### Mobile App (`mobile-app/`)
*   `lib/`:
    *   `main.dart`: App entry point.
    *   `webview_screen.dart`: Configures the WebView and loads `index.html` from assets.
    *   `bridge_manager.dart`: Parses incoming messages from JS and routes them.
    *   `ad_manager.dart`: Wrapper for AdMob (Rewarded & Interstitial).
    *   `iap_manager.dart`: Wrapper for In-App Purchases.
*   `assets/`: (Copy of `web-game` contents will be placed here during build).

## 3. Communication Bridge (WebView <-> Native)

Communication happens via an asynchronous message passing system.

### Web to Native
JavaScript calls a function injected by Flutter (e.g., `Bridge.postMessage`).
**Format:** JSON string.
```json
{
  "action": "show_rewarded_ad",
  "payload": {
    "placementId": "level_complete_2x"
  }
}
```

### Native to Web
Flutter evaluates JavaScript in the WebView context.
**Format:** JS Function call.
```javascript
window.handleNativeMessage({
  "event": "ad_reward_earned",
  "payload": {
    "amount": 50,
    "currency": "coins"
  }
});
```

## 4. Key Components

### A. Level Progression & Difficulty (Hidden)
*   **Logic**: Located in `level-manager.js`.
*   **Mechanism**: Tracks "fail count" and "time taken" per level.
*   **Adjustment**: If player fails 3 times, slightly increase time limit or remove one sorting element in the next attempt. This is internal and never shown to the user.

### B. Offline Caching
*   **Strategy**: The game is "Offline-First".
*   **Implementation**: All game assets (images, js, html) are bundled inside the APK/IPA in the `assets/` folder. The WebView loads `file:///android_asset/...` or a local server. No network request is needed to start the game.

### C. Ads & IAP
*   **Ads**: Controlled by `AdManager`.
    *   *Interstitial*: Shown between levels (configurable frequency).
    *   *Rewarded*: User opts-in to double coins or get a hint.
*   **IAP**: Controlled by `IAPManager`.
    *   *Remove Ads*: A non-consumable product. When purchased, `BridgeManager` sends a message to JS to disable ad triggers and `AdManager` stops serving ads.

## 5. Deployment Workflow
1.  Develop game in `web-game/`. Test in browser.
2.  Run build script (manual or CI) to copy `web-game/` content to `mobile-app/assets/www/`.
3.  Build Flutter app (`flutter build apk`).
