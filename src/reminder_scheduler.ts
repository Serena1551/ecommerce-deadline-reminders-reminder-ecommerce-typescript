import { z } from "zod";
import { infrai } from "./infrai.js";

export const orderReminderRequest = z.object({
  orderId: z.string().min(1),
  customerEmail: z.string().email(),
  fulfillmentDeadline: z.coerce.date(),
  receiptUrl: z.string().url()
});

export type OrderReminder = z.infer<typeof orderReminderRequest>;

export function reminderCron(order: OrderReminder): { cron_expr: string; task: string } {
  const minute = order.fulfillmentDeadline.getUTCMinutes();
  const hour = order.fulfillmentDeadline.getUTCHours();
  const day = order.fulfillmentDeadline.getUTCDate();
  const month = order.fulfillmentDeadline.getUTCMonth() + 1;
  return { cron_expr: `${minute} ${hour} ${day} ${month} *`, task: process.env.REMINDER_WEBHOOK_URL ?? "https://example.com/order-reminder" };
}

export async function scheduleOrderReminder(input: unknown): Promise<{ orderId: string; jobId: string }> {
  const order = orderReminderRequest.parse(input);
  const job = await infrai.cron.create(reminderCron(order));
  return { orderId: order.orderId, jobId: job.job_id };
}

if (process.argv[1]?.endsWith("reminder_scheduler.ts")) {
  const raw = process.env.ORDER_REMINDER_JSON;
  if (!raw) throw new Error("Set ORDER_REMINDER_JSON to run the example");
  scheduleOrderReminder(JSON.parse(raw)).then((result) => console.log(JSON.stringify(result)));
}
