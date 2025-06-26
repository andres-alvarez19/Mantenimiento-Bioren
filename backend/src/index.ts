import express from 'express';
import cors from 'cors';
import equipmentRoutes from './routes/equipment'; // <-- LÍNEA CLAVE

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

app.get('/api', (req, res) => {
    res.send('API de Bioren funcionando!');
});

app.use('/api/equipment', equipmentRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});