import assert from "node:assert/strict";
import { reminderCron, orderReminderRequest } from "./reminder_scheduler.js";

const order = orderReminderRequest.parse({
  orderId: "ord_1001",
  customerEmail: "shopper@example.com",
  fulfillmentDeadline: "2026-09-03T14:30:00Z",
  receiptUrl: "https://store.example/receipts/ord_1001"
});

assert.deepEqual(reminderCron(order), {
  cron_expr: "30 14 3 9 *",
  task: "https://example.com/order-reminder"
});
assert.throws(() => orderReminderRequest.parse({ ...order, customerEmail: "bad" }));
console.log("reminder decision test passed");
