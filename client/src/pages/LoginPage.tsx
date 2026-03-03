import { useState } from "react";
import { useLocation } from "wouter";
import { useAuthContext } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Globe, Eye, EyeOff, Mail, Lock, User, ArrowRight, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { login, register } = useAuthContext();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (mode === "register") {
        if (!formData.name.trim()) {
          setError("Informe seu nome completo.");
          setIsSubmitting(false);
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          setError("As senhas não coincidem.");
          setIsSubmitting(false);
          return;
        }
        const result = await register(formData.name, formData.email, formData.password);
        if (result.success) {
          toast.success("Conta criada com sucesso! Bem-vindo ao EventMap.");
          setLocation("/dashboard");
        } else {
          setError(result.error || "Erro ao criar conta.");
        }
      } else {
        const result = await login(formData.email, formData.password);
        if (result.success) {
          toast.success("Login realizado com sucesso!");
          setLocation("/dashboard");
        } else {
          setError(result.error || "Erro ao fazer login.");
        }
      }
    } catch {
      setError("Ocorreu um erro inesperado. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Painel esquerdo — Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1a1d2e] relative overflow-hidden flex-col justify-between p-12">
        {/* Decoração de fundo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500 rounded-full blur-3xl" />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Globe className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">EventMap</h1>
              <span className="text-xs text-blue-400 font-medium uppercase tracking-widest">
                Enterprise
              </span>
            </div>
          </div>
        </div>

        {/* Texto central */}
        <div className="relative z-10 space-y-6">
          <h2 className="text-4xl font-bold text-white leading-tight">
            Gerencie seus eventos<br />
            de forma inteligente
          </h2>
          <p className="text-white/60 text-lg max-w-md">
            Receba notificações personalizadas de eventos próximos, mudanças de lote e muito mais. Configure o raio de distância ideal para você.
          </p>
          <div className="flex gap-6 pt-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">10+</p>
              <p className="text-sm text-white/50">Eventos ativos</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">500K+</p>
              <p className="text-sm text-white/50">Ingressos vendidos</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">10</p>
              <p className="text-sm text-white/50">Cidades cobertas</p>
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div className="relative z-10">
          <p className="text-white/30 text-sm">
            &copy; 2024 EventMap Enterprise. Todos os direitos reservados.
          </p>
        </div>
      </div>

      {/* Painel direito — Formulário */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Logo mobile */}
          <div className="lg:hidden flex items-center gap-3 justify-center mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold">EventMap</span>
          </div>

          {/* Título */}
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tight">
              {mode === "login" ? "Bem-vindo de volta" : "Crie sua conta"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {mode === "login"
                ? "Faça login para acessar suas configurações de notificação"
                : "Cadastre-se para personalizar suas notificações de eventos"}
            </p>
          </div>

          {/* Erro */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === "register" && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Nome completo
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="João Silva"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="pl-10 h-11"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                E-mail
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="pl-10 h-11"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className="pl-10 pr-10 h-11"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {mode === "register" && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirmar senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Repita a senha"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                    className="pl-10 h-11"
                    required
                    minLength={6}
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 text-sm font-medium gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === "login" ? "Entrar" : "Criar conta"}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Alternar modo */}
          <div className="text-center text-sm">
            {mode === "login" ? (
              <p className="text-muted-foreground">
                Não tem uma conta?{" "}
                <button
                  onClick={() => {
                    setMode("register");
                    setError("");
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium underline-offset-4 hover:underline"
                >
                  Cadastre-se
                </button>
              </p>
            ) : (
              <p className="text-muted-foreground">
                Já tem uma conta?{" "}
                <button
                  onClick={() => {
                    setMode("login");
                    setError("");
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium underline-offset-4 hover:underline"
                >
                  Faça login
                </button>
              </p>
            )}
          </div>

          {/* Conta demo */}
          <div className="border-t border-border pt-5">
            <p className="text-xs text-center text-muted-foreground mb-3">
              Para testar rapidamente, use a conta demo:
            </p>
            <Button
              variant="outline"
              className="w-full h-10 text-sm"
              onClick={async () => {
                setIsSubmitting(true);
                // Criar conta demo se não existir, ou fazer login
                const demoEmail = "demo@eventmap.com";
                const demoPassword = "demo123";
                const demoName = "Demo User";

                let result = await login(demoEmail, demoPassword);
                if (!result.success) {
                  // Registrar conta demo
                  result = await register(demoName, demoEmail, demoPassword);
                }
                if (result.success) {
                  toast.success("Login demo realizado!");
                  setLocation("/dashboard");
                }
                setIsSubmitting(false);
              }}
            >
              Entrar com conta demo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
