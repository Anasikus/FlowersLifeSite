const db = require("../config/db");

const getAllAddresses = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM address");
    res.json(rows);
  } catch (err) {
    console.error("Ошибка получения адресов:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

const createAddress = async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Название обязательно" });

  try {
    await db.query("INSERT INTO address (name) VALUES (?)", [name]);
    res.status(201).json({ message: "Адрес добавлен" });
  } catch (err) {
    console.error("Ошибка добавления адреса:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

const updateAddress = async (req, res) => {
  const id = req.params.id;
  const { name } = req.body;

  try {
    await db.query("UPDATE address SET name = ? WHERE idAddress = ?", [name, id]);
    res.json({ message: "Адрес обновлен" });
  } catch (err) {
    console.error("Ошибка обновления адреса:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

const deleteAddress = async (req, res) => {
  const id = req.params.id;

  if (!id) {
    return res.status(400).json({ message: "ID адреса обязателен" });
  }

  try {
    // Обнуляем idAddress у клиентов, связанных с этим адресом
    await db.query("UPDATE clients SET idAddress = NULL WHERE idAddress = ?", [id]);

    // Удаляем сам адрес
    await db.query("DELETE FROM address WHERE idAddress = ?", [id]);

    res.json({ message: "Адрес удален" });
  } catch (err) {
    console.error("Ошибка удаления адреса:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

module.exports = {
  getAllAddresses,
  createAddress,
  updateAddress,
  deleteAddress
};
