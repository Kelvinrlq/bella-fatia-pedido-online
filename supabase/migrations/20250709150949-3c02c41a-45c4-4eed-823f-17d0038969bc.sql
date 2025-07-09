
-- Criar bucket para armazenar fotos de perfil
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-photos', 'profile-photos', true);

-- Política para permitir que usuários vejam todas as fotos (bucket público)
CREATE POLICY "Anyone can view profile photos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'profile-photos');

-- Política para permitir que usuários façam upload de suas próprias fotos
CREATE POLICY "Users can upload their own profile photos" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'profile-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para permitir que usuários atualizem suas próprias fotos
CREATE POLICY "Users can update their own profile photos" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'profile-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para permitir que usuários deletem suas próprias fotos
CREATE POLICY "Users can delete their own profile photos" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'profile-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Adicionar campos para nome de usuário e foto de perfil na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN username TEXT,
ADD COLUMN profile_photo_url TEXT;

-- Criar índice para melhorar performance de busca por username
CREATE INDEX idx_profiles_username ON public.profiles(username);
