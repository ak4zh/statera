// import { persist, localStorage } from '@macfja/svelte-persistent-store';
import { writable } from 'svelte/store';

export const darkMode = writable(false); // persist(writable(false), localStorage(), 'darkMode');
