import { createContext, useContext } from "react";
import type {
  FormState, Limits, Constraints, DimConfig, Pricing,
  BergDisplay, OptionalStep, FlatItem, Product,
  CategoryVisibility, Texts, Showroom,
} from "../types/config";

export interface WizardContextValue {
  form: FormState;
  set: (key: string, val: unknown) => void;
  setFieldError: (key: string, msg: string) => void;
  errors: Record<string, string>;
  limits: Limits;
  constr: Constraints;
  dimConfig: DimConfig;
  pricing: Pricing;
  toggleExtra: (val: string) => void;
  skippedSteps: OptionalStep[];
  activeHolzarten: FlatItem[];
  activeSchriftarten: FlatItem[];
  activeBerge: FlatItem[];
  bergDisplay: BergDisplay;
  activeOberflaechen: FlatItem[];
  activeExtras: FlatItem[];
  activeHakenMat: FlatItem[];
  activeDarstellungen: FlatItem[];
  activeProduct: Product | null;
  products: Product[];
  categoryVisibility: CategoryVisibility;
  fusionEnabled: boolean;
  isAdmin: boolean;
  texts: Texts;
  showroom: Showroom;
}

const WizardContext = createContext<WizardContextValue | null>(null);

export function WizardProvider({ value, children }: { value: WizardContextValue; children: React.ReactNode }) {
  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>;
}

export function useWizard(): WizardContextValue {
  const ctx = useContext(WizardContext);
  if (!ctx) {
    throw new Error("useWizard must be used within a <WizardProvider>");
  }
  return ctx;
}

export default WizardContext;
