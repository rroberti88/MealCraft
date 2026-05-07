import React, { createContext, ReactNode, useContext, useState } from 'react';

// Modelli dati basati sulla traccia
export interface Recipe {
  id: string;
  nome: string;
  descrizione: string;
  categoria: string;
  tempoPreparazione: number; // in minuti [cite: 26]
  difficolta: 'Bassa' | 'Media' | 'Alta'; // [cite: 27]
  porzioni: number; // [cite: 28]
  ingredienti: { nome: string; qta: string }[];
}

export interface PantryItem {
  id: string;
  nome: string;
  categoria: string;
  quantita: number; // [cite: 43]
  unitaMisura: string; // [cite: 44]
  scadenza: string; // YYYY-MM-DD [cite: 45]
}

interface AppContextType {
  recipes: Recipe[];
  pantry: PantryItem[];
  addRecipe: (r: Recipe) => void;
  addToPantry: (i: PantryItem) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  // Dati fittizi iniziali per testare statistiche e filtri [cite: 7, 115]
  const [recipes, setRecipes] = useState<Recipe[]>([
    { id: '1', nome: 'Pasta al Pomodoro', descrizione: '...', categoria: 'Primi', tempoPreparazione: 15, difficolta: 'Bassa', porzioni: 2, ingredienti: [] }
  ]);
  const [pantry, setPantry] = useState<PantryItem[]>([
    { id: '1', nome: 'Farina', categoria: 'Base', quantita: 500, unitaMisura: 'g', scadenza: '2026-05-10' }
  ]);

  const addRecipe = (r: Recipe) => setRecipes([...recipes, r]);
  const addToPantry = (i: PantryItem) => setPantry([...pantry, i]);

  return (
    <AppContext.Provider value={{ recipes, pantry, addRecipe, addToPantry }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};