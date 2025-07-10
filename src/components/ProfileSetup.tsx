
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, User } from 'lucide-react';
import { useProfile } from '@/hooks/use-profile';
import { useToast } from '@/hooks/use-toast';

interface ProfileSetupProps {
  onComplete: () => void;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ onComplete }) => {
  const { profile, updateProfile, uploadProfilePhoto, updating } = useProfile();
  const { toast } = useToast();
  const [username, setUsername] = useState(profile?.username || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Erro",
          description: "A imagem deve ter no máximo 5MB",
          variant: "destructive",
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast({
          title: "Erro", 
          description: "Por favor, selecione apenas arquivos de imagem",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira um nome de usuário",
        variant: "destructive",
      });
      return;
    }

    try {
      // Upload photo if selected
      if (selectedFile) {
        await uploadProfilePhoto(selectedFile);
      }

      // Update username
      await updateProfile({ username: username.trim() });

      toast({
        title: "Perfil configurado!",
        description: "Bem-vindo à Bella Fatia!",
      });

      onComplete();
    } catch (error) {
      console.error('Error setting up profile:', error);
      toast({
        title: "Erro",
        description: "Erro ao configurar perfil. Tente novamente.",
        variant: "destructive",
      });
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
          Complete seu perfil para continuar
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Photo Section */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage 
                    src={previewUrl || profile?.profile_photo_url || undefined} 
                    alt="Foto de perfil"
                  />
                  <AvatarFallback className="bg-pizza/10 text-pizza text-2xl">
                    {username?.[0]?.toUpperCase() || <User className="w-8 h-8" />}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor="photo-upload"
                  className="absolute bottom-0 right-0 bg-pizza text-white rounded-full p-2 cursor-pointer hover:bg-pizza-dark transition-colors"
                >
                  <Camera className="w-4 h-4" />
                </label>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
              <p className="text-sm text-gray-500 text-center">
                Clique no ícone da câmera para adicionar uma foto
              </p>
            </div>

            {/* Username Field */}
            <div>
              <Label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Nome de usuário *
              </Label>
              <div className="mt-1">
                <Input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="focus:ring-pizza focus:border-pizza"
                  placeholder="Como você gostaria de ser chamado?"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Button
                type="submit"
                disabled={updating || !username.trim()}
                className="w-full bg-pizza hover:bg-pizza-dark text-white focus:ring-2 focus:ring-pizza focus:ring-offset-2"
              >
                {updating ? 'Configurando...' : 'Continuar para o Cardápio'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;
