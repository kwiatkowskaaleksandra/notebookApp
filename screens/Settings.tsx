import { View, StyleSheet, TouchableOpacity, Text } from 'react-native'
import React, { useContext } from 'react'
import { NavigationProp } from '@react-navigation/native'
import { AuthContext } from '../AuthContext'

interface RouterProps {
    navigation: NavigationProp<any, any>
}

const Settings = ({ navigation }: RouterProps) => {
    const { signOut } = useContext(AuthContext);

    const handleLogout = async () => {
        await signOut();
        navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
        });
    };

    const myProfile = async () => {
        navigation.navigate('MyProfile')
    }
    return (
        <View style={styles.settingsContainer}>
            <TouchableOpacity style={styles.settings} onPress={myProfile}>
                <Text style={styles.settingsText}>Mój profil</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settings} onPress={handleLogout}>
                <Text style={styles.settingsText}>Wyloguj się</Text>
            </TouchableOpacity>
        </View>
    )
}

export default Settings

const styles = StyleSheet.create({
    settingsContainer: {
        flexDirection: 'row',
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: 'white',
        height: 900
    },
    settingsText: {
        fontSize: 16,
        color: '#333333',
        fontFamily: 'PlaypenSans-Medium',
    },
    settings: {
        width: 150,
        height: 50,
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 10,
        borderWidth: 1,
        borderColor: '#f2bc0c',
        marginTop: 50
    },
})