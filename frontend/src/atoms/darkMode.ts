import { atom } from 'recoil';

export const darkModeState = atom<boolean>({
  key: 'darkModeState',
  default: localStorage.getItem('theme') === 'dark',
});

