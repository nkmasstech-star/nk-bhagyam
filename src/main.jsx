import { render } from 'preact';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '@fontsource/cinzel-decorative/900.css';
import '@fontsource/poppins/400.css';
import './styles.css';
import { App } from './App.jsx';
import { applyTheme, DEFAULT_THEME } from './data/themes.js';
let saved = DEFAULT_THEME; try { saved = JSON.parse(localStorage.getItem('nk_theme')) || DEFAULT_THEME; } catch (e) { /* ignore */ }
applyTheme(saved);
render(<App />, document.getElementById('app'));
