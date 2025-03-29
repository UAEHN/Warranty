// Register the service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  });
}

// Add PWA install prompt
let deferredPrompt;
const addBtn = document.createElement('button');
addBtn.classList.add('pwa-install-button');
addBtn.style.display = 'none';
addBtn.textContent = 'تثبيت التطبيق';

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  // Update UI to notify the user they can add to home screen
  addBtn.style.display = 'block';
  
  // Show installation banner (نافذة التثبيت العلوية)
  showTopInstallPrompt();
});

function showTopInstallPrompt() {
  // تحقق ما إذا كان المستخدم قد أغلق النافذة سابقا
  const lastClosed = localStorage.getItem('pwa-install-prompt-closed');
  const now = Date.now();
  
  // إذا أغلق المستخدم النافذة خلال 24 ساعة، لا تظهرها مرة أخرى
  if (lastClosed && (now - parseInt(lastClosed) < 24 * 60 * 60 * 1000)) {
    return;
  }
  
  // إزالة أي نوافذ تثبيت سابقة
  const existingPrompt = document.querySelector('.pwa-install-prompt');
  if (existingPrompt) {
    existingPrompt.remove();
  }
  
  // إنشاء نافذة التثبيت الجديدة التي تطابق الصورة المرفقة
  const installPrompt = document.createElement('div');
  installPrompt.className = 'pwa-install-prompt';
  installPrompt.innerHTML = `
    <div class="pwa-install-prompt-content">
      <img src="img/icon-192x192.png" alt="تطبيق ضمان" class="pwa-app-icon">
      <div class="pwa-install-prompt-text">
        <h3>تثبيت تطبيق ضمان</h3>
        <p>قم بتثبيت التطبيق للوصول السريع وإمكانية العمل بدون إنترنت</p>
      </div>
    </div>
    <button id="pwa-install-btn" class="pwa-install-btn">تثبيت</button>
    <button id="pwa-install-close" class="pwa-install-prompt-close">×</button>
  `;
  
  document.body.prepend(installPrompt);
  
  // إضافة مستمعي الأحداث للأزرار
  document.getElementById('pwa-install-btn').addEventListener('click', installApp);
  document.getElementById('pwa-install-close').addEventListener('click', () => {
    installPrompt.remove();
    // احفظ وقت الإغلاق في التخزين المحلي
    localStorage.setItem('pwa-install-prompt-closed', Date.now());
  });
}

function showInstallBanner() {
  const banner = document.createElement('div');
  banner.className = 'install-banner';
  banner.innerHTML = `
    <div class="install-banner-content">
      <div class="install-icon">📱</div>
      <div class="install-text">
        <h3>تثبيت تطبيق ضمان</h3>
        <p>قم بتثبيت التطبيق للوصول السريع وإمكانية العمل بدون إنترنت</p>
      </div>
      <button id="install-app" class="btn-primary">تثبيت</button>
      <button id="close-banner" class="close-banner-btn"><i class="fas fa-times"></i></button>
    </div>
  `;
  
  document.body.appendChild(banner);
  
  // Add event listeners
  document.getElementById('install-app').addEventListener('click', installApp);
  document.getElementById('close-banner').addEventListener('click', () => {
    banner.remove();
    // Save to localStorage to prevent showing again for some time
    localStorage.setItem('pwa-install-banner-closed', Date.now());
  });
}

function installApp() {
  if (!deferredPrompt) {
    return;
  }
  
  // Show the prompt
  deferredPrompt.prompt();
  
  // Wait for the user to respond to the prompt
  deferredPrompt.userChoice.then((choiceResult) => {
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the PWA installation');
      // Remove any install prompts
      const banner = document.querySelector('.install-banner');
      if (banner) banner.remove();
      const topPrompt = document.querySelector('.pwa-install-prompt');
      if (topPrompt) topPrompt.remove();
    } else {
      console.log('User dismissed the PWA installation');
    }
    // Clear the deferredPrompt so it can be garbage collected
    deferredPrompt = null;
  });
} 