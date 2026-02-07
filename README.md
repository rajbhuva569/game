# Casual Puzzle Game: WebView + Flutter Architecture

A hybrid mobile game architecture combining **Phaser.js** for gameplay and **Flutter** for native features (Ads, IAP).

## Project Structure

*   `web-game/`: The HTML5 game source code (Phaser 3).
*   `mobile-app/`: The Flutter application wrapper.
*   `ARCHITECTURE.md`: Detailed system design.
*   `GUIDE.md`: Deployment and monetization guide.

## How to Run

### 1. Run the Web Game (Development)

You can run the game in your browser to test gameplay mechanics.

#### Quick Start (Recommended)
Run the helper script from the project root:
```bash
./run_web_game.sh
```
Then open: [http://localhost:8000/web-game/index.html](http://localhost:8000/web-game/index.html)

#### Manual Start
1.  Navigate to the project root:
    ```bash
    cd /path/to/project
    ```
2.  Start a local HTTP server (Python):
    ```bash
    python3 -m http.server 8000
    ```
3.  Open your browser to:
    [http://localhost:8000/web-game/index.html](http://localhost:8000/web-game/index.html)

*Note: In the browser, native features (Ads, IAP) are mocked via the console.*

### 2. Run the Mobile App (Flutter)

To run the game on an Android emulator or device:

#### Step A: Prepare Assets
The mobile app loads the game from its local assets. You must copy the web game files into the Flutter project.

Run the helper script:
```bash
./setup_mobile_assets.sh
```
Or manually:
```bash
mkdir -p mobile-app/assets/www
cp -r web-game/* mobile-app/assets/www/
```

#### Step B: Configure Flutter
1.  Navigate to `mobile-app/`:
    ```bash
    cd mobile-app
    ```
2.  Initialize the project (if needed):
    ```bash
    flutter create . --platforms=android,ios
    ```
3.  Add dependencies to `pubspec.yaml`:
    ```yaml
    dependencies:
      flutter:
        sdk: flutter
      webview_flutter: ^4.0.0
      # Add google_mobile_ads, in_app_purchase later

    flutter:
      assets:
        - assets/www/
    ```
4.  Get packages:
    ```bash
    flutter pub get
    ```

#### Step C: Run
1.  Connect a device or start an emulator.
2.  Run the app:
    ```bash
    flutter run
    ```

## Development Workflow

1.  Edit game code in `web-game/`.
2.  Test in browser (`./run_web_game.sh`).
3.  When ready to test on device:
    -   Run `./setup_mobile_assets.sh`.
    -   Run `flutter run` (or Hot Restart if already running).
