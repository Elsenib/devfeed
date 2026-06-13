const fs = require('fs');
const path = require('path');

const files = [
  'node_modules/expo-web-browser/android/src/main/AndroidManifest.xml',
  'node_modules/@react-native-async-storage/async-storage/android/src/main/AndroidManifest.xml',
  'node_modules/react-native-safe-area-context/android/src/main/AndroidManifest.xml',
  'node_modules/react-native-screens/android/src/main/AndroidManifest.xml'
];

files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/\s+package="[^"]*"/g, '');
    fs.writeFileSync(filePath, content);
    console.log(`Fixed: ${file}`);
  }
});