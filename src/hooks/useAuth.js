import { useContext } from 'react';
import { AuthContext } from '../context/AuthContextBase';

export const useAuth = () => useContext(AuthContext);
