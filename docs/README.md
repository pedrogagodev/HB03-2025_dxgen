<div align="center">
  <h1>🚀 dxgen</h1>
  <p><strong>AI Documentation Agent - CLI-first tool for generating documentation</strong></p>

  <p>
    <a href="#installation"><img src="https://img.shields.io/badge/install-guide-blue?style=for-the-badge" alt="Installation" /></a>
    <a href="#quick-start"><img src="https://img.shields.io/badge/quick-start-green?style=for-the-badge" alt="Quick Start" /></a>
  </p>
</div>

### Highlights / Features
- ⚡ **AI-Powered Documentation** – Generate comprehensive documentation using advanced AI techniques.
- 🔒 **CLI-First Approach** – Easily integrate into your workflow with a command-line interface.
- 🎯 **Multi-Format Support** – Generate various documentation types including README, API docs, and diagrams.

### Table of Contents
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Architecture](#architecture)
- [Contributing](#contributing)
- [License](#license)

### Prerequisites
- Node.js version: 18.x (recommended)
- Package manager: npm (based on lock file)
- Environment variables: Refer to `.env.example` for required variables.

### Installation
```bash
# Clone the repository
git clone <actual-repo-url-if-available>
cd dxgen

# Install dependencies
npm install

# Setup environment
cp .env.example .env
```

### Quick Start
```bash
npm run dev  # Start the development server
```

### Available Scripts
| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server using Turborepo |
| `npm run dxgen` | Run the CLI tool for generating documentation |
| `npm run build` | Build the project for production |
| `npm run lint` | Lint the project code |
| `npm run test` | Run tests for the project |

### Project Structure
```
dxgen/
├── apps/     # Application packages
├── packages/     # Shared packages/libraries
├── biome.json     # Biome config
├── package.json     # Package configuration
├── tsconfig.json     # TypeScript config
├── tsup.config.ts
└── turbo.json     # Turborepo config
```

### Configuration
- **Biome Configuration**: Configures linting and formatting rules.
- **Environment Variables**: Required variables are specified in `.env.example`.

### Architecture
dxgen is structured as a monorepo using Turborepo, allowing for efficient management of multiple applications and shared libraries. The project includes a CLI tool for generating documentation, leveraging AI capabilities to provide comprehensive and context-aware outputs.

### Contributing
Contributions are welcome! Please follow the standard guidelines for contributing, including forking the repository, making changes, and submitting a pull request.

### License
This project is licensed under the MIT License. See the LICENSE file for more details.