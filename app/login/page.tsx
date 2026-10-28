'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { BudgetForm } from '@/components/forms/BudgetForm';
import { DownloadPdfButton } from '@/components/pdf/DownloadPdfButton';
import { Profile, Budget } from '@/types/budget';

export default function HomePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ultimoBudget, setUltimoBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadUserData() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      } else {
        setProfile({
          id: user.id,
          nombre_comercial: 'Mi Empresa',
          nombre_contacto: '',
          telefono: '',
          email: user.email || '',
          cuit_dni: '',
          alias_cbu: '',
          condiciones_defecto: 'Válido hasta 15 días desde la fecha de emisión. La cotización no incluye materiales.',
          moneda: 'ARS',
          created_at: new Date().toISOString(),
        });
      }
      setLoading(false);
    }

    loadUserData();
  }, [router, supabase]);

  const handleSaveBudget = async (budget: Budget) => {
    if (!profile) return { success: false };

    await supabase.from('profiles').upsert({
      id: profile.id,
      nombre_comercial: profile.nombre_comercial,
      telefono: profile.telefono,
      alias_cbu: profile.alias_cbu,
      email: profile.email,
    });

    const { data, error } = await supabase.from('budgets').insert([
      {
        user_id: profile.id,
        numero_presupuesto: budget.numero_presupuesto,
        cliente_nombre: budget.cliente_nombre,
        cliente_telefono: budget.cliente_telefono,
        cliente_direccion: budget.cliente_direccion,
        items: budget.items,
        subtotal: budget.subtotal,
        descuento: budget.descuento,
        total: budget.total,
        notas_condiciones: budget.notas_condiciones,
        estado: 'borrador',
      }
    ]).select();

    if (error) {
      console.error('Error al guardar presupuesto:', error);
      return { success: false };
    }

    const savedBudget = { ...budget, id: data[0]?.id };
    setUltimoBudget(savedBudget); // Guardamos para habilitar el PDF al instante
    return { success: true, id: data[0]?.id };
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Cargando cotizador...</div>;
  }

  return (
    <main style={{ maxWidth: '850px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span style={{ fontSize: '14px', color: '#4b5563' }}>
          Sesión iniciada: <b>{profile?.email}</b>
        </span>
        <button 
          onClick={handleSignOut}
          style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
        >
          Cerrar Sesión
        </button>
      </div>

      {profile && (
        <BudgetForm
          profile={profile}
          catalog={[]}
          onSave={handleSaveBudget}
        />
      )}

      {/* Si ya se guardó un presupuesto en esta sesión, mostramos el botón de descarga */}
      {ultimoBudget && profile && (
        <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#ecfdf5', border: '1px solid #10b981', borderRadius: '8px', textAlign: 'center' }}>
          <p style={{ color: '#065f46', marginBottom: '10px', fontWeight: 'bold' }}>¡Presupuesto listo para descargar y enviar por WhatsApp!</p>
          <DownloadPdfButton budget={ultimoBudget} profile={profile} />
        </div>
      )}
    </main>
  );
}