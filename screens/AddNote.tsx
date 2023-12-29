import React, { useState } from 'react'
import {Alert, Pressable, SafeAreaView, StyleSheet, TextInput, Text, View, ActivityIndicator} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Checkbox } from 'react-native-paper';
import { ADDRESS } from '../Constants'
import { NavigationProp } from '@react-navigation/native'
import CryptoJS from 'react-native-crypto-js'
import { checkPassword, encryptPassword } from '../passwordService'

interface RouterProps {
    navigation: NavigationProp<any, any>
}

const AddNote = ({navigation}: RouterProps) => {
    const [title, setTitle] = useState('')
    let [content, setContent] = useState('')
    const [isEncrypted, setEncrypted] = useState(false);
    let [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const handleCheckboxChange = () => {
        if (isEncrypted) {
          setPassword('');
        }
        setEncrypted(!isEncrypted);
      };

    const getToken = async () => {
        try {
          const token = await AsyncStorage.getItem('userToken');
          return token;
        } catch (e) {
          console.log(e);
          return null;
        }
      };

      const encryptContent = () => {
        return CryptoJS.AES.encrypt(JSON.stringify(content), password).toString();
      }

    const addNote = async() => {
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
            const response = await fetch(ADDRESS + `/addNote`, {
                method: 'POST',
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
            })
            if (response.ok) {
                Alert.alert('Notatka została dodana prawidłowo.');
                setContent('');
                setTitle('');
                navigation.navigate('MainScreen');
              } else {
                Alert.alert('Błąd dodawania notatki.');
              }
        } catch (error: any) {
            console.error('Błąd dodawania notatki:', error);
            Alert.alert('Błąd dodawania notatki: ' + error.message);
        } finally {
          setLoading(false)
      }
    }

    return (
        <SafeAreaView style={{ backgroundColor: 'white', height: 900 }}>
            <TextInput
                style={styles.input}
                onChangeText={setTitle}
                value={title}
                placeholder="Tytuł"
                multiline={true}
                placeholderTextColor="gray"
            />
            <TextInput
                style={styles.inputContent}
                onChangeText={setContent}
                value={content}
                placeholder="Notatka..."
                multiline={true}
                placeholderTextColor="gray"
            />
            <View style={styles.checkboxContainer}>
                <Checkbox
                    status={isEncrypted ? 'checked' : 'unchecked'}
                    onPress={handleCheckboxChange}
                      color='#f2bc0c'
                      uncheckedColor='#f2bc0c'
                />
                <Text style={styles.label}>Szyfrowanie notatki</Text>
            </View>
            {isEncrypted && (
                <TextInput
                style={styles.input}
                onChangeText={setPassword}
                value={password}
                placeholder="hasło notatki"
                placeholderTextColor="gray"
                secureTextEntry={true}
            />
             )} 
{loading ? (<ActivityIndicator size='large' color='#0000ff' />)
                : (
            <Pressable onPress={addNote} style={styles.button}>
                <Text style={styles.text}>
                    Dodaj notatkę
                </Text>
            </Pressable>
            )}
        </SafeAreaView>
      );
}

export default AddNote

const styles = StyleSheet.create({
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
        marginRight: 40
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