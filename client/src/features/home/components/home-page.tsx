import { LinkButton } from "@/components/ui/link-button";
import { Panel } from "@/components/ui/panel";

export function HomePage() {
  return (
    <section className="page stack">
      <Panel className="stack">
        <p className="muted">Phase 1</p>
        <h1>Write together without merge conflicts.</h1>
        <p>
          Create a document, invite collaborators later, and edit live through
          Yjs-powered synchronization.
        </p>
        <div className="nav-links">
          <LinkButton href="/dashboard">Open dashboard</LinkButton>
          <LinkButton href="/signup" variant="secondary">
            Create account
          </LinkButton>
        </div>
      </Panel>
    </section>
  );
}
