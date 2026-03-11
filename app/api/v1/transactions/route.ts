import { wrapHandler, successResponse, AppError } from "@/lib/api-utils";
import { TransactionService } from "@/lib/services/transaction.service";
import { PaymentService } from "@/lib/services/payment.service";
import { CheckoutSchema } from "@/lib/validations/transaction.schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const POST = wrapHandler(async (req: Request) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new AppError("Unauthorized", 401, "UNAUTHORIZED");

  const body = await req.json();
  const validatedData = CheckoutSchema.parse(body);

  // 1. Create Transaction (Atomic stock decrement)
  const transaction = await TransactionService.checkout(session.user.id, validatedData);

  // 2. If Payment is not CASH, initialize Midtrans
  if (validatedData.paymentMethod !== "CASH") {
    const snapResult = await PaymentService.createSnapTransaction(
      transaction.id,
      Number(transaction.totalAmount),
      {
        name: session.user.name,
        email: session.user.email,
      }
    );

    return successResponse({
      transaction,
      payment: snapResult,
    }, 201);
  }

  return successResponse(transaction, 201);
});

export const GET = wrapHandler(async (req: Request) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new AppError("Unauthorized", 401, "UNAUTHORIZED");

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");
  const status = searchParams.get("status");
  const paymentMethod = searchParams.get("paymentMethod");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const filters: {
    query?: string;
    status?: string;
    paymentMethod?: string;
    from?: string;
    to?: string;
  } = {
    query: query || undefined,
    status: status && status !== "all" ? status : undefined,
    paymentMethod: paymentMethod && paymentMethod !== "all" ? paymentMethod : undefined,
    from: from || undefined,
    to: to || undefined,
  };

  const transactions = await TransactionService.getHistory(session.user.id, filters);
  return successResponse(transactions);
});
