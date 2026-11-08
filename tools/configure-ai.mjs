import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { writeFile } from 'node:fs/promises';
const rl = createInterface({input, output});
console.log('\nCAI DAT GEMINI API CHO MATH 3D MUSEUM');
console.log('Tao khoa tai https://aistudio.google.com/apikey');
console.log('Khoa chi luu tren may nay trong file .env. Khong chia se file .env.');
const key = (await rl.question('Dan Gemini API key vao day (Enter de huy): ')).trim();
if (!/^AIza[\w-]{20,}$/.test(key)) {
  console.log('Khong ghi file: khoa rong hoac khong dung dinh dang.');
} else {
  await writeFile(new URL('../.env', import.meta.url), `GEMINI_API_KEY=${key}\nGEMINI_MODEL=gemini-2.5-flash\n`, {mode:0o600});
  console.log('Da luu .env. Hay khoi dong lai ung dung de su dung AI.');
}
rl.close();
