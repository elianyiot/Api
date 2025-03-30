const express = require('express');
const app = express();
app.use(express.json());
let users = [];

app.get('/', (req, res) => {
    res.send('API funcionando correctamente');
});

app.get('/users', (req, res) => {
    res.json(users);
});

app.post('/users', (req, res) => {
    users.push(req.body);
    res.status(201).json({ message: 'Usuario agregado' });
});

const usersDB = [{ username: "admin", password: "1234" }];
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = usersDB.find(u => u.username === username &&
        u.password === password);
    if (!user) return res.status(401).json({
        message:
            'Credenciales incorrectas'
    });
    res.json({ message: 'Autenticación exitosa' });
});

const authMiddleware = (req, res, next) => {
    const { username, password } = req.headers;
    const user = usersDB.find(u => u.username === username &&
        u.password === password);
    if (!user) return res.status(403).json({
        message: 'Acceso denegado'
    });
    next();
};
app.get('/secure-data', authMiddleware, (req, res) => {
    res.json({ message: 'Accediste a datos protegidos' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`API corriendo en el puerto ${PORT}`);
});