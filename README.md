# ITQAN - Sistem Mutaba'ah Tahfidz Terpadu

Aplikasi mutaba'ah tahfidz terpadu berbasis web yang dirancang untuk pesantren dan halaqoh Al-Qur'an. Berfokus pada fast-logging musyrif, kurikulum target pacing 3 tahun, digital tap counter ujian tasmi', serta pelaporan progres harian dan rapor santri.

## Fitur Utama
- **Fast-Logging Halaqoh**: Input setoran ziyadah & muroja'ah cepat berbasis surah, ayat, dan halaman standar mushaf 15 baris.
- **Pacing Engine Adaptif**: Kalkulasi otomatis target harian 30 Juz dalam 3 tahun (36 bulan).
- **Digital Tap Counter Ujian**: Simulasi ujian tasmi' dengan penghitung tawaqquf & fath digital.
- **Rapor & WhatsApp Digest**: Generator pesan progres harian untuk wali santri.

## Tech Stack
- React 19 + TypeScript + Vite
- Tailwind CSS
- GSAP & Lucide Icons
- React Router DOM

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://npmx.dev/package/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://npmx.dev/package/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
