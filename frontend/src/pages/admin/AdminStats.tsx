import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import AdminHeader from '../../components/AdminHeader';

interface DailyStat {
  date: string;
  count: number;
}

interface AdminStatsResponse {
  totalOrders: number;
  totalClients: number;
  totalSum: string;
  dailyStats: DailyStat[];
}

const AdminStats = () => {
  const [stats, setStats] = useState<AdminStatsResponse>({
    totalOrders: 0,
    totalClients: 0,
    totalSum: '0.00',
    dailyStats: []
  });

  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(() =>
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:4000/admin/stats?startDate=${startDate}&endDate=${endDate}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Ошибка загрузки аналитики:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handlePeriodChange = () => {
    fetchStats();
  };

  const chartData = {
    labels: stats.dailyStats.map((item) =>
      new Date(item.date).toLocaleDateString()
    ),
    datasets: [
      {
        label: 'Заказы за день',
        data: stats.dailyStats.map((item) => item.count),
        fill: false,
        borderColor: 'rgba(75,192,192,1)',
        tension: 0.2
      }
    ]
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <div className="p-6">
      <AdminHeader />
      <h2 className="text-2xl font-bold mb-4">Аналитика</h2>

      {/* Выбор периода */}
      <div className="flex gap-4 mb-6 items-end">
        <div>
          <label className="block text-sm font-medium">С:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">По:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded p-2"
          />
        </div>
        <button
          onClick={handlePeriodChange}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Применить
        </button>
      </div>

      {/* Основная статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold">Всего заказов</h3>
          <p className="text-2xl">{stats.totalOrders}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold">Клиентов</h3>
          <p className="text-2xl">{stats.totalClients}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold">Общая сумма</h3>
          <p className="text-2xl">{stats.totalSum} ₽</p>
        </div>
      </div>

      {/* График */}
      <div className="bg-white p-4 rounded shadow"
        style={{ height: "500px", width: "1157px" }}
      >
        <h3 className="text-lg font-semibold mb-2">График заказов</h3>
        <Line data={chartData} />
      </div>
    </div>
  );
};

export default AdminStats;
