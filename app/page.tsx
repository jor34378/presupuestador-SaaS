'use client';

import React, { useState, useEffect } from 'react';
import { BudgetForm } from '@/components/forms/BudgetForm';
import { Profile, CatalogItem, Budget } from '@/types/budget';

const mockProfile: Profile = {
  id: 'usr_123',
  nombre_comercial: 'Servicios Eléctricos Iván',
  nombre_contacto: 'Iván Pérez',
  telefono: '5491122334455',
  email: 'contacto@servicioselectricosivan.com.ar',
  logo_url: null,
  cuit_dni: '20-38112233-4',
  alias_cbu: 'IVAN.ELECTRICISTA.CBU',
  condiciones_defecto: 'Validez 10 días. 50% de anticipo para iniciar el trabajo.',
  moneda: 'ARS',
  created_at: '2026-01-01T00:00:00.000Z',
};

const mockCatalog: CatalogItem[] = [
  {
    id: '1',
    user_id: 'usr_123',
    titulo: 'Instalación de Térmica y Disyuntor',
    descripcion: 'Incluye montaje en tablero y cableado base',
    precio_sugerido: 25000,
    unidad: 'global',
  },
  {
    id: '2',
    user_id: 'usr_123',
    titulo: 'Boca de Luz / Toma Corriente',
    descripcion: 'Cableado y colocación de módulo',
    precio_sugerido: 8500,
    unidad: 'unidad',
  },
];

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSaveBudget = async (budget: Budget) => {
    console.log('Presupuesto guardado:', budget);
    return { success: true, id: 'demo-123' };
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen py-8 px-4 bg-gray-50">
      <BudgetForm
        profile={mockProfile}
        catalog={mockCatalog}
        onSave={handleSaveBudget}
      />
    </main>
  );
}