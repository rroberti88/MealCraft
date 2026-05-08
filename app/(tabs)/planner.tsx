import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useAppContext } from '../context/AppContext';

const PlannerScreen = () => {
  const {
    plan,
    updatePlan,
    removeFromPlan,
    pantry,
    addToShoppingList,
  } = useAppContext();

  const params = useLocalSearchParams();
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const [showCalendar, setShowCalendar] = useState(false);

  const handleSelection = useCallback(
    (mealType: string, item: any, origin: 'recipe' | 'pantry') => {
      if (!mealType || !item) return;

      if (origin === 'recipe') {
        const missing =
          item.ingredienti
            ?.filter(
              (ing: any) =>
                !pantry.some(
                  (p: any) =>
                    p.nome?.toLowerCase().trim() ===
                    ing.nome?.toLowerCase().trim()
                )
            )
            .map((ing: any) => ing.nome) || [];

        if (missing.length > 0) {
          Alert.alert(
            'Ingredienti Mancanti',
            `Per "${item.nome}" mancano: ${missing.join(', ')}`,
            [
              {
                text: 'Annulla',
                style: 'cancel',
              },
              {
                text: 'Aggiungi alla Spesa',
                onPress: () => {
                  updatePlan(selectedDate, mealType, {
                    ...item,
                    type: 'recipe',
                  });

                  if (addToShoppingList) {
                    missing.forEach((name: string) => {
                      addToShoppingList({
                        nome: name,
                        checked: false,
                      });
                    });
                  }

                  router.push('/shopping');
                },
              },
              {
                text: 'Aggiungi comunque',
                onPress: () => {
                  updatePlan(selectedDate, mealType, {
                    ...item,
                    type: 'recipe',
                  });
                },
              },
            ]
          );
        } else {
          updatePlan(selectedDate, mealType, {
            ...item,
            type: 'recipe',
          });
        }
      } else {
        updatePlan(selectedDate, mealType, {
          ...item,
          type: 'pantry',
        });
      }
    },
    [pantry, selectedDate, updatePlan, router, addToShoppingList]
  );

  useFocusEffect(
    useCallback(() => {
      if (
        params?.selectedItem === 'true' &&
        params?.item &&
        params?.mealType
      ) {
        try {
          const parsedItem =
            typeof params.item === 'string'
              ? JSON.parse(params.item)
              : params.item;

          handleSelection(
            params.mealType as string,
            parsedItem,
            (params.origin as 'recipe' | 'pantry') || 'recipe'
          );

          router.replace('/planner');
        } catch (error) {
          console.log('Errore parsing item:', error);
        }
      }
    }, [params, handleSelection])
  );

  const generateWeekDays = () => {
    const days = [];
    const baseDate = new Date(selectedDate);
    const startOfWeek = new Date(baseDate);

    const dayOfWeek = baseDate.getDay();

    const diff =
      baseDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);

    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);

      date.setDate(startOfWeek.getDate() + i);

      days.push({
        label: date.toLocaleDateString('it-IT', {
          weekday: 'short',
        }),
        date: date.getDate().toString(),
        fullDate: date.toISOString().split('T')[0],
      });
    }

    return days;
  };

  const mealTypes = ['COLAZIONE', 'PRANZO', 'CENA', 'SPUNTINI'];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.welcomeText}>La tua Cucina Smart</Text>
              <Text style={styles.mainTitle}>Pianifica i pasti</Text>
            </View>

            <TouchableOpacity
              onPress={() => setShowCalendar(true)}
              style={styles.calendarToggle}
            >
              <Ionicons name="calendar" size={24} color="#3b82f6" />
            </TouchableOpacity>
          </View>
        </View>

        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dayList}
          >
            {generateWeekDays().map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCard,
                  selectedDate === item.fullDate && styles.activeDayCard,
                ]}
                onPress={() => setSelectedDate(item.fullDate)}
              >
                <Text
                  style={[
                    styles.dayLabel,
                    selectedDate === item.fullDate &&
                      styles.activeDayText,
                  ]}
                >
                  {item.label}
                </Text>

                <Text
                  style={[
                    styles.dayNumber,
                    selectedDate === item.fullDate &&
                      styles.activeDayText,
                  ]}
                >
                  {item.date}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <Modal visible={showCalendar} animationType="fade" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.calendarContainer}>
              <Calendar
                onDayPress={(day: any) => {
                  setSelectedDate(day.dateString);
                  setShowCalendar(false);
                }}
                markedDates={{
                  [selectedDate]: {
                    selected: true,
                    selectedColor: '#3b82f6',
                  },
                }}
              />

              <TouchableOpacity
                style={styles.closeModal}
                onPress={() => setShowCalendar(false)}
              >
                <Text style={styles.closeModalText}>Chiudi</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.mealList}
        >
          {mealTypes.map((type) => {
            const meal = plan?.[selectedDate]?.[type];

            return (
              <View key={type} style={styles.slotCard}>
                <Text style={styles.slotType}>{type}</Text>

                {meal ? (
                  <View style={styles.recipeContent}>
                    <View style={styles.iconCircle}>
                      <Ionicons
                        name={
                          meal.type === 'pantry'
                            ? 'basket'
                            : 'restaurant'
                        }
                        size={20}
                        color="#3b82f6"
                      />
                    </View>

                    <View style={styles.recipeInfo}>
                      <Text style={styles.recipeTitle}>
                        {meal.nome}
                      </Text>

                      <Text style={styles.recipeSub}>
                        {meal.type === 'recipe'
                          ? `${meal.tempoPreparazione || 0} min`
                          : 'Dalla Dispensa'}
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() =>
                        removeFromPlan(selectedDate, type)
                      }
                    >
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color="#ef4444"
                      />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                      Alert.alert(
                        'Aggiungi',
                        "Scegli l'origine del pasto",
                        [
                          {
                            text: 'Ricette',
                            onPress: () =>
                              router.push({
                                pathname: '/recipes',
                                params: {
                                  pickerMode: 'true',
                                  mealType: type,
                                  returnTo: 'planner',
                                },
                              }),
                          },
                          {
                            text: 'Dispensa',
                            onPress: () =>
                              router.push({
                                pathname: '/pantry',
                                params: {
                                  pickerMode: 'true',
                                  mealType: type,
                                  returnTo: 'planner',
                                },
                              }),
                          },
                          {
                            text: 'Annulla',
                            style: 'cancel',
                          },
                        ]
                      );
                    }}
                  >
                    <Ionicons
                      name="add-circle-outline"
                      size={20}
                      color="#888"
                    />

                    <Text style={styles.addText}>
                      Aggiungi al piano
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}

          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },

  container: {
    flex: 1,
    paddingHorizontal: 20,
  },

  header: {
    marginTop: 20,
    marginBottom: 15,
  },

  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  welcomeText: {
    fontSize: 16,
    color: '#666',
  },

  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },

  calendarToggle: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 12,
  },

  dayList: {
    paddingVertical: 10,
    marginBottom: 15,
  },

  dayCard: {
    backgroundColor: '#fff',
    width: 60,
    height: 75,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  activeDayCard: {
    backgroundColor: '#3b82f6',
  },

  dayLabel: {
    fontSize: 12,
    color: '#888',
    textTransform: 'capitalize',
  },

  dayNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },

  activeDayText: {
    color: '#fff',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },

  calendarContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 15,
  },

  closeModal: {
    marginTop: 15,
    alignItems: 'center',
  },

  closeModalText: {
    color: '#3b82f6',
    fontWeight: 'bold',
    fontSize: 16,
  },

  mealList: {
    flex: 1,
  },

  slotCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
  },

  slotType: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 12,
    letterSpacing: 1,
  },

  recipeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },

  recipeInfo: {
    flex: 1,
    marginLeft: 15,
  },

  recipeTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },

  recipeSub: {
    fontSize: 12,
    color: '#888',
  },

  addButton: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  addText: {
    marginLeft: 10,
    color: '#888',
    fontSize: 14,
  },
});

export default PlannerScreen;