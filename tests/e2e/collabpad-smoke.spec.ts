import { expect, test } from "@playwright/test";
import { DashboardPage } from "./pages/dashboard.page";
import { DocumentPage } from "./pages/document.page";
import { SignupPage } from "./pages/signup.page";
import { TestUsers } from "./support/test-users";

test("user can sign up, create a document, and edit in realtime", async ({
  page
}) => {
  const user = TestUsers.create();
  const documentTitle = `Playwright smoke ${Date.now()}`;
  const editorText = `Smoke write ${Date.now()}`;

  const signupPage = new SignupPage(page);
  const dashboardPage = new DashboardPage(page);
  const documentPage = new DocumentPage(page);

  await signupPage.goto();
  await signupPage.signup(user);

  await dashboardPage.waitForLoaded();
  await dashboardPage.createDocument(documentTitle);

  await expect(page).toHaveURL(/\/documents\/[a-z0-9]+$/i);

  await documentPage.waitForLoaded();
  await expect(documentPage.titleInput).toHaveValue(documentTitle);
  await documentPage.waitForRealtimeReady();

  await documentPage.typeInEditor(editorText);
  await documentPage.expectEditorText(editorText);
});
