// backend/src/index.ts

import express from 'express';
import cors from 'cors';
import equipmentRoutes from './routes/equipment';
import issueRoutes from './routes/issues';
const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// Rutas existentes
app.get('/api', (req, res) => {
    res.send('API de Bioren funcionando!');
});
app.use('/api/equipment', equipmentRoutes);

// Usamos las nuevas rutas
app.use('/api/issues', issueRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});