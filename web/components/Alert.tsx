import type { ReactNode } from "react";

type AlertProps = {
  variant?: "info" | "error" | "success";
  children: ReactNode;
};

export function Alert({ variant = "info", children }: AlertProps) {
  const variantClass =
    variant === "error"
      ? "alertError"
      : variant === "success"
        ? "alertSuccess"
        : "";

  return (
    <div
      className={variantClass ? `alert ${variantClass}` : "alert"}
      role={variant === "error" ? "alert" : "status"}
      aria-live={variant === "error" ? "assertive" : "polite"}
    >
      {children}
    </div>
  );
}
