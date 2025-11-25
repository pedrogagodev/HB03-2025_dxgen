import { Command } from "commander";
import { initCommand } from "./commands/init";

const program = new Command();

program
  .name('dxgen')
  .description('AI Documentation Agent - CLI-first tool for generating documentation')
  .version('0.0.1');

program.addCommand(initCommand)

program.parse();
