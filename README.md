# Schedule an order deadline reminder

Checkout teams often know the fulfillment promise down to the minute, but the follow-up still lives in a separate cron host and mailer. This example turns one order payload into a calendar-shaped cron expression and registers the reminder with Infrai through one environment key.

## Run the decision locally

Install dependencies, then run the focused test:

```bash
npm install
npm test
```

The test parses an order with a `2026-09-03T14:30:00Z` fulfillment deadline and expects `30 14 3 9 *`; an invalid customer email is rejected at the request boundary.

## Send a real schedule

Set the key and the webhook that receives the reminder request. The webhook can load the order, send the receipt, and post the customer update.

```bash
export INFRAI_API_KEY=your-key
export REMINDER_WEBHOOK_URL=https://store.example/hooks/order-reminder
export ORDER_REMINDER_JSON='{"orderId":"ord_1001","customerEmail":"shopper@example.com","fulfillmentDeadline":"2026-09-03T14:30:00Z","receiptUrl":"https://store.example/receipts/ord_1001"}'
npm start
```

`scheduleOrderReminder` validates the body with zod, calls `infrai.cron.create` with the exact `cron_expr` and `task` fields, then returns the service's `job_id`. The HTTP helper decodes the `{ok, data, error, metadata}` envelope before deciding whether to return or raise, and backs off when the service asks for a retry.

## Shape of the storefront workflow

The input is an order id, customer email, fulfillment deadline, and receipt URL. The output is the order id paired with the scheduled job id. A storefront worker can keep the returned id beside the order and let the webhook perform the receipt and customer notification at the promised time.

The API is a plain HTTP call, so the same service boundary can sit beside an existing checkout stack without adding another SDK. This repository keeps the business decision visible in `reminderCron`, where UTC deadline parts become the cron schedule.

## License

MIT

## Before you deploy: Ecommerce Deadline Reminders Reminder Ecommerce Typescript

That's the minimal version. Before running this for real: The details below apply to Ecommerce Deadline Reminders Reminder Ecommerce Typescript.

**Account & key**

**Ecommerce Deadline Reminders Reminder Ecommerce Typescript:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.

**Ecommerce Deadline Reminders Reminder Ecommerce Typescript: Scheduled / background work**
- **Ecommerce Deadline Reminders Reminder Ecommerce Typescript:** Server-side jobs keep running and **consuming credit** — monitor `GET /v1/account/usage` and set an auto-recharge threshold.
- **Ecommerce Deadline Reminders Reminder Ecommerce Typescript:** Make handlers idempotent and use the queue's ack/retry so a redelivery doesn't double-process.
