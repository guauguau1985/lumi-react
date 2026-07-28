// src/app/AppShell.tsx
import { useState, type PropsWithChildren } from "react";
import { MoodProvider } from "@/state/mood";
import { ProgressProvider } from "@/state/progress";
import { ConsentModal } from "@/shared/components/ui/ConsentModal";

export function AppProviders({ children }: PropsWithChildren) {
  const [showConsent, setShowConsent] = useState<boolean>(
    () => localStorage.getItem("lumi_perfil_habilitado") === null
  );

  return (
    <ProgressProvider>
      <MoodProvider>
        {children}
        {showConsent && (
          <ConsentModal onClose={() => setShowConsent(false)} />
        )}
      </MoodProvider>
    </ProgressProvider>
  );
}

export default AppProviders;
