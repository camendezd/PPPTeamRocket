import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './TRdb.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();
connectDB(); 

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);



app.get('/', (req, res) => {
    res.send('API funcionando correctamente');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
