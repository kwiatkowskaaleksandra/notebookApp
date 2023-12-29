import { Alert, View, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ADDRESS } from '../Constants'
import { NavigationProp } from '@react-navigation/native'

interface RouterProps {
    navigation: NavigationProp<any, any>
}
type Note = {
    id: string;
    title: string;
    creationDate: Date
  };
const Notebook = ({ navigation }: RouterProps) => {
    const [notes, setNotes] = useState<Note[]>([]);

  const getToken = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      return token;
    } catch (e) {
      console.log(e);
      return null;
    }
  };

  const getAllNotes = async () => {
    try {
      const token = await getToken();
      const response = await fetch(ADDRESS + `/getAllNotes`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
        const data = await response.json();
        setNotes(data);
      
    } catch (error: any) {
      console.error('Błąd pobrania danych:', error);
      Alert.alert('Błąd pobrania danych: ' + error.message);
    }
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      getAllNotes();
    });
    getAllNotes();
    return unsubscribe;
  }, [navigation]);

  const onPressAddNote = () => {
    navigation.navigate('AddNote');
  }

  const onPressOpenNote = (noteId: any) => {
    navigation.navigate('OpenNote', { id: noteId });
  }

  return (
    <View style={styles.container}>
      <ScrollView >
        <View style={styles.notesContainer}>
          {notes.map((note, index) => {
            const date = new Date(note.creationDate);
            const formattedDate = date.toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' }).split(',')[0];

            return (
              <TouchableOpacity key={index} style={styles.note} onPress={() => onPressOpenNote(note.id)}>
                <Text style={styles.noteTitle}>{note.title}</Text>
                <Text style={styles.noteDate}>{formattedDate}</Text>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity style={styles.addButton} onPress={onPressAddNote}>
            <Text style={styles.addText}>Dodaj notatkę +</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

export default Notebook

const styles = StyleSheet.create({
  notesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    height: 900
  },
  noteTitle: {
    fontSize: 16,
    color: '#333333',
    fontFamily: 'PlaypenSans-Medium',
    textAlign: 'center',
    alignItems: 'center',
    marginTop: 50
  },
  noteDate: {
    fontSize: 10,
    color: '#333333',
    fontFamily: 'PlaypenSans-Medium',
    textAlign: 'center',
    alignItems: 'center',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    width: 150,
    height: 150,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: '#f2bc0c'
  },
  note: {
    width: 150,
    height: 150,
    borderRadius: 10,
    backgroundColor: '#f2bc0c',
    marginHorizontal: 10,
    marginBottom: 30
  },
  addText: {
    fontSize: 16,
    color: '#333333',
    fontFamily: 'PlaypenSans-Medium',
  },
});