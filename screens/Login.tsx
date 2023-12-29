import { Alert, View, TextInput, StyleSheet, Text, ActivityIndicator, Image } from 'react-native'
import React, { useState, useContext } from 'react'
import { Pressable } from 'react-native'
import { AuthContext } from '../AuthContext'
import { ADDRESS } from '../Constants'
import { NavigationProp } from '@react-navigation/native'
import { verifyPassword } from '../passwordService'

interface RouterProps {
    navigation: NavigationProp<any, any>
}
const Login = ({ navigation }: RouterProps) => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const { setIsAuthenticated, storeToken } = useContext(AuthContext);

    const signIn = async () => {
        setLoading(true);
        try {
            const response = await fetch(ADDRESS + '/getUserByUsername', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username
                }),
            });

            const data = await response.json();

            if (response.ok) {
                const user = data.user;
                if (await verifyPassword(password, user.password)) {
                    await userToken(user);
                } else {
                    await updateLoginAttempts(user)
                }
            } else {
                const errorMessage = data.message || 'Wystąpił błąd';
                throw new Error(errorMessage);
            }
        } catch (error: any) {
            console.error('Błąd logowania:', error);
            Alert.alert('Błąd logowania: ' + error.message);
        } finally {
            setLoading(false)
        }
    }

    const userToken = async (user: any) => {
        try {
            const response = await fetch(ADDRESS + '/login', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user: user
                }),
            });

            const data = await response.json();
            if (response.ok) {
                const token = data.token;
                await storeToken(token);
                setIsAuthenticated(true);
                navigation.navigate('MainScreen');
            } else {
                const errorMessage = data.message || 'Wystąpił błąd';
                throw new Error(errorMessage);
            }
        } catch (error: any) {
            console.error('Błąd:', error);
            Alert.alert('Błąd: ' + error.message);
        }
    }

    const updateLoginAttempts = async (user: any) => {
        try {
            const respons = await fetch(ADDRESS + '/updateUserLoginAttempts', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user: user
                }),
            });

            if (respons.ok) {
                Alert.alert("Podano błędne hasło. Proszę spróbować ponownie.")
            }
        } catch (error: any) {
            console.error('Błąd:', error);
            Alert.alert('Błąd: ' + error.message);
        }
    }

    return (
        <View style={styles.container}>
            <Image source={require('../assets/logo.png')} style={styles.image}></Image>
            <TextInput value={username} style={styles.input} placeholder="nazwa uzytkownika" autoCapitalize='none' onChangeText={(text) => setUsername(text)} placeholderTextColor="gray"/>
            <TextInput secureTextEntry={true} value={password} style={styles.input} placeholder="hasło" autoCapitalize='none' onChangeText={(text) => setPassword(text)} placeholderTextColor="gray"/>

            {loading ? (<ActivityIndicator size='large' color='#0000ff' />)
                : (
                    <Pressable onPress={signIn} style={styles.button}>
                        <Text style={styles.text}>
                            Zaloguj się
                        </Text>
                    </Pressable>
                )}
        </View>

    )
}
export default Login;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'white',
        borderColor: 'white',
    },
    input: {
        marginVertical: 4,
        height: 50,
        padding: 10,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderRadius: 10,
        borderColor: '#f2bc0c',
        marginTop: 10,
        marginLeft: 40,
        marginRight: 40,
        color: 'black'
    },
    image: {
        alignSelf: 'center',
        width: 150,
        height: 175,
        marginTop: -150
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
    }
})