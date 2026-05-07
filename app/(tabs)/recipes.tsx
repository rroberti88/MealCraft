import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Recipe, useAppContext } from '../context/AppContext';

export default function RecipesScreen() {
  const { recipes } = useAppContext();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Tipizzazione esplicita per risolvere errore
  const renderRecipe = ({ item }: { item: Recipe }) => {
    const isExpanded = selectedId === item.id;

    return (
      <TouchableOpacity 
        style={[styles.card, isExpanded && styles.expandedCard]} 
        onPress={() => setSelectedId(isExpanded ? null : item.id)}
        activeOpacity={0.9}
      >
        {/* Immagine della ricetta */}
        <Image source={{ uri: item.immagine }} style={styles.recipeImage} resizeMode="cover" />
        
        <View style={styles.cardContent}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{item.nome}</Text>
            <View style={[styles.badge, { backgroundColor: item.difficolta === 'Bassa' ? '#4caf50' : '#ff9800' }]}>
              <Text style={styles.badgeText}>{item.difficolta}</Text>
            </View>
          </View>
          
          <Text style={styles.desc}>{item.descrizione}</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.infoText}>{item.tempoPreparazione} min</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="people-outline" size={16} color="#666" />
              <Text style={styles.infoText}>{item.porzioni} porz.</Text>
            </View>
            <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color="#999" style={{marginLeft: 'auto'}} />
          </View>

          {isExpanded && (
            <View style={styles.details}>
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>Ingredienti:</Text>
              {item.ingredienti.map((ing, index) => (
                <Text key={index} style={styles.detailText}>• {ing.nome}: {ing.qta}</Text>
              ))}
              <Text style={[styles.sectionTitle, {marginTop: 12}]}>Procedimento:</Text>
              <Text style={styles.detailText}>{item.procedimento}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Le Tue Ricette</Text>
      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        renderItem={renderRecipe}
        contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  pageTitle: { fontSize: 28, fontWeight: '800', paddingHorizontal: 20, paddingTop: 20, color: '#1a1a1a' },
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 20, 
    marginBottom: 20, 
    elevation: 4, 
    shadowColor: '#000', 
    shadowOpacity: 0.1, 
    shadowRadius: 10,
    overflow: 'hidden' 
  },
  expandedCard: { borderColor: '#2f95dc', borderWidth: 1.5 },
  recipeImage: { width: '100%', height: 200 },
  cardContent: { padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '700', color: '#333' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  desc: { color: '#666', marginVertical: 10, fontSize: 14, lineHeight: 20 },
  infoRow: { flexDirection: 'row', gap: 15, alignItems: 'center' },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  infoText: { color: '#666', fontSize: 13, fontWeight: '600' },
  details: { marginTop: 10 },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 15 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#444', marginBottom: 8 },
  detailText: { fontSize: 14, color: '#555', lineHeight: 22 }
});