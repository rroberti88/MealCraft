import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAppContext } from '../context/AppContext';

export default function DashboardScreen() {
  const { recipes, pantry } = useAppContext();

  // Logica per prodotti in scadenza (Requisito obbligatorio) [cite: 52, 95]
  const inScadenza = pantry.filter(item => {
    const oggi = new Date();
    const dataScadenza = new Date(item.scadenza);
    const diff = (dataScadenza.getTime() - oggi.getTime()) / (1000 * 3600 * 24);
    return diff <= 3 && diff >= 0; // Prodotti che scadono entro 3 giorni
  });

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>La tua Cucina Smart</Text>
      
      <View style={styles.statsRow}>
        <View style={styles.card}>
          <Text style={styles.statNumber}>{recipes.length}</Text>
          <Text style={styles.statLabel}>Ricette Salvate</Text>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.statNumber}>{pantry.length}</Text>
          <Text style={styles.statLabel}>Prodotti Dispensa</Text>
        </View>
      </View>

      <View style={styles.alertCard}>
        <Text style={styles.alertTitle}> Avvisi Scadenza [cite: 95]</Text>
        {inScadenza.length > 0 ? (
          inScadenza.map(item => (
            <Text key={item.id} style={styles.alertText}>• {item.nome} scade il {item.scadenza}</Text>
          ))
        ) : (
          <Text style={styles.alertText}>Nessun prodotto in scadenza immediata.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 10, width: '48%', elevation: 3 },
  statNumber: { fontSize: 22, fontWeight: 'bold', color: '#2f95dc' },
  statLabel: { fontSize: 14, color: '#666' },
  alertCard: { backgroundColor: '#ffebee', padding: 15, borderRadius: 10, borderLeftWidth: 5, borderLeftColor: '#f44336' },
  alertTitle: { fontSize: 18, fontWeight: 'bold', color: '#c62828', marginBottom: 5 },
  alertText: { fontSize: 16, color: '#b71c1c' }
});