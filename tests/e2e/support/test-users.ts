export class TestUsers {
  static create() {
    const stamp = `${Date.now()}-${Math.round(Math.random() * 1000)}`;

    return {
      name: `Playwright User ${stamp}`,
      email: `playwright-${stamp}@example.com`,
      password: `Playwright-${stamp}`
    };
  }
}
