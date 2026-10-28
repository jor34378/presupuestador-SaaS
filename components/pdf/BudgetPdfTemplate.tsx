import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { Budget, Profile } from '@/types/budget';

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 10, fontFamily: 'Helvetica', color: '#1f2937' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#2563eb', paddingBottom: 10 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#1e3a8a' },
  subtitle: { fontSize: 9, color: '#4b5563', marginTop: 2 },
  section: { marginVertical: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  box: { width: '48%', padding: 10, backgroundColor: '#f8fafc', borderRadius: 4 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#1e3a8a', color: 'white', padding: 6, fontWeight: 'bold', borderRadius: 2 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', padding: 6 },
  totalBox: { alignSelf: 'flex-end', width: '45%', marginTop: 10, padding: 8, backgroundColor: '#f8fafc', borderRadius: 4 },
  footer: { position: 'absolute', bottom: 25, left: 30, right: 30, textAlign: 'center', fontSize: 8, color: '#9ca3af', borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 8 }
});

interface BudgetPdfProps {
  budget: Budget;
  profile: Profile;
}

export const BudgetPdfTemplate: React.FC<BudgetPdfProps> = ({ budget, profile }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Encabezado: Datos reales del Emisor */}
      <View style={styles.header}>
        <View style={{ width: '55%' }}>
          <Text style={styles.title}>{profile.nombre_comercial || 'Mi Empresa'}</Text>
          {profile.cuit_dni ? <Text style={styles.subtitle}>CUIT/DNI: {profile.cuit_dni}</Text> : null}
          <Text style={styles.subtitle}>Tel: {profile.telefono || '-'}</Text>
          <Text style={styles.subtitle}>Email: {profile.email || '-'}</Text>
        </View>
        <View style={{ width: '40%', alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#2563eb' }}>{budget.numero_presupuesto}</Text>
          <Text style={{ color: '#6b7280', marginTop: 2 }}>Fecha: {new Date(budget.created_at).toLocaleDateString('es-AR')}</Text>
          {profile.alias_cbu ? <Text style={{ fontSize: 8, color: '#4b5563', marginTop: 4 }}>Alias/CBU: {profile.alias_cbu}</Text> : null}
        </View>
      </View>

      {/* Datos del Cliente */}
      <View style={[styles.row, styles.section]}>
        <View style={styles.box}>
          <Text style={{ fontWeight: 'bold', marginBottom: 4, color: '#1e3a8a', fontSize: 9 }}>CLIENTE:</Text>
          <Text>Nombre: {budget.cliente_nombre}</Text>
          <Text>Teléfono: {budget.cliente_telefono || '-'}</Text>
          <Text>Dirección / Zona: {budget.cliente_direccion || '-'}</Text>
        </View>
      </View>

      {/* Tabla de Ítems */}
      <View style={styles.section}>
        <View style={styles.tableHeader}>
          <Text style={{ flex: 3 }}>Descripción / Ítem</Text>
          <Text style={{ flex: 1, textAlign: 'center' }}>Cant.</Text>
          <Text style={{ flex: 1, textAlign: 'right' }}>P. Unit.</Text>
          <Text style={{ flex: 1, textAlign: 'right' }}>Subtotal</Text>
        </View>
        {budget.items.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <View style={{ flex: 3 }}>
              <Text style={{ fontWeight: 'bold' }}>{item.titulo}</Text>
              {item.descripcion ? <Text style={{ color: '#6b7280', fontSize: 8 }}>{item.descripcion}</Text> : null}
            </View>
            <Text style={{ flex: 1, textAlign: 'center' }}>{item.cantidad}</Text>
            <Text style={{ flex: 1, textAlign: 'right' }}>${item.precio_unitario?.toLocaleString('es-AR')}</Text>
            <Text style={{ flex: 1, textAlign: 'right' }}>${item.subtotal?.toLocaleString('es-AR')}</Text>
          </View>
        ))}
      </View>

      {/* Totales */}
      <View style={styles.totalBox}>
        <View style={[styles.row, { marginBottom: 4 }]}>
          <Text>Subtotal:</Text>
          <Text>${budget.subtotal?.toLocaleString('es-AR')}</Text>
        </View>
        {budget.descuento ? (
          <View style={[styles.row, { marginBottom: 4, color: '#dc2626' }]}>
            <Text>Descuento:</Text>
            <Text>-${budget.descuento?.toLocaleString('es-AR')}</Text>
          </View>
        ) : null}
        <View style={[styles.row, { borderTopWidth: 1, borderTopColor: '#cbd5e1', paddingTop: 4, fontWeight: 'bold' }]}>
          <Text style={{ fontSize: 11, color: '#1e3a8a' }}>TOTAL:</Text>
          <Text style={{ fontSize: 11, color: '#1e3a8a' }}>${budget.total?.toLocaleString('es-AR')} ARS</Text>
        </View>
      </View>

      {/* Condiciones */}
      {budget.notas_condiciones ? (
        <View style={[styles.section, { marginTop: 15, padding: 8, backgroundColor: '#f1f5f9', borderRadius: 4 }]}>
          <Text style={{ fontWeight: 'bold', marginBottom: 2, fontSize: 9 }}>CONDICIONES DEL SERVICIO:</Text>
          <Text>{budget.notas_condiciones}</Text>
        </View>
      ) : null}

      <Text style={styles.footer}>
        * Documento no válido como factura. Operación comercial en carácter de presupuesto.
      </Text>
    </Page>
  </Document>
);