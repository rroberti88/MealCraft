import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

// Definizione modelli dati
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
  immagine: string; // Campo per l'URL della foto
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
  setPantry: React.Dispatch<React.SetStateAction<PantryItem[]>>; // Risolve errore
  addToPantry: (item: PantryItem) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [pantry, setPantry] = useState<PantryItem[]>([]);
  
  // Database Ricette con immagini fotorealistiche
  const [recipes] = useState<Recipe[]>([
    {
      id: 'r1',
      nome: 'Salmone al Limone',
      descrizione: 'Un secondo leggero e profumato, perfetto per una cena sana.',
      categoria: 'Secondi',
      tempoPreparazione: 20,
      difficolta: 'Bassa',
      porzioni: 2,
      ingredienti: [
        { nome: 'Tranci di salmone', qta: '2' },
        { nome: 'Limone', qta: '1' },
        { nome: 'Prezzemolo', qta: 'qb' }
      ],
      procedimento: "1. Adagia i tranci su carta forno. 2. Copri con fette di limone. 3. Inforna a 180°C per 15 minuti.",
      immagine: 'http://googleusercontent.com/image_collection/image_retrieval/2990935221230499478_0'
    },
    {
      id: 'r2',
      nome: 'Risotto ai Funghi',
      descrizione: 'Un classico della cucina italiana, cremoso e saporito.',
      categoria: 'Primi',
      tempoPreparazione: 40,
      difficolta: 'Media',
      porzioni: 4,
      ingredienti: [
        { nome: 'Riso Carnaroli', qta: '320g' },
        { nome: 'Funghi Porcini', qta: '300g' },
        { nome: 'Brodo Vegetale', qta: '1L' }
      ],
      procedimento: "1. Tosta il riso. 2. Aggiungi i funghi e sfuma col brodo un mestolo alla volta. 3. Manteca con burro e parmigiano.",
      immagine: 'http://googleusercontent.com/image_collection/image_retrieval/6892171262187972154_0'
    }
  ]);

  // Caricamento dati persistenti all'avvio
  useEffect(() => {
    AsyncStorage.getItem('@pantry').then(data => {
      if (data) setPantry(JSON.parse(data));
    });
  }, []);

  // Salvataggio automatico su disco
  useEffect(() => {
    AsyncStorage.setItem('@pantry', JSON.stringify(pantry));
  }, [pantry]);

  const addToPantry = (newItem: PantryItem) => {
    setPantry(prev => {
      const existing = prev.find(i => i.nome.toLowerCase() === newItem.nome.toLowerCase());
      if (existing) {
        return prev.map(i => i.nome.toLowerCase() === newItem.nome.toLowerCase() 
          ? { ...i, quantita: i.quantita + newItem.quantita } : i);
      }
      return [...prev, newItem];
    });
  };

  return (
    <AppContext.Provider value={{ recipes, pantry, setPantry, addToPantry }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};