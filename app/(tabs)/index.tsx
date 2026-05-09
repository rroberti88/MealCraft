import React, { useMemo } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { useAppContext } from '../context/AppContext';

const screenWidth = Dimensions.get("window").width;

export default function DashboardScreen() {
  const { recipes, pantry, plan } = useAppContext();

 
  const numRecipes = useMemo(() => (Array.isArray(recipes) ? recipes.length : 0), [recipes]);
  
  const totalPlannedMeals = useMemo(() => {
    if (!plan) return 0;
    return Object.values(plan).reduce((acc, day: any) => {
      if (!day) return acc;
    
      const count = Object.values(day).reduce((subAcc: number, mealArray: any) => {
        return subAcc + (Array.isArray(mealArray) ? mealArray.length : 0);
      }, 0);
      return acc + count;
    }, 0);
  }, [plan]);


  const inScadenza = useMemo(() => {
    if (!Array.isArray(pantry)) return [];
    return pantry.filter(item => {
      if (!item.scadenza) return false;
      const oggi = new Date();
      oggi.setHours(0, 0, 0, 0);
      const [year, month, day] = item.scadenza.split('-').map(Number);
      const dataScadenza = new Date(year, month - 1, day);
      const diff = (dataScadenza.getTime() - oggi.getTime()) / (1000 * 3600 * 24);
      return diff <= 3 && diff >= 0;
    });
  }, [pantry]);

  const categoryData = useMemo(() => {
    if (numRecipes === 0) return [];
    const counts: Record<string, number> = {};
    recipes.forEach(r => {
      if (r.categoria) counts[r.categoria] = (counts[r.categoria] || 0) + 1;
    });

    const colors = ['#2f95dc', '#4caf50', '#fb8c00', '#e91e63', '#9c27b0'];
    return Object.keys(counts).map((cat, index) => ({
      name: cat,
      population: counts[cat],
      color: colors[index % colors.length],
      legendFontColor: "#7F7F7F",
      legendFontSize: 12
    }));
  }, [recipes, numRecipes]);

  
  const topIng = useMemo(() => {
    if (numRecipes === 0) return [];
    const counts: Record<string, number> = {};
    recipes.forEach(r => {
      r.ingredienti?.forEach(ing => {
        const nome = ing.nome?.toLowerCase().trim();
        if (nome) counts[nome] = (counts[nome] || 0) + 1;
      });
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [recipes, numRecipes]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>La tua Cucina Smart</Text>

      <View style={styles.statsRow}>
        <View style={styles.card}>
          <Text style={styles.statNumber}>{numRecipes}</Text>
          <Text style={styles.statLabel}>Ricette</Text>
        </View>
        <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: '#4caf50' }]}>
          <Text style={styles.statNumber}>{totalPlannedMeals}</Text>
          <Text style={styles.statLabel}>Pasti in Piano</Text>
        </View>
      </View>

      <View style={[styles.alertCard, inScadenza.length > 0 && styles.alertActive]}>
        <Text style={styles.alertTitle}>⚠️ Avvisi Scadenza ({inScadenza.length})</Text>
        {inScadenza.length > 0 ? (
          inScadenza.map((item, index) => (
            <View key={index} style={styles.alertRow}>
              <Text style={styles.alertText}>• {item.nome}</Text>
              <Text style={styles.dateBadge}>{item.scadenza}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.infoText}>Dispensa sotto controllo.</Text>
        )}
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.sectionTitle}>Distribuzione Categorie</Text>
        {categoryData.length > 0 ? (
          <PieChart
            data={categoryData}
            width={screenWidth - 60}
            height={200}
            chartConfig={{ color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})` }}
            accessor={"population"}
            backgroundColor={"transparent"}
            paddingLeft={"15"}
            absolute
          />
        ) : (
          <Text style={styles.infoText}>Aggiungi ricette per vedere le statistiche.</Text>
        )}
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.sectionTitle}>Ingredienti più ricorrenti</Text>
        {topIng.length > 0 ? (
          topIng.map(([name, count]) => (
            <View key={name} style={styles.progressRow}>
              <Text style={styles.ingName} numberOfLines={1}>{name}</Text>
              <View style={styles.barContainer}>
                <View style={[styles.barFill, { width: `${(count / (numRecipes || 1)) * 100}%` }]} />
              </View>
              <Text style={styles.ingCount}>{count}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.infoText}>Nessuna analisi ingredienti disponibile.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 20, marginTop: 40, color: '#1c1c1e' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 12, width: '48%', elevation: 3 },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: '#2f95dc' },
  statLabel: { fontSize: 14, color: '#666' },
  alertCard: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 20, borderLeftWidth: 5, borderLeftColor: '#ccc' },
  alertActive: { borderLeftColor: '#f44336' },
  alertTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  alertRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  alertText: { fontSize: 15, color: '#444' },
  dateBadge: { color: '#f44336', fontWeight: 'bold', fontSize: 12 },
  infoText: { color: '#888', fontStyle: 'italic', textAlign: 'center', paddingVertical: 10 },
  chartCard: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 20, elevation: 3 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  ingName: { width: 80, fontSize: 13, textTransform: 'capitalize', color: '#444' },
  barContainer: { flex: 1, height: 8, backgroundColor: '#eee', borderRadius: 4, marginHorizontal: 10 },
  barFill: { height: '100%', backgroundColor: '#2f95dc', borderRadius: 4 },
  ingCount: { fontSize: 12, fontWeight: 'bold', width: 20, color: '#333' }
});