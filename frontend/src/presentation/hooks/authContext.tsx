import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import { api } from '../../services/api';

interface User {
    id: string;
    username: string;
    isCompleted: boolean;
}

interface AuthContextType {
    token: string | null;
    user: User | null;
    isLoading: boolean;
    login: (token: string, userData: User) => Promise<void>;
    updateUser: (userData: Partial<User>) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const bootstrapAsync = async () => {
            try {
                const savedToken = await SecureStore.getItemAsync('userToken');
                const savedUser = await SecureStore.getItemAsync('userData'); // โหลดข้อมูล User มา

                if (savedToken) {
                    api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
                    setToken(savedToken);

                    if (savedUser) {
                        setUser(JSON.parse(savedUser)); // คืนค่าสถานะ User เข้าระบบ
                    }
                }
            } catch (e) {
                console.error("Failed to load auth data", e);
            } finally {
                setIsLoading(false);
            }
        };
        bootstrapAsync();
    }, []);

    const login = async (newToken: string, userData: User) => {
        await SecureStore.setItemAsync('userToken', newToken);
        await SecureStore.setItemAsync('userData', JSON.stringify(userData)); // บันทึก User ลงเครื่อง
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        setToken(newToken);
        setUser(userData);
    };

    const updateUser = async (updatedFields: Partial<User>) => {
        if (user) {
            const newUser = { ...user, ...updatedFields };
            setUser(newUser);
            await SecureStore.setItemAsync('userData', JSON.stringify(newUser)); // อัปเดตข้อมูลที่บันทึกไว้
        }
    };

    const logout = async () => {
        await SecureStore.deleteItemAsync('userToken');
        await SecureStore.deleteItemAsync('userData');
        delete api.defaults.headers.common['Authorization'];
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ token, user, isLoading, login, updateUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};