import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowRight, Heart } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-6 h-6 text-blue-600" />
            <span className="font-bold text-lg">Agitaí</span>
          </div>
          <div className="flex gap-2">
            {isAuthenticated && (
              <Link href="/favorites">
                <Button variant="outline" className="gap-2">
                  <Heart className="w-4 h-4" />
                  Favoritos
                </Button>
              </Link>
            )}
            <Link href="/map">
              <Button className="gap-2">
                <MapPin className="w-4 h-4" />
                Mapa Interativo
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50 py-20 sm:py-32">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
                <span className="block text-gray-900">Descubra Eventos</span>
                <span className="block bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  em Todo o Brasil
                </span>
              </h1>
              <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
                Explore eventos de música, tecnologia, gastronomia, esportes e muito mais através de um mapa interativo. Encontre o que você procura em qualquer cidade do país.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/map">
                  <Button size="lg" className="gap-2 text-base">
                    <MapPin className="w-5 h-5" />
                    Explorar Mapa
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 sm:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Recursos Principais
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Tudo que você precisa para encontrar eventos incríveis
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="p-8 rounded-2xl border border-border bg-card hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Mapa Interativo
                </h3>
                <p className="text-gray-600">
                  Visualize todos os eventos em um mapa interativo do Brasil. Clique nos marcadores para obter mais detalhes.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-8 rounded-2xl border border-border bg-card hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Filtros Avançados
                </h3>
                <p className="text-gray-600">
                  Filtre eventos por cidade, categoria ou busque por nome. Encontre exatamente o que você procura.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-8 rounded-2xl border border-border bg-card hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Salve Favoritos
                </h3>
                <p className="text-gray-600">
                  Marque seus eventos favoritos e acesse-os facilmente depois. Crie sua lista personalizada de eventos.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-24 bg-gradient-to-r from-blue-600 to-blue-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Pronto para explorar?
            </h2>
            <p className="text-lg text-blue-100 mb-8">
              Acesse nosso mapa interativo e descubra eventos incríveis em todo o Brasil
            </p>
            <Link href="/map">
              <Button size="lg" variant="secondary" className="gap-2 text-base">
                <MapPin className="w-5 h-5" />
                Ir para o Mapa
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <span className="font-semibold">Agitaí</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Agitaí. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
