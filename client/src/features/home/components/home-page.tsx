import { LinkButton } from "@/components/ui/link-button";
import { Panel } from "@/components/ui/panel";

export function HomePage() {
  return (
    <section className="page stack">
      <Panel className="stack home-panel">
        <div className="page-heading">
          <h1>Write together without merge conflicts.</h1>
          <p className="muted">
            Create a document, invite collaborators later, and edit live through
            Yjs-powered synchronization.
          </p>
        </div>
        <div className="nav-links hero-actions">
          <LinkButton href="/dashboard">Open dashboard</LinkButton>
          <LinkButton href="/signup" variant="secondary">
            Create account
          </LinkButton>
        </div>
        <div className="home-highlights">
          <div>
            <strong>Live editing</strong>
            <span className="muted">Changes sync across open sessions.</span>
          </div>
          <div>
            <strong>Presence</strong>
            <span className="muted">See who is active in the document.</span>
          </div>
          <div>
            <strong>Autosave</strong>
            <span className="muted">Reload and continue from the latest state.</span>
          </div>
        </div>
      </Panel>
    </section>
  );
}
