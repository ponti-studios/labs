import { AppRegistry } from 'react-native';
import App from './App';

// Register the app
AppRegistry.registerComponent('MedicationPenCalculator', () => App);

// Run the app
AppRegistry.runApplication('MedicationPenCalculator', {
  rootTag: document.getElementById('root'),
});
