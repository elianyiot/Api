const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto-js');
const helmet = require('helmet');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(helmet());
app.use(cors());

const usersDB = [];

//verificar que la API está corriendo
app.get('/', (req, res) => {
    res.json({ message: 'API corriendo correctamente' });
});

// Registrar usuarios con contraseña hasheada
app.post('/users', async (req, res) => {
    const { username, password } = req.body;
    if (usersDB.find(u => u.username === username)) {
        return res.status(400).json({ message: 'Usuario ya existe' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    usersDB.push({ username, password: hashedPassword });
    res.status(201).json({ message: 'Usuario registrado con éxito' });
});

// Login con JWT
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = usersDB.find(u => u.username === username);
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Credenciales incorrectas' });
    }
    const token = jwt.sign({ username }, 'secreto_jwt', { expiresIn: '1h' });
    res.json({ message: 'Autenticación exitosa', token });
});

// Middleware de autenticación con JWT
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(403).json({ message: 'Acceso denegado' });

    jwt.verify(token, 'secreto_jwt', (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Token inválido' });
        req.user = decoded;
        next();
    });
};

// Endpoint protegido
app.get('/secure-data', authMiddleware, (req, res) => {
    const user = usersDB.find(u => u.username === req.user.username);

    if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({
        message: `Hola ${req.user.username}, accediste a datos protegidos`,
        userData: {
            username: user.username,
            passwordHashed: user.password 
        }
    });
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API corriendo en el puerto ${PORT}`));
