import { Alert, View, TextInput, StyleSheet, Text, ActivityIndicator, Image } from 'react-native'
import React, { useState } from 'react'
import { Pressable } from 'react-native'
import { ADDRESS } from '../Constants'
import { NavigationProp } from '@react-navigation/native'
import { checkPassword, encryptPassword } from '../passwordService'

interface RouterProps {
    navigation: NavigationProp<any, any>
}

const Register = ({ navigation }: RouterProps) => {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const signUp = async () => {
    setLoading(true);

    try {
      const passwordError = await checkPassword(password);
      if (passwordError) {
        console.log("Nieprawidłowe hasło")
        return Alert.alert(`${passwordError}`);
      }

      const hashedPassword = await encryptPassword(password);
      const response = await fetch(ADDRESS + '/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          username: username,
          password: hashedPassword
        })
      });

      if (response.ok) {
        Alert.alert('Rejestracja przebiegła pomyślnie ;)');
        setEmail('');
        setPassword('');
        setUsername('');
        navigation.navigate('Home')
      } else {
        response.text().then(errorMessage => {
            Alert.alert(errorMessage);
        });
      }

    } catch (error: any) {
        Alert.alert('Błąd rejestracji: ' + error.message);
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo.png')} style={styles.image}></Image>
      <TextInput value={email} style={styles.input} placeholder="e-mail" autoCapitalize='none' onChangeText={(text) => setEmail(text)} />
      <TextInput value={username} style={styles.input} placeholder="nazwa użytkownika" autoCapitalize='none' onChangeText={(text) => setUsername(text)} />
      <TextInput secureTextEntry={true} value={password} style={styles.input} placeholder="hasło" autoCapitalize='none' onChangeText={(text) => setPassword(text)} />

      {loading ? (<ActivityIndicator size='large' color='#0000ff' />)
        : (
          <Pressable onPress={signUp} style={styles.button}>
            <Text style={styles.text}>
              Zarejestruj się
            </Text>
          </Pressable>
        )}
    </View>

  )
}
export default Register;

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
    marginRight: 40
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