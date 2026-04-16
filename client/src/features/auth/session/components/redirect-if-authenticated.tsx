"use client";

import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { Panel } from "@/components/ui/panel";
import { useCurrentUser } from "../api/use-current-user";

type RedirectIfAuthenticatedProps = {
  children: ReactNode;
};

export function RedirectIfAuthenticated({
  children
}: RedirectIfAuthenticatedProps) {
  const router = useRouter();
  const currentUser = useCurrentUser();

  useEffect(() => {
    if (currentUser.data) {
      router.replace("/dashboard");
    }
  }, [currentUser.data, router]);

  if (currentUser.data) {
    return (
      <section className="page">
        <Panel>
          <p className="muted">Opening dashboard...</p>
        </Panel>
      </section>
    );
  }

  if (currentUser.isLoading) {
    return (
      <section className="page">
        <Panel>
          <p className="muted">Checking session...</p>
        </Panel>
      </section>
    );
  }

  return <>{children}</>;
}
