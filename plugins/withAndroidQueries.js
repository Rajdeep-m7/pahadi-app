const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Expo Config Plugin to add <queries> to AndroidManifest.xml
 * This is required for Android 11+ to detect installed UPI apps.
 */
const withAndroidQueries = (config) => {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;

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
