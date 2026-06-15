const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Expo Config Plugin to add <queries> to AndroidManifest.xml
 * This is required for Android 11+ to detect installed UPI apps.
 */
const withAndroidQueries = (config) => {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;

    // 1. Enable the "tools" namespace (required for overriding conflicts)
    if (!manifest.$['xmlns:tools']) {
      manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
    }

    const application = manifest.application[0];
    
    // 2. Fix the "Manifest Merger" crash by forcing Android to use 
    // the Firebase default white color instead of Expo's custom color.
    if (application['meta-data']) {
      const notificationColorMetadata = application['meta-data'].find(
        (m) => m.$['android:name'] === 'com.google.firebase.messaging.default_notification_color'
      );

      if (notificationColorMetadata) {
        // Force use of default white and add the replace attribute to solve the merger conflict
        notificationColorMetadata.$['android:resource'] = '@color/white';
        notificationColorMetadata.$['tools:replace'] = 'android:resource';
      }
    }

    // Ensure <queries> block exists
    if (!manifest.queries) {
      manifest.queries = [{}];
    }

    const queries = manifest.queries[0];

    // Add specific packages for UPI apps to support Android 11+ intent
    if (!queries.package) {
      queries.package = [];
    }

    const packagesToAdd = [
      'com.google.android.apps.nbu.paisa.user', // Google Pay
      'com.phonepe.app',                         // PhonePe
      'net.one97.paytm',                         // Paytm
      'in.org.npci.upiapp'                       // BHIM
    ];

    packagesToAdd.forEach((pkgName) => {
      const exists = queries.package.some((p) => p.$['android:name'] === pkgName);
      if (!exists) {
        queries.package.push({
          $: { 'android:name': pkgName },
        });
      }
    });

    // Add intent for UPI fallback
    if (!queries.intent) {
      queries.intent = [];
    }

    const upiIntent = {
      action: {
        $: { 'android:name': 'android.intent.action.VIEW' },
      },
      data: {
        $: { 'android:scheme': 'upi' },
      },
    };

    // Check if it already exists to avoid duplicates
    const exists = queries.intent.some(
      (i) =>
        i.action &&
        i.action[0].$['android:name'] === 'android.intent.action.VIEW' &&
        i.data &&
        i.data[0].$['android:scheme'] === 'upi'
    );

    if (!exists) {
      queries.intent.push(upiIntent);
    }

    return config;
  });
};

module.exports = withAndroidQueries;
