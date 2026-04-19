import type { Page } from "@playwright/test";

type SignupUser = {
  name: string;
  email: string;
  password: string;
};

export class SignupPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto("/signup");
  }

  async signup(user: SignupUser) {
    await this.page.getByLabel("Name").fill(user.name);
    await this.page.getByLabel("Email").fill(user.email);
    await this.page.getByLabel("Password").fill(user.password);
    await this.page.getByRole("button", { name: "Signup" }).click();
  }
}
