import { Command } from "commander";
import { generateCommand } from "./commands/generate";

const program = new Command();

program
  .name("dxgen")
  .description(
    "AI Documentation Agent - CLI-first tool for generating documentation",
  )
  .version("0.0.1");

program.addCommand(generateCommand);

program.parse(process.argv);
