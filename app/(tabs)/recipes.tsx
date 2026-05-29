import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState, useRef } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList
} from 'react-native';
import { useAppContext } from '../context/AppContext';

const RECIPE_CATEGORIES = ['antipasto', 'primo', 'secondo', 'dolce', 'spuntino'];
const AVAILABLE_UNITS = ['pz', 'g', 'kg', 'ml', 'l'];

const CATEGORY_CONFIG: { [key: string]: { label: string, icon: string, type: 'ionicons' | 'material', color: string } } = {
  'all': { label: 'Tutte', icon: 'apps-outline', type: 'ionicons', color: '#fff' },
  'antipasto': { label: 'Antipasti', icon: 'leaf-outline', type: 'ionicons', color: '#10b981' },
  'primo': { label: 'Primi', icon: 'noodles', type: 'material', color: '#f59e0b' }, // Accorciato in 'Primi' per salvare spazio
  'secondo': { label: 'Secondi', icon: 'food-drumstick-outline', type: 'material', color: '#ef4444' },
  'dolce': { label: 'Dolci', icon: 'cake-variant-outline', type: 'material', color: '#6366f1' },
  'spuntino': { label: 'Spuntini', icon: 'fast-food-outline', type: 'ionicons', color: '#06b6d4' },
};

const CATEGORY_IMAGES: { [key: string]: string } = {
  'antipasto': 'https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=1200&q=80', 
  'primo': 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=1200&q=80',    
  'secondo': 'https://images.unsplash.com/photo-1532597311687-5c2dc87fff52?auto=format&fit=crop&w=1200&q=80',   
  'dolce': 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=1200&q=80',     
  'spuntino': 'https://images.unsplash.com/photo-1600271801401-65fe5f623a9a?auto=format&fit=crop&w=1200&q=80', 
  'default': 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=1200&q=80'    
};

const getDifficultyColor = (diff: string) => {
  switch (diff?.toLowerCase()?.trim()) {
    case 'bassa':
    case 'facile':
    case 'facili':
      return '#10b981';
    case 'media':
    case 'medie':
      return '#f97316';
    case 'alta':
    case 'difficile':
    case 'difficili':
      return '#ef4444';
    default:
      return '#64748b';
  }
};

