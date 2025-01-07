import React, { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { darkModeState } from '../atoms/darkMode';
import { Switch } from '@mui/material';

const DarkModeSlider: React.FC = () => {
  const [darkMode, setDarkMode] = useRecoilState(darkModeState);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDarkMode(event.target.checked);
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="flex items-center justify-between mt-4 px-4 dark:bg-black">
      <span className="text-gray-700 dark:text-gray-200 ">Dark Mode</span>
      <Switch
        checked={darkMode}
        onChange={handleChange}
        name="darkMode"
        color="primary"
      />
    </div>
  );
};

export default DarkModeSlider;
