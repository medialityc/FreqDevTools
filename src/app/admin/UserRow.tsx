"use client";

import { useActionState, useState, useTransition } from "react";
import { KeyRound } from "lucide-react";
import {
  changeUserPassword,
  setUserActive,
  type ActionResult,
} from "@/actions/admin";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: "USER" | "ADMIN";
  isActive: boolean;
  createdAt: string;
}

export function UserRow({
  user,
  isSelf,
}: {
  user: AdminUser;
  isSelf: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [toggleMsg, setToggleMsg] = useState<string | null>(null);
  const [showPwd, setShowPwd] = useState(false);
  const [pwdState, pwdAction, pwdPending] = useActionState<
    ActionResult | undefined,
    FormData
  >(changeUserPassword, undefined);

  function toggle() {
    startTransition(async () => {
      const res = await setUserActive(user.id, !user.isActive);
      setToggleMsg(res.error ?? res.success ?? null);
    });
  }

  return (
    <>
      <tr className="border-b border-border">
        <td className="px-3 py-2">
          <div className="font-medium">{user.email}</div>
          {user.name && (
            <div className="text-xs text-muted-foreground">{user.name}</div>
          )}
        </td>
        <td className="px-3 py-2">
          <span
            className={
              user.role === "ADMIN"
                ? "rounded bg-primary/15 px-2 py-0.5 text-xs text-primary"
                : "text-xs text-muted-foreground"
            }
          >
            {user.role}
          </span>
        </td>
        <td className="px-3 py-2">
          <span
            className={
              user.isActive
                ? "text-xs text-success"
                : "text-xs text-destructive"
            }
          >
            {user.isActive ? "Activo" : "Inactivo"}
          </span>
        </td>
        <td className="px-3 py-2 text-xs text-muted-foreground">
          {new Date(user.createdAt).toLocaleDateString()}
        </td>
        <td className="px-3 py-2">
          <div className="flex items-center justify-end gap-2">
            <Button
              variant={user.isActive ? "outline" : "primary"}
              size="sm"
              onClick={toggle}
              disabled={pending || isSelf}
              title={isSelf ? "No puedes cambiar tu propia cuenta" : undefined}
            >
              {user.isActive ? "Desactivar" : "Activar"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPwd((v) => !v)}
              aria-label="Cambiar contraseña"
            >
              <KeyRound className="h-4 w-4" />
            </Button>
          </div>
          {toggleMsg && (
            <div className="mt-1 text-right text-xs text-muted-foreground">
              {toggleMsg}
            </div>
          )}
        </td>
      </tr>
      {showPwd && (
        <tr className="border-b border-border bg-muted/40">
          <td colSpan={5} className="px-3 py-3">
            <form action={pwdAction} className="flex flex-wrap items-center gap-2">
              <input type="hidden" name="userId" value={user.id} />
              <Input
                name="password"
                type="text"
                placeholder="Nueva contraseña (mín. 8)"
                className="max-w-xs"
                required
              />
              <Button type="submit" size="sm" disabled={pwdPending}>
                {pwdPending ? "Guardando..." : "Guardar"}
              </Button>
              {pwdState?.error && (
                <span className="text-xs text-destructive">
                  {pwdState.error}
                </span>
              )}
              {pwdState?.success && (
                <span className="text-xs text-success">{pwdState.success}</span>
              )}
            </form>
          </td>
        </tr>
      )}
    </>
  );
}
