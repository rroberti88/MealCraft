import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useAppContext } from '../context/AppContext';

// Nuove categorie basate sulla tua ricerca
const CATEGORIES = [
  'Ortofrutta', 
  'Latticini, Salumi e Formaggi', 
  'Carne e Pesce', 
  'Drogheria Alimentare (Secco)', 
  'Surgelati e Gelati', 
  'Bevande'
];

const UNITS = ['pz', 'kg', 'g', 'l', 'ml'];

// Colorazione coerente per le nuove categorie
const CATEGORY_COLORS: { [key: string]: string } = {
  'Ortofrutta': '#22c55e',                     // Verde brillante
  'Latticini, Salumi e Formaggi': '#eab308',  // Giallo/Oro
  'Carne e Pesce': '#ef4444',                 // Rosso
  'Drogheria Alimentare (Secco)': '#a855f7', // Viola
  'Surgelati e Gelati': '#06b6d4',            // Ciano/Ghiaccio
  'Bevande': '#3b82f6',                       // Blu acqua
  'Senza Categoria': '#94a3b8'                // Grigio fallback
};

// Placeholder contestuali aggiornati
const CATEGORY_PLACEHOLDERS: { [key: string]: string } = {
  'Ortofrutta': 'es. Mele, Carote, Insalata...',
  'Latticini, Salumi e Formaggi': 'es. Latte, Mozzarella, Prosciutto...',
  'Carne e Pesce': 'es. Petto di Pollo, Salmone, Macinato...',
  'Drogheria Alimentare (Secco)': 'es. Pasta, Riso, Farina, Biscotti...',
  'Surgelati e Gelati': 'es. Piselli surgelati, Coni gelato...',
  'Bevande': 'es. Acqua naturale, Succo di frutta, Vino...'
};

