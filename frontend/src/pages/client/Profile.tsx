import { useEffect, useState } from 'react';
import Header from '../../components/Header';

interface UserProfile {
  id: number;
  username: string;
  photo: string;
  surname: string;
  name: string;
  patronymic: string;
  dateOfBirth: string;
  mail: string;
  address: string;
}

const Profile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);

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
          setFormData(data);
        } else {
          console.error('Ошибка получения профиля:', data.message);
        }
      } catch (error) {
        console.error('Ошибка запроса:', error);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isValidAge = (dob: string) => {
    const birthDate = new Date(dob);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    return age >= 18 && age <= 100;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData && !isValidAge(formData.dateOfBirth)) {
      alert('Возраст должен быть от 18 до 100 лет');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:4000/users/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        alert('Профиль обновлён');
        setProfile(formData);
        setIsEditing(false); // Закрыть режим редактирования
      } else {
        alert('Ошибка: ' + data.message);
      }
    } catch (error) {
      console.error('Ошибка при обновлении:', error);
    }
  };

  if (!formData) return <p>Загрузка профиля...</p>;

  return (
    <>
      <Header />
      <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
        <h2>Профиль</h2>

        {!isEditing ? (
          <div>
            <p><strong>Фамилия:</strong> {profile?.surname}</p>
            <p><strong>Имя:</strong> {profile?.name}</p>
            <p><strong>Отчество:</strong> {profile?.patronymic}</p>
            <p><strong>Дата рождения:</strong> {profile?.dateOfBirth}</p>
            <p><strong>Почта:</strong> {profile?.mail}</p>
            <p><strong>Телефон:</strong> {profile?.username}</p>
            <p><strong>Адрес:</strong> {profile?.address}</p>
            <p><strong>Фото:</strong> {profile?.photo}</p>
            <button onClick={() => setIsEditing(true)}>Редактировать</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label>Фамилия: <input name="surname" value={formData.surname} onChange={handleChange} /></label><br />
            <label>Имя: <input name="name" value={formData.name} onChange={handleChange} /></label><br />
            <label>Отчество: <input name="patronymic" value={formData.patronymic} onChange={handleChange} /></label><br />
            <label>Дата рождения: <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} /></label><br />
            <label>Почта: <input name="mail" value={formData.mail} onChange={handleChange} /></label><br />
            <label>Телефон: <input name="username" value={formData.username} onChange={handleChange} /></label><br />
            <label>Адрес доставки: <input name="address" value={formData.address} onChange={handleChange} /></label><br />
            <label>Фото (URL): <input name="photo" value={formData.photo} onChange={handleChange} /></label><br />
            <button type="submit">Сохранить</button>
            <button type="button" onClick={() => {
              setFormData(profile);
              setIsEditing(false);
            }}>Отмена</button>
          </form>
        )}
      </div>
    </>
  );
};

export default Profile;
