"use client";

import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { handleLogout } from "../api";
import { MobileMenu } from "./MobileMenu";

const MainNavigation = ({ children }: { children: React.ReactNode }) => {
  const { user, setUser } = useAuth();
  const router = useRouter();
  console.log(user);

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Image
                  src="/icon.png"
                  alt="Logo"
                  width={40}
                  height={40}
                  className="hover:scale-110 transition-transform"
                />
              </Link>

              <div className="hidden md:flex space-x-4">
                <NavigationMenu>
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger className="h-9 px-3">
                        País
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <div className="w-[80px] p-2">
                          <Link
                            href="#"
                            className="block select-none rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                          >
                            México
                          </Link>
                        </div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>

                <NavigationMenu>
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger className="h-9 px-3">
                        Ayuda
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <div className="w-[140px] p-2">
                          <Link
                            href="#"
                            className="block select-none rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                          >
                            Centro de ayuda
                          </Link>
                        </div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>

                <NavigationMenu>
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger className="h-9 px-3">
                        About Us
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <div className="w-[100px] p-2">
                          <Link
                            href="#"
                            className="block select-none rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                          >
                            Nosotros
                          </Link>
                        </div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4">
              {user && user.username ? (
                <>
                  <span>Hola, {user.username}</span>
                  <Button
                    variant="default"
                    onClick={() => handleLogout(setUser)}
                  >
                    Cerrar sesión
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => router.push("/auth/login")}
                  >
                    Iniciar sesión
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => router.push("/auth/register")}
                  >
                    Registrarse
                  </Button>
                </>
              )}
            </div>

            {/* Menú móvil (visible solo en móvil) */}
            <MobileMenu />
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <main className="flex-1">{children}</main>
    </div>
  );
};

export default MainNavigation;
