import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import AdminHeader from '../../components/AdminHeader';
import styles from '../../styles/AdminStats.module.css';

interface DailyStat {
  date: string;
  count: number;
}

interface Review {
  id: number;
  rating: number;
  text: string;
  created_at: string;
  surname: string;
  name: string;
}

interface AdminStatsResponse {
  totalOrders: number;
  totalClients: number;
  totalSum: string;
  dailyStats: DailyStat[];
  totalReviews: number;
  averageRating: string;
  allReviews: Review[];
}

const AdminStats = () => {
  const [stats, setStats] = useState<AdminStatsResponse>({
    totalOrders: 0,
    totalClients: 0,
    totalSum: '0.00',
    dailyStats: [],
    totalReviews: 0,
    averageRating: '',
    allReviews: [],
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
      const response = await axios.get(
        `http://localhost:4000/admin/stats?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
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
        borderColor: '#2563eb',
        backgroundColor: '#2563eb',
        tension: 0.3,
      },
    ],
  };

  if (loading) return <div style={{ padding: 24, fontSize: '18px' }}>Загрузка...</div>;

  return (
    <div className={styles.container}>
      <AdminHeader />
      <h2 className={styles.title}>Аналитика</h2>

      <div className={styles.periodBlock}>
        <div>
          <label className={styles.label}>С:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={styles.input}
          />
        </div>
        <div>
          <label className={styles.label}>По:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={styles.input}
          />
        </div>
        <button onClick={handlePeriodChange} className={styles.button}>
          Применить
        </button>
      </div>

      <div className={styles.statGrid}>
        <StatCard title="Всего заказов" value={stats.totalOrders} />
        <StatCard title="Клиентов" value={stats.totalClients} />
        <StatCard title="Общая сумма" value={`${stats.totalSum} ₽`} />
        <StatCard title="Отзывы" value={stats.totalReviews} />
        <StatCard title="Средняя оценка" value={`${stats.averageRating} ★`} />
      </div>

      <div className={styles.card}>
        <h3 className={styles.sectionTitle}>График заказов</h3>
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <div style={{ width: '100%', minWidth: '400px', height: '500px' }}>
            <Line
              data={chartData}
              options={{
                maintainAspectRatio: false,
                responsive: true,
                plugins: {
                  legend: { display: true },
                },
                scales: {
                  x: {
                    ticks: {
                      autoSkip: true,
                      maxTicksLimit: 10,
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <h3 className={styles.sectionTitle}>Отзывы клиентов</h3>
        {stats.allReviews.length === 0 ? (
          <p style={{ color: '#6b7280' }}>Отзывов пока нет.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {stats.allReviews.map((review) => (
              <li key={review.id} style={{ padding: '16px 0', borderBottom: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span className={styles.reviewName}>
                    {review.surname} {review.name}
                  </span>
                  <span className={styles.reviewRating}>★ {review.rating}</span>
                </div>
                <p className={styles.reviewText}>{review.text}</p>
                <p className={styles.reviewDate}>
                  {new Date(review.created_at).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value }: { title: string; value: string | number }) => (
  <div className={styles.statCard}>
    <h4 className={styles.statTitle}>{title}</h4>
    <p className={styles.statValue}>{value}</p>
  </div>
);

export default AdminStats;