export default function RecipesScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const isFocused = useIsFocused();
  
  const flatListRef = useRef<FlatList>(null);

  const { recipes = [], pantry = [], addRecipe, updateRecipe, deleteRecipe, activePicker, closePicker } = useAppContext();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<any>(null);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('tutti');
  const [timeFilter, setTimeFilter] = useState<'tutti' | 'breve' | 'medio' | 'lungo'>('tutti');

  const isPickerMode = activePicker?.isOpen && activePicker?.target === 'recipes';
  const mealType = activePicker?.mealType;

  const filteredRecipes = recipes.filter((recipe: any) => {
    const matchesSearch = recipe.nome?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || recipe.categoria?.toLowerCase() === selectedCategory;
    
    const recipeDiff = recipe.difficolta?.toLowerCase()?.trim();
    const filterDiff = difficultyFilter?.toLowerCase()?.trim();
    const matchesDifficulty = difficultyFilter === 'tutti' || 
      recipeDiff === filterDiff || 
      (filterDiff === 'bassa' && recipeDiff === 'facile') ||
      (filterDiff === 'alta' && recipeDiff === 'difficile');
    
    let matchesTime = true;
    const minutes = recipe.tempoPreparazione || 0;
    if (timeFilter === 'breve') matchesTime = minutes < 20;
    else if (timeFilter === 'medio') matchesTime = minutes >= 20 && minutes <= 40;
    else if (timeFilter === 'lungo') matchesTime = minutes > 40;

    return matchesSearch && matchesCategory && matchesDifficulty && matchesTime;
  });

  useEffect(() => {
    if (!isFocused) {
      closePicker();
    } else if (params?.recipeIdOpen) {
      const targetId = params.recipeIdOpen as string;
      setSelectedId(targetId);

      const targetRecipe = recipes.find((r: any) => String(r.id) === targetId);
      if (targetRecipe) {
        setSearchQuery('');
        setDifficultyFilter('tutti');
        setTimeFilter('tutti');
        if (targetRecipe.categoria) {
          setSelectedCategory(targetRecipe.categoria.toLowerCase().trim());
        }

        setTimeout(() => {
          const index = filteredRecipes.findIndex((r: any) => String(r.id) === targetId);
          if (index !== -1 && flatListRef.current) {
            flatListRef.current.scrollToIndex({
              index,
              animated: true,
              viewPosition: 0.2
            });
          }
        }, 300);
      }
    }
  }, [isFocused, params?.recipeIdOpen]);

  const [form, setForm] = useState({
    nome: '', descrizione: '', categoria: 'primo', tempo: '', porzioni: '', 
    difficolta: 'Media', 
    procedimento: '', note: '',
    ingredienti: [{ nome: '', qta: '', unita: 'pz' }]
  });

  const handleCancelSelection = () => {
    closePicker();
    router.setParams({ recipeIdOpen: undefined });
  };

  const handleSelectForPlanner = (recipe: any) => {
    const missingIngredients: string[] = [];
    
    if (recipe.ingredienti && Array.isArray(recipe.ingredienti)) {
      recipe.ingredienti.forEach((ing: any) => {
        const name = typeof ing === 'string' ? ing : ing.nome;
        if (name && name.trim()) {
          const cleanName = name.trim().toLowerCase();
          const inPantry = pantry.some((pItem: any) => pItem?.nome?.trim().toLowerCase() === cleanName);
          if (!inPantry) {
            const formattedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
            missingIngredients.push(formattedName);
          }
        }
      });
    }

    router.push({
      pathname: '/planner',
      params: {
        selectedItem: 'true',
        mealType: mealType, 
        item: JSON.stringify(recipe),
        origin: 'recipe',
        addItems: missingIngredients.length > 0 ? JSON.stringify(missingIngredients) : undefined
      }
    });
    
    closePicker(); 
  };

  const openForm = (recipe?: any) => {
    if (recipe) {
      setEditingRecipe(recipe);
      setForm({
        nome: recipe.nome, descrizione: recipe.descrizione, 
        categoria: RECIPE_CATEGORIES.includes(recipe.categoria?.toLowerCase()?.trim()) ? recipe.categoria.toLowerCase().trim() : 'primo',
        tempo: (recipe.tempoPreparazione || '').toString(), 
        difficolta: recipe.difficolta || 'Media',
        porzioni: (recipe.porzioni || '').toString(), 
        procedimento: Array.isArray(recipe.procedimento) ? recipe.procedimento.join('\n') : recipe.procedimento, 
        note: recipe.note || '',
        ingredienti: recipe.ingredienti && recipe.ingredienti.length > 0 
          ? recipe.ingredienti.map((ing: any) => ({ nome: ing.nome || '', qta: ing.qta || '', unita: ing.unita || 'pz' }))
          : [{ nome: '', qta: '', unita: 'pz' }]
      });
    } else {
      setEditingRecipe(null);
      setForm({ 
        nome: '', descrizione: '', categoria: 'primo', tempo: '', porzioni: '', 
        difficolta: 'Media', procedimento: '', note: '', ingredienti: [{ nome: '', qta: '', unita: 'pz' }] 
      });
    }
    setModalVisible(true);
  };

  const handleIngredientChange = (index: number, field: 'nome' | 'qta' | 'unita', value: string) => {
    const updatedIngredients = [...form.ingredienti];
    updatedIngredients[index] = { ...updatedIngredients[index], [field]: value };
    setForm({ ...form, ingredienti: updatedIngredients });
  };

  const toggleUnit = (index: number) => {
    const updatedIngredients = [...form.ingredienti];
    const currentUnit = updatedIngredients[index].unita || 'pz';
    const currentIndex = AVAILABLE_UNITS.indexOf(currentUnit);
    const nextIndex = (currentIndex + 1) % AVAILABLE_UNITS.length;
    updatedIngredients[index].unita = AVAILABLE_UNITS[nextIndex];
    setForm({ ...form, ingredienti: updatedIngredients });
  };

  const addIngredientRow = () => {
    setForm({
      ...form,
      ingredienti: [...form.ingredienti, { nome: '', qta: '', unita: 'pz' }]
    });
  };

  const removeIngredientRow = (index: number) => {
    if (form.ingredienti.length === 1) {
      setForm({ ...form, ingredienti: [{ nome: '', qta: '', unita: 'pz' }] });
    } else {
      const updatedIngredients = form.ingredienti.filter((_, i) => i !== index);
      setForm({ ...form, ingredienti: updatedIngredients });
    }
  };

  const handleSave = () => {
    if (!form.nome.trim() || !form.procedimento.trim()) return;
  
    const catLow = form.categoria.toLowerCase().trim();
    const selectedImg = editingRecipe?.immagine 
      ? editingRecipe.immagine 
      : (CATEGORY_IMAGES[catLow] || CATEGORY_IMAGES.default);
  
    const recipeData = {
      id: editingRecipe ? editingRecipe.id : Date.now().toString(),
      nome: form.nome,
      descrizione: form.descrizione,
      categoria: form.categoria,
      tempoPreparazione: parseInt(form.tempo) || 0,
      difficolta: form.difficolta,
      porzioni: parseInt(form.porzioni) || 1,
      procedimento: form.procedimento,
      note: form.note,
      ingredienti: form.ingredienti,
      immagine: selectedImg 
    };
  
    if (editingRecipe) updateRecipe(recipeData);
    else addRecipe(recipeData);
    setModalVisible(false);
  };

  const openDeleteConfirm = (id: any) => {
    setRecipeToDelete(String(id));
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = () => {
    if (recipeToDelete) {
      deleteRecipe(recipeToDelete);
      setSelectedId(null);
      setDeleteModalVisible(false);
      setRecipeToDelete(null);
    }
  };

  const renderRecipeItem = ({ item }: { item: any }) => {
    const isRecipeFocused = selectedId === String(item.id);
    return (
      <View style={[styles.card, isRecipeFocused && styles.focusedCard]}>
        <TouchableOpacity 
          activeOpacity={0.8}
          onPress={() => setSelectedId(isRecipeFocused ? null : String(item.id))}
        >
          <Image 
            source={ item.immagine ? (typeof item.immagine === 'string' ? { uri: item.immagine } : item.immagine)
            : { uri: CATEGORY_IMAGES[item.categoria?.toLowerCase()?.trim()] || CATEGORY_IMAGES.default } }  
            style={styles.cardImg} 
            resizeMode="cover"
            fadeDuration={0}
          />
          <View style={styles.cardContent}>
            <View style={styles.rowBetween}>
              <Text style={styles.title} numberOfLines={1}>{item.nome}</Text>
              <Text style={styles.catBadge}>{item.categoria?.toUpperCase()}</Text>
            </View>

            <View style={styles.specsRow}>
              <View style={styles.specInlineItem}>
                <Ionicons name="restaurant-outline" size={14} color="#64748b" />
                <Text style={styles.specInlineText}>Difficoltà: </Text>
                <Text style={[styles.specInlineValue, { color: getDifficultyColor(item.difficolta) }]}>
                  {item.difficolta === 'Bassa' || item.difficolta === 'Facile' || item.difficolta === 'Facili' ? 'Facile' : item.difficolta === 'Media' || item.difficolta === 'Medie' ? 'Media' : 'Difficile'}
                </Text>
              </View>
              <View style={styles.specInlineItem}>
                <Ionicons name="time-outline" size={14} color="#64748b" />
                <Text style={styles.specInlineText}>Prep: </Text>
                <Text style={styles.specInlineValue}>{item.tempoPreparazione || 0} min</Text>
              </View>
              <View style={styles.specInlineItem}>
                <Ionicons name="people-outline" size={14} color="#64748b" />
                <Text style={styles.specInlineText}>Dosi: </Text>
                <Text style={styles.specInlineValue}>{item.porzioni || 1} {item.porzioni === 1 ? 'pers.' : 'pers.'}</Text>
              </View>
            </View>
            
            {isPickerMode && (
              <TouchableOpacity 
                style={styles.selectBtn} 
                onPress={() => handleSelectForPlanner(item)}
              >
                <Text style={styles.selectBtnText}>SELEZIONA PER {String(mealType || '').toUpperCase()}</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>

        {isRecipeFocused && (
          <View style={styles.details}>
            {item.descrizione ? (
              <View>
                <Text style={styles.sub}>Descrizione:</Text>
                <Text style={styles.txt}>{item.descrizione}</Text>
              </View>
            ) : null}

            <Text style={styles.sub}>Ingredienti:</Text>
            {item.ingredienti?.map((ing: any, i: number) => (
              <Text key={i} style={styles.txt}>
                • {ing.nome} ({ing.qta} {ing.unita || ''})
              </Text>
            ))}

            <Text style={styles.sub}>Procedimento:</Text>
            <Text style={styles.txt}>
              {Array.isArray(item.procedimento) ? item.procedimento.join('\n') : item.procedimento}
            </Text>
            
            {item.note ? (
              <View>
                <Text style={styles.sub}>Note:</Text>
                <Text style={styles.txt}>{item.note}</Text>
              </View>
            ) : null}

            {!isPickerMode && (
              <View style={styles.actions}>
                <Pressable 
                  onPress={() => openForm(item)}
                  style={({ pressed }) => [styles.actionButton, { opacity: pressed ? 0.6 : 1 }]}
                >
                  <Ionicons name="pencil" size={20} color="#2f95dc"/>
                </Pressable>
                <Pressable 
                  onPress={() => openDeleteConfirm(item.id)}
                  style={({ pressed }) => [styles.actionButton, { opacity: pressed ? 0.6 : 1 }]}
                >
                  <Ionicons name="trash" size={20} color="red"/>
                </Pressable>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header compresso */}
      <View style={styles.header}>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={styles.headerTitle}>{isPickerMode ? "Scegli Ricetta" : "Ricette"}</Text>
          {isPickerMode && (
             <TouchableOpacity onPress={handleCancelSelection} style={{ marginTop: 2 }}>
                <Text style={styles.cancelSelectionText}>Annulla selezione</Text>
             </TouchableOpacity>
          )}
        </View>

        {!isPickerMode && (
          <TouchableOpacity onPress={() => openForm()}>
            <Ionicons name="add-circle" size={42} color="#2f95dc" />
          </TouchableOpacity>
        )}
      </View>

      {/* Ricerca compressa */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color="#94a3b8" style={{ marginRight: 6 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cerca ricette per nome..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Sezione Filtri ultra-compatta */}
      <View style={styles.filtersWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScrollPadding}>
          <View style={styles.categoriesBlockContainer}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.categoryCard, selectedCategory === 'all' && styles.categoryCardActive]}
              onPress={() => setSelectedCategory('all')}
            >
              <Ionicons name={CATEGORY_CONFIG.all.icon as any} size={18} color={selectedCategory === 'all' ? '#fff' : '#007fff'} style={{ marginRight: 5 }} />
              <Text style={[styles.categoryLabel, selectedCategory === 'all' && styles.categoryLabelActive]}>
                {CATEGORY_CONFIG.all.label}
              </Text>
            </TouchableOpacity>

            {RECIPE_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              const config = CATEGORY_CONFIG[cat] || { label: cat, icon: 'restaurant', type: 'ionicons', color: '#64748b' };
              return (
                <TouchableOpacity
                  key={cat}
                  activeOpacity={0.8}
                  style={[styles.categoryCard, isSelected && styles.categoryCardActive]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  {config.type === 'ionicons' ? (
                    <Ionicons name={config.icon as any} size={18} color={isSelected ? '#fff' : config.color} style={{ marginRight: 5 }} />
                  ) : (
                    <MaterialCommunityIcons name={config.icon as any} size={18} color={isSelected ? '#fff' : config.color} style={{ marginRight: 5 }} />
                  )}
                  <Text style={[styles.categoryLabel, isSelected && styles.categoryLabelActive]} numberOfLines={1}>
                    {config.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScrollPadding}>
          <View style={styles.pillsRowWrap}>
            <TouchableOpacity style={[styles.statusPill, difficultyFilter === 'tutti' && styles.statusPillActive]} onPress={() => setDifficultyFilter('tutti')}>
              <Text style={[styles.statusPillText, difficultyFilter === 'tutti' && styles.statusPillTextActive]}>Tutti</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.statusPill, (difficultyFilter === 'Bassa' || difficultyFilter === 'Facile') && styles.statusPillActiveState]} onPress={() => setDifficultyFilter('Bassa')}>
              <Text style={styles.statusPillText}>Facili</Text>
              <View style={[styles.dot, { backgroundColor: '#10b981' }]} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.statusPill, difficultyFilter === 'Media' && styles.statusPillActiveState]} onPress={() => setDifficultyFilter('Media')}>
              <Text style={styles.statusPillText}>Medie</Text>
              <View style={[styles.dot, { backgroundColor: '#f97316' }]} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.statusPill, difficultyFilter === 'Alta' && styles.statusPillActiveState]} onPress={() => setDifficultyFilter('Alta')}>
              <Text style={styles.statusPillText}>Difficili</Text>
              <View style={[styles.dot, { backgroundColor: '#ef4444' }]} />
            </TouchableOpacity>
          </View>
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScrollPadding}>
          <View style={styles.pillsRowWrap}>
            <TouchableOpacity style={[styles.statusPill, timeFilter === 'tutti' && styles.statusPillActive]} onPress={() => setTimeFilter('tutti')}>
              <Text style={[styles.statusPillText, timeFilter === 'tutti' && styles.statusPillTextActive]}>Tutti tempi</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.statusPill, timeFilter === 'breve' && styles.statusPillActiveState]} onPress={() => setTimeFilter('breve')}>
              <Text style={styles.statusPillText}>&lt; 20 min ⏱️</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.statusPill, timeFilter === 'medio' && styles.statusPillActiveState]} onPress={() => setTimeFilter('medio')}>
              <Text style={styles.statusPillText}>20-40 min ⏱️</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.statusPill, timeFilter === 'lungo' && styles.statusPillActiveState]} onPress={() => setTimeFilter('lungo')}>
              <Text style={styles.statusPillText}>&gt; 40 min ⏱️</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      <FlatList
        ref={flatListRef}
        data={filteredRecipes}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderRecipeItem}
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
        onScrollToIndexFailed={(info) => {
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({ index: info.index, animated: true, viewPosition: 0.2 });
          }, 100);
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={40} color="#cbd5e1" />
            <Text style={styles.emptyText}>Nessuna ricetta trovata.</Text>
          </View>
        }
      />
      
      {/* Modale Inserimento/Modifica */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <View style={styles.modalTop}>
            <Text style={styles.modalTitle}>{editingRecipe ? 'Modifica Ricetta' : 'Nuova Ricetta'}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close-circle" size={30} color="#cbd5e1" />
            </TouchableOpacity>
          </View>
          
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex: 1}}>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>NOME *</Text>
              <TextInput style={styles.input} value={form.nome} onChangeText={t => setForm({...form, nome: t})} placeholder="Es. Pasta alla carbonara" />
              
              <Text style={styles.label}>CATEGORIA *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesChipsContainer}>
                {RECIPE_CATEGORIES.map(cat => (
                  <TouchableOpacity 
                    key={cat} 
                    style={[styles.categoryChip, form.categoria === cat && styles.categoryChipActive]} 
                    onPress={() => setForm({...form, categoria: cat})}
                  >
                    <Text style={[styles.categoryChipText, form.categoria === cat && styles.categoryChipTextActive]}>
                      {cat.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.label}>DIFFICOLTÀ *</Text>
              <View style={styles.difficultyContainer}>
                {['Bassa', 'Media', 'Alta'].map(diff => (
                  <TouchableOpacity
                    key={diff}
                    style={[styles.diffBtn, form.difficolta === diff && { backgroundColor: getDifficultyColor(diff), borderColor: 'transparent' }]}
                    onPress={() => setForm({ ...form, difficolta: diff })}
                  >
                    <Text style={[styles.diffBtnText, form.difficolta === diff && { color: '#fff' }]}>
                      {diff === 'Bassa' ? 'FACILE' : diff === 'Media' ? 'MEDIA' : 'DIFFICILE'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.row}>
                <View style={{flex:1}}>
                  <Text style={styles.label}>MINUTI *</Text>
                  <TextInput style={styles.input} keyboardType="numeric" value={form.tempo} onChangeText={t => setForm({...form, tempo: t})} placeholder="30" />
                </View>
                <View style={{flex:1}}>
                  <Text style={styles.label}>PORZIONI *</Text>
                  <TextInput style={styles.input} keyboardType="numeric" value={form.porzioni} onChangeText={t => setForm({...form, porzioni: t})} placeholder="4" />
                </View>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, marginBottom: 4 }}>
                <Text style={[styles.label, { marginTop: 0, marginBottom: 0 }]}>INGREDIENTI *</Text>
                <TouchableOpacity onPress={addIngredientRow} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="add-circle-outline" size={16} color="#007fff" />
                  <Text style={{ color: '#007fff', fontWeight: '700', fontSize: 12 }}>Aggiungi</Text>
                </TouchableOpacity>
              </View>

              {form.ingredienti.map((ing, index) => (
                <View key={index} style={{ flexDirection: 'row', gap: 6, alignItems: 'center', marginBottom: 6 }}>
                  <TextInput style={[styles.input, { flex: 2, marginBottom: 0, paddingVertical: 8 }]} value={ing.nome} onChangeText={t => handleIngredientChange(index, 'nome', t)} placeholder="Ingredienti" />
                  <TextInput style={[styles.input, { flex: 0.8, marginBottom: 0, paddingVertical: 8 }]} keyboardType="numeric" value={ing.qta} onChangeText={t => handleIngredientChange(index, 'qta', t)} placeholder="Q.tà" />
                  <TouchableOpacity activeOpacity={0.7} onPress={() => toggleUnit(index)} style={[styles.input, { flex: 0.7, marginBottom: 0, height: 38, justifyContent: 'center', alignItems: 'center', backgroundColor: '#e2e8f0' }]}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#1e293b' }}>{ing.unita || 'pz'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => removeIngredientRow(index)} style={{ padding: 2 }}>
                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))}

              <Text style={styles.label}>PROCEDIMENTO *</Text>
              <TextInput style={[styles.input, {height: 100, textAlignVertical: 'top'}]} multiline value={form.procedimento} onChangeText={t => setForm({...form, procedimento: t})} placeholder="Passaggi..." />

              <TouchableOpacity onPress={handleSave} style={styles.btnSave}>
                <Text style={styles.btnSaveText}>SALVA RICETTA</Text>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      {/* Modale Conferma Eliminazione */}
      <Modal transparent={true} visible={deleteModalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.confirmBox}>
            <Ionicons name="warning" size={36} color="#ef4444" />
            <Text style={styles.confirmTitle}>Sei sicuro?</Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity style={[styles.confirmBtn, styles.cancelBtn]} onPress={() => setDeleteModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Annulla</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.confirmBtn, styles.deleteBtn]} onPress={handleConfirmDelete}>
                <Text style={styles.deleteBtnText}>Elimina</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  // Ridotto il padding dell'header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 2 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#000' },
  cancelSelectionText: { color: '#ef4444', fontWeight: '700', fontSize: 13 },
  // Contratto lo spazio della barra di ricerca
  searchContainer: { paddingHorizontal: 16, marginVertical: 6 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: Platform.OS === 'ios' ? 8 : 6, borderRadius: 12 },
  searchInput: { flex: 1, fontSize: 14, color: '#1e293b' },
  // Ridotti i margini e i gap del blocco filtri
  filtersWrapper: { flexDirection: 'column', gap: 6, marginBottom: 8 },
  horizontalScrollPadding: { paddingHorizontal: 16, alignItems: 'center' },
  categoriesBlockContainer: { flexDirection: 'row', gap: 6 },
  // CAMBIO COMPLETO: Layout orizzontale, più basso ed elegante per risparmiare spazio verticale
  categoryCard: { flexDirection: 'row', height: 36, backgroundColor: '#fff', borderRadius: 12, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.02, shadowRadius: 3, elevation: 1 },
  categoryCardActive: { backgroundColor: '#007fff' },
  categoryLabel: { fontSize: 12, fontWeight: '700', color: '#1e293b' },
  categoryLabelActive: { color: '#fff' },
  pillsRowWrap: { flexDirection: 'row', gap: 5, alignItems: 'center' },
  // Compresse le pillole di stato secondarie
  statusPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e2e8f0', paddingHorizontal: 10, height: 28, borderRadius: 14, gap: 4 },
  statusPillActive: { backgroundColor: '#007fff' },
  statusPillActiveState: { backgroundColor: '#cbd5e1', borderWidth: 1, borderColor: '#94a3b8' },
  statusPillText: { fontSize: 12, fontWeight: '700', color: '#475569' },
  statusPillTextActive: { color: '#fff' },
  dot: { width: 6, height: 6, borderRadius: 3 },
  // Card del contenuto principale
  card: { backgroundColor: '#fff', borderRadius: 20, marginHorizontal: 16, marginBottom: 14, overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.03, shadowRadius: 8, borderWidth: 1.5, borderColor: 'transparent' },
  focusedCard: { borderColor: '#2f95dc', shadowColor: '#2f95dc', shadowOpacity: 0.15, elevation: 5 },
  cardImg: { width: '100%', height: 150 },
  cardContent: { padding: 12 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  title: { fontSize: 17, fontWeight: '800', color: '#1e293b', flex: 1 },
  catBadge: { backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, fontSize: 10, fontWeight: '800', color: '#64748b', overflow: 'hidden' },
  specsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 8 },
  specInlineItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  specInlineText: { fontSize: 12, color: '#64748b', fontWeight: '500' },
  specInlineValue: { fontSize: 12, fontWeight: '700', color: '#334155' },
  selectBtn: { backgroundColor: '#10b981', padding: 10, borderRadius: 10, marginTop: 12, alignItems: 'center' },
  selectBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  details: { padding: 12, borderTopWidth: 1, borderColor: '#f1f5f9', backgroundColor: '#fafafa' },
  sub: { fontWeight: 'bold', color: '#475569', marginTop: 8, fontSize: 13 },
  txt: { color: '#334155', fontSize: 13, lineHeight: 20 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 30, paddingHorizontal: 20 },
  emptyText: { color: '#64748b', fontSize: 14, textAlign: 'center', marginTop: 8 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 12, borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 10 },
  actionButton: { padding: 6, borderRadius: 6, backgroundColor: '#f1f5f9' },
  modalTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b' },
  modalBody: { padding: 16 },
  label: { fontSize: 11, fontWeight: '700', color: '#64748b', marginBottom: 4, marginTop: 12 },
  input: { backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, fontSize: 14, color: '#1e293b', marginBottom: 4 },
  categoriesChipsContainer: { flexDirection: 'row', gap: 6, paddingVertical: 2 },
  categoryChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#f1f5f9' },
  categoryChipActive: { backgroundColor: '#2f95dc' },
  categoryChipText: { fontSize: 11, fontWeight: '700', color: '#64748b' },
  categoryChipTextActive: { color: '#fff' },
  difficultyContainer: { flexDirection: 'row', gap: 6, marginVertical: 2 },
  diffBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e1', alignItems: 'center' },
  diffBtnText: { fontSize: 11, fontWeight: '700', color: '#64748b' },
  row: { flexDirection: 'row', gap: 10 },
  btnSave: { backgroundColor: '#2f95dc', padding: 14, borderRadius: 12, marginTop: 20, marginBottom: 30, alignItems: 'center' },
  btnSaveText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  confirmBox: { backgroundColor: '#fff', padding: 20, borderRadius: 20, width: '75%', alignItems: 'center' },
  confirmTitle: { fontSize: 16, fontWeight: '800', color: '#1e293b', marginTop: 10, marginBottom: 16 },
  confirmButtons: { flexDirection: 'row', gap: 10, width: '100%' },
  confirmBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#f1f5f9' },
  cancelBtnText: { color: '#64748b', fontWeight: '700' },
  deleteBtn: { backgroundColor: '#ef4444' },
  deleteBtnText: { color: '#fff', fontWeight: '700' }
});