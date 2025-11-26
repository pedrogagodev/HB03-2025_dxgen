import type { Server } from "node:http";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";

export interface OAuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  token_type?: string;
}

export interface OAuthServer {
  port: number;
  callbackUrl: string;
  waitForCallback: () => Promise<OAuthTokens>;
  close: () => void;
}

async function findAvailablePort(startPort: number): Promise<number> {
  const net = await import("node:net");

  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.listen(startPort, () => {
      const { port } = server.address() as AddressInfo;
      server.close(() => resolve(port));
    });

    server.on("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE") {
        resolve(findAvailablePort(startPort + 1));
      } else {
        reject(err);
      }
    });
  });
}

const SUCCESS_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login Successful</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .container {
      text-align: center;
      padding: 2rem;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 1rem;
      backdrop-filter: blur(10px);
    }
    h1 { font-size: 3rem; margin: 0 0 1rem 0; }
    p { font-size: 1.2rem; margin: 0; opacity: 0.9; }
  </style>
</head>
<body>
  <div class="container">
    <h1>✅ Login Successful!</h1>
    <p>You can close this window and return to the terminal.</p>
  </div>
  <script>
    // Auto-close after 2 seconds (may not work in all browsers due to security)
    setTimeout(() => window.close(), 2000);
  </script>
</body>
</html>
`;

const ERROR_HTML = (error: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login Failed</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
    }
    .container {
      text-align: center;
      padding: 2rem;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 1rem;
      backdrop-filter: blur(10px);
      max-width: 500px;
    }
    h1 { font-size: 3rem; margin: 0 0 1rem 0; }
    p { font-size: 1.2rem; margin: 0; opacity: 0.9; }
    code { background: rgba(0,0,0,0.2); padding: 0.2rem 0.5rem; border-radius: 0.3rem; }
  </style>
</head>
<body>
  <div class="container">
    <h1>❌ Login Failed</h1>
    <p>Error: <code>${error}</code></p>
    <p style="margin-top: 1rem;">Please return to the terminal and try again.</p>
  </div>
</body>
</html>
`;

export async function startOAuthServer(
  preferredPort = 54321,
): Promise<OAuthServer> {
  const port = await findAvailablePort(preferredPort);
  const callbackUrl = `http://localhost:${port}/callback`;

  let server: Server;
  let resolveCallback: (tokens: OAuthTokens) => void;
  let rejectCallback: (error: Error) => void;

  const callbackPromise = new Promise<OAuthTokens>((resolve, reject) => {
    resolveCallback = resolve;
    rejectCallback = reject;
  });

  server = createServer((req, res) => {
    if (req.url === "/callback/tokens" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });
      req.on("end", () => {
        try {
          const tokens = JSON.parse(body) as OAuthTokens;

          if (!tokens.access_token) {
            throw new Error("No access token received");
          }

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true }));

          resolveCallback(tokens);
        } catch (error) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: (error as Error).message }));
          rejectCallback(error as Error);
        }
      });
      return;
    }

    if (!req.url?.startsWith("/callback")) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
      return;
    }

    const url = new URL(req.url, `http://localhost:${port}`);

    const error = url.searchParams.get("error");
    const errorDescription = url.searchParams.get("error_description");

    if (error) {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(ERROR_HTML(errorDescription || error));
      rejectCallback(new Error(`OAuth error: ${errorDescription || error}`));
      return;
    }

    const accessToken = url.searchParams.get("access_token");
    const refreshToken = url.searchParams.get("refresh_token");
    const expiresIn = url.searchParams.get("expires_in");
    const tokenType = url.searchParams.get("token_type");

    if (!accessToken) {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Authenticating...</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .container {
      text-align: center;
      padding: 2rem;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 1rem;
      backdrop-filter: blur(10px);
    }
    .spinner {
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-top: 4px solid white;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 20px auto;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .success { font-size: 3rem; margin: 0 0 1rem 0; }
    .message { font-size: 1.2rem; margin: 0; opacity: 0.9; }
  </style>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <p class="message">Completing authentication...</p>
  </div>
  <script>
    // Extract tokens from hash fragment
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);

    const tokens = {
      access_token: params.get('access_token'),
      refresh_token: params.get('refresh_token'),
      expires_in: params.get('expires_in'),
      token_type: params.get('token_type')
    };

    // Post tokens to server
    fetch('/callback/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tokens)
    }).then(() => {
      document.querySelector('.container').innerHTML = '<h1 class="success">✅ Login Successful!</h1><p class="message">You can close this window and return to the terminal.</p>';
      setTimeout(() => window.close(), 2000);
    }).catch((err) => {
      document.querySelector('.container').innerHTML = '<h1 class="success">❌ Error</h1><p class="message">Failed to complete login: ' + err.message + '</p>';
    });
  </script>
</body>
</html>`);
      return;
    }

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(SUCCESS_HTML);

    resolveCallback({
      access_token: accessToken,
      refresh_token: refreshToken || "",
      expires_in: expiresIn ? Number.parseInt(expiresIn, 10) : undefined,
      token_type: tokenType || "bearer",
    });
  });

  await new Promise<void>((resolve) => {
    server.listen(port, "localhost", () => {
      resolve();
    });
  });

  return {
    port,
    callbackUrl,
    waitForCallback: () => callbackPromise,
    close: () => {
      server.close();
    },
  };
}
