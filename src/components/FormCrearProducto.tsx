import { useState } from "react";
import axios from "axios";

interface Props {
  telegramId: number;
  onProductoCreado: () => void;
}

export default function FormCrearProducto({ telegramId, onProductoCreado }: Props) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState<number>(0);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError("");

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/products/`, {
        nombre,
        descripcion,
        precio,
        usuario_id: telegramId,
      });

      setNombre("");
      setDescripcion("");
      setPrecio(0);
      onProductoCreado();
    } catch (err) {
      setError("Hubo un error al crear el producto.");
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="mt-6 p-4 bg-white border rounded shadow">
      <h3 className="text-lg font-semibold mb-2">Crear nuevo producto</h3>
      <form onSubmit={handleCrear} className="space-y-2">
        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <textarea
          placeholder="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="number"
          placeholder="Precio en MNT"
          value={precio}
          onChange={(e) => setPrecio(parseFloat(e.target.value))}
          className="w-full p-2 border rounded"
          step="0.01"
          min="0"
          required
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={cargando}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          {cargando ? "Creando..." : "Crear producto"}
        </button>
      </form>
    </div>
  );
}
