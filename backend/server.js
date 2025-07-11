import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js';
import cardRoutes from './routes/cardRoutes.js';
import pokemonRoutes from './routes/pokemonRoutes.js';
import { loadCardNames } from './cache.js';

dotenv.config();

const app = express();

// --- CONFIGURACIÓN DE CORS ESPECÍFICA ---
const whitelist = [
    'http://localhost:3000',
    'https://ppp-team-rocket-m4tzst3p0-martin-peraltas-projects.vercel.app' // <-- CORREGIDO
];

const corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
};

app.use(cors(corsOptions)); 

// Middleware
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/pokemon', pokemonRoutes);

// Ruta raíz
app.get('/', (req, res) => {
  res.send('API funcionando correctamente');
});

// Conexión a MongoDB Atlas
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB Atlas');
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error.message);
    process.exit(1);
  }
};

// Función para iniciar el servidor de forma ordenada
const startServer = async () => {
  await connectDB();
  await loadCardNames();

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  });
};

// Iniciar todo el proceso
startServer();