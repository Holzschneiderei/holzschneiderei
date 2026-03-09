import { createContext, useContext } from "react";
import type {
  BergDisplay, 
  CategoryVisibility, Constraints, DimConfig, FlatItem, 
  FormState, Limits, OptionalStep, Pricing,Product,Showroom,Texts, 
} from "../types/config";

export interface WizardContextValue {
  form: FormState;
  set: <K extends keyof FormState>(key: K, val: FormState[K]) => void;
  setFieldError: (key: keyof FormState, msg: string) => void;
  errors: Partial<Record<keyof FormState, string | boolean>>;
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
