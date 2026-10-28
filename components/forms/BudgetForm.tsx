'use client';

import React, { useState } from 'react';
import { Profile, CatalogItem, Budget, BudgetItem } from '@/types/budget';
import { DownloadPdfButton } from '@/components/pdf/DownloadPdfButton';
import styles from './BudgetForm.module.css';

interface BudgetFormProps {
  profile: Profile;
  catalog: CatalogItem[];
  onSave: (budget: Budget) => Promise<{ success: boolean; id?: string }>;
}

export const BudgetForm: React.FC<BudgetFormProps> = ({ profile, catalog, onSave }) => {
  // Datos del emisor (customizables)
  const [empresaNombre, setEmpresaNombre] = useState(profile.nombre_comercial || 'Servicios Eléctricos Iván');
  const [empresaTelefono, setEmpresaTelefono] = useState(profile.telefono || '5491122334455');
  const [empresaAlias, setEmpresaAlias] = useState(profile.alias_cbu || 'IVAN.ELECTRICISTA.CBU');

  // Datos del Cliente
  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteTelefono, setClienteTelefono] = useState('');
  const [clienteDireccion, setClienteDireccion] = useState('');
  const [clienteZona, setClienteZona] = useState('');
  
  const [numeroPresupuesto] = useState(`PRES-${Math.floor(1000 + Math.random() * 9000)}`);
  
  const [items, setItems] = useState<BudgetItem[]>([
    { id: '1', titulo: '', descripcion: '', cantidad: 1, precio_unitario: 0, subtotal: 0 }
  ]);
  
  const [notasCondiciones, setNotasCondiciones] = useState(profile.condiciones_defecto || '');
  const [descuento, setDescuento] = useState(0);
  const [descuentoMotivo, setDescuentoMotivo] = useState('');
  const [incluirIva, setIncluirIva] = useState(false);

  // Opciones con tilde
  const [incluyeValidez15, setIncluyeValidez15] = useState(true);
  const [noIncluyeMateriales, setNoIncluyeMateriales] = useState(true);

  // Estado para guardar el presupuesto ya creado y habilitar el PDF
  const [presupuestoGuardado, setPresupuestoGuardado] = useState<Budget | null>(null);

  // Fechas
  const fechaActual = new Date().toLocaleDateString('es-AR');
  const fechaVencimiento = new Date();
  fechaVencimiento.setDate(fechaVencimiento.getDate() + 15);
  const fechaVencimientoStr = fechaVencimiento.toLocaleDateString('es-AR');

  const handleAddItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), titulo: '', descripcion: '', cantidad: 1, precio_unitario: 0, subtotal: 0 }
    ]);
  };

  const handleItemChange = (index: number, field: keyof BudgetItem, value: any) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };
    
    if (field === 'cantidad' || field === 'precio_unitario') {
      item.subtotal = (Number(item.cantidad) || 0) * (Number(item.precio_unitario) || 0);
    }
    
    newItems[index] = item;
    setItems(newItems);
  };

  const subtotal = items.reduce((acc, curr) => acc + (curr.subtotal || 0), 0);
  const subtotalConDescuento = Math.max(0, subtotal - descuento);
  const montoIva = incluirIva ? subtotalConDescuento * 0.21 : 0;
  const total = subtotalConDescuento + montoIva;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clienteNombre.trim()) {
      alert('Por favor, ingresá el nombre del cliente.');
      return;
    }

    let notasFinales = notasCondiciones;
    if (incluyeValidez15) notasFinales += ` | Válido hasta: ${fechaVencimientoStr}.`;
    if (noIncluyeMateriales) notasFinales += ` | La cotización no incluye materiales.`;
    if (descuentoMotivo) notasFinales += ` | Descuento aplicado por: ${descuentoMotivo}.`;

    const nuevoPresupuesto: Budget = {
      id: '',
      user_id: profile.id,
      numero_presupuesto: numeroPresupuesto,
      cliente_nombre: clienteNombre,
      cliente_telefono: clienteTelefono,
      cliente_direccion: clienteZona ? `${clienteDireccion} (Zona: ${clienteZona})` : clienteDireccion,
      items: items,
      subtotal: subtotal,
      descuento: descuento,
      total: total,
      notas_condiciones: notasFinales,
      estado: 'borrador',
      created_at: new Date().toISOString(),
    };

    try {
      const resultado = await onSave(nuevoPresupuesto);
      if (resultado.success) {
        setPresupuestoGuardado({ ...nuevoPresupuesto, id: resultado.id || '' });
        alert('¡Presupuesto guardado con éxito en la base de datos!');
      } else {
        alert('Hubo un error al guardar el presupuesto.');
      }
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error inesperado al intentar guardar.');
    }
  };

  // Datos actualizados del emisor para el PDF en tiempo real
  const profileActualizado: Profile = {
    ...profile,
    nombre_comercial: empresaNombre,
    telefono: empresaTelefono,
    alias_cbu: empresaAlias,
  };

  return (
    <form onSubmit={handleSubmit} className={styles.container}>
      {/* Datos editables de tu Empresa / Prestador */}
      <div className={styles.card} style={{ backgroundColor: '#f8fafc', borderLeft: '4px solid #2563eb' }}>
        <h2 className={styles.sectionHeader}>Mis Datos (Emisor)</h2>
        <div className={styles.formRow}>
          <div className={styles.formGroup} style={{ flex: 1 }}>
            <label className={styles.label}>Nombre o Empresa</label>
            <input 
              className={styles.input} 
              type="text" 
              value={empresaNombre} 
              onChange={(e) => setEmpresaNombre(e.target.value)} 
            />
          </div>
          <div className={styles.formGroup} style={{ flex: 1 }}>
            <label className={styles.label}>WhatsApp / Teléfono</label>
            <input 
              className={styles.input} 
              type="text" 
              value={empresaTelefono} 
              onChange={(e) => setEmpresaTelefono(e.target.value)} 
            />
          </div>
        </div>
        <div className={styles.formGroup} style={{ marginTop: '8px' }}>
          <label className={styles.label}>Alias / CBU para cobros</label>
          <input 
            className={styles.input} 
            type="text" 
            value={empresaAlias} 
            onChange={(e) => setEmpresaAlias(e.target.value)} 
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '16px 0' }}>
        <div>
          <h1 className={styles.title}>Presupuesto {numeroPresupuesto}</h1>
          <p className={styles.subtitle}>Fecha de emisión: {fechaActual}</p>
        </div>
        {incluyeValidez15 && (
          <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '6px 12px', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold' }}>
            Válido hasta: {fechaVencimientoStr}
          </span>
        )}
      </div>

      {/* Datos del Cliente */}
      <div className={styles.card}>
        <h2 className={styles.sectionHeader}>Datos del Cliente</h2>
        <div className={styles.formGroup}>
          <label className={styles.label}>Nombre Completo *</label>
          <input 
            className={styles.input} 
            type="text" 
            placeholder="Ej: Juan Pérez" 
            value={clienteNombre} 
            onChange={(e) => setClienteNombre(e.target.value)} 
          />
        </div>
        <div className={styles.formRow}>
          <div className={styles.formGroup} style={{ flex: 1 }}>
            <label className={styles.label}>Teléfono (WhatsApp) *</label>
            <input 
              className={styles.input} 
              type="text" 
              placeholder="Ej: 5491122334455" 
              value={clienteTelefono} 
              onChange={(e) => setClienteTelefono(e.target.value)} 
            />
          </div>
          <div className={styles.formGroup} style={{ flex: 1 }}>
            <label className={styles.label}>Zona</label>
            <input 
              className={styles.input} 
              type="text" 
              placeholder="Ej: Caseros" 
              value={clienteZona} 
              onChange={(e) => setClienteZona(e.target.value)} 
            />
          </div>
        </div>
        <div className={styles.formGroup} style={{ marginTop: '10px' }}>
          <label className={styles.label}>Dirección (Opcional)</label>
          <input 
            className={styles.input} 
            type="text" 
            placeholder="Ej: Av. San Martín 1234" 
            value={clienteDireccion} 
            onChange={(e) => setClienteDireccion(e.target.value)} 
          />
        </div>
      </div>

      {/* Detalle de Trabajos */}
      <div className={styles.card}>
        <h2 className={styles.sectionHeader}>Detalle de trabajos</h2>
        {items.map((item, index) => (
          <div key={item.id} className={styles.itemCard}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Título del trabajo / servicio</label>
              <input 
                className={styles.input} 
                type="text" 
                placeholder="Ej: Instalación de cámaras" 
                value={item.titulo} 
                onChange={(e) => handleItemChange(index, 'titulo', e.target.value)} 
              />
            </div>
            <div className={styles.formRow}>
              <div style={{ flex: 1 }}>
                <label className={styles.label}>Cantidad</label>
                <input 
                  className={styles.input} 
                  type="number" 
                  placeholder="1" 
                  value={item.cantidad} 
                  onChange={(e) => handleItemChange(index, 'cantidad', Number(e.target.value))} 
                />
              </div>
              <div style={{ flex: 1 }}>
                <label className={styles.label}>Precio Unitario ($)</label>
                <input 
                  className={styles.input} 
                  type="number" 
                  placeholder="0.00" 
                  value={item.precio_unitario} 
                  onChange={(e) => handleItemChange(index, 'precio_unitario', Number(e.target.value))} 
                />
              </div>
            </div>
            <div className={styles.formGroup} style={{ marginTop: '8px' }}>
              <label className={styles.label}>Descripción Adicional</label>
              <textarea 
                className={styles.textarea} 
                placeholder="Detalles específicos..." 
                value={item.descripcion} 
                onChange={(e) => handleItemChange(index, 'descripcion', e.target.value)} 
              />
            </div>
          </div>
        ))}

        <button type="button" className={styles.btnSecondary} onClick={handleAddItem}>
          + Añadir concepto
        </button>

        {/* Totales */}
        <div className={styles.totalsBox}>
          <div className={styles.totalRow}>
            <span>Subtotal:</span>
            <span>${subtotal.toLocaleString('es-AR')}</span>
          </div>

          <div style={{ width: '100%', margin: '8px 0', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'flex-end' }}>
            <input 
              className={styles.input} 
              style={{ width: '180px' }} 
              type="text" 
              placeholder="Motivo del descuento" 
              value={descuentoMotivo}
              onChange={(e) => setDescuentoMotivo(e.target.value)}
            />
            <span style={{ fontSize: '13px' }}>Descuento ($):</span>
            <input 
              className={styles.input} 
              style={{ width: '90px', textAlign: 'right' }} 
              type="number" 
              value={descuento} 
              onChange={(e) => setDescuento(Number(e.target.value))} 
            />
          </div>

          <div style={{ width: '100%', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
            <label style={{ fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input 
                type="checkbox" 
                checked={incluirIva} 
                onChange={(e) => setIncluirIva(e.target.checked)} 
              />
              Sumar IVA (21%)
            </label>
            {incluirIva && <span style={{ fontSize: '13px', fontWeight: 'bold' }}>+${montoIva.toLocaleString('es-AR')}</span>}
          </div>

          <div className={`${styles.totalRow} ${styles.grandTotal}`}>
            <span>Total Final:</span>
            <span>${total.toLocaleString('es-AR')} ARS</span>
          </div>
        </div>
      </div>

      {/* Condiciones */}
      <div className={styles.card}>
        <h2 className={styles.sectionHeader}>Condiciones y Leyendas</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
          <label style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={incluyeValidez15} 
              onChange={(e) => setIncluyeValidez15(e.target.checked)} 
            />
            Válido hasta el {fechaVencimientoStr}
          </label>

          <label style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={noIncluyeMateriales} 
              onChange={(e) => setNoIncluyeMateriales(e.target.checked)} 
            />
            Aclarar que la cotización <b>no incluye materiales</b>
          </label>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Notas o aclaraciones adicionales</label>
          <textarea 
            className={styles.textarea} 
            value={notasCondiciones} 
            onChange={(e) => setNotasCondiciones(e.target.value)} 
          />
        </div>
      </div>

      <p style={{ fontSize: '11px', color: '#9ca3af', textAlign: 'center', marginBottom: '12px' }}>
        * Documento no válido como factura. Operación comercial en carácter de presupuesto.
      </p>

      {/* Botones de acción */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {!presupuestoGuardado ? (
          <button type="submit" className={styles.btnPrimary} style={{ width: '100%' }}>
            Guardar Presupuesto
          </button>
        ) : (
          <div style={{ padding: '16px', backgroundColor: '#ecfdf5', border: '1px solid #10b981', borderRadius: '8px', textAlign: 'center' }}>
            <p style={{ color: '#065f46', marginBottom: '10px', fontWeight: 'bold' }}>¡Guardado con éxito! Ya podés descargar el PDF:</p>
            <DownloadPdfButton budget={presupuestoGuardado} profile={profileActualizado} />
          </div>
        )}
      </div>
    </form>
  );
};