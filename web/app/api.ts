import {
  ApiResponse,
  Login,
  Note,
  NotesForm,
  ReviewForm,
  School,
  User,
} from "./types/types";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const getSchools = async (q: string) => {
  try {
    const { data } = await axios.get(`${API_URL}/search/schools`, {
      params: { q },
    });
    return data.data ?? [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getNoteByID = async (q: string, professorId: number) => {
  try {
    const { data } = await axios.get(`${API_URL}/search/${professorId}/notes`, {
      params: { q },
    });
    return data.data ?? [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getProfessors = async (q: string) => {
  try {
    const { data } = await axios.get(`${API_URL}/search/professor`, {
      params: { q },
    });
    return data.data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const createNote = async (note: NotesForm, professorId: number) => {
  try {
    const formData = new FormData();

    formData.append("subject", note.subject);
    formData.append("title", note.title);
    formData.append("content", note.content);

    note.files.forEach((file) => {
      formData.append("files", file, file.name);
    });

    const token = localStorage.getItem("token");

    const { data } = await axios.post(
      `${API_URL}/notes/${professorId}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error("No autorizado, por favor inicia sesión");
    }
    throw new Error(error.response?.data?.error || "Error al crear la nota");
  }
};

export const createReview = async (review: ReviewForm, professorId: number) => {
  try {
    const { data } = await axios.post(
      `${API_URL}/reviews/${professorId}`,
      review,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );

    return data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error("No autorizado, por favor inicia sesión");
    }
    throw new Error(
      error.response?.data?.error || "Error al crear la evaluación",
    );
  }
};

export const getNotesByID = async (id: number) => {
  try {
    const { data } = await axios.get(`${API_URL}/notes/${id}/view`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return data.data;
  } catch (error) {
    throw new Error("Error al obtener la nota");
  }
};

export const getNotes = async (professorId: number): Promise<Note[]> => {
  try {
    const { data } = await axios.get(`${API_URL}/notes/${professorId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return data.data as Note[];
  } catch (error: any) {
    console.error(error);
    return [];
  }
};

export const getReviews = async (professorId: number) => {
  // Implementación pendiente
};

export const getProfessorByID = async (id: number) => {
  try {
    const { data } = await axios.get(`${API_URL}/professor/${id}`);
    return data.data;
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
    const { data } = await axios.get(`${API_URL}/school/${id}`, {
      params: { limit, offset },
    });
    return data.data;
  } catch (error) {
    console.error(error);
  }
};

export const getRandomSchools = async () => {
  try {
    const {
      data: { data },
    } = await axios.get(`${API_URL}/school/random`);
    return data;
  } catch (error) {
    console.error(error);
  }
};

export const handleGoogleLogin = async () => {
  try {
    window.location.href = `${API_URL}/auth/google`;
  } catch (error) {
    console.error("Error en el inicio de sesión con Google:", error);
  }
};

export const handleLogin = async ({ email, password }: Login) => {
  const {
    data: { data },
  } = await axios.post<ApiResponse<{ token: string; user: User }>>(
    `${API_URL}/auth/login`,
    {
      email,
      password,
    },
  );

  localStorage.setItem("token", data.token);
  return data.user;
};

export const handleLogout = async (setUser: (user: User | null) => void) => {
  try {
    await axios.get(`${API_URL}/auth/logout/google`, { withCredentials: true });
    localStorage.removeItem("token");
    setUser(null);
  } catch (error) {
    console.error(error);
  }
};

export const getTagsFromProfessor = async (professorId: number) => {
  try {
    const { data } = await axios.get(`${API_URL}/reviews/${professorId}/tags`);
    return data.data;
  } catch (error) {
    console.error("Error al obtener las etiquetas del profesor:", error);
    return [];
  }
};

export const activateAccountUser = async (token: string) => {
  try {
    const { data } = await axios.put(`${API_URL}/users/activate/${token}`);

    if (!data.ok) throw new Error(data?.error || "Error al activar la cuenta");

    setTimeout(() => {
      window.location.href = "/auth/login";
    }, 3000);
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : "Error desconocido");
  }
};
