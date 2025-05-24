"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { handleLogout } from "../api";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const router = useRouter();
  const { user, setUser } = useAuth();

  return (
    <div className="md:hidden flex items-center">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <Menu className="h-10 w-10" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right">
          <div className="flex flex-col gap-4 mt-8 items-center">
            {user && user.username ? (
              <>
                <span className="text-md text-shadow-muted-foreground">
                  Hola, {user.username}
                </span>
                <Button
                  variant="default"
                  onClick={() => {
                    handleLogout(setUser);
                    setIsOpen(false);
                  }}
                >
                  Cerrar sesión
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => {
                    router.push("/auth/login");
                    setIsOpen(false);
                  }}
                >
                  Iniciar sesión
                </Button>
                <Button
                  variant="default"
                  onClick={() => {
                    router.push("/auth/register");
                    setIsOpen(false);
                  }}
                >
                  Registrarse
                </Button>
              </>
            )}
            <Button variant="ghost" onClick={() => router.push("/")}>
              Inicio
            </Button>
            <Button variant="ghost" onClick={() => router.push("/ayuda")}>
              Centro de ayuda
            </Button>
            <Button variant="ghost" onClick={() => router.push("/nosotros")}>
              Nosotros
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
