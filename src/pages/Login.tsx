
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      console.log('User logged in, redirecting to home');
      navigate('/');
    }
  }, [user, navigate]);

  const getErrorMessage = (error: any) => {
    if (!error) return 'Erro desconhecido';
    
    const message = error.message || '';
    
    if (message.includes('Invalid login credentials')) {
      return 'Email ou senha incorretos. Verifique seus dados e tente novamente.';
    }
    
    if (message.includes('Email not confirmed')) {
      return 'Você precisa confirmar seu email antes de fazer login. Verifique sua caixa de entrada.';
    }
    
    if (message.includes('Too many requests')) {
      return 'Muitas tentativas de login. Aguarde alguns minutos e tente novamente.';
    }
    
    if (message.includes('User not found')) {
      return 'Usuário não encontrado. Verifique se você já criou uma conta.';
    }

    return 'Erro ao fazer login. Tente novamente ou entre em contato conosco.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    console.log('Login form submitted with:', { email });

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        console.error('Login error:', error);
        toast({
          title: "Erro no login",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      } else {
        console.log('Login successful');
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo de volta à Bella Fatia!",
        });
        // Navigation will be handled by useEffect when user state changes
      }
    } catch (error) {
      console.error('Login catch error:', error);
      toast({
        title: "Erro no login",
        description: "Erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <img 
            src="/lovable-uploads/4d863ce3-4852-436b-90e4-9a0516de9889.png" 
            alt="Bella Fatia Logo" 
            className="w-16 h-16"
          />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-pizza-contrast">
          <span className="text-pizza">Bella </span>Fatia
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Entre na sua conta
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </Label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="pl-10 focus:ring-pizza focus:border-pizza"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </Label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="pl-10 focus:ring-pizza focus:border-pizza"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-pizza hover:bg-pizza-dark text-white focus:ring-2 focus:ring-pizza focus:ring-offset-2"
                aria-label={isLoading ? "Fazendo login..." : "Entrar na conta"}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Não tem uma conta?{' '}
                <Link 
                  to="/cadastro" 
                  className="font-medium text-pizza hover:text-pizza-dark focus:ring-2 focus:ring-pizza focus:ring-offset-2 rounded-md px-1"
                >
                  Cadastre-se aqui
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
