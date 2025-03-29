// Register the service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  });
}

// ضمان عدم تدخل نافذة التثبيت مع ترتيب العناصر
function ensurePWAPromptDoesNotInterfere() {
  const header = document.querySelector('header');
  const container = document.querySelector('.container');
  const installPrompt = document.querySelector('.pwa-install-prompt');
  
  if (installPrompt && window.innerWidth <= 768) {
    // إضافة هامش علوي للرأس إذا كانت نافذة التثبيت ظاهرة
    if (header) {
      header.style.marginTop = '60px';
    }
  } else {
    // إزالة الهامش العلوي إذا لم تكن نافذة التثبيت ظاهرة
    if (header) {
      header.style.marginTop = '0';
    }
  }
  
  // تأكيد الترتيب الصحيح للعناصر
  const siteLogo = document.querySelector('.site-logo');
  const headerActions = document.querySelector('.header-actions');
  
  if (siteLogo) {
    siteLogo.style.order = '-1';
    siteLogo.style.marginBottom = '15px';
  }
  
  if (headerActions) {
    headerActions.style.order = '1';
  }
}

// تنفيذ عند تحميل الصفحة وتغيير حجم النافذة
window.addEventListener('load', ensurePWAPromptDoesNotInterfere);
window.addEventListener('resize', ensurePWAPromptDoesNotInterfere);
window.addEventListener('scroll', ensurePWAPromptDoesNotInterfere);

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
  setTimeout(() => {
    showTopInstallPrompt();
  }, 1000); // تأخير لضمان تحميل العناصر الأخرى أولاً
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
  installPrompt.style.zIndex = '990'; // تعيين z-index بشكل صريح
  installPrompt.innerHTML = `
    <div class="pwa-install-prompt-content">
      <img src="./img/icon-192x192.png" alt="تطبيق ضمان" class="pwa-app-icon">
      <div class="pwa-install-prompt-text">
        <h3>تثبيت تطبيق ضمان</h3>
        <p>قم بتثبيت التطبيق للوصول السريع وإمكانية العمل بدون إنترنت</p>
      </div>
    </div>
    <button id="pwa-install-btn" class="pwa-install-btn" style="pointer-events: auto !important; cursor: pointer !important;">تثبيت</button>
    <button id="pwa-install-close" class="pwa-install-prompt-close" style="pointer-events: auto !important; cursor: pointer !important;">×</button>
  `;

  // إضافة النافذة في بداية body
  document.body.prepend(installPrompt);
  
  // تعديل طريقة عرض المحتوى لمنع التداخل مع النافذة
  const container = document.querySelector('.container');
  if (container) {
    container.style.marginTop = '80px';
  }
  
  // إضافة مستمعي الأحداث للأزرار مع تأخير لضمان تحميل العناصر
  setTimeout(() => {
    const installBtn = document.getElementById('pwa-install-btn');
    const closeBtn = document.getElementById('pwa-install-close');
    
    if (installBtn) {
      // إزالة مستمع الحدث السابق إن وجد ثم إضافة مستمع جديد
      installBtn.removeEventListener('click', installApp);
      installBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Install button clicked');
        installApp();
      });
    }
    
    if (closeBtn) {
      closeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Close button clicked');
        installPrompt.remove();
        // تعديل margin بعد إغلاق النافذة
        if (container) {
          container.style.marginTop = '0';
        }
        // احفظ وقت الإغلاق في التخزين المحلي
        localStorage.setItem('pwa-install-prompt-closed', Date.now());
      });
    }
  }, 100);
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
  console.log('Installing app, deferredPrompt:', deferredPrompt);
  
  if (!deferredPrompt) {
    console.log('No deferred prompt available');
    // إظهار رسالة للمستخدم
    alert('لا يمكن تثبيت التطبيق في هذا الوقت. يرجى المحاولة مرة أخرى لاحقًا أو استخدام خيار "إضافة إلى الشاشة الرئيسية" من قائمة المتصفح.');
    return;
  }
  
  // Show the prompt
  deferredPrompt.prompt();
  
  // Wait for the user to respond to the prompt
  deferredPrompt.userChoice
    .then((choiceResult) => {
      console.log('User choice result:', choiceResult.outcome);
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the PWA installation');
        // Remove any install prompts
        const banner = document.querySelector('.install-banner');
        if (banner) banner.remove();
        const topPrompt = document.querySelector('.pwa-install-prompt');
        if (topPrompt) topPrompt.remove();
        
        // تعديل margin بعد تثبيت التطبيق
        const container = document.querySelector('.container');
        if (container) {
          container.style.marginTop = '0';
        }
      } else {
        console.log('User dismissed the PWA installation');
      }
      // Clear the deferredPrompt so it can be garbage collected
      deferredPrompt = null;
    })
    .catch(error => {
      console.error('Error with installation prompt:', error);
      // إظهار رسالة خطأ للمستخدم
      alert('حدث خطأ أثناء محاولة تثبيت التطبيق. يرجى المحاولة مرة أخرى لاحقًا.');
    });
} 