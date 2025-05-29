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
  address: number; // idAddress
  addressName?: string; // опционально название, для отображения

}

interface Address {
  idAddress: number;
  name: string;
}

const Profile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<UserProfile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
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
          const updatedProfile = {
            ...data,
            address: parseInt(data.address), // преобразуем строку idAddress в число
            addressName: data.address // сохраним название отдельно
          };
          setProfile(updatedProfile);
          setFormData(updatedProfile);
        } else {
          console.error('Ошибка получения профиля:', data.message);
        }
      } catch (error) {
        console.error('Ошибка запроса:', error);
      }
    };

    const fetchAddresses = async () => {
      try {
        const res = await fetch('http://localhost:4000/admin/addresses');
        const data = await res.json();
        setAddresses(data);
      } catch (err) {
        console.error('Ошибка загрузки адресов:', err);
      }
    };

    fetchProfile();
    fetchAddresses();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!formData) return;
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isValidAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 18 && age <= 100;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    if (!isValidAge(formData.dateOfBirth)) {
      alert('Возраст должен быть от 18 до 100 лет');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const form = new FormData();
      form.append('surname', formData.surname);
      form.append('name', formData.name);
      form.append('patronymic', formData.patronymic);
      form.append('dateOfBirth', formData.dateOfBirth);
      form.append('mail', formData.mail);
      form.append('username', formData.username);
      form.append('address', formData.address.toString()); // это idAddress
      if (photoFile) {
        form.append('photo', photoFile);
      }

      const res = await fetch('http://localhost:4000/users/profile/update', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: form
      });

      const data = await res.json();
      if (res.ok) {
        alert('Профиль обновлён');
        setProfile(formData);
        setIsEditing(false);
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
            <p><br /> <img src={`http://localhost:4000${profile?.photo}`} alt="Фото" width={150} /></p>
            <p><strong>Фамилия:</strong> {profile?.surname}</p>
            <p><strong>Имя:</strong> {profile?.name}</p>
            <p><strong>Отчество:</strong> {profile?.patronymic}</p>
            <p><strong>Дата рождения:</strong> {profile?.dateOfBirth}</p>
            <p><strong>Почта:</strong> {profile?.mail}</p>
            <p><strong>Телефон:</strong> {profile?.username}</p>
            <p><strong>Адрес:</strong> {addresses.find(a => a.idAddress === profile?.address)?.name || profile?.addressName || 'Неизвестно'}</p>
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
            <label>Адрес доставки:
            <select
              name="address"
              value={formData.address.toString()} // приведение к строке
              onChange={(e) =>
                setFormData({ ...formData, address: parseInt(e.target.value) }) // вернуть число
              }
            >
              <option value="">Выберите адрес</option>
              {addresses.map(addr => (
                <option key={addr.idAddress} value={addr.idAddress}>{addr.name}</option>
              ))}
            </select>

            </label><br />
            <label>Фото:
              <input type="file" accept="image/*" onChange={(e) => {
                if (e.target.files) {
                  setPhotoFile(e.target.files[0]);
                }
              }} />
            </label><br />
            <button type="submit">Сохранить</button>
            <button type="button" onClick={() => {
              setFormData(profile);
              setIsEditing(false);
              setPhotoFile(null);
            }}>Отмена</button>
          </form>
        )}
      </div>
    </>
  );
};

export default Profile;
