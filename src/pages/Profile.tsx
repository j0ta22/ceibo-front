import { useEffect, useState } from "react";
import axios from "axios";
import FormCrearProducto from "../components/FormCrearProducto";
import UpdateWallet from "../components/UpdateWallet";

const tg = window.Telegram.WebApp;
const user = tg.initDataUnsafe?.user;
const initData = tg.initData;

// Agregar logs para depuración
console.log('Telegram WebApp:', tg);
console.log('User data:', user);
console.log('Init data:', initData);
console.log('API URL:', import.meta.env.VITE_API_URL);

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
}

interface Usuario {
  telegram_id: number;
  username: string;
  wallet: string;
  productos: Producto[];
}

export default function Profile() {
  const [perfil, setPerfil] = useState<Usuario | null>(null);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [editando, setEditando] = useState<Producto | null>(null);
  const [nuevoProducto, setNuevoProducto] = useState<Producto>({
    id: 0,
    nombre: "",
    descripcion: "",
    precio: 0,
  });

  // Obtener datos de Telegram
  const webApp = window.Telegram?.WebApp;
  const user = webApp?.initDataUnsafe?.user;
  const initData = webApp?.initData;

  console.log('=== Datos de Telegram ===');
  console.log('WebApp disponible:', !!webApp);
  console.log('Usuario:', user);
  console.log('InitData:', initData);
  console.log('=== Fin Datos de Telegram ===');

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        setIsLoading(true);
        console.log('Iniciando carga de perfil...');
        
        if (!webApp) {
          console.error('Telegram WebApp no está disponible');
          setError("No se detectó la aplicación de Telegram.");
          return;
        }

        if (!user?.id) {
          console.error('No se encontró el ID de usuario de Telegram');
          setError("No se detectó sesión de Telegram.");
          return;
        }

        if (!initData) {
          console.error('No se encontró initData de Telegram');
          setError("No se detectaron datos de inicialización de Telegram.");
          return;
        }

        console.log('Realizando petición a la API...');
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/users/telegram/${user.id}`,
          {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
              "X-Telegram-Init-Data": initData,
            },
          }
        );

        console.log('Respuesta de la API:', res.data);
        
        if (!res.data) {
          console.error('La respuesta de la API está vacía');
          setError("No se pudieron obtener los datos del perfil.");
          return;
        }

        setPerfil(res.data);
        setError("");
      } catch (err) {
        console.error('Error detallado:', err);
        
        if (axios.isAxiosError(err)) {
          if (err.response) {
            console.error('Error de respuesta:', err.response.data);
            console.error('Status:', err.response.status);
            console.error('Headers:', err.response.headers);
            
            if (err.response.status === 404) {
              setError("Usuario no encontrado. Por favor, crea una wallet desde el bot.");
            } else if (err.response.status === 401) {
              setError("No autorizado. Por favor, verifica que estés accediendo desde el bot de Telegram.");
            } else if (err.response.status === 500) {
              setError("Error del servidor. Por favor, intenta más tarde.");
            } else {
              setError(`Error al cargar el perfil: ${err.response.data?.detail || 'Error desconocido'}`);
            }
          } else if (err.request) {
            console.error('Error de red:', err.request);
            setError("Error de conexión. Por favor, verifica tu conexión a internet.");
          } else {
            console.error('Error de configuración:', err.message);
            setError("Error al configurar la petición. Por favor, intenta nuevamente.");
          }
        } else {
          console.error('Error no relacionado con Axios:', err);
          setError("Error desconocido al cargar el perfil.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    cargarPerfil();
  }, [webApp, user, initData]);

  const handleEditarClick = (producto: Producto) => {
    setEditando(producto);
    setNuevoProducto(producto);
  };

  const handleEditarProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/products/${nuevoProducto.id}`,
        {
          nombre: nuevoProducto.nombre,
          descripcion: nuevoProducto.descripcion,
          precio: nuevoProducto.precio,
        }
      );
      setEditando(null);
      cargarPerfil(); // Refrescar datos
    } catch (err) {
      alert("Error al editar el producto");
    }
  };

  const handleEliminarProducto = async (id: number) => {
    const confirmar = confirm("¿Estás seguro que querés eliminar este producto?");
    if (!confirmar) return;

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/products/${id}`);
      cargarPerfil(); // Refrescar productos
    } catch (err) {
      alert("Error al eliminar el producto");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Recargar
        </button>
      </div>
    );
  }

  if (!perfil) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Atención:</strong>
          <span className="block sm:inline"> No se encontró el perfil.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
        <div className="p-8">
          <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
            Perfil de Usuario
          </div>
          <div className="mt-4">
            <p className="text-gray-600">
              <span className="font-semibold">ID de Telegram:</span> {perfil.telegram_id}
            </p>
            <p className="text-gray-600">
              <span className="font-semibold">Wallet:</span> {perfil.wallet}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
