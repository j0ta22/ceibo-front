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
      console.log('Intentando cargar perfil para usuario:', user?.id);
      console.log('Init data:', initData);
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/users/telegram/${user?.id}`,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Telegram-Init-Data": initData,
          },
        }
      );
      console.log('Respuesta de la API:', res.data);
      setPerfil(res.data);
    } catch (err) {
      console.error('Error al cargar perfil:', err);
      if (axios.isAxiosError(err)) {
        console.error('Detalles del error:', {
          status: err.response?.status,
          data: err.response?.data,
          headers: err.response?.headers
        });
      }
      setError("No se pudo cargar el perfil.");
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
