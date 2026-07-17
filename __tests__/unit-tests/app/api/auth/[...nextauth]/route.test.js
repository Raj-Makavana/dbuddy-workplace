/**
 * @jest-environment node
 */

const mockHandler = jest.fn();

jest.mock('@/lib/auth', () => ({
  handlers: {
    GET: mockHandler,
    POST: mockHandler,
  },
}));

describe('NextAuth API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should export handlers as GET and POST', () => {
    const { GET, POST } = require('@/app/api/auth/[...nextauth]/route');
    expect(GET).toBe(mockHandler);
    expect(POST).toBe(mockHandler);
  });
});
