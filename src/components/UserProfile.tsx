import { useTelegramUser } from "../hooks/useTelegramUser";
import { useUsuarioPerfil } from "../hooks/useUsuarioPerfil";

const UserProfile = () => {
  const { telegramUser } = useTelegramUser();

  if (!telegramUser) {
    return (
      <div className="text-center text-red-500 mt-6">
        No se pudo obtener el usuario de Telegram.
      </div>
    );
  }

  const { id: telegramId } = telegramUser;
  const { perfil, loading, error } = useUsuarioPerfil(telegramId);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500 text-lg">Cargando perfil...</p>
      </div>
    );
  }

  if (error || !perfil) {
    return (
      <div className="text-center text-red-500 mt-6">
        {error || "Perfil no encontrado."}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8 bg-white rounded-2xl shadow-md p-6">
      <div className="flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-4 text-3xl">
          {perfil.username?.[0]?.toUpperCase() || "👤"}
        </div>

        <h2 className="text-xl font-semibold text-gray-800">
          @{perfil.username || "Sin nombre"}
        </h2>
        <p className="text-gray-600">Wallet: {perfil.wallet || "No asignada"}</p>

        <div className="mt-4 text-sm text-gray-700 space-y-1 w-full">
          <h3 className="text-lg font-semibold mb-2 text-center text-gray-900">
            Productos publicados
          </h3>
          {perfil.productos.length > 0 ? (
            <ul className="space-y-2">
              {perfil.productos.map((prod) => (
                <li
                  key={prod.id}
                  className="p-2 bg-gray-100 rounded-lg border text-sm"
                >
                  <strong>{prod.nombre}</strong> – ${prod.precio}
                  <p className="text-xs text-gray-500">{prod.descripcion}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500">No hay productos.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
