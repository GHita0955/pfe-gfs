import { createContext, useContext, useState, useCallback } from 'react'

const ConfirmContext = createContext()

export function ConfirmProvider({ children }) {
  const [modal, setModal] = useState(null)

  const confirm = useCallback(({ title, message, danger = false }) => {
    return new Promise(resolve => {
      setModal({ title, message, danger, resolve })
    })
  }, [])

  const handleClose = (result) => {
    modal?.resolve(result)
    setModal(null)
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {modal && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => handleClose(false)} />
          <div className="relative card-dark max-w-sm w-full animate-slide-up">
            <h3 className="text-white font-bold text-lg mb-2">{modal.title}</h3>
            <p className="text-gray-400 text-sm mb-6">{modal.message}</p>
            <div className="flex gap-3 justify-end">
              <button
                className="btn-ghost text-sm"
                onClick={() => handleClose(false)}
              >
                Annuler
              </button>
              <button
                className={modal.danger ? 'px-5 py-2 rounded-lg text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors' : 'btn-gold text-sm'}
                onClick={() => handleClose(true)}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  return useContext(ConfirmContext)
}
