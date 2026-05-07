import { ChefHat, Clock, Users, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  FlatList, Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet, Text,
  TouchableOpacity,
  View
} from 'react-native';

// Database di test popolato per l'effetto "Wow"
const RECIPES = [
  {
    id: '1',
    nome: 'Salmone al Limone',
    categoria: 'Secondi di Pesce',
    tempo: '25 min',
    difficolta: 'Facile',
    porzioni: 2,
    descrizione: 'Un filetto di salmone tenero cotto al vapore con aromi mediterranei e scorza di limone bio.',
    procedimento: '1. Lavare il salmone.\n2. Condire con olio e limone.\n3. Cuocere in forno a 180°C per 20 minuti.',
    immagine: 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?q=80&w=500&auto=format&fit=crop',
    ingredienti: ['Salmone (300g)', 'Limone', 'Rosmarino']
  },
  {
    id: '2',
    nome: 'Risotto ai Funghi',
    categoria: 'Primi Piatti',
    tempo: '40 min',
    difficolta: 'Media',
    porzioni: 4,
    descrizione: 'Il classico comfort food autunnale, preparato con riso Carnaroli e funghi porcini freschi.',
    procedimento: '1. Tostare il riso.\n2. Aggiungere il brodo.\n3. Mantecare con burro e parmigiano.',
    immagine: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?q=80&w=500&auto=format&fit=crop',
    ingredienti: ['Riso Carnaroli', 'Funghi Porcini', 'Brodo Vegetale']
  }
];

export default function RecipeListScreen() {
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Funzione per aprire il dettaglio
  const openRecipe = (recipe) => {
    setSelectedRecipe(recipe);
    setModalVisible(true);
  };

  // Componente per la singola Card della lista
  const RecipeCard = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => openRecipe(item)}>
      <Image source={{ uri: item.immagine }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Text style={styles.categoryText}>{item.categoria.toUpperCase()}</Text>
        <Text style={styles.recipeTitle}>{item.nome}</Text>
        <View style={styles.cardMetrics}>
          <View style={styles.metricItem}>
            <Clock size={16} color="#64748b" />
            <Text style={styles.metricText}>{item.tempo}</Text>
          </View>
          <View style={styles.metricItem}>
            <ChefHat size={16} color={item.difficolta === 'Facile' ? '#10b981' : '#f59e0b'} />
            <Text style={[styles.metricText, { color: item.difficolta === 'Facile' ? '#059669' : '#d97706' }]}>
              {item.difficolta}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Esplora Ricette</Text>
        <Text style={styles.headerSubtitle}>Trova l'ispirazione per oggi</Text>
      </View>

      <FlatList
        data={RECIPES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <RecipeCard item={item} />}
        contentContainerStyle={styles.listPadding}
      />

      {/* Modal del Dettaglio */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        {selectedRecipe && (
          <ScrollView style={styles.modalContainer}>
            <Image source={{ uri: selectedRecipe.immagine }} style={styles.modalImage} />
            
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setModalVisible(false)}
            >
              <X color="white" size={28} />
            </TouchableOpacity>

            <View style={styles.modalContent}>
              <Text style={styles.modalCategory}>{selectedRecipe.categoria}</Text>
              <Text style={styles.modalTitle}>{selectedRecipe.nome}</Text>

              {/* Row delle icone di riepilogo */}
              <View style={styles.infoRow}>
                <View style={styles.infoBox}>
                  <Clock size={20} color="#4f46e5" />
                  <Text style={styles.infoLabel}>Tempo</Text>
                  <Text style={styles.infoValue}>{selectedRecipe.tempo}</Text>
                </View>
                <View style={styles.infoBox}>
                  <ChefHat size={20} color="#4f46e5" />
                  <Text style={styles.infoLabel}>Difficoltà</Text>
                  <Text style={styles.infoValue}>{selectedRecipe.difficolta}</Text>
                </View>
                <View style={styles.infoBox}>
                  <Users size={20} color="#4f46e5" />
                  <Text style={styles.infoLabel}>Porzioni</Text>
                  <Text style={styles.infoValue}>{selectedRecipe.porzioni}</Text>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Descrizione</Text>
              <Text style={styles.descriptionText}>{selectedRecipe.descrizione}</Text>

              <Text style={styles.sectionTitle}>Procedimento</Text>
              <View style={styles.procedureContainer}>
                <Text style={styles.descriptionText}>{selectedRecipe.procedimento}</Text>
              </View>
            </View>
          </ScrollView>
        )}
      </Modal>
    </SafeAreaView>
  );
}

// STYLES PROFESSIONALI
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 24, backgroundColor: '#fff' },
  headerTitle: { fontSize: 32, fontWeight: '800', color: '#1e293b' },
  headerSubtitle: { fontSize: 16, color: '#64748b', marginTop: 4 },
  listPadding: { padding: 16 },
  
  // Stile Card Lista
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 4, // Shadow per Android
    shadowColor: '#000', // Shadow per iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardImage: { width: '100%', height: 180 },
  cardContent: { padding: 16 },
  categoryText: { fontSize: 12, fontWeight: '700', color: '#6366f1', marginBottom: 4 },
  recipeTitle: { fontSize: 20, fontWeight: '700', color: '#1e293b', marginBottom: 12 },
  cardMetrics: { flexDirection: 'row', gap: 16 },
  metricItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metricText: { fontSize: 14, color: '#64748b', fontWeight: '500' },

  // Stile Modal Dettaglio
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  modalImage: { width: '100%', height: 350 },
  closeButton: { 
    position: 'absolute', top: 50, right: 20, 
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 25, padding: 8 
  },
  modalContent: { padding: 24, marginTop: -30, backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  modalCategory: { color: '#6366f1', fontWeight: '700', marginBottom: 8 },
  modalTitle: { fontSize: 28, fontWeight: '800', color: '#1e293b', marginBottom: 24 },
  
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  infoBox: { alignItems: 'center', flex: 1 },
  infoLabel: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  infoValue: { fontSize: 14, fontWeight: '700', color: '#334155' },
  
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginBottom: 12, marginTop: 10 },
  descriptionText: { fontSize: 16, lineHeight: 24, color: '#475569' },
  procedureContainer: { backgroundColor: '#f1f5f9', padding: 16, borderRadius: 12, marginTop: 8 }
});