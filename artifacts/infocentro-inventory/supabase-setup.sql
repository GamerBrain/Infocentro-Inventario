-- =============================================
-- CONFIGURACIÓN DE SUPABASE - INFOINVENTARIO
-- =============================================
-- Ejecuta este script en el SQL Editor de Supabase
-- (Dashboard → SQL Editor → New Query)
-- =============================================

-- 1. Tabla de perfiles de usuarios
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de inventario
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  item_type TEXT NOT NULL,
  serial TEXT NOT NULL UNIQUE,
  description TEXT,
  condition TEXT NOT NULL DEFAULT 'Bueno',
  location TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. Trigger para inventory_items
DROP TRIGGER IF EXISTS update_inventory_items_updated_at ON public.inventory_items;
CREATE TRIGGER update_inventory_items_updated_at
  BEFORE UPDATE ON public.inventory_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. Función para crear perfil al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Trigger para crear perfil automáticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
DROP POLICY IF EXISTS "Usuarios pueden ver todos los perfiles" ON public.profiles;
CREATE POLICY "Usuarios pueden ver todos los perfiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON public.profiles;
CREATE POLICY "Usuarios pueden actualizar su propio perfil"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins pueden actualizar cualquier perfil" ON public.profiles;
CREATE POLICY "Admins pueden actualizar cualquier perfil"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Insertar perfil propio" ON public.profiles;
CREATE POLICY "Insertar perfil propio"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Políticas para inventory_items
DROP POLICY IF EXISTS "Todos los autenticados pueden ver inventario" ON public.inventory_items;
CREATE POLICY "Todos los autenticados pueden ver inventario"
  ON public.inventory_items FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Autenticados pueden insertar objetos" ON public.inventory_items;
CREATE POLICY "Autenticados pueden insertar objetos"
  ON public.inventory_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Autenticados pueden actualizar objetos" ON public.inventory_items;
CREATE POLICY "Autenticados pueden actualizar objetos"
  ON public.inventory_items FOR UPDATE
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Solo admins pueden eliminar objetos" ON public.inventory_items;
CREATE POLICY "Solo admins pueden eliminar objetos"
  ON public.inventory_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================
-- PARA DAR ROL DE ADMIN A UN USUARIO:
-- =============================================
-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE email = 'correo_del_jefe@ejemplo.com';
-- =============================================
