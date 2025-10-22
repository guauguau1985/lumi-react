// src/app/AppShell.tsx
import { PropsWithChildren } from "react";
import { MoodProvider } from "@/state/mood";
import { ProgressProvider } from "@/state/progress";
import { GamificationProvider } from "@/state/progress"; // si está aquí, ajusta el import real

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ProgressProvider>
      <MoodProvider>
        <GamificationProvider>
          {children}
        </GamificationProvider>
      </MoodProvider>
    </ProgressProvider>
  );
}

export default AppProviders;
