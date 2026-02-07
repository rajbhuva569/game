// Mock implementation of Google Mobile Ads
// In a real project, import 'package:google_mobile_ads/google_mobile_ads.dart';

class AdManager {
  bool _adsEnabled = true;

  void disableAds() {
    _adsEnabled = false;
    print("Ads disabled by IAP.");
  }

  void showInterstitialAd(Function onClosed) {
    if (!_adsEnabled) {
      onClosed();
      return;
    }

    print("Showing Interstitial Ad...");
    // Mock ad display delay
    Future.delayed(Duration(seconds: 2), () {
      print("Interstitial Ad Closed");
      onClosed();
    });
  }

  void showRewardedAd(Function(RewardItem) onReward) {
    print("Showing Rewarded Ad...");
    // Mock ad completion
    Future.delayed(Duration(seconds: 5), () {
      print("User watched ad. Granting reward.");
      onReward(RewardItem(amount: 50, type: 'coins'));
    });
  }
}

class RewardItem {
  final int amount;
  final String type;

  RewardItem({required this.amount, required this.type});
}
