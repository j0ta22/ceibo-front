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
  const [error, setError] = useState("");
  const [editando, setEditando] = useState<Producto | null>(null);
  const [nuevoProducto, setNuevoProducto] = useState<Producto>({
    id: 0,
    nombre: "",
    descripcion: "",
    precio: 0,
  });

  const cargarPerfil = async () => {
    try {
      console.log('Iniciando carga de perfil...');
      console.log('Telegram ID:', user?.id);
      console.log('Init Data:', initData);
      console.log('API URL:', import.meta.env.VITE_API_URL);

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
          // El servidor respondió con un código de estado fuera del rango 2xx
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
          // La petición fue hecha pero no se recibió respuesta
          console.error('Error de red:', err.request);
          setError("Error de conexión. Por favor, verifica tu conexión a internet.");
        } else {
          // Algo pasó en la configuración de la petición
          console.error('Error de configuración:', err.message);
          setError("Error al configurar la petición. Por favor, intenta nuevamente.");
        }
      } else {
        console.error('Error no relacionado con Axios:', err);
        setError("Error desconocido al cargar el perfil.");
      }
    }
  };

  useEffect(() => {
    if (user?.id && initData) {
      cargarPerfil();
    } else {
      console.log('Faltan datos de usuario o initData');
      setError("No se detectó sesión de Telegram.");
    }
  }, []);

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

  if (error) return <p className="text-red-500">{error}</p>;
  if (!perfil) return <p>Cargando perfil...</p>;

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-2">Hola @{perfil.username}</h2>
      
      <UpdateWallet
        telegramId={perfil.telegram_id}
        currentWallet={perfil.wallet}
        onWalletUpdated={cargarPerfil}
      />

      <h3 className="text-xl font-semibold mb-2 mt-4">Tus productos:</h3>
      <ul className="space-y-4">
        {perfil.productos.map((p) => (
          <li
            key={p.id}
            className="p-4 border rounded shadow-sm bg-white flex justify-between items-start"
          >
            <div>
              <h4 className="font-bold text-lg">{p.nombre}</h4>
              <p className="text-sm">{p.descripcion}</p>
              <p className="mt-1 text-green-600 font-semibold">{p.precio} MNT</p>
            </div>
            <div className="flex flex-col gap-1 ml-4">
              <button
                onClick={() => handleEditarClick(p)}
                className="text-blue-500 hover:underline text-sm"
              >
                Editar
              </button>
              <button
                onClick={() => handleEliminarProducto(p.id)}
                className="text-red-500 hover:underline text-sm"
              >
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>
      <FormCrearProducto
        telegramId={perfil.telegram_id}
        onProductoCreado={cargarPerfil}
      />

      {editando && (
        <div className="mt-6 p-4 border rounded bg-gray-100">
          <h4 className="font-semibold mb-2">Editando: {editando.nombre}</h4>
          <form onSubmit={handleEditarProducto} className="space-y-2">
            <input
              type="text"
              value={nuevoProducto.nombre}
              onChange={(e) =>
                setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })
              }
              className="w-full p-2 border rounded"
              placeholder="Nombre"
              required
            />
            <textarea
              value={nuevoProducto.descripcion}
              onChange={(e) =>
                setNuevoProducto({
                  ...nuevoProducto,
                  descripcion: e.target.value,
                })
              }
              className="w-full p-2 border rounded"
              placeholder="Descripción"
              required
            />
            <input
              type="number"
              value={nuevoProducto.precio}
              onChange={(e) =>
                setNuevoProducto({
                  ...nuevoProducto,
                  precio: parseFloat(e.target.value),
                })
              }
              className="w-full p-2 border rounded"
              placeholder="Precio"
              required
            />
            <div className="flex gap-2 mt-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={() => setEditando(null)}
                className="text-red-500"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
