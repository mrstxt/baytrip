import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { TOURS as DEFAULT_TOURS, DOMESTIC_TOURS as DEFAULT_DOMESTIC_TOURS, type Tour, type DomesticTour } from "./data";

const STORAGE_KEY_TOURS = "baytrip_tours";
const STORAGE_KEY_DOMESTIC = "baytrip_domestic_tours";

function loadTours(): Tour[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TOURS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_TOURS;
}

function loadDomestic(): DomesticTour[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DOMESTIC);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_DOMESTIC_TOURS;
}

type ToursState = {
  tours: Tour[];
  domesticTours: DomesticTour[];
  setTours: (t: Tour[]) => void;
  setDomesticTours: (t: DomesticTour[]) => void;
  addTour: (t: Tour) => void;
  updateTour: (id: string, t: Partial<Tour>) => void;
  deleteTour: (id: string) => void;
  addDomesticTour: (t: DomesticTour) => void;
  updateDomesticTour: (id: string, t: Partial<DomesticTour>) => void;
  deleteDomesticTour: (id: string) => void;
  resetAll: () => void;
};

const Ctx = createContext<ToursState | null>(null);

export function ToursProvider({ children }: { children: ReactNode }) {
  const [tours, setToursState] = useState<Tour[]>(loadTours);
  const [domesticTours, setDomesticState] = useState<DomesticTour[]>(loadDomestic);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TOURS, JSON.stringify(tours));
  }, [tours]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DOMESTIC, JSON.stringify(domesticTours));
  }, [domesticTours]);

  const setTours = useCallback((t: Tour[]) => setToursState(t), []);
  const setDomesticTours = useCallback((t: DomesticTour[]) => setDomesticState(t), []);

  const addTour = useCallback((t: Tour) => setToursState((prev) => [...prev, t]), []);
  const updateTour = useCallback(
    (id: string, patch: Partial<Tour>) =>
      setToursState((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t))),
    []
  );
  const deleteTour = useCallback((id: string) => setToursState((prev) => prev.filter((t) => t.id !== id)), []);

  const addDomesticTour = useCallback((t: DomesticTour) => setDomesticState((prev) => [...prev, t]), []);
  const updateDomesticTour = useCallback(
    (id: string, patch: Partial<DomesticTour>) =>
      setDomesticState((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t))),
    []
  );
  const deleteDomesticTour = useCallback(
    (id: string) => setDomesticState((prev) => prev.filter((t) => t.id !== id)),
    []
  );

  const resetAll = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY_TOURS);
    localStorage.removeItem(STORAGE_KEY_DOMESTIC);
    setToursState(DEFAULT_TOURS);
    setDomesticState(DEFAULT_DOMESTIC_TOURS);
  }, []);

  return (
    <Ctx.Provider
      value={{
        tours,
        domesticTours,
        setTours,
        setDomesticTours,
        addTour,
        updateTour,
        deleteTour,
        addDomesticTour,
        updateDomesticTour,
        deleteDomesticTour,
        resetAll,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useTours() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTours must be used inside ToursProvider");
  return ctx;
}
