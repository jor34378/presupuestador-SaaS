-- Habilitar extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA PROFILES
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre_comercial TEXT NOT NULL,
    nombre_contacto TEXT NOT NULL,
    telefono TEXT NOT NULL,
    email TEXT NOT NULL,
    logo_url TEXT,
    cuit_dni TEXT NOT NULL,
    alias_cbu TEXT NOT NULL,
    condiciones_defecto TEXT DEFAULT 'Validez de la oferta: 10 días. 50% de anticipo para iniciar el trabajo.',
    moneda TEXT DEFAULT 'ARS' CHECK (moneda IN ('ARS', 'USD', 'EUR')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABLA ITEM_CATALOG
CREATE TABLE public.item_catalog (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    precio_sugerido NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (precio_sugerido >= 0),
    unidad TEXT NOT NULL DEFAULT 'global',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABLA BUDGETS
CREATE TABLE public.budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    numero_presupuesto TEXT NOT NULL,
    cliente_nombre TEXT NOT NULL,
    cliente_telefono TEXT NOT NULL,
    cliente_direccion TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (subtotal >= 0),
    descuento NUMERIC(12, 2) DEFAULT 0.00 CHECK (descuento >= 0),
    total NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (total >= 0),
    estado TEXT NOT NULL DEFAULT 'borrador' CHECK (estado IN ('borrador', 'enviado', 'aprobado', 'rechazado')),
    notas_condiciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- INDICES PARA MEJORAR PERFORMANCES
CREATE INDEX idx_item_catalog_user_id ON public.item_catalog(user_id);
CREATE INDEX idx_budgets_user_id ON public.budgets(user_id);
CREATE INDEX idx_budgets_created_at ON public.budgets(created_at DESC);

-- HABILITAR ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS DE SEGURIDAD PARA PROFILES
CREATE POLICY "Usuarios pueden ver su propio perfil" 
    ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuarios pueden actualizar su propio perfil" 
    ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Usuarios pueden insertar su propio perfil" 
    ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- POLÍTICAS DE SEGURIDAD PARA ITEM_CATALOG
CREATE POLICY "Usuarios pueden ver su catálogo" 
    ON public.item_catalog FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden insertar en su catálogo" 
    ON public.item_catalog FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden actualizar su catálogo" 
    ON public.item_catalog FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden borrar de su catálogo" 
    ON public.item_catalog FOR DELETE USING (auth.uid() = user_id);

-- POLÍTICAS DE SEGURIDAD PARA BUDGETS
CREATE POLICY "Usuarios pueden ver sus presupuestos" 
    ON public.budgets FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden crear presupuestos" 
    ON public.budgets FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden actualizar sus presupuestos" 
    ON public.budgets FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden eliminar sus presupuestos" 
    ON public.budgets FOR DELETE USING (auth.uid() = user_id);

-- TRIGGER AUTOMÁTICO PARA CREAR PROFILE AL REGISTRARSE
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nombre_comercial, nombre_contacto, telefono, email, cuit_dni, alias_cbu, moneda)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'nombre_comercial', 'Mi Empresa / Servicio'),
    COALESCE(new.raw_user_meta_data->>'nombre_contacto', 'Contacto Principal'),
    COALESCE(new.raw_user_meta_data->>'telefono', ''),
    new.email,
    '',
    '',
    'ARS'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();