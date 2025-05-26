const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./config/db');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/userRoutes');
const app = express();

app.use(cors());
app.use(express.json());

// Подключение маршрутов
app.use('/auth', authRoutes);
const protectedRoutes = require('./routes/protected');
app.use('/protected', protectedRoutes);
const productsRoutes = require('./routes/products');
app.use('/products', productsRoutes);
const categoriesRoutes = require('./routes/categories');
app.use('/categories', categoriesRoutes);
const favoritesRoutes = require('./routes/favorites');
app.use('/favorites', favoritesRoutes);
const cartRoutes = require('./routes/cart');
app.use('/cart', cartRoutes);
const ordersRoutes = require('./routes/orders');
app.use('/orders', ordersRoutes);
const reviewsRoutes = require('./routes/reviews');
app.use('/reviews', reviewsRoutes);
const adminOrdersRoutes = require('./routes/admin/orders');
app.use('/admin/orders', adminOrdersRoutes);
const adminProductsRoutes = require('./routes/admin/products');
app.use('/admin/products', adminProductsRoutes);
const adminCategoriesRoutes = require('./routes/admin/categories');
app.use('/admin/categories', adminCategoriesRoutes);
const adminUsersRoutes = require('./routes/admin/users');
app.use('/admin/users', adminUsersRoutes);
const adminStatsRoutes = require('./routes/admin/stats');
app.use('/admin/stats', adminStatsRoutes);
app.use('/users', userRoutes);

// Тестовый маршрут
app.get('/', (req, res) => res.send('API работает'));

// Подключение к базе
db.query('SELECT 1')
  .then(() => console.log('✅ Подключение к MySQL успешно'))
  .catch(err => console.error('❌ Ошибка подключения:', err));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));
