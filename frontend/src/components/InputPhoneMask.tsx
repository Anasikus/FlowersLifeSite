import React from "react";

// Форматирование номера: +7 (XXX) XXX-XX-XX
const formatPhoneNumber = (value: string) => {
  let digits = value.replace(/\D/g, "");

  // Приводим к виду, начинающемуся с 7
  if (digits.startsWith("8")) digits = "7" + digits.slice(1);
  if (!digits.startsWith("7")) digits = "7" + digits;

  digits = digits.slice(0, 11); // максимум 11 цифр

  const part1 = digits.slice(1, 4);
  const part2 = digits.slice(4, 7);
  const part3 = digits.slice(7, 9);
  const part4 = digits.slice(9, 11);

  let result = "+7";
  if (part1) result += ` (${part1}`;
  if (part1.length === 3) result += ")";
  if (part2) result += ` ${part2}`;
  if (part3) result += `-${part3}`;
  if (part4) result += `-${part4}`;

  return result;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
};

const InputPhoneMask: React.FC<Props> = ({ value, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    onChange(formatted);
  };

  return (
    <input
      type="tel"
      value={value}
      onChange={handleChange}
      placeholder="+7 (___) ___-__-__"
      maxLength={18}
      required
    />
  );
};

export const getCleanPhone = (val: string) => val.replace(/\D/g, "");

export default InputPhoneMask;
