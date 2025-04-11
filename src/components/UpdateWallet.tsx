import { useState } from 'react'
import axios from 'axios'

interface UpdateWalletProps {
  telegramId: number
  currentWallet: string
  onWalletUpdated: () => void
}

function UpdateWallet({ telegramId, currentWallet, onWalletUpdated }: UpdateWalletProps) {
  const [wallet, setWallet] = useState(currentWallet)
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState('')

  const handleUpdate = async () => {
    try {
      const tg = window.Telegram.WebApp
      const initData = tg.initData

      await axios.put(
        `${import.meta.env.VITE_API_URL}/users/${telegramId}/wallet`,
        { wallet },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Telegram-Init-Data': initData,
          },
        }
      )

      setIsEditing(false)
      onWalletUpdated()
    } catch (err) {
      setError('Error al actualizar la wallet')
      console.error(err)
    }
  }

  if (isEditing) {
    return (
      <div className="mt-2">
        <input
          type="text"
          value={wallet}
          onChange={(e) => setWallet(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Ingresa tu wallet"
        />
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleUpdate}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Guardar
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="text-red-500"
          >
            Cancelar
          </button>
        </div>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
    )
  }

  return (
    <div className="mt-2">
      <p className="text-sm">
        <strong>Wallet:</strong> {currentWallet || 'No asignada'}
      </p>
      <button
        onClick={() => setIsEditing(true)}
        className="text-blue-500 hover:underline text-sm mt-1"
      >
        Actualizar wallet
      </button>
    </div>
  )
}

export default UpdateWallet 