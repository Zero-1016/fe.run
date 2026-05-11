"use client";

import { Toaster } from "react-hot-toast";

const DEFAULT_TOAST_DURATION_MS = 5000;

export function AppToaster() {
  return (
    <Toaster
      position="top-center"
      gutter={10}
      toastOptions={{
        duration: DEFAULT_TOAST_DURATION_MS,
      }}
      containerClassName="pointer-events-none"
    />
  );
}
