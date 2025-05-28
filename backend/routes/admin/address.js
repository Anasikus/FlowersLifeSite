const express = require("express");
const router = express.Router();
const addressController = require("../../controllers/addressController");
const db = require('../../config/db');

// Адреса
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM address');
    res.json(rows);
  } catch (err) {
    console.error('Ошибка получения адресов:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});
router.post("/", addressController.createAddress);
router.put("/:id", addressController.updateAddress);
router.delete("/:id", addressController.deleteAddress);

module.exports = router;
