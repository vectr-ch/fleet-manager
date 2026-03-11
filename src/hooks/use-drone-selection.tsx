"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface DroneSelectionContext {
  selectedDroneId: string | null;
  selectDrone: (id: string | null) => void;
}

const DroneSelectionCtx = createContext<DroneSelectionContext>({
  selectedDroneId: null,
  selectDrone: () => {},
});

export function DroneSelectionProvider({ children }: { children: ReactNode }) {
  const [selectedDroneId, setSelectedDroneId] = useState<string | null>("D-01");

  const selectDrone = useCallback((id: string | null) => {
    setSelectedDroneId(id);
  }, []);

  return (
    <DroneSelectionCtx.Provider value={{ selectedDroneId, selectDrone }}>
      {children}
    </DroneSelectionCtx.Provider>
  );
}

export function useDroneSelection() {
  return useContext(DroneSelectionCtx);
}
