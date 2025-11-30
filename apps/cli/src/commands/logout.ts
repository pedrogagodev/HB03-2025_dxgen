import { Command } from "commander";
import { render } from "ink";
import React from "react";
import { LogoutView } from "../components/LogoutView";
import { checkAuth, logout } from "../lib/auth";
import { getSessionFilePath } from "../lib/auth/session";

export const logoutCommand = new Command("logout")
  .description("Sign out and clear local session")
  .action(async () => {
    const user = await checkAuth();
    if (!user) {
      render(React.createElement(LogoutView, { type: "not_logged_in" }));
      return;
    }

    try {
      await logout();
      render(
        React.createElement(LogoutView, {
          type: "success",
          email: user.email || user.id,
          sessionPath: getSessionFilePath(),
        }),
      );
    } catch (error) {
      render(
        React.createElement(LogoutView, {
          type: "error",
          error: (error as Error).message,
        }),
      );
      process.exit(1);
    }
  });
