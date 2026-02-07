# Comprehensive Guide: Casual WebView Puzzle Game

This guide covers advanced topics for building, monetizing, and deploying your casual puzzle game.

## 1. Ad Placement Strategy (Maximizing Revenue)

The goal is to balance revenue with user retention.

### A. Interstitial Ads (High Revenue)
*   **Trigger**: Between levels (Level End Screen -> Next Level).
*   **Frequency**: Every 2-3 levels.
    *   *Dynamic*: If level duration < 30s, show every 4 levels. If > 60s, show every 2 levels.
*   **Implementation**: Preload the ad during the level. Show immediately when "Next Level" is tapped.

### B. Rewarded Video Ads (High Engagement)
*   **Triggers**:
    1.  **Second Chance**: If user fails a level, offer "Watch Ad to Continue" (extra time or moves).
    2.  **Daily Bonus**: "Watch Ad to Double Daily Reward".
    3.  **Hints**: "Watch Ad to Get a Hint" (highlight correct move).
    4.  **Shop**: "Watch Ad to Get 50 Coins".

### C. Banner Ads (Consistent Revenue)
*   **Placement**: Bottom of the screen during gameplay (optional).
*   **Note**: Often distracting in puzzle games. Recommended only for menus or non-gameplay screens.

## 2. In-App Purchase (IAP) Flow

### Product: "Remove Ads" (Non-Consumable)
1.  **User Action**: Tap "Remove Ads" button in Settings or Shop.
2.  **Bridge Call**: JS sends `buy_remove_ads` to Native.
3.  **Native**: `IAPManager` initiates purchase flow via StoreKit/Google Play Billing.
4.  **Success**:
    *   Native disables `AdManager`.
    *   Native sends `purchase_success` to JS.
    *   JS updates UI (hides "Remove Ads" button) and saves status to `localStorage`.
5.  **Restore**: Implement a "Restore Purchases" button that checks past purchases on app start.

## 3. Offline Caching Strategy

Since this is an "Offline-First" game, we do not rely on a service worker for the core game files. Instead, we bundle them.

### Strategy: Bundled Assets
*   **Android**: Place `web-game` content into `android/app/src/main/assets/www`.
*   **iOS**: Add `web-game` content to Xcode project as a folder reference (`www`).
*   **Flutter**: Add `assets/www/` to `pubspec.yaml`.

### Loading
*   WebView loads `file:///android_asset/www/index.html` (Android) or the local bundle path (iOS).
*   **No Network Required**: The game starts immediately without internet.

## 4. Performance Optimization for WebView

1.  **Hardware Acceleration**: Ensure `android:hardwareAccelerated="true"` is in `AndroidManifest.xml`.
2.  **Canvas Rendering**: Phaser uses WebGL by default. Ensure WebView supports WebGL (Modern WebViews do).
    *   *Fallback*: If WebGL fails, Phaser falls back to Canvas.
3.  **Asset Compression**:
    *   Use **Texture Atlases** (Packer) to reduce draw calls.
    *   Compress images (TinyPNG) and audio (MP3/OGG).
4.  **Memory Management**:
    *   Destroy Phaser scenes properly when not in use.
    *   Avoid large DOM manipulations; keep everything in Canvas.
5.  **Touch Latency**: Use `touch-action: none` in CSS to prevent browser zooming/scrolling delays.

## 5. Play Store & App Store Safety

To avoid rejection (especially for "WebView Spam" policies):

1.  **Native Functionality**: Ensure the app *feels* native. Use native navigation wrappers if possible, or high-quality transitions.
2.  **Offline Support**: Mandatory. If it breaks offline, it's flagged as a "wrapper of a website".
3.  **Deep Integration**: The two-way bridge (Ads, IAP) proves it's not just a URL wrapper.
4.  **Privacy Policy**: Must be accessible within the app (WebView link) and on the Store listing.
5.  **Target Audience**: If targeting "Kids", follow strict COPPA/GDPR rules (Age Gate, specific Ad constraints).

## 6. Common Mistakes to Avoid

1.  **Loading Remote URL**: DO NOT load `https://mygame.com`. It breaks offline and feels slow. Load local files.
2.  **Ignoring Safe Areas**: Notches and dynamic islands cut off UI.
    *   *Fix*: Use `viewport-fit=cover` in HTML meta tag and handle safe areas in Phaser resize logic.
3.  **Back Button Issues**: Android Back button should pause game or show exit dialog, not close the app instantly.
    *   *Fix*: Intercept `WillPopScope` in Flutter and send `pause_game` event to JS.
4.  **Audio Lag**: HTML5 Audio can be laggy.
    *   *Fix*: Use WebAudio API (Phaser does this automatically) and preload sounds.

## 7. Folder Structure for Deployment

When building the final app, your structure should look like this:

```
project/
  ├── mobile-app/
  │   ├── assets/
  │   │   └── www/          <-- COPY web-game contents HERE
  │   │       ├── index.html
  │   │       ├── js/
  │   │       └── assets/
  │   ├── lib/
  │   └── pubspec.yaml
  └── web-game/             <-- Source for game development
```
