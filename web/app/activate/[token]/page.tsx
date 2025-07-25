"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { activateAccountUser } from "@/app/api";
import { Loader2 } from "lucide-react";

const ActivateAccountPage = () => {
  const { token } = useParams();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const activateAccount = async () => {
      if (!token) {
        setError("Token de activación no proporcionado.");
        return;
      }

      setIsLoading(true);
      try {
        await activateAccountUser(token as string);

        setMessage("Cuenta activada correctamente. Redirigiendo...");
      } catch (err) {
        console.log(err);
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        window.location.href = "/auth/login";
        setIsLoading(false);
      }
    };

    activateAccount();
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      {isLoading && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
    </div>
  );
};

export default ActivateAccountPage;
