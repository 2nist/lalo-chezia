/**
 * AppCombined — LALO Music Interface Template (Modular)
 *
 * Composition-only entrypoint:
 * - State: ./template/store
 * - UI shell + placeholders: ./template/ui
 * - Tokens/helpers: ./template/constants
 * - Export adapters: ./template/exporters
 */

import React from "react";
import { StoreProvider } from "./template/store";
import { AppShell } from "./template/ui";

export default function AppCombined() {
  return (
    <StoreProvider>
      <AppShell />
    </StoreProvider>
  );
}
