// jest.setup.cjs
if (typeof TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Only require jest-dom if it's available (for component tests)
try {
  require("@testing-library/jest-dom");
} catch (e) {
  // Skip if not available
}

// Globally mock next-auth/react to bypass ES modules loading issues in Jest
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
  signOut: jest.fn(),
  useSession: jest.fn(() => ({ data: null, status: 'unauthenticated' })),
  SessionProvider: ({ children }) => children,
}), { virtual: true });