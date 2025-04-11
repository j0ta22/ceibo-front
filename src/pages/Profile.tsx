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
  username: string | null;
  wallet: string;
}

interface DebugInfo {
  message: string;
  type: 'info' | 'error' | 'success';
  timestamp: string;
}

// Configurar Axios globalmente
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Agregar interceptor para logs de todas las peticiones
axios.interceptors.request.use(request => {
  console.log('Iniciando petición:', {
    url: request.url,
    method: request.method,
    headers: request.headers,
    data: request.data
  });
  return request;
});

axios.interceptors.response.use(
  response => {
    console.log('Respuesta recibida:', {
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  error => {
    console.error('Error en la petición:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers
    });
    return Promise.reject(error);
  }
);

export default function Profile() {
  const [perfil, setPerfil] = useState<Usuario | null>(null);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [debugLogs, setDebugLogs] = useState<DebugInfo[]>([]);

  const addDebugLog = (message: string, type: 'info' | 'error' | 'success' = 'info') => {
    setDebugLogs(prev => [...prev, {
      message,
      type,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  // Obtener datos de Telegram
  const webApp = window.Telegram?.WebApp;
  const user = webApp?.initDataUnsafe?.user;
  const initData = webApp?.initData;

  console.log('=== Datos de Telegram ===');
  console.log('WebApp disponible:', !!webApp);
  console.log('Usuario:', user);
  console.log('InitData:', initData);
  console.log('=== Fin Datos de Telegram ===');

  const cargarPerfil = async (): Promise<void> => {
    try {
      setIsLoading(true);
      addDebugLog('=== Iniciando carga del perfil ===', 'info');
      
      if (!webApp) {
        addDebugLog('Telegram WebApp no está disponible', 'error');
        setError("No se detectó la aplicación de Telegram.");
        return;
      }

      if (!user?.id) {
        addDebugLog('No se encontró el ID de usuario de Telegram', 'error');
        setError("No se detectó sesión de Telegram.");
        return;
      }

      if (!initData) {
        addDebugLog('No se encontró initData de Telegram', 'error');
        setError("No se detectaron datos de inicialización de Telegram.");
        return;
      }

      addDebugLog(`ID de usuario: ${user.id}`, 'info');
      addDebugLog(`API URL: ${import.meta.env.VITE_API_URL}`, 'info');

      // Verificar conexión con la API
      try {
        addDebugLog('Realizando test de conexión...', 'info');
        const testResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/users/health`,
          {
            headers: {
              "X-Telegram-Init-Data": initData,
            },
          }
        );
        addDebugLog('Test de conexión exitoso', 'success');
      } catch (testError) {
        addDebugLog('Error en test de conexión', 'error');
        if (axios.isAxiosError(testError)) {
          if (testError.response) {
            addDebugLog(`Error ${testError.response.status}: ${JSON.stringify(testError.response.data)}`, 'error');
          } else if (testError.request) {
            addDebugLog('Error de red: No se recibió respuesta del servidor', 'error');
          }
        }
        setError("No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet.");
        return;
      }

      addDebugLog('Realizando petición a la API...', 'info');
      const res = await axios.get<Usuario>(
        `${import.meta.env.VITE_API_URL}/users/telegram/${user.id}`,
        {
          headers: {
            "X-Telegram-Init-Data": initData,
          },
        }
      );

      addDebugLog('Respuesta de la API recibida', 'success');
      
      if (!res.data) {
        addDebugLog('La respuesta de la API está vacía', 'error');
        setError("No se pudieron obtener los datos del perfil.");
        return;
      }

      setPerfil(res.data);
      setError("");
      addDebugLog('Perfil cargado exitosamente', 'success');
    } catch (err) {
      addDebugLog('Error al cargar el perfil', 'error');
      
      if (axios.isAxiosError(err)) {
        if (err.response) {
          addDebugLog(`Error ${err.response.status}: ${JSON.stringify(err.response.data)}`, 'error');
          
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
          addDebugLog('Error de red: No se recibió respuesta del servidor', 'error');
          setError("Error de conexión. Por favor, verifica tu conexión a internet.");
        } else {
          addDebugLog(`Error de configuración: ${err.message}`, 'error');
          setError("Error al configurar la petición. Por favor, intenta nuevamente.");
        }
      } else {
        addDebugLog('Error desconocido al cargar el perfil', 'error');
        setError("Error desconocido al cargar el perfil.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void cargarPerfil();
  }, [webApp, user, initData]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <div className="mt-4 text-gray-600">Cargando perfil...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
        <div className="p-8">
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}

          {perfil ? (
            <>
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
            </>
          ) : (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
              <strong className="font-bold">Atención:</strong>
              <span className="block sm:inline"> No se encontró el perfil.</span>
            </div>
          )}

          {/* Panel de depuración */}
          <div className="mt-8">
            <div className="text-sm font-semibold text-gray-700 mb-2">Logs de depuración:</div>
            <div className="max-h-60 overflow-y-auto bg-gray-50 p-2 rounded">
              {debugLogs.map((log, index) => (
                <div key={index} className={`text-xs mb-1 ${log.type === 'error' ? 'text-red-600' : log.type === 'success' ? 'text-green-600' : 'text-gray-600'}`}>
                  [{log.timestamp}] {log.message}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
