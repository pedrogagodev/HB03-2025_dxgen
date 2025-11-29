import { render } from "ink";
import React from "react";
import { CLI } from "./components/CLI";
import { handleGenerate } from "./handlers/generate.handler";
import { handleLogin } from "./handlers/login.handler";
import { handleLogout } from "./handlers/logout.handler";
import { handleStatus } from "./handlers/status.handler";
import { loadEnv } from "./lib/env";

loadEnv();

const args = process.argv.slice(2);
const command = args[0];

async function main() {
  // Version flag
  if (args.includes("-v") || args.includes("--version")) {
    console.log("dxgen v0.0.1");
    process.exit(0);
  }

  // Help flag
  if (
    args.includes("-h") ||
    args.includes("--help") ||
    command === "help" ||
    !command
  ) {
    render(React.createElement(CLI));
    return;
  }

  // Route commands
  switch (command) {
    case "login":
      await handleLogin();
      break;

    case "logout":
      await handleLogout();
      break;

    case "status":
      await handleStatus();
      break;

    case "generate":
      await handleGenerate();
      break;

    default:
      console.error(`\nUnknown command: ${command}`);
      console.error('Run "dxgen --help" for usage information.\n');
      process.exit(1);
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
