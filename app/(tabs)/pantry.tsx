import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppContext } from '../context/AppContext';

export default function PantryScreen() {
  const { pantry, setPantry } = useAppContext();
  const [filter, setFilter] = useState<'Tutti' | 'In Scadenza'>('Tutti');

  // Logica per calcolare se un prodotto è in scadenza (entro 3 giorni)
  const isExpiringSoon = (dateStr: string) => {
    const today = new Date();
    const expiryDate = new Date(dateStr);
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3;
  };

  // Filtriamo i dati in base alla scelta dell'utente
  const displayedItems = filter === 'Tutti' 
    ? pantry 
    : pantry.filter(item => isExpiringSoon(item.scadenza));

  const deleteItem = (id: string) => {
    Alert.alert("Elimina", "Vuoi rimuovere questo prodotto?", [
      { text: "Annulla", style: "cancel" },
      { text: "Rimuovi", onPress: () => setPantry(pantry.filter(i => i.id !== id)), style: "destructive" }
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header con Filtri (Punteggio Usabilità) */}
      <View style={styles.filterBar}>
        <TouchableOpacity 
          style={[styles.filterBtn, filter === 'Tutti' && styles.activeFilter]} 
          onPress={() => setFilter('Tutti')}
        >
          <Text style={filter === 'Tutti' ? styles.activeText : styles.filterText}>Tutti</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterBtn, filter === 'In Scadenza' && styles.activeFilter]} 
          onPress={() => setFilter('In Scadenza')}
        >
          <Text style={filter === 'In Scadenza' ? styles.activeText : styles.filterText}>In Scadenza ⚠️</Text>
        </TouchableOpacity>
      </View>

      {/* Lista Prodotti */}
      <FlatList
        data={displayedItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.card, isExpiringSoon(item.scadenza) && styles.alertCard]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{item.nome}</Text>
              <Text style={styles.itemSub}>{item.categoria} • {item.quantita}{item.unitaMisura}</Text>
              <Text style={[styles.expiryText, isExpiringSoon(item.scadenza) && styles.urgentText]}>
                Scadenza: {item.scadenza}
              </Text>
            </View>
            <TouchableOpacity onPress={() => deleteItem(item.id)}>
              <Ionicons name="trash-outline" size={24} color="#ff4444" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nessun prodotto trovato nella tua dispensa.</Text>
        }
      />

      {/* Pulsante Aggiunta (CRUD) */}
      <TouchableOpacity style={styles.fab} onPress={() => Alert.alert("Feature", "Qui apriremo il modulo di aggiunta!")}>
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 10 },
  filterBar: { flexDirection: 'row', marginBottom: 15, justifyContent: 'center' },
  filterBtn: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, backgroundColor: '#e0e0e0', marginHorizontal: 5 },
  activeFilter: { backgroundColor: '#2f95dc' },
  filterText: { color: '#555', fontWeight: '600' },
  activeText: { color: '#fff', fontWeight: '600' },
  card: { 
    backgroundColor: '#fff', padding: 15, borderRadius: 12, flexDirection: 'row', 
    alignItems: 'center', marginBottom: 10, elevation: 2, shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 
  },
  alertCard: { borderLeftWidth: 6, borderLeftColor: '#ff4444', backgroundColor: '#fff5f5' },
  itemName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  itemSub: { fontSize: 14, color: '#666', marginVertical: 2 },
  expiryText: { fontSize: 13, color: '#888', fontWeight: '500' },
  urgentText: { color: '#ff4444', fontWeight: 'bold' },
  fab: { 
    position: 'absolute', bottom: 20, right: 20, backgroundColor: '#2f95dc', 
    width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5 
  },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999', fontSize: 16 }
});