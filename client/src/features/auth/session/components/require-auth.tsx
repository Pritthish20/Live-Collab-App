"use client";

import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { Panel } from "@/components/ui/panel";
import { SessionStorage } from "@/utils/session";
import { useCurrentUser } from "../api/use-current-user";

type RequireAuthProps = {
  children: ReactNode;
};

export function RequireAuth({ children }: RequireAuthProps) {
  const router = useRouter();
  const [hasToken, setHasToken] = useState(false);
  const currentUser = useCurrentUser();

  useEffect(() => {
    const nextHasToken = SessionStorage.hasToken();
    setHasToken(nextHasToken);

    if (!nextHasToken) {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    if (currentUser.isError) {
      SessionStorage.clearToken();
      router.replace("/login");
    }
  }, [currentUser.isError, router]);

  if (!hasToken || currentUser.isLoading || currentUser.isError) {
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
