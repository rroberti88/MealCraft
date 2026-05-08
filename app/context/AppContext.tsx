import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

// Struttura dati per le Ricette
export interface Recipe {
  id: string;
  nome: string;
  descrizione: string;
  categoria: string;
  tempoPreparazione: number;
  difficolta: 'Bassa' | 'Media' | 'Alta';
  porzioni: number;
  ingredienti: { nome: string; qta: string }[];
  procedimento: string;
  note?: string;
  immagine: string;
}

// Struttura dati per la Dispensa
export interface PantryItem {
  id: string;
  nome: string;
  categoria: string;
  quantita: number;
  unitaMisura: string;
  scadenza: string;
}

interface AppContextType {
  recipes: Recipe[];
  pantry: PantryItem[];
  setPantry: React.Dispatch<React.SetStateAction<PantryItem[]>>;
  addToPantry: (item: PantryItem) => void;
  addRecipe: (recipe: Recipe) => void;
  updateRecipe: (recipe: Recipe) => void;
  deleteRecipe: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [pantry, setPantry] = useState<PantryItem[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  // 1. CARICAMENTO DATI ALL'AVVIO
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedPantry = await AsyncStorage.getItem('@pantry');
        const savedRecipes = await AsyncStorage.getItem('@recipes');
        
        if (savedPantry) setPantry(JSON.parse(savedPantry));
        
        if (savedRecipes) {
          setRecipes(JSON.parse(savedRecipes));
        } else {
          // Dati iniziali di esempio
          const defaultRecipes: Recipe[] = [
            {
              id: 'r1',
              nome: 'Salmone al Limone',
              descrizione: 'Un secondo piatto leggero.',
              categoria: 'Secondi',
              tempoPreparazione: 20,
              difficolta: 'Bassa',
              porzioni: 2,
              ingredienti: [{ nome: 'Salmone', qta: '2 tranci' }],
              procedimento: 'Spremi il limone e inforna a 180°C per 15 min.',
              note: 'Ottimo con asparagi.',
              immagine: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500'
            }
          ];
          setRecipes(defaultRecipes);
          await AsyncStorage.setItem('@recipes', JSON.stringify(defaultRecipes));
        }
      } catch (e) {
        console.error("Errore caricamento AsyncStorage:", e);
      }
    };
    loadData();
  }, []);

  // 2. FUNZIONI CRUD CON SALVATAGGIO IMMEDIATO
  // Usiamo funzioni che aggiornano lo stato e salvano subito per evitare perdite di dati
  
  const addRecipe = async (newRecipe: Recipe) => {
    const updatedRecipes = [newRecipe, ...recipes];
    setRecipes(updatedRecipes);
    await AsyncStorage.setItem('@recipes', JSON.stringify(updatedRecipes));
  };

  const updateRecipe = async (updatedRecipe: Recipe) => {
    const updatedRecipes = recipes.map(r => r.id === updatedRecipe.id ? updatedRecipe : r);
    setRecipes(updatedRecipes);
    await AsyncStorage.setItem('@recipes', JSON.stringify(updatedRecipes));
  };

  const deleteRecipe = async (id: string) => {
    const updatedRecipes = recipes.filter(r => r.id !== id);
    setRecipes(updatedRecipes);
    await AsyncStorage.setItem('@recipes', JSON.stringify(updatedRecipes));
  };

  // 3. GESTIONE DISPENSA
  const addToPantry = async (newItem: PantryItem) => {
    const existing = pantry.find(i => i.nome.toLowerCase() === newItem.nome.toLowerCase());
    let newPantry;
    
    if (existing) {
      newPantry = pantry.map(i => i.nome.toLowerCase() === newItem.nome.toLowerCase() 
        ? { ...i, quantita: i.quantita + newItem.quantita } : i);
    } else {
      newPantry = [...pantry, newItem];
    }
    
    setPantry(newPantry);
    await AsyncStorage.setItem('@pantry', JSON.stringify(newPantry));
  };

  return (
    <AppContext.Provider value={{ 
      recipes, pantry, setPantry, addToPantry, 
      addRecipe, updateRecipe, deleteRecipe 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext deve essere usato all\'interno di AppProvider');
  return context;
};