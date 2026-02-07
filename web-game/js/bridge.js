/**
 * Bridge.js
 * Handles communication between the Phaser game (WebView) and the Native App (Flutter/Android).
 */

const Bridge = {
    // Check if we are running inside the app
    isNative: function() {
        // Flutter's webview_flutter injects a JavascriptChannel named 'NativeBridge'
        return window.NativeBridge && typeof window.NativeBridge.postMessage === 'function';
    },

    /**
     * Send a message to the native app.
     * @param {string} action - The action name (e.g., 'show_ad', 'buy_iap').
     * @param {object} payload - Data to send with the action.
     */
    send: function(action, payload = {}) {
        const message = JSON.stringify({ action: action, payload: payload });
        console.log(`[Bridge] Sending to Native: ${message}`);

        if (this.isNative()) {
            window.NativeBridge.postMessage(message);
        } else {
            console.warn("[Bridge] Native interface not found. Running in browser mode.");
            // Mock response for testing in browser
            this.mockNativeResponse(action, payload);
        }
    },

    /**
     * Register a callback for when the native app sends data back.
     * @param {string} eventName - The event to listen for.
     * @param {function} callback - The function to call.
     */
    on: function(eventName, callback) {
        if (!window.bridgeListeners) {
            window.bridgeListeners = {};
        }
        if (!window.bridgeListeners[eventName]) {
            window.bridgeListeners[eventName] = [];
        }
        window.bridgeListeners[eventName].push(callback);
    },

    /**
     * Mock responses for browser testing.
     */
    mockNativeResponse: function(action, payload) {
        setTimeout(() => {
            switch(action) {
                case 'show_rewarded_ad':
                    console.log("[Mock Native] Ad watched! Granting reward...");
                    this.handleNativeMessage(JSON.stringify({ event: 'ad_rewarded', payload: { type: 'coins', amount: 50 } }));
                    break;
                case 'buy_remove_ads':
                    console.log("[Mock Native] Purchase successful!");
                    this.handleNativeMessage(JSON.stringify({ event: 'purchase_success', payload: { productId: 'remove_ads' } }));
                    break;
                case 'show_interstitial_ad':
                    console.log("[Mock Native] Interstitial closed.");
                    this.handleNativeMessage(JSON.stringify({ event: 'interstitial_closed', payload: {} }));
                    break;
            }
        }, 1000);
    },

    /**
     * Called by Native App to send data to JS.
     * Ensure this function is globally accessible.
     */
    handleNativeMessage: function(jsonString) {
        console.log(`[Bridge] Received from Native: ${jsonString}`);
        try {
            const data = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
            const eventName = data.event;
            const payload = data.payload;

            if (window.bridgeListeners && window.bridgeListeners[eventName]) {
                window.bridgeListeners[eventName].forEach(callback => callback(payload));
            }
        } catch (e) {
            console.error("[Bridge] Error parsing native message:", e);
        }
    }
};

// Expose handleNativeMessage globally so native code can call it
window.handleNativeMessage = Bridge.handleNativeMessage.bind(Bridge);
