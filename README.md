# Hisobfy — Landing sahifasi

## Loyihani ishga tushirish (cmd orqali)

1. Loyiha papkasini biror joyga chiqaring (masalan `C:\Users\user\Downloads\hisobfy`).
2. `cmd` oching va papkaga o'ting:
   ```
   cd C:\Users\user\Downloads\hisobfy
   ```
3. Kutubxonalarni o'rnating (faqat birinchi marta):
   ```
   npm install
   ```
4. Saytni ishga tushiring:
   ```
   npm run dev
   ```
5. Terminalda chiqqan manzilni (masalan `http://localhost:5173`) brauzerda oching.

## Sahifalar
- `/` — asosiy landing sahifa
- `/login` — kirish sahifasi
- `/register` — ro'yxatdan o'tish sahifasi

## Tayyor versiya (production build)
```
npm run build
```
Bu `dist` papkasini yaratadi — shu papkani istalgan hosting (Vercel, Netlify va h.k.) ga yuklash mumkin.
