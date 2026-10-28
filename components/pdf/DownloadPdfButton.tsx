'use client';

import React, { useEffect, useState } from 'react';
import { BudgetPdfTemplate } from './BudgetPdfTemplate';
import { Budget, Profile } from '@/types/budget';

interface DownloadPdfButtonProps {
  budget: Budget;
  profile: Profile;
}

export const DownloadPdfButton: React.FC<DownloadPdfButtonProps> = ({ budget, profile }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <button disabled style={buttonStyle}>Preparando PDF...</button>;
  }

  // Importación dinámica limpia para Next.js
  const { PDFDownloadLink } = require('@react-pdf/renderer');

  return (
    <PDFDownloadLink
      document={<BudgetPdfTemplate budget={budget} profile={profile} />}
      fileName={`Presupuesto_${budget.numero_presupuesto}.pdf`}
      style={{ textDecoration: 'none', width: '100%' }}
    >
      {({ loading }: { loading: boolean }) => (
        <button type="button" style={buttonStyle}>
          {loading ? 'Generando PDF...' : '📥 Descargar PDF'}
        </button>
      )}
    </PDFDownloadLink>
  );
};

const buttonStyle: React.CSSProperties = {
  backgroundColor: '#2563eb',
  color: 'white',
  fontWeight: 'bold',
  padding: '12px 20px',
  borderRadius: '6px',
  border: 'none',
  cursor: 'pointer',
  width: '100%',
  fontSize: '15px',
  textAlign: 'center',
  display: 'block',
};