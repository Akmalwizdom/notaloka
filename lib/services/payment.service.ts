import midtransClient from "midtrans-client";
import { AppError } from "../api-utils";

export class PaymentService {
  private static snap = new midtransClient.Snap({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
    serverKey: process.env.MIDTRANS_SERVER_KEY!,
    clientKey: process.env.MIDTRANS_CLIENT_KEY!,
  });

  static async createSnapTransaction(orderId: string, amount: number, customerDetails: { name: string, email: string }) {
    try {
      const parameter = {
        transaction_details: {
          order_id: orderId,
          gross_amount: amount,
        },
        customer_details: {
          first_name: customerDetails.name,
          email: customerDetails.email,
        },
        credit_card: {
          secure: true,
        },
      };

      const result = await this.snap.createTransaction(parameter);
      return result; // contains redirect_url and token
    } catch (error) {
      console.error("[Midtrans Error]:", error);
      throw new AppError("Failed to initialize payment gateway", 500, "PAYMENT_GATEWAY_ERROR");
    }
  }

  static async verifyWebhookSignature(orderId: string, statusCode: string, grossAmount: string, signatureKey: string) {
    // Logic to verify signature key from Midtrans notification
    // Signature = SHA512(order_id + status_code + gross_amount + server_key)
    const crypto = await import("crypto");
    const payload = orderId + statusCode + grossAmount + process.env.MIDTRANS_SERVER_KEY!;
    const expectedSignature = crypto.createHash("sha512").update(payload).digest("hex");
    
    return expectedSignature === signatureKey;
  }
}
