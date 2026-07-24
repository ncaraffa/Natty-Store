"use client";

import type { ReactNode } from "react";

type AdminConfirmButtonProps = {
  confirmMessage: string;
  children: ReactNode;
  className?: string;
};

/**
 * Submit button that asks for browser confirmation before letting a destructive
 * form (delete/remove) go through. Purely presentational — it never touches the
 * form's action, name attributes or values, it only conditionally calls
 * preventDefault() on click.
 */
export function AdminConfirmButton({ confirmMessage, children, className }: AdminConfirmButtonProps) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      {children}
    </button>
  );
}
