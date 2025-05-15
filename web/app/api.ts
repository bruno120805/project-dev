import { Note, ReviewForm, School, User } from "./types/types";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const getSchools = async (q: string) => {
  try {
    const res = await fetch(`${API_URL}/search/schools?q=${q}`);
    const { data } = await res.json();

    return data ?? [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getProfessors = async (q: string) => {
  try {
    const res = await fetch(`${API_URL}/search/professor?q=${q}`);
    const { data } = await res.json();

    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

const createNote = async (note: Note, professorId: number) => {
  try {
    const res = await fetch(`${API_URL}/notes/${professorId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(note),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Error al crear la nota");
  } catch (error) {
    console.error(error);
  }
};

export const createReview = async (review: ReviewForm, id: number) => {
  try {
    const res = await fetch(`${API_URL}/reviews/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },

      body: JSON.stringify(review),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Error al crear la evaluación");
  } catch (error) {
    throw new Error("Error al crear la evaluación");
  }
};

export const getNotesByID = async (id: number) => {
  try {
    const res = await fetch(`${API_URL}/notes/${id}/view`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const { data } = await res.json();
    return data;
  } catch (error) {
    throw new Error("Error al obtener la nota");
  }
};

export const getNotes = async (professorId: number): Promise<Note[]> => {
  try {
    const res = await fetch(`${API_URL}/notes/${professorId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const { data } = await res.json();

    if (!res.ok) throw new Error(data.error || "Error al obtener las notas");
    return data as Note[];
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getReviews = async (professorId: number) => {};

export const getProfessorByID = async (id: number) => {
  try {
    const res = await fetch(`${API_URL}/professor/${id}`);
    const { data } = await res.json();

    return data;
  } catch (error) {
    console.error(error);
  }
};

export const getSchoolByID = async (
  id: School["id"],
  limit?: number,
  offset?: number,
) => {
  try {
    const res = await fetch(
      `${API_URL}/school/${id}?limit=${limit}&offset=${offset}`,
    );
    const { data } = await res.json();

    return data;
  } catch (error) {
    console.error(error);
  }
};

export const getRandomSchools = async () => {
  try {
    const res = await fetch(`${API_URL}/school/random`);
    const { data } = await res.json();
    return data;
  } catch (error) {
    console.error(error);
  }
};

export const handleGoogleLogin = async () => {
  try {
    // Redirige al usuario a la URL de autenticación de Google
    window.location.href = `${API_URL}/auth/google`; // Esta es la URL donde tu backend maneja la autenticación

    // No hay necesidad de hacer un fetch, ya que el navegador hará una redirección
    // El flujo se completará con la redirección de Google de vuelta a tu app
  } catch (error) {
    console.error("Error en el inicio de sesión con Google:", error);
  }
};

export const handleLogin = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "include",
  });

  const { data } = await res.json();
  localStorage.setItem("token", data.token);
  if (!res.ok) throw new Error(data || "Error al iniciar sesión");
  return data.user;
};

export const handleLogout = async (setUser: (user: User | null) => void) => {
  try {
    await fetch(`${API_URL}/auth/logout/google`, {
      method: "GET",
      credentials: "include",
    });

    localStorage.removeItem("token");
    setUser(null);
  } catch (error) {
    console.error(error);
  }
};
