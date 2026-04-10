<div align="center">
  <img src="./assets/stoozebot.png" alt="Stoozebot" width="280" style="margin-bottom: -10px" />

  <h1>Stoozebot</h1>

  <p>
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Cloudflare_Workers-F38020?style=flat&logo=cloudflare&logoColor=white" alt="Cloudflare Workers" />
    <img src="https://img.shields.io/badge/Bun-000000?style=flat&logo=bun&logoColor=white" alt="Bun" />
    <img src="https://img.shields.io/badge/grammY-00A98F?style=flat&logo=telegram&logoColor=white" alt="GrammY" />
    <img src="https://img.shields.io/badge/Vitest-729B1B?style=flat&logo=vitest&logoColor=white" alt="Vitest" />
    <img src="https://img.shields.io/badge/Drizzle-C5F74F?style=flat-square&logo=drizzle&logoColor=black" alt="Drizzle" />
  </p>
</div>

Stoozebot is a Telegram bot built with **grammY**, running on **Cloudflare Workers**. It uses **Drizzle ORM** for database interactions with **Cloudflare D1** and uses **Vitest** for unit testing.

## Features

- **Built for Edge**: Uses Cloudflare Workers for fast, low-latency execution.
- **Drizzle ORM & Cloudflare D1**: Type-safe database queries natively supported on Cloudflare.
- **Commands**: Pre-registered bot commands and webhook payload handling.
- **Testing**: Comprehensive test setup using Vitest and `@cloudflare/vitest-pool-workers`.

## Prerequisites

- **[Bun](https://bun.sh/)** (recommended) or Node.js to install dependencies and run scripts.
- **[Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)** to deploy and test locally.
- A Telegram Bot Token from [@BotFather](https://t.me/botfather).

## Getting Started

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/stoozebot.git
   cd stoozebot
   ```

2. **Install dependencies:**

   ```bash
   bun install
   ```

3. **Configure Environment Variables:**
   Copy the example environment file:

   ```bash
   cp .dev.vars.example .dev.vars
   ```

   Open `.dev.vars` and add your `BOT_TOKEN` and `BOT_SECRET`.

4. **Generate Cloudflare types:**

   ```bash
   bun run cf-typegen
   ```

5. **Start the Development Server:**
   ```bash
   bun run dev
   ```
   This will start Wrangler in local development mode.

## Testing

This project uses Vitest. To run the test suite:

```bash
bun run test
```

## Deployment

To deploy the bot to Cloudflare Workers:

> [!IMPORTANT]
> Change DB ids in wrangler.jsonc` to match your DB ids

```bash
bun run deploy
```

> **Note**: Ensure you have configured the webhook URL with Telegram to point to your Cloudflare Worker URL.

## Project Structure

- `src/index.ts`: The main entry point for the Cloudflare Worker.
- `src/db/`: Database schemas and configurations for Drizzle ORM.
- `src/middlewares/`: Express-like middlewares tailored for grammY.
- `src/handlers/`: Command logic and webhook registers.
- `test/`: Vitest configuration and unit tests.

## License

MIT License. See `LICENSE` for more information.
