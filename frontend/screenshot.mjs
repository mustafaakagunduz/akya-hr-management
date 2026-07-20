import { chromium } from '@playwright/test';
import { mkdirSync } from 'fs';

const OUT_DIR = '../docs/screenshots';
mkdirSync(OUT_DIR, { recursive: true });

const unique = Date.now().toString().slice(-9);
const employee = {
  firstName: 'Zeynep',
  lastName: `Demir${unique.slice(-4)}`,
  nationalId: unique.padStart(11, '2'),
  email: `zeynep.demir.${unique}@sirket.com`,
  phone: '5559876543',
  department: 'Pazarlama',
  position: 'Uzman',
  startDate: '2023-03-01',
  birthDate: '1994-11-20',
  password: 'Sifre123',
};

// Önceki çalıştırmalardan kalan bekleyen talepleri temizle (temiz ekran görüntüsü için)
async function clearAllPending() {
  const loginRes = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@sirket.com', password: 'Admin123!' }),
  });
  const { accessToken } = await loginRes.json();
  const pendingRes = await fetch('http://localhost:3000/leaves/pending', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const pending = await pendingRes.json();
  for (const item of pending) {
    await fetch(`http://localhost:3000/leaves/${item.id}/reject`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }
}
await clearAllPending();

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.on('console', (msg) => console.log('BROWSER:', msg.type(), msg.text()));
page.on('response', (res) => {
  if (res.url().includes('/leaves')) {
    console.log('RESPONSE:', res.status(), res.url());
  }
});
page.on('pageerror', (err) => console.log('PAGEERROR:', err.message));

// Login
await page.goto('http://localhost:5173/login');
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT_DIR}/01-login.png` });

// Register
await page.goto('http://localhost:5173/register');
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT_DIR}/02-register.png` });

// Register the demo employee via the form
await page.getByTestId('register-firstName').fill(employee.firstName);
await page.getByTestId('register-lastName').fill(employee.lastName);
await page.getByTestId('register-nationalId').fill(employee.nationalId);
await page.getByTestId('register-email').fill(employee.email);
await page.getByTestId('register-phone').fill(employee.phone);
await page.getByTestId('register-department').fill(employee.department);
await page.getByTestId('register-position').fill(employee.position);
await page.getByTestId('register-startDate').fill(employee.startDate);
await page.getByTestId('register-birthDate').fill(employee.birthDate);
await page.getByTestId('register-password').fill(employee.password);
await page.getByTestId('register-submit').click();
await page.waitForURL('**/login');

// Login as employee
await page.getByTestId('login-email').fill(employee.email);
await page.getByTestId('login-password').fill(employee.password);
await page.getByTestId('login-submit').click();
await page.waitForURL('**/panel');
await page.waitForTimeout(300);

// Create a leave request so the table has data
await page.getByTestId('leave-type').selectOption('ANNUAL');
await page.getByTestId('leave-start-date').fill('2026-09-10');
await page.getByTestId('leave-end-date').fill('2026-09-12');
await page.getByTestId('leave-description').fill('Aile ziyareti');
await page.getByTestId('leave-submit').click();
try {
  await page.getByTestId('leave-create-success').waitFor({ timeout: 5000 });
} catch {
  console.log('UYARI: leave-create-success görünmedi, body:', await page.textContent('body'));
}
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT_DIR}/03-personel-paneli.png`, fullPage: true });

await page.getByTestId('logout-button').click();
await page.waitForURL('**/login');

// Login as manager
await page.getByTestId('login-email').fill('admin@sirket.com');
await page.getByTestId('login-password').fill('Admin123!');
await page.getByTestId('login-submit').click();
await page.waitForURL('**/panel');
console.log('manager link visible?', await page.getByRole('link', { name: 'Yönetici Paneli' }).count());
await page.getByRole('link', { name: 'Yönetici Paneli' }).click();
await page.waitForURL('**/yonetici');
console.log('current url:', page.url());
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT_DIR}/04-yonetici-paneli.png`, fullPage: true });

await browser.close();
console.log('Ekran görüntüleri kaydedildi:', OUT_DIR);
