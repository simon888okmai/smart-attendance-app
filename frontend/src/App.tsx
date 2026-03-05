import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import '../global.css';

export default function App() {
    return (
        <View className="flex-1 bg-white items-center justify-center">
            <Text className="text-xl font-bold text-blue-500">NativeWind is working! 🦊</Text>
            <StatusBar style="auto" />
        </View>
    );
}
