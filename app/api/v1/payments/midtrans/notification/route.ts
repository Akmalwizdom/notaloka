import { wrapHandler, successResponse, AppError } from "@/lib/api-utils";
import { TransactionService } from "@/lib/services/transaction.service";
import { PaymentService } from "@/lib/services/payment.service";
import { TransactionStatus } from "@prisma/client";

export const POST = wrapHandler(async (req: Request) => {
  const body = await req.json();

  // 1. Verify Midtrans Signature
  const isVerified = await PaymentService.verifyWebhookSignature(
    body.order_id,
    body.status_code,
    body.gross_amount,
    body.signature_key
  );

  if (!isVerified) {
    throw new AppError("Invalid signature", 401, "INVALID_SIGNATURE");
  }

  // 2. Map Midtrans status to TransactionStatus
  const transactionStatus = body.transaction_status;
  const fraudStatus = body.fraud_status;

  let newStatus: TransactionStatus | undefined;

  if (transactionStatus === "capture") {
    if (fraudStatus === "accept") newStatus = "PAID";
  } else if (transactionStatus === "settlement") {
    newStatus = "PAID";
  } else if (["cancel", "deny", "expire"].includes(transactionStatus)) {
    newStatus = "CANCELLED";
  } else if (transactionStatus === "pending") {
    newStatus = "PENDING";
  }

  // 3. Update Transaction in DB
  if (newStatus) {
    await TransactionService.updateStatus(body.order_id, newStatus, body.transaction_id);
  }

  return successResponse({ received: true });
});
