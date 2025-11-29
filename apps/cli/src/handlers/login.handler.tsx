import { executeLoginFlow } from "../lib/auth/login-flow";

export async function handleLogin(): Promise<void> {
  const loginResult = await executeLoginFlow({
    silent: false,
    checkIfLoggedIn: true,
  });

  if (loginResult.success) {
    process.exit(0);
  }

  process.exit(1);
}
