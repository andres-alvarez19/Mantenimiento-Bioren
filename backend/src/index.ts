import express from 'express';
import cors from 'cors';
import equipmentRoutes from './routes/equipment'; // Importaremos la ruta que crearemos a continuación

const app = express();
const PORT = 4000; // El frontend corre en un puerto (ej. 5173), el backend en otro.

// Middlewares: funciones que se ejecutan antes de llegar a nuestras rutas
app.use(cors()); // Permite que el frontend haga peticiones a nuestro backend
app.use(express.json()); // Permite al servidor entender JSON en el cuerpo de las peticiones

// Rutas de la API
app.get('/api', (req, res) => {
    res.send('API de Bioren funcionando!');
});

app.use('/api/equipment', equipmentRoutes); // Todas las rutas en equipment.ts empezarán con /api/equipment

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});