import React, { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedPantry = await AsyncStorage.getItem('@pantry');
        const savedRecipes = await AsyncStorage.getItem('@recipes');
        if (savedPantry) setPantry(JSON.parse(savedPantry));
        if (savedRecipes) setRecipes(JSON.parse(savedRecipes));
      } catch (e) {
        console.error("Errore nel caricamento dei dati", e);
      }
    };
    loadData();
  }, []);

  const addRecipe = async (newRecipe: Recipe) => {
    const updated = [newRecipe, ...recipes];
    setRecipes(updated);
    await AsyncStorage.setItem('@recipes', JSON.stringify(updated));
  };

  const updateRecipe = async (updatedRecipe: Recipe) => {
    const updated = recipes.map(r => r.id === updatedRecipe.id ? updatedRecipe : r);
    setRecipes(updated);
    await AsyncStorage.setItem('@recipes', JSON.stringify(updated));
  };

  const deleteRecipe = async (id: string) => {
    const updated = recipes.filter(r => r.id !== id);
    setRecipes(updated);
    await AsyncStorage.setItem('@recipes', JSON.stringify(updated));
  };

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
    <AppContext.Provider value={{ recipes, pantry, setPantry, addToPantry, addRecipe, updateRecipe, deleteRecipe }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext deve essere usato dentro AppProvider');
  return context;
};