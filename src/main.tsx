import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { validateFirestoreConnection } from './services/firebase';

validateFirestoreConnection();

createRoot(document.getElementById('root')!).render(<App />);
