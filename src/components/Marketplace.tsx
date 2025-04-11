// src/pages/Marketplace.tsx
import { useEffect, useState } from "react";
import axios from "axios";

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  created_at: string;
  usuario_id: number;
}

const tg = window.Telegram.WebApp;
const user = tg.initDataUnsafe?.user;
const initData = tg.initData;

export default function Marketplace() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/products/`, {
          headers: {
            "Content-Type": "application/json",
            "X-Telegram-Init-Data": initData,
          },
        });
        const data = res.data as Producto[];
        const propios = user?.id;
        const filtrados = propios
          ? data.filter((p) => p.usuario_id !== propios)
          : data;
        setProductos(filtrados);
      } catch (err) {
        console.error(err);
        setError("Error al cargar los productos.");
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);

  if (error) return <p className="text-red-500">{error}</p>;
  if (loading) return <p className="text-gray-500">Cargando productos...</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Marketplace</h2>
      <ul className="space-y-4">
        {productos.map((p) => (
          <li key={p.id} className="bg-white border rounded p-4 shadow">
            <div className="flex justify-between">
              <h3 className="text-lg font-bold">{p.nombre}</h3>
              <span className="text-green-600 font-semibold">{p.precio} MNT</span>
            </div>
            <p className="text-gray-600">{p.descripcion}</p>
            <button
              className="mt-2 px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => handleComprar(p.id)}
            >
              Comprar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  async function handleComprar(productoId: number) {
    try {
      if (!user?.id) {
        alert("Sesión de Telegram no detectada");
        return;
      }

      await axios.post(`${import.meta.env.VITE_API_URL}/compras/`, {
        producto_id: productoId,
        comprador_id: user.id,
      }, {
        headers: {
          "Content-Type": "application/json",
          "X-Telegram-Init-Data": initData,
        },
      });

      alert("¡Compra realizada con éxito!");
    } catch (err) {
      console.error(err);
      alert("No se pudo realizar la compra.");
    }
  }
}
