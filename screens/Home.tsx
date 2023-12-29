import { View, Text, StyleSheet, Pressable, Image} from 'react-native'
import React from 'react'
import { NavigationProp } from '@react-navigation/native'

interface RouterProps {
    navigation: NavigationProp<any, any>
}

const Home = ({ navigation }: RouterProps) => {

    const signIn = async() => {
        navigation.navigate('Login');
    }

    const signUp = async() => {
        navigation.navigate('Register');
    }

    return (
        <View style={styles.container}>
            <Image source={require('../assets/logo.png')} style={styles.image}></Image>
            <Pressable onPress={signIn} style={styles.button}>
                <Text style={styles.text}>
                    Zaloguj się
                </Text>
            </Pressable>
            <View style={styles.grayBar}>
                <View style={styles.separator} />
                <Text style={styles.textSeparator}>LUB</Text>
                <View style={styles.separator} />
            </View>
            <Pressable onPress={signUp} style={styles.button}>
                <Text style={styles.text}>
                    Załóż nowe konto
                </Text>
            </Pressable>
        </View>

    )
}
export default Home;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'white',
        borderColor: 'white'
    },
    image: {
        alignSelf: 'center',
        width: 215,
        height: 240
    },
    grayBar: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 30
      },
      textSeparator: {
        fontSize: 15,
        color: 'grey',
        marginRight: 10, 
        marginLeft: 10
      },
      separator: {
        flex: 1, 
        height: 1, 
        backgroundColor: '#ccc',
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