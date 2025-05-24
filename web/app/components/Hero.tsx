"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProfessorsStore } from "@/store/professorsStore";
import { useSchoolsStore } from "@/store/schoolsStore";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getProfessors, getRandomSchools, getSchools } from "../api";
import { RandomSchool } from "../types/types";

export default function LandingPage() {
  const [labelText, setLabelText] = useState<string>(
    "Escribe el nombre de la universidad para empezar.",
  );
  const [placeholderText, setPlaceholderText] = useState("Tu escuela");
  const [schools, setSchools] = useState<RandomSchool[]>([]);
  const [selectedButton, setSelectedButton] = useState("school");
  const [query, setQuery] = useState<string>("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      localStorage.setItem("token", token);
    }
    router.replace("/");
  }, [searchParams]);

  useEffect(() => {
    const fetchSchools = async () => {
      const schools = await getRandomSchools();
      setSchools(schools);
    };
    fetchSchools();
  }, []);

  const handleButtonClick = (type: string) => {
    setSelectedButton(type);
    if (type === "school") {
      setLabelText("Escribe el nombre de la universidad para empezar.");
      setPlaceholderText("Tu escuela");
    } else if (type === "professor") {
      setLabelText("Escribe el nombre del profesor para empezar.");
      setPlaceholderText("Nombre del profesor");
    }
  };

  const handleOnClick = async (id: number) => {
    router.push(`/school/${id}`);
  };

  const handleSubmit = async () => {
    if (!query.trim()) {
      toast.warn("Por favor, ingresa un término de búsqueda.");
      return;
    }

    try {
      if (selectedButton === "school") {
        const data = await getSchools(query);
        if (data.length > 0) {
          useSchoolsStore.getState().setSchools(data);
          router.push(`/school`);
        } else {
          toast.error("No se encontraron resultados.");
        }
      } else if (selectedButton === "professor") {
        const data = await getProfessors(query);
        if (data.length > 0) {
          useProfessorsStore.getState().setProfessors(data);
          router.push("/professors");
        } else {
          toast.error("No se encontraron resultados.");
        }
      }
    } catch (error) {
      toast.error("Hubo un error en la búsqueda.");
      console.error("Error en la búsqueda:", error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <ToastContainer position="top-right" autoClose={3000} />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[calc(100vh-4rem)] flex-col justify-center py-12">
          <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
            <div className="flex flex-col gap-8">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
                  Califica tu profesor y encuentra los apuntes de sus materias.
                </h1>
                <p className="text-lg text-muted-foreground">{labelText}</p>
              </div>

              {/* Search Input */}
              <div className="space-y-4">
                <Input
                  type="search"
                  placeholder={placeholderText}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  className="max-w-md"
                />

                <div className="flex gap-4 justify-center">
                  {selectedButton === "school" ? (
                    <span
                      className="text-sm font-semibold cursor-pointer"
                      onClick={() => handleButtonClick("professor")}
                    >
                      Me gustaría buscar a un profesor
                    </span>
                  ) : (
                    <span
                      className="text-sm font-semibold cursor-pointer"
                      onClick={() => handleButtonClick("school")}
                    >
                      Me gustaría buscar una escuela
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Escuelas</p>
                  <div className="space-y-2">
                    {schools?.map((school) => (
                      <button
                        key={school.id}
                        className="flex w-full max-w-md items-center gap-2 rounded-lg border p-4 text-left transition-colors hover:bg-accent"
                        onClick={() => handleOnClick(school.id)}
                      >
                        <div className="h-4 w-4 rounded-full border " />
                        <span className="uppercase text-sm font-bold">
                          {school.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Illustration */}
            <div className="relative flex justify-end md:block">
              <div className="relative h-[500px] w-[500px] lg:h-[600px] lg:w-[600px]">
                <Image
                  src="/iconp.png"
                  alt="Hero Illustration"
                  fill
                  className="object-contain hidden md:block"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
