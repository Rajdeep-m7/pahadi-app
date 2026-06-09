const { withProjectBuildGradle } = require('@expo/config-plugins');

/**
 * Expo Config Plugin to add Razorpay Maven repository to the project's build.gradle
 */
const withRazorpay = (config) => {
  return withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      config.modResults.contents = addMavenRepository(config.modResults.contents);
    }
    return config;
  });
};

function addMavenRepository(src) {
  // The official Razorpay Android Maven repository
  const razorpayRepo = "maven { url 'https://sdk.razorpay.com/android/maven' }";
  
  if (src.includes(razorpayRepo)) {
    return src;
  }

  // Inject the repository into the allprojects block
  // This is required so the native 'react-native-razorpay' module can find its dependency
  const searchPattern = /allprojects\s*\{\s*repositories\s*\{/;
  const replacement = `allprojects {
    repositories {
        ${razorpayRepo}`;
        
  return src.replace(searchPattern, replacement);
}

module.exports = withRazorpay;
