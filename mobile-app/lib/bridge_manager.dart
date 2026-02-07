import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'ad_manager.dart';
import 'iap_manager.dart';

class BridgeManager {
  final WebViewController controller;
  final AdManager adManager;
  final IAPManager iapManager;

  BridgeManager({
    required this.controller,
    required this.adManager,
    required this.iapManager,
  });

  void handleMessage(JavaScriptMessage message) {
    print("Received from JS: ${message.message}");
    try {
      final data = jsonDecode(message.message);
      final String action = data['action'];
      final Map<String, dynamic> payload = data['payload'] ?? {};

      switch (action) {
        case 'show_interstitial_ad':
          adManager.showInterstitialAd(() {
            _sendToJs('interstitial_closed', {});
          });
          break;

        case 'show_rewarded_ad':
          adManager.showRewardedAd((RewardItem reward) {
            _sendToJs('ad_rewarded', {
              'type': reward.type,
              'amount': reward.amount,
            });
          });
          break;

        case 'buy_remove_ads':
          iapManager.buyProduct('remove_ads', (success) {
            if (success) {
              _sendToJs('purchase_success', {'productId': 'remove_ads'});
              adManager.disableAds();
            } else {
              _sendToJs('purchase_failed', {'productId': 'remove_ads'});
            }
          });
          break;

        case 'game_loaded':
          print("Game loaded successfully!");
          break;

        default:
          print("Unknown action: $action");
      }
    } catch (e) {
      print("Error parsing message: $e");
    }
  }

  void _sendToJs(String event, Map<String, dynamic> payload) {
    final jsonString = jsonEncode({
      'event': event,
      'payload': payload,
    });
    // Call the global JS function handleNativeMessage
    controller.runJavaScript('window.handleNativeMessage($jsonString)');
  }
}