export default function ShoppingScreen() {
  const { addToPantry, shoppingList, setShoppingList } = useAppContext() as any;
  const params = useLocalSearchParams();
  const navigation = useNavigation<any>();

  const [productName, setProductName] = useState('');
  const [selectedCat, setSelectedCat] = useState('Ortofrutta');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('pz');
  const [weight, setWeight] = useState(''); 

  const [isConfigModalVisible, setIsConfigModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingSection, setEditingSection] = useState('');
  const [itemToDelete, setItemToDelete] = useState<{section: string, id: string, nome: string} | null>(null);
  
  const [pantryCat, setPantryCat] = useState('Ortofrutta');
  const [finalQty, setFinalQty] = useState('');
  const [finalUnit, setFinalUnit] = useState('pz');
  const [finalWeight, setFinalWeight] = useState('');
  const [expiryMode, setExpiryMode] = useState<'days' | 'date'>('days');
  const [expValue, setExpValue] = useState(''); 

  const getSectionsFromList = (): any[] => {
    if (!shoppingList || !Array.isArray(shoppingList)) return [];

    if (shoppingList.length > 0 && shoppingList[0] && 'title' in shoppingList[0] && 'data' in shoppingList[0]) {
      return shoppingList
        .filter((s: any) => s && Array.isArray(s.data))
        .map((s: any) => ({
          title: s.title || 'Senza Categoria',
          data: Array.isArray(s.data) ? s.data : []
        }));
    }

    const MapSezioni: { [key: string]: any[] } = {};
    shoppingList.forEach((item: any) => {
      if (!item) return;
      const normalizedItem = {
        id: item.id || Math.random().toString(36).substr(2, 9),
        nome: item.nome || item.name || 'Prodotto',
        qta: item.qta || item.quantita || '1',
        unita: item.unita || item.unitaMisura || 'pz',
        peso: item.peso || '',
        preso: !!item.preso,
        scadenza: item.scadenza || '',
        categoriaModificata: item.categoriaModificata || item.categoria || null
      };

      let catf = normalizedItem.categoriaModificata || item.categoria;
      if (!catf || catf === 'Altro' || catf === 'Carboidrati' || catf === 'Proteine' || catf === 'Snack&Dolci' || catf === 'Frutta&Verdura') {
        catf = CATEGORIES.includes(catf) ? catf : 'Senza Categoria';
      }

      if (!MapSezioni[catf]) MapSezioni[catf] = [];
      MapSezioni[catf].push(normalizedItem);
    });

    return Object.keys(MapSezioni).map(title => ({
      title: title,
      data: MapSezioni[title] || []
    }));
  };

  const sectionsData = getSectionsFromList();

  const salvaStatoLista = (nuoveSezioni: any[]) => {
    if (!shoppingList || !Array.isArray(shoppingList) || shoppingList.length === 0) {
      setShoppingList(nuoveSezioni);
      return;
    }
    
    if (shoppingList[0] && !('title' in shoppingList[0]) && !('data' in shoppingList[0])) {
      const flatList = nuoveSezioni.flatMap((s: any) => 
        s.data.map((i: any) => ({
          ...i,
          categoria: i.categoriaModificata || s.title
        }))
      );
      setShoppingList(flatList);
    } else {
      setShoppingList(nuoveSezioni);
    }
  };

  useEffect(() => {
    if (params?.addItems) {
      const itemsToAdd = Array.isArray(params.addItems) ? params.addItems : [params.addItems];
      let attualiSezioni = JSON.parse(JSON.stringify(sectionsData));
      
      const targetCategory = 'Senza Categoria';

      itemsToAdd.forEach((itemName: any) => {
        if (!itemName) return;
        const newItem = {
          id: Math.random().toString(36).substr(2, 9),
          nome: itemName,
          qta: '1',
          unita: 'pz',
          peso: '',
          preso: false,
          scadenza: ''
        };

        const idx = attualiSezioni.findIndex((s: any) => s.title === targetCategory);
        if (idx !== -1) {
          if (!Array.isArray(attualiSezioni[idx].data)) attualiSezioni[idx].data = [];
          attualiSezioni[idx].data.push(newItem);
        } else {
          attualiSezioni.push({ title: targetCategory, data: [newItem] });
        }
      });

      salvaStatoLista(attualiSezioni);
      navigation.setParams({ addItems: undefined });
    }
  }, [params?.addItems]);

  const addProduct = () => {
    if (!productName.trim()) return Alert.alert("Errore", "Nome mancante");
    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      nome: productName,
      qta: quantity || '1',
      unita: unit,
      peso: unit === 'pz' ? '' : weight,
      preso: false,
      scadenza: ''
    };

    let attualiSezioni = JSON.parse(JSON.stringify(sectionsData));
    const idx = attualiSezioni.findIndex((s: any) => s.title === selectedCat);
    if (idx !== -1) {
      if (!Array.isArray(attualiSezioni[idx].data)) attualiSezioni[idx].data = [];
      attualiSezioni[idx].data.push(newItem);
    } else {
      attualiSezioni.push({ title: selectedCat, data: [newItem] });
    }

    salvaStatoLista(attualiSezioni);
    setProductName(''); setQuantity('1'); setWeight('');
  };

  const handlePressCheckbox = (sectionTitle: string, item: any) => {
    let attualiSezioni = JSON.parse(JSON.stringify(sectionsData));
    
    if (item.preso) {
      attualiSezioni = attualiSezioni.map((section: any) => 
        section.title === sectionTitle 
          ? { ...section, data: Array.isArray(section.data) ? section.data.map((i: any) => i.id === item.id ? { ...i, preso: false } : i) : [] }
          : section
      );
      salvaStatoLista(attualiSezioni);
    } else {
      setEditingItem(item);
      setEditingSection(sectionTitle);
      
      const initialModalCat = (sectionTitle === 'Senza Categoria' || !CATEGORIES.includes(sectionTitle)) 
        ? CATEGORIES[0] 
        : sectionTitle;

      setPantryCat(initialModalCat);
      
      setFinalQty(item.qta && item.qta !== '1' ? item.qta : '');
      setFinalUnit(item.unita || 'pz');
      setFinalWeight(item.peso || '');
      setExpValue(item.scadenza || '');
      setIsConfigModalVisible(true);
    }
  };

  const salvaCaratteristicheProdotto = () => {
    if (!editingItem) return;

    const salvataQty = finalQty.trim() === '' ? '1' : finalQty;
    const salvatoPeso = finalUnit === 'pz' ? '' : finalWeight;

    let finalExpiryDate = expValue;
    if (expValue && !expValue.includes('-')) {
      if (expiryMode === 'days') {
        const days = parseInt(expValue.replace(/[^0-9]/g, '') || '0');
        const d = new Date();
        d.setDate(d.getDate() + days);
        finalExpiryDate = d.toISOString().split('T')[0];
      } else {
        const dateParts = expValue.split(/[/.-]/);
        if (dateParts.length === 3) {
          const day = dateParts[0].padStart(2, '0');
          const month = dateParts[1].padStart(2, '0');
          const year = dateParts[2].length === 2 ? `20${dateParts[2]}` : dateParts[2];
          finalExpiryDate = `${year}-${month}-${day}`;
        }
      }
    }

    const attualiSezioni = JSON.parse(JSON.stringify(sectionsData)).map((section: any) => 
      section.title === editingSection 
        ? {
            ...section,
            data: Array.isArray(section.data) ? section.data.map((i: any) => 
              i.id === editingItem.id 
                ? { 
                    ...i, 
                    nome: editingItem.nome,
                    preso: true, 
                    qta: salvataQty, 
                    unita: finalUnit,
                    peso: salvatoPeso, 
                    scadenza: finalExpiryDate.trim(),
                    categoriaModificata: pantryCat
                  } 
                : i
            ) : []
          }
        : section
    );

    salvaStatoLista(attualiSezioni);
    setIsConfigModalVisible(false);
    setEditingItem(null);
  };

  const updateQuantity = (sectionTitle: string, id: string, inc: number) => {
    const attualiSezioni = JSON.parse(JSON.stringify(sectionsData)).map((s: any) => {
      if (s.title === sectionTitle) {
        return {
          ...s,
          data: Array.isArray(s.data) ? s.data.map((i: any) => {
            if (i.id === id) {
              const cur = parseInt(i.qta) || 1;
              return { ...i, qta: Math.max(1, cur + inc).toString() };
            }
            return i;
          }) : []
        };
      }
      return s;
    });
    salvaStatoLista(attualiSezioni);
  };

  const triggerDeleteRequest = (section: string, item: any) => {
    setItemToDelete({ section, id: item.id, nome: item.nome });
    setIsDeleteModalVisible(true);
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;
    const attualiSezioni = JSON.parse(JSON.stringify(sectionsData)).map((s: any) => 
      s.title === itemToDelete.section ? { ...s, data: Array.isArray(s.data) ? s.data.filter((i: any) => i.id !== itemToDelete.id) : [] } : s
    ).filter((s: any) => s.data && s.data.length > 0);
    
    salvaStatoLista(attualiSezioni);
    setIsDeleteModalVisible(false);
    setItemToDelete(null);
  };

  const finalizeShopping = () => {
    const purchased = sectionsData.flatMap((s: any) => 
      s.data ? s.data.filter((i: any) => i.preso).map((i: any) => ({
        id: Math.random().toString(36).substr(2, 9) + Date.now().toString(36),
        nome: i.nome,
        categoria: i.categoriaModificata || s.title,
        quantita: parseFloat(i.qta) || 1,
        unitaMisura: i.unita || 'pz',
        pesoEffettivo: i.peso || '',
        scadenza: i.scadenza || '',
        carboidrati: 0,
        proteine: 0,
        grassi: 0,
        verdura: s.title === 'Ortofrutta'
      })) : []
    );

    const haProdottiNonAssegnati = purchased.some((p: any) => p.categoria === 'Senza Categoria');
    if (haProdottiNonAssegnati) {
      return Alert.alert(
        "Attenzione", 
        "Ci sono prodotti contrassegnati come 'Senza Categoria'. Clicca sulla loro checkbox per impostare una delle nuove categorie corrette prima di inviarli alla dispensa."
      );
    }

    if (purchased.length === 0) return Alert.alert("Info", "Nessun prodotto selezionato e configurato.");

    purchased.forEach((p: any) => addToPantry(p));
    Alert.alert("Successo!", "Prodotti salvati e caricati in Dispensa");

    const rimastiSezioni = sectionsData.map((s: any) => ({
      ...s,
      data: s.data ? s.data.filter((i: any) => !i.preso) : []
    })).filter((s: any) => s.data && s.data.length > 0);

    salvaStatoLista(rimastiSezioni);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <View style={styles.inputCard}>
          <Text style={styles.inputTitle}>Cosa manca?</Text>
          
          <TextInput 
            style={styles.input} 
            placeholder={CATEGORY_PLACEHOLDERS[selectedCat] || 'Nome del prodotto...'} 
            placeholderTextColor="#94a3b8"
            value={productName} 
            onChangeText={setProductName} 
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity key={cat} style={[styles.chip, selectedCat === cat && { backgroundColor: CATEGORY_COLORS[cat] }]} onPress={() => setSelectedCat(cat)}>
                <Text style={[styles.chipText, selectedCat === cat && { color: '#fff' }]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.row}>
            <TextInput 
              style={[styles.input, { flex: 0.8, marginBottom: 0 }]} 
              keyboardType="numeric" 
              placeholder="1" 
              placeholderTextColor="#94a3b8"
              value={quantity} 
              onChangeText={setQuantity} 
            />
            <TextInput 
              style={[styles.input, { flex: 1, marginBottom: 0, opacity: unit === 'pz' ? 0.3 : 1 }]} 
              keyboardType="numeric" 
              placeholder={unit === 'pz' ? "N/A" : "Peso"} 
              placeholderTextColor="#94a3b8"
              value={weight} 
              onChangeText={setWeight} 
              editable={unit !== 'pz'} 
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 2 }}>
              <View style={styles.unitContainer}>
                {UNITS.map(u => (
                  <TouchableOpacity key={u} style={[styles.unitBtn, unit === u && styles.unitBtnActive]} onPress={() => setUnit(u)}>
                    <Text style={[styles.unitBtnText, unit === u && { color: '#fff' }]}>{u}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            <TouchableOpacity style={styles.addButton} onPress={addProduct}>
              <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <SectionList
          sections={sectionsData}
          keyExtractor={(item: any) => item.id}
          renderItem={({ item, section }: { item: any, section: any }) => (
            <View style={styles.itemRowContainer}>
              <TouchableOpacity style={styles.itemRow} onPress={() => handlePressCheckbox(section.title, item)}>
                <Ionicons name={item.preso ? "checkbox" : "square-outline"} size={26} color={item.preso ? "#10b981" : "#cbd5e1"} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.itemName, item.preso && styles.strikethrough]}>{item.nome}</Text>
                  <Text style={styles.itemDetails}>
                    {item.qta} x {item.peso ? `${item.peso} ` : ''}{item.unita || 'pz'} 
                    {item.preso && " • Configurato"}
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={styles.actionButtons}>
                <TouchableOpacity onPress={() => updateQuantity(section.title, item.id, -1)} style={styles.iconBtn}>
                  <Ionicons name="remove-circle-outline" size={22} color="#94a3b8" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => updateQuantity(section.title, item.id, 1)} style={styles.iconBtn}>
                  <Ionicons name="add-circle-outline" size={22} color="#94a3b8" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => triggerDeleteRequest(section.title, item)} style={styles.iconBtn}>
                  <Ionicons name="trash-outline" size={20} color="#f87171" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          renderSectionHeader={({ section: { title } }: any) => (
            <Text style={[styles.sectionTitle, { color: CATEGORY_COLORS[title] || '#94a3b8' }]}>{title.toUpperCase()}</Text>
          )}
          ListEmptyComponent={<Text style={styles.empty}>La lista è vuota</Text>}
          contentContainerStyle={{ paddingBottom: 100 }}
        />

        <Modal visible={isConfigModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ width: '100%' }}>
              <View style={styles.modalContentStyleSpec}>
                
                <Text style={styles.modalTitleSpec}>Nuovo Ingrediente</Text>

                <TextInput 
                  style={styles.specInput} 
                  value={editingItem?.nome} 
                  onChangeText={(txt) => setEditingItem((prev: any) => ({ ...prev, nome: txt }))}
                  placeholder="Nome prodotto *" 
                  placeholderTextColor="#7a7a7a" 
                />

                <Text style={styles.specLabel}>Categoria *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15, maxHeight: 40 }}>
                  {CATEGORIES.map(cat => (
                    <TouchableOpacity 
                      key={cat} 
                      style={[
                        styles.specChip, 
                        pantryCat === cat && { backgroundColor: CATEGORY_COLORS[cat], borderColor: 'transparent' }
                      ]} 
                      onPress={() => setPantryCat(cat)}
                    >
                      <Text style={[
                        styles.specChipText, 
                        pantryCat === cat && { color: '#fff', fontWeight: '700' }
                      ]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <View style={[styles.row, { marginBottom: 14 }]}>
                  <TextInput 
                    style={[styles.specInput, { flex: 1, marginBottom: 0 }]} 
                    placeholder="Pezzi/Qta (es. 1) *" 
                    placeholderTextColor="#9ca3af"
                    keyboardType="numeric" 
                    value={finalQty} 
                    onChangeText={setFinalQty} 
                  />
                  
                  <View style={{ flex: 1.2 }}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={styles.modalUnitRow}>
                        {UNITS.map(u => (
                          <TouchableOpacity 
                            key={u} 
                            style={[styles.modalUnitBtn, finalUnit === u && styles.modalUnitBtnActive]} 
                            onPress={() => {
                              setFinalUnit(u);
                              if (u === 'pz') setFinalWeight('');
                            }}
                          >
                            <Text style={[styles.modalUnitText, finalUnit === u && { color: '#fff' }]}>{u}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                </View>

                <TextInput 
                  style={[styles.specInput, finalUnit === 'pz' && { opacity: 0.4, backgroundColor: '#cbd5e1' }]} 
                  placeholder={finalUnit === 'pz' ? "N/A per l'unità 'pz'" : "Peso/Volume singolo (es. 250)"} 
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric" 
                  value={finalWeight} 
                  onChangeText={setFinalWeight}
                  editable={finalUnit !== 'pz'} 
                />

                <View style={styles.expiryToggleRowSpec}>
                  <TouchableOpacity onPress={() => setExpiryMode('days')} style={[styles.specToggleBtn, expiryMode === 'days' && styles.specToggleBtnActive]}>
                    <Text style={styles.specToggleText}>+ Giorni</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setExpiryMode('date')} style={[styles.specToggleBtn, expiryMode === 'date' && styles.specToggleBtnActive]}>
                    <Text style={styles.specToggleText}>Data Esatta</Text>
                  </TouchableOpacity>
                </View>

                <TextInput 
                  style={styles.specInput} 
                  placeholder={expiryMode === 'days' ? "Giorni rimanenti (es. 10) *" : "Scadenza (AAAA-MM-GG) *"} 
                  placeholderTextColor="#9ca3af"
                  value={expValue} 
                  onChangeText={setExpValue} 
                />

                <View style={[styles.row, { marginTop: 20 }]}>
                  <TouchableOpacity style={styles.specCancelBtn} onPress={() => setIsConfigModalVisible(false)}>
                    <Text style={styles.specCancelBtnText}>Annulla</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.specSaveBtn} onPress={salvaCaratteristicheProdotto}>
                    <Text style={styles.specSaveBtnText}>Salva</Text>
                  </TouchableOpacity>
                </View>

              </View>
            </KeyboardAvoidingView>
          </View>
        </Modal>

        <Modal visible={isDeleteModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { borderTopWidth: 5, borderTopColor: '#f87171' }]}>
              <Ionicons name="warning-outline" size={40} color="#f87171" style={{ alignSelf: 'center', marginBottom: 10 }} />
              <Text style={styles.modalTitle}>Elimina Prodotto</Text>
              <Text style={[styles.modalSubtitle, { color: '#64748b' }]}>
                Sei sicuro di voler rimuovere <Text style={{fontWeight: 'bold', color: '#1e293b'}}>{itemToDelete?.nome}</Text>?
              </Text>
              
              <View style={[styles.row, { marginTop: 15 }]}>
                <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#f1f5f9' }]} onPress={() => setIsDeleteModalVisible(false)}>
                  <Text style={{ color: '#64748b', fontWeight: 'bold' }}>Mantieni</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#f87171' }]} onPress={confirmDelete}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Elimina</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <TouchableOpacity style={styles.finalizeBtn} onPress={finalizeShopping}>
          <Text style={styles.finalizeBtnText}>Sposta in Dispensa</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  inputCard: { backgroundColor: '#fff', padding: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 4 },
  inputTitle: { fontSize: 20, fontWeight: '900', color: '#1e293b', marginBottom: 12 },
  input: { backgroundColor: '#f1f5f9', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 10, fontSize: 15, color: '#1e293b' },
  row: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: '#f1f5f9', marginRight: 8 },
  chipText: { fontSize: 12, fontWeight: 'bold', color: '#64748b' },
  unitContainer: { flexDirection: 'row', gap: 5 },
  unitBtn: { padding: 10, borderRadius: 10, backgroundColor: '#f1f5f9' },
  unitBtnActive: { backgroundColor: '#1e293b' },
  unitBtnText: { fontSize: 12, fontWeight: '700', color: '#64748b' },
  addButton: { backgroundColor: '#4f46e5', width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 11, fontWeight: '900', letterSpacing: 1.5, marginLeft: 20, marginTop: 20, marginBottom: 5 },
  itemRowContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 20, marginTop: 8, borderRadius: 18, paddingRight: 10 },
  itemRow: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 15, gap: 12 },
  actionButtons: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  iconBtn: { padding: 5 },
  itemName: { fontSize: 16, fontWeight: '700', color: '#334155' },
  itemDetails: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  strikethrough: { textDecorationLine: 'line-through', color: '#cbd5e1' },
  empty: { textAlign: 'center', marginTop: 40, color: '#94a3b8' },
  finalizeBtn: { position: 'absolute', bottom: 20, left: 20, right: 20, backgroundColor: '#0f172a', padding: 18, borderRadius: 20, alignItems: 'center' },
  finalizeBtnText: { color: '#fff', fontWeight: '800' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 16 },
  modalContent: { backgroundColor: '#fff', padding: 25, borderRadius: 25 },
  modalTitle: { fontSize: 18, fontWeight: '900', color: '#1e293b', textAlign: 'center' },
  modalSubtitle: { fontSize: 16, color: '#4f46e5', textAlign: 'center', marginBottom: 20 },
  modalBtn: { flex: 1, padding: 15, borderRadius: 12, alignItems: 'center' },
  
  modalContentStyleSpec: { backgroundColor: '#f3f4f6', padding: 24, borderRadius: 16, width: '100%', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 10 },
  modalTitleSpec: { fontSize: 24, fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: 20 },
  specInput: { backgroundColor: '#edf2f7', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: '#d1d5db', marginBottom: 14, fontSize: 16, color: '#1f2937' },
  specLabel: { fontSize: 14, fontWeight: '600', color: '#4b5563', marginBottom: 8 },
  specChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', marginRight: 6 },
  specChipText: { fontSize: 13, color: '#1f2937', fontWeight: '500' },
  
  modalUnitRow: { flexDirection: 'row', gap: 6, alignItems: 'center', backgroundColor: '#edf2f7', padding: 4, borderRadius: 14, borderWidth: 1, borderColor: '#d1d5db' },
  modalUnitBtn: { paddingVertical: 10, paddingHorizontal: 10, borderRadius: 10, backgroundColor: '#fff' },
  modalUnitBtnActive: { backgroundColor: '#111827' },
  modalUnitText: { fontSize: 13, fontWeight: '700', color: '#6b7280' },

  expiryToggleRowSpec: { flexDirection: 'row', gap: 10, marginBottom: 10, justifyContent: 'flex-start' },
  specToggleBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#e5e7eb' },
  specToggleBtnActive: { backgroundColor: '#4b5563' },
  specToggleText: { fontSize: 12, fontWeight: '600', color: '#111827' },
  specCancelBtn: { flex: 1, backgroundColor: '#9ca3af', paddingVertical: 16, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  specCancelBtnText: { color: '#ffffff', fontSize: 18, fontWeight: '600' },
  specSaveBtn: { flex: 1, backgroundColor: '#007aff', paddingVertical: 16, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  specSaveBtnText: { color: '#ffffff', fontSize: 18, fontWeight: '600' }
});