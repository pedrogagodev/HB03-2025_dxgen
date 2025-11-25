import { Command } from "commander";
import prompts from "prompts";

export const initCommand = new Command("init").description("Initialize a new project");

initCommand.action(async () => {
  if (!process.stdin.isTTY) {
    console.error('Error: This command requires an interactive terminal.');
    console.error('Please execute the command directly in the terminal, not through pipes or redirection.');
    process.exit(1);
  }

  console.log("Initializing a new project...");

  try {
    const answers = await prompts([
      {
        type: 'confirm',
        name: 'confirmStack',
        message: `Stack detected: Node.js. Is it correct?`,
        initial: true,
      },
      {
        type: (prev: boolean) => (prev ? null : 'select'),
        name: 'stack',
        message: 'Choose the stack manually:',
        choices: [
          { title: 'Node.js', value: 'node' },
          { title: 'Python', value: 'python' },
          { title: 'Go', value: 'go' },
          { title: 'Rust', value: 'rust' },
        ],
      },
      {
        type: 'text',
        name: 'outputDir',
        message: 'Output directory for docs:',
        initial: './docs',
      },
      {
        type: 'multiselect',
        name: 'features',
        message: 'What types of documentation do you want to generate?',
        choices: [
          { title: 'README', value: 'readme', selected: true },
          { title: 'API Docs', value: 'api-docs', selected: true },
          { title: 'Diagrams', value: 'diagram', selected: true },
          { title: 'Repository Summary', value: 'summary' },
        ],
      },
    ], {
      onCancel: () => {
        console.log('\nOperation cancelled.');
        process.exit(0);
      }
    });

    if (!answers) {
      console.log('No answer received.');
      return;
    }

    console.log(answers);
  } catch (error) {
    console.error('Error executing prompts:', error);
    process.exit(1);
  }
});
