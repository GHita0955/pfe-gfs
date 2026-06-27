import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { servicesAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Button from '../components/Button'

export default function Home() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    servicesAPI.getAll()
      .then(res => setServices(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))

    const t = setTimeout(() => setMounted(true), 80)
    return () => clearTimeout(t)
  }, [])

  const handleBook = (serviceId) => navigate(user ? `/book/${serviceId}` : '/login')
  const firstService = services[0]

  return (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-black text-white">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://plus.unsplash.com/premium_photo-1661883237884-263e8de8869b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmVzdGF1cmFudHxlbnwwfHwwfHx8MA%3D%3D')",
        }}
      />
      <div className="absolute inset-0 bg-black/45" />
      <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-black via-black/85 to-black/10 md:w-[68%]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.06)_0_1px,transparent_1px_100%)] bg-[length:72px_100%] opacity-20" />

      <div
        className={`relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl flex-col px-7 py-6 transition-all duration-700 sm:px-12 md:px-16 lg:px-20 ${
          mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}
      >
        <div className="flex flex-1 items-center">
          <div className="max-w-xl pt-16 text-left sm:pt-10">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-gold">
                Fresh restaurant
              </p>

              <h1 className="font-serif text-4xl font-bold leading-tight text-white drop-shadow-2xl sm:text-5xl lg:text-6xl">
                Perfect Ambience & Best Quality Food
              </h1>

              <p className="mt-5 max-w-md text-sm leading-7 text-white/70 sm:text-base">
                Satisfy your cravings by getting the best quality food from us and enjoy it with your beloved ones.
                Reserve your table and have a best experience in our place.
              </p>

              <div className="mt-6 rounded-xl border border-gold/45 bg-black/55 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-gold">SOUKAINA - modules actifs</p>
                <p className="mt-2 text-sm leading-6 text-white/80">
                  Tarification dynamique, recherche, QR Code, PDF, statistiques et chatbot sont branches.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    className="rounded-lg border border-gold/40 bg-gold/15 px-3 py-2 text-xs font-semibold text-gold hover:bg-gold/25"
                    onClick={() => firstService && handleBook(firstService.id)}
                    disabled={loading || !firstService}
                  >
                    Tester consultation
                  </button>
                  <button
                    className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:border-gold/40 hover:text-gold"
                    onClick={() => navigate('/reservations')}
                  >
                    Consultation reservations
                  </button>
                  <button
                    className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:border-gold/40 hover:text-gold"
                    onClick={() => navigate('/admin/dashboard')}
                  >
                    Dashboard admin
                  </button>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={() => firstService && handleBook(firstService.id)}
                  disabled={loading || !firstService}
                  className="w-full sm:w-auto"
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L13.586 11H4a1 1 0 110-2h9.586l-3.293-3.293a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  }
                >
                  {loading ? 'Loading...' : firstService ? 'Explore More' : 'Coming Soon'}
                </Button>

                <Button onClick={() => navigate('/menu')} variant="secondary" className="w-full sm:w-auto" icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}>
                  View Menu
                </Button>
              </div>
          </div>
        </div>
      </div>
    </section>
  )
}
