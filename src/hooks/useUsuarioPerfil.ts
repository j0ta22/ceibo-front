// src/hooks/useUsuarioPerfil.ts
import { useEffect, useState } from "react";
import axios from "axios";

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
}

interface UsuarioPerfil {
  telegram_id: number;
  username: string;
  wallet: string;
  productos: Producto[];
}

export function useUsuarioPerfil(telegramId?: number, initData?: string) {
  const [perfil, setPerfil] = useState<UsuarioPerfil | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!telegramId || !initData) {
      setError("No se detectó sesión válida.");
      setLoading(false);
      return;
    }

    const fetchPerfil = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/users/telegram/${telegramId}`,
          {
            headers: {
              "Content-Type": "application/json",
              "X-Telegram-Init-Data": initData,
            },
          }
        );
        setPerfil(res.data);
      } catch (err) {
        setError("No se pudo cargar el perfil.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPerfil();
  }, [telegramId, initData]);

  return { perfil, loading, error };
}
