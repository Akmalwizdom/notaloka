import { PaymentMethod } from "@prisma/client";

/**
 * Frontend payment method options (user-facing)
 */
export type FrontendPaymentMethod = "CASH" | "CARD" | "QRIS";

/**
 * Map frontend payment methods to backend Prisma enum values
 */
export function mapToBackendPaymentMethod(frontendMethod: FrontendPaymentMethod): PaymentMethod {
  const mapping: Record<FrontendPaymentMethod, PaymentMethod> = {
    "CASH": PaymentMethod.CASH,
    "CARD": PaymentMethod.VA, // Map Card to VA (Virtual Account) as fallback
    "QRIS": PaymentMethod.QRIS_STATIC,
  };

  return mapping[frontendMethod];
}

/**
 * Map backend payment method enum to frontend display format
 */
export function mapToFrontendDisplay(backendMethod: string): string {
  const mapping: Record<string, string> = {
    "CASH": "Cash",
    "QRIS_STATIC": "QRIS",
    "QRIS_DYNAMIC": "QRIS",
    "VA": "Card/VA",
  };

  return mapping[backendMethod] || backendMethod;
}
