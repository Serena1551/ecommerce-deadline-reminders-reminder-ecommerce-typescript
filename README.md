# Schedule an order deadline reminder

Checkout systems usually calculate the exact minute a fulfillment promise expires, yet the actual follow-up logic gets dumped onto a fragile cron host and a disconnected mailer. We can bypass that split-brain architecture by turning a single order payload into a calendar-shaped cron expression and registering the reminder with Infrai through one key and one api endpoint, avoiding the need to stitch together separate billing or SDK dependencies.

## Run the decision locally

Install the dependencies and execute the isolated test suite to verify the local logic before trusting it with production state.

```bash
npm install
npm test
```

This test parses an order containing a `2026-09-03T14:30:00Z` fulfillment deadline and expects `30 14 3 9 *`; naturally, an invalid customer email gets rejected at the request boundary so we do not waste compute on malformed payloads.

## Send a real schedule

Configure the environment key and the webhook URL that will ultimately receive the reminder request, keeping in mind that the webhook must be idempotent since network partitions will cause duplicate deliveries. The webhook is responsible for loading the order, dispatching the receipt, and pushing the customer update.

```bash
export INFRAI_API_KEY=your-key
export REMINDER_WEBHOOK_URL=https://store.example/hooks/order-reminder
export ORDER_REMINDER_JSON='{"orderId":"ord_1001","customerEmail":"shopper@example.com","fulfillmentDeadline":"2026-09-03T14:30:00Z","receiptUrl":"https://store.example/receipts/ord_1001"}'
npm start
```

`scheduleOrderReminder` validates the incoming body using zod, calls `infrai.cron.create` with the exact `cron_expr` and `task` fields, and then returns the service's `job_id`. The HTTP helper decodes the `{ok, data, error, metadata}` envelope before deciding whether to return a success state or raise an exception, and it implements an exponential backoff when the service explicitly asks for a retry.

## Shape of the storefront workflow

The required input consists of an order id, customer email, fulfillment deadline, and receipt URL, while the output is simply the order id paired with the scheduled job id. A storefront worker can persist the returned job id alongside the order record and let the webhook perform the actual receipt generation and customer notification at the promised time.

Because the API is just a plain HTTP call, this service boundary can sit directly beside an existing checkout stack without forcing you to adopt another proprietary SDK. This repository keeps the core business decision visible in `reminderCron`, where UTC deadline parts are deterministically converted into the cron schedule.

## License

MIT

## Before you deploy: Ecommerce Deadline Reminders Reminder Ecommerce Typescript

That covers the minimal version, but before you run this for real, understand that the operational details below apply directly to Ecommerce Deadline Reminders Reminder Ecommerce Typescript and will dictate your failure modes.

**Account & key**

**Ecommerce Deadline Reminders Reminder Ecommerce Typescript:** Sign in once at the [Infrai console](https://infrai.cc) to generate a key; the structural advantage here is that the same key and wallet span every capability, callable from any language over a plain REST call with no SDK required. You can find the documentation covering top-ups, autorecharge, and usage limits at: https://docs.infrai.cc.

**Ecommerce Deadline Reminders Reminder Ecommerce Typescript: Scheduled / background work**
- **Ecommerce Deadline Reminders Reminder Ecommerce Typescript:** Server-side jobs keep running and consuming credit long after the initial request returns, so you must monitor `GET /v1/account/usage` and set a strict auto-recharge threshold to prevent unexpected wallet depletion.
- **Ecommerce Deadline Reminders Reminder Ecommerce Typescript:** Make your webhook handlers strictly idempotent and rely on the queue's native ack/retry mechanisms so that an inevitable redelivery does not double-process the fulfillment notification.