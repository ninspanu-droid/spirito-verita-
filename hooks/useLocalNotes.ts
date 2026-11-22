import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'spirito-verita:local-notes:v1';

export function useLocalNotes() {
  const [note, setNote] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (active && value !== null) setNote(value);
      })
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const save = async (value: string) => {
    setNote(value);
    await AsyncStorage.setItem(STORAGE_KEY, value);
  };

  const clear = async () => {
    setNote('');
    await AsyncStorage.removeItem(STORAGE_KEY);
  };

  return { note, save, clear, loaded };
}
