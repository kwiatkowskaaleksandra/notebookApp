import React, { useEffect, useState } from 'react'
import { Alert, Pressable, SafeAreaView, StyleSheet, TextInput, Text, View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Checkbox } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';
import Dialog from 'react-native-dialog';
import { ADDRESS } from '../Constants'
import { NavigationProp, RouteProp } from '@react-navigation/native';
import CryptoJS from 'react-native-crypto-js'
import { checkPassword, encryptPassword, verifyPassword } from '../passwordService'

type RootStackParamList = {
  OpenNote: { id: number }; 
  MainScreen: undefined;
};
interface Note {
  id: number,
  content: string,
  isEncrypted: boolean,
  idUser: number,
  title: string,
  password: string;
  creationDate: Date
}
interface OpenNoteProps {
  route: RouteProp<RootStackParamList, 'OpenNote'>;
  navigation: NavigationProp<RootStackParamList, 'OpenNote'>;
}

const OpenNote: React.FC<OpenNoteProps> = ({ route, navigation }) => {
  const { id } = route.params;
  const [note, setNote] = useState<Note | null>(null)
  const [title, setTitle] = useState('')
  let [content, setContent] = useState('')
  const [isEncrypted, setEncrypted] = useState(false);
  let [password, setPassword] = useState('')
  const [editable, setEditable] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false)

  const getToken = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      return token;
    } catch (e) {
      console.log(e);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      getNoteById();
    });
    getNoteById();
    return unsubscribe;
  }, [navigation]);

  const handleCancel = () => {
    setDialogVisible(false);
    navigation.navigate('MainScreen');
  };

  const handlePasswordCheck = async (actionType: string, passwordConf: string | undefined) => {
    setLoading(true);
    try {
      if (note) {
        if (await verifyPassword(passwordConf as string, note.password) === false) {
          setTimeout(() => {
            if (actionType === 'delete') {
              setConfirmPassword('');
              setDeleteDialogVisible(true);
            } else if (actionType === 'open') {
              setPassword('');
              setDialogVisible(true);
            }
          }, 1000);
        } else {
          if (actionType === 'open') {
          setDialogVisible(false);
          setTitle(note.title);
          let d = await decryptContent(note.content)
          setContent(d);
          setEncrypted(note.isEncrypted);
          } else if (actionType === 'delete') {
            setConfirmPassword('');
            deleteNoteById();
            navigation.navigate('MainScreen');
        }
      }
    }
    } catch (error: any) {
      console.error('Błąd otwierania notatki:', error);
      Alert.alert('Błąd otwierania notatki: ' + error.message);
    }
    finally {
      setLoading(false)
  }
  };
  
  const handleSubmitDelete = async () => {
    setDeleteDialogVisible(false);
    await handlePasswordCheck('delete', confirmPassword);
  };
  
  const handleSubmit = async () => {
    setDialogVisible(false);
    await handlePasswordCheck('open', password);
  };

  const deleteNoteById = async () => {
    try {
      const token = await getToken();
      const response = await fetch(ADDRESS + `/deleteNote?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        Alert.alert("Notatka została usunięta prawidłowo.")
      }

    } catch (error: any) {
      console.error('Błąd usuwania notatki:', error);
      Alert.alert('Błąd usuwania notatki: ' + error.message);
    }
  }

  const decryptContent = async (ciphertext: string) => {
    setLoading(true);
    try {
      let bytes = CryptoJS.AES.decrypt(ciphertext, password);
      let decryptedData = bytes.toString(CryptoJS.enc.Utf8);
  
      if (!decryptedData) {
        throw new Error("Deszyfrowanie nie powiodło się.");
      }
  
      return JSON.parse(decryptedData);
    } catch (error) {
      throw new Error("Deszyfrowanie nie powiodło się.");
    }finally {
          setLoading(false)
      }
  } 

  const encryptContent = () => {
    return CryptoJS.AES.encrypt(JSON.stringify(content), password).toString();
  }

  const getNoteById = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const response = await fetch(ADDRESS + `/getNoteById?id=${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

        const data = await response.json();
        setNote(data)
        if (data.isEncrypted) { setDialogVisible(true) }
        else {
          setTitle(data.title);
          setContent(data.content);
          setEncrypted(data.isEncrypted === 1);
        }
      
    } catch (error: any) {
      console.error('Błąd otwierania notatki:', error);
      Alert.alert('Błąd otwierania notatki: ' + error.message);
    }finally {
      setLoading(false)
    }
  }

  const deleteNote = () => {
    if (isEncrypted) {
      setDeleteDialogVisible(true);
    } else {
      deleteNoteById();
      navigation.navigate('MainScreen');
    }
  }

  useEffect(() => {
    if (!isEncrypted) {
      setPassword('');
    }
  }, [isEncrypted]);

  const saveEdits = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      if (isEncrypted) {
        const passwordError = await checkPassword(password);
        if (passwordError) {
          console.log("Nieprawidłowe hasło")
          return Alert.alert(`${passwordError}`);
        }
        content = encryptContent();
        password = await encryptPassword(password) as string;
      }
     
      const response = await fetch(ADDRESS + `/editNoteById?id=${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: title,
          content: content,
          isEncrypted: isEncrypted,
          password: password
        })
      });

      if (response.ok) {
        Alert.alert('Notatka została edytowana prawidłowo.');
        setContent('');
        setTitle('');
        setPassword('')
        navigation.navigate('MainScreen');
      } else {
        response.text().then(errorMessage => {
          Alert.alert(errorMessage);
        });
      }
    } catch (error: any) {
      console.error('Błąd edycji notatki:', error);
      Alert.alert('Błąd edycji notatki: ' + error.message);
    }
    finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={{ backgroundColor: 'white', height: 900 }}>
      <Dialog.Container visible={dialogVisible}>
        <Dialog.Title>Hasło do notatki</Dialog.Title>
        <Dialog.Input
          placeholder="Wpisz hasło"
          placeholderTextColor="gray"
          secureTextEntry={true}
          onChangeText={setPassword}
          value={password}
        />
        <Dialog.Button label="Anuluj" onPress={handleCancel} />
        {loading ? (<ActivityIndicator size='large' color='#0000ff' />) : (<Dialog.Button label="Odszyfruj" onPress={handleSubmit} />)}
      </Dialog.Container>

      <Dialog.Container visible={deleteDialogVisible}>
        <Dialog.Title>Potwierdź usunięcie notatki hasłem</Dialog.Title>
        <Dialog.Input
          placeholder="Wpisz hasło"
          placeholderTextColor="gray"
          secureTextEntry={true}
          onChangeText={setConfirmPassword}
          value={confirmPassword}
        />
        <Dialog.Button label="Anuluj" onPress={() => setDeleteDialogVisible(false)} />
        {loading ? (<ActivityIndicator size='large' color='#0000ff' />) : (<Dialog.Button label="Usuń" onPress={handleSubmitDelete} /> )}
      </Dialog.Container>
      
      {!editable && (
        <View style={styles.buttonContainer}>
          <Pressable onPress={() => setEditable(true)} style={styles.editButton}>
            <Icon name="edit" size={24} color="#f2bc0c" />
          </Pressable>
          <Pressable onPress={deleteNote} style={styles.editButton}>
            <Icon name="trash" size={24} color="#f2bc0c" />
          </Pressable>
        </View>
      )}
      
      <TextInput
        style={styles.input}
        onChangeText={setTitle}
        value={title}
        placeholder="Tytuł"
        multiline={true}
        editable={editable}
        placeholderTextColor="gray"
      />
      <TextInput
        style={styles.inputContent}
        onChangeText={setContent}
        value={content}
        placeholder="Notatka..."
        multiline={true}
        editable={editable}
        placeholderTextColor="gray"
      />
      <View style={styles.checkboxContainer}>
        <Checkbox
          status={isEncrypted ? 'checked' : 'unchecked'}
          disabled={!editable}
          onPress={() => setEncrypted(!isEncrypted)}
          color='#f2bc0c'
          uncheckedColor='#f2bc0c'
        />
        <Text style={styles.label}>Szyfrowanie notatki</Text>
      </View>
      {isEncrypted && editable && (
        <TextInput
          style={styles.input}
          onChangeText={setPassword}
          value={password}
          placeholder="hasło notatki"
          secureTextEntry={true}
          placeholderTextColor="gray"
        />
      )}
      {loading ? (
        <ActivityIndicator size='large' color='#0000ff' />
      ) : (
        editable && (
          <Pressable onPress={saveEdits} style={styles.button}>
            <Text style={styles.text}>
              Zapisz zmiany
            </Text>
          </Pressable>
        )
      )}


    </SafeAreaView>
)}

export default OpenNote

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    borderColor: '#f2bc0c',
    color: 'black'
  },
  inputContent: {
    height: 150,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    borderColor: '#f2bc0c',
    color: 'black'
  },
  button: {
    marginTop: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#f2bc0c',
    marginLeft: 40,
    marginRight: 40,
  },
  editButton: {
    marginTop: 20,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginEnd: 10,
  },
  text: {
    color: '#f2bc0c',
    fontSize: 20,
    fontFamily: 'PlaypenSans-Bold',
  },
  checkboxContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  checkbox: {
    alignSelf: 'center',
  },
  label: {
    margin: 8,
    color: 'black'
  },
});