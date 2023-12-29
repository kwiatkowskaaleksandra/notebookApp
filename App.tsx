import Home from './screens/Home';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator  } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import IconStickyNote from 'react-native-vector-icons/FontAwesome';
import IconSettings from 'react-native-vector-icons/Ionicons'
import { AuthProvider } from './AuthContext';
import Login from './screens/Login';
import Register from './screens/Register';
import Notebook from './screens/Notebook';
import Settings from './screens/Settings';
import AddNote from './screens/AddNote';
import OpenNote from './screens/OpenNote';
import MyProfile from './screens/MyProfile';

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  Notebook: undefined;
  Settings: undefined;
  MainScreen: undefined;
  AddNote: undefined;
  OpenNote: { id: number };
  MyProfile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>()
const Tab = createBottomTabNavigator();
function MainScreen() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Notebook" component={Notebook} options={{
        tabBarIcon: () => (
          <IconStickyNote name="sticky-note" size={24} color="#f2bc0c" />
        )
      }} />
      <Tab.Screen name="Ustawienia" component={Settings} options={{
        tabBarIcon: () => (
          <IconSettings name="settings" size={24} color="#f2bc0c" />
        )
      }} />
    </Tab.Navigator>
  );
}

export default function App() {
  
  
  return (
    <AuthProvider  >
      <NavigationContainer >
        <Stack.Navigator initialRouteName="Home" >
          <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
          <Stack.Screen name="Login" component={Login} options={{ headerShown: true, headerTitle: 'Zaloguj się', headerTitleStyle: { fontFamily: 'PlaypenSans-Medium' } }} />
          <Stack.Screen name="Register" component={Register} options={{ headerShown: true, headerTitle: 'Zarejestruj się', headerTitleStyle: { fontFamily: 'PlaypenSans-Medium' } }} />
          <Stack.Screen name="Notebook" component={Notebook} options={{headerLeft: () => null }} />
          <Stack.Screen name="MainScreen" component={MainScreen} options={{ headerShown: false }} />
          <Stack.Screen name="AddNote" component={AddNote} options={{ headerLeft: () => null, headerTitle: 'Dodaj notatkę', headerTitleStyle: { fontFamily: 'PlaypenSans-Medium' } }} />
          <Stack.Screen name="OpenNote" component={OpenNote} initialParams={{id: 2}} options={{ headerLeft: () => null, headerTitle: '', headerTitleStyle: { fontFamily: 'PlaypenSans-Medium' } }} />
          <Stack.Screen name="MyProfile" component={MyProfile} options={{ headerLeft: () => null, headerTitle: 'Mój profil', headerTitleStyle: { fontFamily: 'PlaypenSans-Medium' } }} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}