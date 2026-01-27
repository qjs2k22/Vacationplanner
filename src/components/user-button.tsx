"use client";

import { UserButton } from "@clerk/nextjs";

export function UserButtonWithMenu() {
  return (
    <UserButton
      afterSignOutUrl="/"
      appearance={{
        elements: {
          avatarBox: "h-10 w-10",
        },
      }}
    />
  );
}
