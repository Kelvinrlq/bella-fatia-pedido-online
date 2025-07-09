
import React, { useState, useRef } from 'react';
import { Camera, User, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useProfile } from '@/hooks/use-profile';

const ProfileEdit: React.FC = () => {
  const { profile, loading, updating, updateProfile, uploadProfilePhoto } = useProfile();
  const [username, setUsername] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (profile) {
      setUsername(profile.username || '');
    }
  }, [profile]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (file) {
      const photoUrl = await uploadProfilePhoto(file);
      if (photoUrl) {
        setPreviewUrl(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  const handleUsernameUpdate = async () => {
    if (username.trim() !== profile?.username) {
      await updateProfile({ username: username.trim() });
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-pizza" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-pizza-contrast">Meu Perfil</CardTitle>
          <CardDescription>
            Personalize sua experiência no Bella Fatia
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Foto de Perfil */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="w-32 h-32 border-4 border-pizza/20">
                <AvatarImage 
                  src={previewUrl || profile?.profile_photo_url || undefined} 
                  alt="Foto de perfil"
                />
                <AvatarFallback className="bg-pizza/10 text-pizza text-2xl">
                  {profile?.username?.[0]?.toUpperCase() || 
                   profile?.email?.[0]?.toUpperCase() || 
                   <User className="w-12 h-12" />}
                </AvatarFallback>
              </Avatar>
              <Button
                onClick={handleCameraClick}
                size="sm"
                className="absolute bottom-0 right-0 rounded-full w-10 h-10 p-0 bg-pizza hover:bg-pizza-dark shadow-lg"
                disabled={updating}
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {previewUrl && (
              <div className="flex gap-2">
                <Button
                  onClick={handlePhotoUpload}
                  disabled={updating}
                  className="bg-pizza hover:bg-pizza-dark"
                >
                  {updating ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Salvar Foto
                </Button>
                <Button
                  onClick={() => {
                    setPreviewUrl(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  variant="outline"
                  disabled={updating}
                >
                  Cancelar
                </Button>
              </div>
            )}
          </div>

          {/* Nome de Usuário */}
          <div className="space-y-2">
            <Label htmlFor="username" className="text-pizza-contrast font-medium">
              Nome de Usuário
            </Label>
            <div className="flex gap-2">
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Digite seu nome de usuário"
                className="flex-1 focus:border-pizza focus:ring-pizza"
                disabled={updating}
              />
              <Button
                onClick={handleUsernameUpdate}
                disabled={updating || username.trim() === profile?.username}
                className="bg-pizza hover:bg-pizza-dark"
              >
                {updating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Email (somente leitura) */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-pizza-contrast font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={profile?.email || ''}
              disabled
              className="bg-gray-50 text-gray-500"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileEdit;
