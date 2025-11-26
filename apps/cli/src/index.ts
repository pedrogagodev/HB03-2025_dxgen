import { Command } from "commander";

import { generateCommand } from "./commands/generate";
import { loginCommand } from "./commands/login";
import { logoutCommand } from "./commands/logout";
import { statusCommand } from "./commands/status";
import { requireAuth } from "./lib/auth";
import { loadEnv } from "./lib/env";

const program = new Command();

loadEnv();

program
  .name("dxgen")
  .description(
    "AI Documentation Agent - CLI-first tool for generating documentation",
  )
  .version("0.0.1");

program.hook("preAction", async (_thisCommand, actionCommand) => {
  const commandName = actionCommand.name();

  const exemptCommands = ["login", "logout", "status", "help"];

  if (exemptCommands.includes(commandName)) {
    return;
  } 

  const user = await requireAuth();

  actionCommand.setOptionValue("__authenticatedUser", user);
});

program.addCommand(loginCommand);
program.addCommand(logoutCommand);
program.addCommand(statusCommand);
program.addCommand(generateCommand);

program.parse(process.argv);
