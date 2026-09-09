// Use the library's official in-memory mock for AsyncStorage in tests, so
// `src/storage` can be unit-tested without a real device/simulator.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
