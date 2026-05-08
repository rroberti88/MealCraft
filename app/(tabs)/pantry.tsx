import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  LayoutAnimation,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { useAppContext } from '../context/AppContext';

const CATEGORIES = [
  { id: 'Bibite', label: 'Bibite', icon: 'wine-outline' },
  { id: 'Carboidrati', label: 'Carboidrati', icon: 'pizza-outline' },
  { id: 'Proteine', label: 'Proteine', icon: 'egg-outline' },
  { id: 'Snack&Dolci', label: 'Snack&Dolci', icon: 'ice-cream-outline' },
  { id: 'Frutta&Verdura', label: 'Frutta&Verdura', icon: 'leaf-outline' },
];


type FilterStatus = 'Tutti' | 'Scadenze' | 'Esaurimento' | 'InStato';

export default function PantryScreen() {
  const { pantry, setPantry } = useAppContext();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tutte');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('Tutti');
  
  const [formVisible, setFormVisible] = useState(false);
  const [customAlert, setCustomAlert] = useState({
    visible: false,
    type: 'success' as 'success' | 'warning' | 'error',
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const [newItem, setNewItem] = useState({
    nome: '', categoria: '', quantita: '', unitaMisura: '', scadenza: '', note: ''
  });

  const getDaysDiff = (dateStr: string) => {
    if (!dateStr || !dateStr.includes('-')) return null;
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const [year, month, day] = dateStr.split('-').map(Number);
      const expiry = new Date(year, month - 1, day);
      const diffTime = expiry.getTime() - today.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch (e) { return null; }
  };

  const filteredItems = useMemo(() => {
    return pantry.filter(item => {
      const matchesSearch = item.nome.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'Tutte' || item.categoria === selectedCategory;
      const diff = getDaysDiff(item.scadenza);
      
      let matchesStatus = true;
      if (statusFilter === 'Scadenze') {
        matchesStatus = diff !== null && diff <= 3;
      } else if (statusFilter === 'Esaurimento') {
        matchesStatus = Number(item.quantita) <= 2;
      } else if (statusFilter === 'InStato') {
       
        matchesStatus = diff !== null && diff > 3;
      }
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [pantry, searchQuery, selectedCategory, statusFilter]);

  const addProductToPantry = () => {
    const product = { 
      ...newItem, 
      id: Date.now().toString(), 
      quantita: Number(newItem.quantita),
    };
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    setPantry([...pantry, product]);
    setNewItem({ nome: '', categoria: '', quantita: '', unitaMisura: '', scadenza: '', note: '' });
    
    setCustomAlert({
      visible: true,
      type: 'success',
      title: 'OPERAZIONE RIUSCITA',
      message: 'Il prodotto è stato aggiunto alla tua dispensa!',
      onConfirm: () => setCustomAlert(prev => ({ ...prev, visible: false }))
    });
  };
//stile
  const handleSave = () => {
    if (!newItem.nome || !newItem.quantita || !newItem.scadenza || !newItem.categoria) {
      setCustomAlert({
        visible: true,
        type: 'error',
        title: 'CAMPI MANCANTI',
        message: 'Devi compilare tutti i campi e selezionare una categoria prima di salvare.',
        onConfirm: () => setCustomAlert(prev => ({ ...prev, visible: false }))
      });
      return;
    }

    const diff = getDaysDiff(newItem.scadenza);
    setFormVisible(false);

    if (diff !== null && diff < 0) {
      setCustomAlert({
        visible: true,
        type: 'error',
        title: 'PRODOTTO SCADUTO',
        message: 'La data inserita è già passata. Confermi di volerlo aggiungere?',
        onConfirm: () => {
          setCustomAlert(prev => ({ ...prev, visible: false }));
          addProductToPantry();
        }
      });
    } else if (diff !== null && diff <= 3) {
      setCustomAlert({
        visible: true,
        type: 'warning',
        title: 'SCADENZA BREVE',
        message: `Attenzione: il prodotto scadrà tra ${diff === 0 ? 'OGGI' : diff + ' giorni'}.`,
        onConfirm: () => {
          setCustomAlert(prev => ({ ...prev, visible: false }));
          addProductToPantry();
        }
      });
    } else {
      addProductToPantry();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topSection}>
        <Text style={styles.headerTitle}>Dispensa Intelligente</Text>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput style={styles.searchInput} placeholder="Cerca ingredienti..." value={searchQuery} onChangeText={setSearchQuery} />
        </View>
      </View>

      <View style={{ height: 110 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
          <TouchableOpacity style={[styles.catCard, selectedCategory === 'Tutte' && styles.activeCatCard]} onPress={() => setSelectedCategory('Tutte')}>
            <Ionicons name="grid-outline" size={24} color={selectedCategory === 'Tutte' ? '#fff' : '#007AFF'} />
            <Text style={[styles.catLabel, selectedCategory === 'Tutte' && styles.activeCatLabel]}>Tutte</Text>
          </TouchableOpacity>
          {CATEGORIES.map(cat => (
            <TouchableOpacity key={cat.id} style={[styles.catCard, selectedCategory === cat.id && styles.activeCatCard]} onPress={() => setSelectedCategory(cat.id)}>
              <Ionicons name={cat.icon as any} size={24} color={selectedCategory === cat.id ? '#fff' : '#007AFF'} />
              <Text style={[styles.catLabel, selectedCategory === cat.id && styles.activeCatLabel]}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {}
      <View style={styles.statusRowContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statusRow}>
          <TouchableOpacity onPress={() => setStatusFilter('Tutti')} style={[styles.statusTab, statusFilter === 'Tutti' && styles.statusTabActive]}>
            <Text style={[styles.statusTabText, statusFilter === 'Tutti' && styles.statusTabTextActive]}>Tutti</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => setStatusFilter('InStato')} style={[styles.statusTab, statusFilter === 'InStato' && { backgroundColor: '#34C759' }]}>
            <Text style={styles.statusTabTextActive}>Scadenza non prossima 🟢</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setStatusFilter('Scadenze')} style={[styles.statusTab, statusFilter === 'Scadenze' && { backgroundColor: '#FF9500' }]}>
            <Text style={styles.statusTabTextActive}>Scadenze 🔴</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => setStatusFilter('Esaurimento')} style={[styles.statusTab, statusFilter === 'Esaurimento' && { backgroundColor: '#FF3B30' }]}>
            <Text style={styles.statusTabTextActive}>Stock Basso 📉</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const diff = getDaysDiff(item.scadenza);
          const borderStyle = diff !== null && diff < 0 
            ? styles.expiredCard 
            : (diff !== null && diff <= 3 ? styles.warningCard : styles.goodCard);

          return (
            <View style={[styles.itemCard, borderStyle]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{item.nome}</Text>
                <Text style={styles.itemSub}>{item.categoria} • {item.quantita} {item.unitaMisura}</Text>
                <Text style={[styles.itemExpiry, diff !== null && diff < 0 && { color: '#FF3B30', fontWeight: 'bold' }]}>
                  Scadenza: {item.scadenza} {diff !== null && diff < 0 ? '(SCADUTO)' : ''}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setPantry(pantry.filter(i => i.id !== item.id))}>
                <Ionicons name="trash-outline" size={22} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          );
        }}
      />

      {}
      <Modal visible={formVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nuovo Ingrediente</Text>
            
            <TextInput style={styles.input} placeholder="Nome prodotto *" value={newItem.nome} onChangeText={t => setNewItem({...newItem, nome: t})} />
            
            <Text style={styles.label}>Categoria *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity key={cat.id} style={[styles.chip, newItem.categoria === cat.id && styles.chipActive]} onPress={() => setNewItem({...newItem, categoria: cat.id})}>
                  <Text style={[styles.chipText, newItem.categoria === cat.id && styles.chipTextActive]}>{cat.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="Quantità *" keyboardType="numeric" value={newItem.quantita} onChangeText={t => setNewItem({...newItem, quantita: t})} />
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="Unità (es. kg)" value={newItem.unitaMisura} onChangeText={t => setNewItem({...newItem, unitaMisura: t})} />
            </View>

            <TextInput style={styles.input} placeholder="Scadenza (AAAA-MM-GG) *" value={newItem.scadenza} onChangeText={t => setNewItem({...newItem, scadenza: t})} />

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <TouchableOpacity style={[styles.btn, { backgroundColor: '#8E8E93' }]} onPress={() => setFormVisible(false)}><Text style={styles.btnText}>Annulla</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.btn, { backgroundColor: '#007AFF' }]} onPress={handleSave}><Text style={styles.btnText}>Salva</Text></TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {}
      <Modal visible={customAlert.visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.alertContainer, { borderTopColor: customAlert.type === 'error' ? '#FF3B30' : customAlert.type === 'warning' ? '#FF9500' : '#34C759' }]}>
            <Ionicons 
              name={customAlert.type === 'error' ? 'alert-circle' : customAlert.type === 'warning' ? 'warning' : 'checkmark-circle'} 
              size={50} 
              color={customAlert.type === 'error' ? '#FF3B30' : customAlert.type === 'warning' ? '#FF9500' : '#34C759'} 
            />
            <Text style={[styles.alertTitle, { color: customAlert.type === 'error' ? '#FF3B30' : customAlert.type === 'warning' ? '#FF9500' : '#34C759' }]}>{customAlert.title}</Text>
            <Text style={styles.alertMessage}>{customAlert.message}</Text>
            
            <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
              {(customAlert.type === 'error' && customAlert.title !== 'CAMPI MANCANTI') || customAlert.type === 'warning' ? (
                <TouchableOpacity style={[styles.btn, { backgroundColor: '#F2F2F7' }]} onPress={() => setCustomAlert(prev => ({ ...prev, visible: false }))}>
                  <Text style={[styles.btnText, { color: '#000' }]}>Annulla</Text>
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity 
                style={[styles.btn, { backgroundColor: customAlert.type === 'error' ? '#FF3B30' : customAlert.type === 'warning' ? '#FF9500' : '#34C759' }]} 
                onPress={customAlert.onConfirm}
              >
                <Text style={styles.btnText}>{customAlert.type === 'success' || customAlert.title === 'CAMPI MANCANTI' ? 'OK' : 'Procedi'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <TouchableOpacity style={styles.fab} onPress={() => setFormVisible(true)}>
        <Ionicons name="add" size={35} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  topSection: { padding: 20, backgroundColor: '#fff', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 5 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 15 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F3F6', paddingHorizontal: 15, borderRadius: 15, height: 45 },
  searchInput: { flex: 1, marginLeft: 10 },
  categoryList: { paddingHorizontal: 20, paddingVertical: 15, gap: 12 },
  catCard: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', padding: 10, borderRadius: 20, width: 80, height: 85, elevation: 3 },
  activeCatCard: { backgroundColor: '#007AFF' },
  catLabel: { fontSize: 10, fontWeight: 'bold', color: '#666', marginTop: 5 },
  activeCatLabel: { color: '#fff' },
  statusRowContainer: { marginBottom: 15 },
  statusRow: { paddingHorizontal: 20, gap: 8 },
  statusTab: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, backgroundColor: '#E0E0E0' },
  statusTabActive: { backgroundColor: '#007AFF' },
  statusTabText: { fontSize: 12, fontWeight: '700', color: '#666' },
  statusTabTextActive: { color: '#fff', fontSize: 12, fontWeight: '700' },
  itemCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 16, marginHorizontal: 15, borderRadius: 18, marginBottom: 10, alignItems: 'center', elevation: 2 },
  warningCard: { borderLeftWidth: 8, borderLeftColor: '#FF9500' },
  expiredCard: { borderLeftWidth: 8, borderLeftColor: '#FF3B30' },
  goodCard: { borderLeftWidth: 8, borderLeftColor: '#34C759' }, 
  itemTitle: { fontSize: 18, fontWeight: 'bold' },
  itemSub: { color: '#888', marginVertical: 2 },
  itemExpiry: { fontSize: 12, fontWeight: '600', color: '#666' },
  fab: { position: 'absolute', bottom: 30, right: 25, backgroundColor: '#007AFF', width: 65, height: 65, borderRadius: 32.5, justifyContent: 'center', alignItems: 'center', elevation: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 25, padding: 25, width: '100%' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: '#F1F3F6', padding: 14, borderRadius: 12, marginBottom: 12, fontSize: 16 },
  label: { fontWeight: 'bold', marginBottom: 10, color: '#666' },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, backgroundColor: '#F1F3F6', marginRight: 8, borderWidth: 1, borderColor: '#DDD' },
  chipActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  chipText: { fontSize: 12, color: '#333' },
  chipTextActive: { color: '#fff', fontWeight: 'bold' },
  btn: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  alertContainer: { backgroundColor: '#fff', width: '85%', borderRadius: 30, padding: 25, alignItems: 'center', borderTopWidth: 8 },
  alertTitle: { fontSize: 20, fontWeight: '900', marginTop: 15, textAlign: 'center' },
  alertMessage: { fontSize: 16, color: '#444', textAlign: 'center', marginVertical: 20, lineHeight: 22 }
});