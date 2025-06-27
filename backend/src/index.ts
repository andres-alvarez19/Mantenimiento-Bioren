// backend/src/index.ts

import express from 'express';
import cors from 'cors';
import equipmentRoutes from './routes/equipment';
import issueRoutes from './routes/issues';
import userRoutes from './routes/users'; // <-- ESTA ES LA LÍNEA QUE FALTABA

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// API de prueba
app.get('/api', (req, res) => {
    res.send('API de Bioren funcionando!');
});

// Rutas de la aplicación
app.use('/api/equipment', equipmentRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/users', userRoutes); // Ahora 'userRoutes' ya es conocido

app.listen(PORT, () => {
    console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});