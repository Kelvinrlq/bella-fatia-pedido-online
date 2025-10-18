import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Mail, CheckCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ConfirmacaoEmailProps {
  email?: string;
}

const ConfirmacaoEmail: React.FC<ConfirmacaoEmailProps> = ({ email }) => {
  const [isResending, setIsResending] = useState(false);
  const { toast } = useToast();

  const handleResendEmail = async () => {
    if (!email) {
      toast({
        title: "Email não encontrado",
        description: "Por favor, faça o cadastro novamente.",
        variant: "destructive",
      });
      return;
    }

    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Email reenviado!",
        description: "Verifique sua caixa de entrada e spam.",
      });
    } catch (error: any) {
      console.error('Erro ao reenviar email:', error);
      toast({
        title: "Erro ao reenviar email",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-pizza rounded-full flex items-center justify-center">
            <Mail className="w-10 h-10 text-white" />
          </div>
        </div>
        
        <h2 className="mt-6 text-center text-3xl font-bold text-pizza-contrast">
          Confirme seu email
        </h2>
        
        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center space-y-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Conta criada com sucesso!
              </h3>
              <p className="text-gray-600">
                Enviamos um email de confirmação para:
              </p>
              {email && (
                <p className="text-pizza font-semibold mt-2">
                  {email}
                </p>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
              <h4 className="font-semibold text-blue-900 mb-2">
                Próximos passos:
              </h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                <li>Verifique sua caixa de entrada</li>
                <li>Clique no link de confirmação no email</li>
                <li>Após confirmar, faça login no site</li>
              </ol>
            </div>

            <div className="text-sm text-gray-500">
              <p>Não recebeu o email?</p>
              <p className="mt-1">Verifique sua caixa de spam ou</p>
            </div>

            <Button
              onClick={handleResendEmail}
              disabled={isResending}
              variant="outline"
              className="w-full border-pizza text-pizza hover:bg-pizza hover:text-white"
            >
              {isResending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Reenviando...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reenviar email de confirmação
                </>
              )}
            </Button>

            <div className="pt-4 border-t">
              <Link to="/login">
                <Button className="w-full bg-pizza hover:bg-pizza-dark text-white">
                  Ir para Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmacaoEmail;
