import { createContext, useContext } from "react";

/**
 * WizardContext provides shared wizard state to all step and phase components,
 * eliminating deep prop drilling through PhaseWizard → StepRenderer → Step*.
 *
 * Provided values:
 * - form          — current form state object
 * - set           — (key, val) => void — set a form field and clear its error
 * - errors        — current validation errors object
 * - limits        — computed dimension/hook limits (from computeLimits)
 * - constr        — dimension constraints config
 * - dimConfig     — dimension input mode config (pills/combo/text)
 * - pricing       — pricing configuration
 * - toggleExtra   — (val) => void — toggle an extra option
 * - skippedSteps  — array of OPTIONAL_STEPS that are disabled
 * - activeHolzarten — enabled holzarten in flat format
 * - activeDarstellungen — enabled darstellungen in flat format
 * - activeProduct — currently selected product definition (or null)
 */
const WizardContext = createContext(null);

export function WizardProvider({ value, children }) {
  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>;
}

export function useWizard() {
  const ctx = useContext(WizardContext);
  if (!ctx) {
    throw new Error("useWizard must be used within a <WizardProvider>");
  }
  return ctx;
}

export default WizardContext;
