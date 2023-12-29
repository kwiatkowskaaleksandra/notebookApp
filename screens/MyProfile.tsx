import { Alert, View, StyleSheet, Text, TextInput, SafeAreaView, Pressable, ActivityIndicator } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../AuthContext'
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import { ADDRESS } from '../Constants'
import { NavigationProp } from '@react-navigation/native'
import { checkPasswordToEdit, verifyPassword, checkPassword, encryptPassword } from '../passwordService'

interface RouterProps {
    navigation: NavigationProp<any, any>
}

const MyProfile = ({ navigation }: RouterProps) => {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [oldPassword, setOldPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [repeatedNewPassword, setRepeatedNewPasswordNewPassword] = useState('')
    const [editable, setEditable] = useState(false);
    const { signOut } = useContext(AuthContext);
    const [loading, setLoading] = useState(false)

    const handleLogout = async () => {
        await signOut();
        navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
        });
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

      useEffect(() => {
        getUser();
      }, []);
      
      const getUser = async() => {
        try {
        const token = await getToken();
        const response = await fetch(ADDRESS + `/getUser`, {
            method: 'GET', 
            headers: {
                'Authorization': `Bearer ${token}`,
              },
        });
        
            const data = await response.json()
            setEmail(data.email)
            setUsername(data.username)
            setPassword(data.password)
        }catch (error: any) {
            console.error('Błąd pobrania danych użytkownika:', error);
            Alert.alert('Błąd pobrania danych użytkownika: ' + error.message);
          }
      }

      const saveEdits = async() => {
        setLoading(true);
        try {
            if (oldPassword === '' || await verifyPassword(oldPassword, password) === false) {
                return Alert.alert("Podane stare hasło jest błędne.");
            }
            const passwordError = await checkPassword(oldPassword);
            const passwordCheck = await checkPasswordToEdit(newPassword, repeatedNewPassword)
            if (passwordError) {
                console.log("Nieprawidłowe hasło")
                return Alert.alert(`${passwordError}`);
            }
            if (passwordCheck) {
                console.log("Nieprawidłowe hasło")
                return Alert.alert(`${passwordCheck}`);
            }

            const hashedPassword = await encryptPassword(newPassword);
            const token = await getToken();
            const response = await fetch(ADDRESS + `/changePassword`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    newPassword: hashedPassword
                }),
            });

            if (response.ok) {
                Alert.alert('Hasło zostało zmienione. Proszę zalogować się ponownie.');
                setOldPassword('');
                setNewPassword('');
                setRepeatedNewPasswordNewPassword('');
                handleLogout();
            } else {
                response.text().then(errorMessage => {
                    Alert.alert(errorMessage);
                  });
            }

        } catch (error: any) {
            console.error('Błąd zmiany hasła:', error);
            Alert.alert('Błąd zmiany hasła: ' + error.message);
        }
        finally {
            setLoading(false)
        }
      }

    return (
        <SafeAreaView style={styles.settingsContainer}>
            {!editable && (
                <View style={styles.buttonContainer}>
                    <Pressable onPress={() => setEditable(true)} style={styles.editButton}>
                        <Icon name="edit" size={24} color="#f2bc0c" />
                    </Pressable>
                </View>
            )}
            <View style={styles.view}>
                <Text style={styles.label}>Nazwa użytkownika</Text>
                <Text style={styles.input}>{username}</Text>
            </View>
            <View style={styles.view}>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.input}>{email}</Text>
            </View>
            {editable && (
                <View>
                    <View style={styles.view}>
                        <Text style={styles.label}>Stare hasło</Text>
                        <TextInput secureTextEntry={true} value={oldPassword} style={styles.input} placeholder="stare hasło" autoCapitalize='none' onChangeText={(text) => setOldPassword(text)} />
                    </View>
                    <View style={styles.view}>
                        <Text style={styles.label}>Nowe hasło</Text>
                        <TextInput secureTextEntry={true} value={newPassword} style={styles.input} placeholder="nowe hasło" autoCapitalize='none' onChangeText={(text) => setNewPassword(text)} />
                    </View>
                    <View style={styles.view}>
                        <Text style={styles.label}>Powtórz nowe hasło</Text>
                        <TextInput secureTextEntry={true} value={repeatedNewPassword} style={styles.input} placeholder="powtórz nowe hasło" autoCapitalize='none' onChangeText={(text) => setRepeatedNewPasswordNewPassword(text)} />
                    </View>
                    {loading ? (<ActivityIndicator size='large' color='#0000ff' />) : (
                    <Pressable onPress={saveEdits} style={styles.button}>
                        <Text style={styles.text} >
                            Zmień hasło
                        </Text>
                    </Pressable>
            )}
                </View>
            )}
        </SafeAreaView>
    )
}

export default MyProfile

const styles = StyleSheet.create({
    buttonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end'
      },
    view: {
        flexDirection: 'row',
    },
    settingsContainer: {
        display: 'flex',
        backgroundColor: 'white',
        height: 900
    },
    input: {
        height: 40,
        width: 200,
        borderWidth: 1,
        padding: 10,
        borderColor: '#f2bc0c',
        color: 'black',
        marginTop: 20,
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10
      },
      label: {
        height: 40,
        width: 160,
        borderWidth: 1,
        padding: 10,
        borderColor: '#f2bc0c',
        color: 'black',
        marginTop: 20,
        marginLeft: 20,
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10
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
      text: {
        color: '#f2bc0c',
        fontSize: 20,
        fontFamily: 'PlaypenSans-Bold',
      },
      editButton: {
        marginTop: 20,
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginEnd: 10,
      },
})