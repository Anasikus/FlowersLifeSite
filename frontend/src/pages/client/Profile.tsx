import { useEffect, useState } from 'react';
import Header from '../../components/Header'; // убедись, что путь правильный

interface UserProfile {
  id: number;
  username: string;
  role: string;
  name: string;
  mail: string;
}

const Profile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('http://localhost:4000/users/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (res.ok) {
          setProfile(data);
        } else {
          console.error('Ошибка получения профиля:', data.message);
        }
      } catch (error) {
        console.error('Ошибка запроса:', error);
      }
    };

    fetchProfile();
  }, []);

  if (!profile) {
    return (
      <>
        <Header />
        <p style={{ textAlign: 'center', padding: '2rem' }}>Загрузка профиля...</p>
      </>
    );
  }

  return (
    <>
      <Header />
      <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>👤 Профиль пользователя</h2>
        <p><strong>Имя:</strong> {profile.name}</p>
        <p><strong>Телефон:</strong> {profile.username}</p>
        <p><strong>Email:</strong> {profile.mail}</p>
        <p><strong>Роль:</strong> {profile.role}</p>
      </div>
    </>
  );
};

export default Profile;
