import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

// Modelli dati basati sulla traccia
export interface Recipe {
  id: string;
  nome: string;
  descrizione: string;
  categoria: string;
  tempoPreparazione: number;
  difficolta: 'Bassa' | 'Media' | 'Alta';
  porzioni: number;
  ingredienti: { nome: string; qta: string }[];
}

export interface PantryItem {
  id: string;
  nome: string;
  categoria: string;
  quantita: number;
  unitaMisura: string;
  scadenza: string; // Formato YYYY-MM-DD
}

interface AppContextType {
  recipes: Recipe[];
  pantry: PantryItem[];
  setRecipes: React.Dispatch<React.SetStateAction<Recipe[]>>;
  setPantry: React.Dispatch<React.SetStateAction<PantryItem[]>>;
  addRecipe: (r: Recipe) => void;
  addToPantry: (i: PantryItem) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [pantry, setPantry] = useState<PantryItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. CARICAMENTO DATI ALL'AVVIO (Persistenza - 2 punti traccia)
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const savedPantry = await AsyncStorage.getItem('@pantry_storage');
        const savedRecipes = await AsyncStorage.getItem('@recipes_storage');
        
        if (savedPantry) setPantry(JSON.parse(savedPantry));
        else {
          // Dati iniziali se l'app è vuota (Primo avvio)
          setPantry([
            { id: '1', nome: 'Farina', categoria: 'Base', quantita: 500, unitaMisura: 'g', scadenza: '2026-12-10' },
            { id: '2', nome: 'Uova', categoria: 'Proteine', quantita: 6, unitaMisura: 'pz', scadenza: '2026-05-09' },
            { id: '3', nome: 'Latte', categoria: 'Bibite', quantita: 1, unitaMisura: 'L', scadenza: '2026-05-07' },
          ]);
        }
        
        if (savedRecipes) setRecipes(JSON.parse(savedRecipes));
        setIsLoaded(true);
      } catch (e) {
        console.error("Errore nel caricamento dati", e);
      }
    };
    loadStoredData();
  }, []);

  // 2. SALVATAGGIO AUTOMATICO (Ogni volta che cambiano i dati)
  useEffect(() => {
    if (isLoaded) {
      AsyncStorage.setItem('@pantry_storage', JSON.stringify(pantry));
    }
  }, [pantry]);

  useEffect(() => {
    if (isLoaded) {
      AsyncStorage.setItem('@recipes_storage', JSON.stringify(recipes));
    }
  }, [recipes]);

  // Funzioni helper
  const addRecipe = (r: Recipe) => setRecipes((prev) => [...prev, r]);
  
  const addToPantry = (newItem: PantryItem) => {
    setPantry((currentPantry) => {
      // Controlliamo se il prodotto esiste già per sommare la quantità (Usabilità avanzata)
      const existingIndex = currentPantry.findIndex(
        item => item.nome.toLowerCase() === newItem.nome.toLowerCase()
      );

      if (existingIndex !== -1) {
        const updatedPantry = [...currentPantry];
        updatedPantry[existingIndex].quantita += newItem.quantita;
        return updatedPantry;
      }
      return [...currentPantry, newItem];
    });
  };

  return (
    <AppContext.Provider value={{ 
      recipes, 
      pantry, 
      setRecipes, 
      setPantry, 
      addRecipe, 
      addToPantry 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};