"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const ActivateAccountPage = () => {
  const { token } = useParams();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const activateAccount = async () => {
      if (!token) return;

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/activate/${token}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
          },
        );

        const data = await res.json();

        if (!res.ok)
          throw new Error(data?.error || "Error al activar la cuenta");

        setMessage("Cuenta activada correctamente. Redirigiendo...");

        setTimeout(() => {
          window.location.href = "/auth/login";
        }, 3000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      }
    };

    activateAccount();
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      {message && <p className="text-green-600">{message}</p>}
      {error && <p className="text-red-600">{error}</p>}
    </div>
  );
};

export default ActivateAccountPage;
