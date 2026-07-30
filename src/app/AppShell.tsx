// src/app/AppShell.tsx
import { type PropsWithChildren } from "react";
import { MoodProvider } from "@/state/mood";
import { ProgressProvider } from "@/state/progress";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ProgressProvider>
      <MoodProvider>
        {children}
      </MoodProvider>
    </ProgressProvider>
  );
}

export default AppProviders;
