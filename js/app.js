// DOM Elements
const devicesList = document.getElementById('devices-list');
const emptyState = document.getElementById('empty-state');
const addDeviceBtn = document.getElementById('add-device');
const addFirstDeviceBtn = document.getElementById('add-first-device');
const deviceModal = document.getElementById('device-modal');
const confirmModal = document.getElementById('confirm-modal');
const deviceForm = document.getElementById('device-form');
const modalTitle = document.getElementById('modal-title');
const closeModalBtn = document.getElementById('close-modal');
const cancelBtn = document.getElementById('cancel-btn');
const closeConfirmModalBtn = document.getElementById('close-confirm-modal');
const confirmDeleteBtn = document.getElementById('confirm-delete');
const cancelDeleteBtn = document.getElementById('cancel-delete');
const searchInput = document.getElementById('search');
const sortBySelect = document.getElementById('sort-by');

// State
let devices = JSON.parse(localStorage.getItem('devices')) || [];
let currentDeviceId = null;
let deleteDeviceId = null;

// Initialize app
function init() {
    // ضبط ارتفاع شاشة الجوال
    setMobileViewportHeight();
    window.addEventListener('resize', setMobileViewportHeight);
    
    // اكتشاف إذا كان الجهاز يدعم اللمس
    detectTouchDevice();
    
    renderDevices();
    
    // Event Listeners
    addDeviceBtn.addEventListener('click', openAddDeviceModal);
    addFirstDeviceBtn.addEventListener('click', openAddDeviceModal);
    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    deviceForm.addEventListener('submit', handleFormSubmit);
    
    closeConfirmModalBtn.addEventListener('click', closeConfirmModal);
    cancelDeleteBtn.addEventListener('click', closeConfirmModal);
    confirmDeleteBtn.addEventListener('click', confirmDelete);
    
    searchInput.addEventListener('input', filterDevices);
    sortBySelect.addEventListener('change', sortDevices);
}

// ضبط ارتفاع شاشة الجوال لمعالجة مشكلة شريط العناوين في المتصفح
function setMobileViewportHeight() {
    // حل مشكلة ارتفاع الشاشة على الجوال مع شريط العناوين في المتصفح
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// اكتشاف إذا كان الجهاز يدعم اللمس
function detectTouchDevice() {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) {
        document.body.classList.add('touch-device');
    }
}

// Render devices list
function renderDevices(filteredDevices = null) {
    const devicesToRender = filteredDevices || devices;
    
    // Show empty state if no devices
    if (devicesToRender.length === 0) {
        emptyState.style.display = 'flex';
        devicesList.innerHTML = '';
        devicesList.appendChild(emptyState);
        return;
    }
    
    // Hide empty state and render devices
    emptyState.style.display = 'none';
    
    // Clear devices list
    devicesList.innerHTML = '';
    
    // Add devices to list
    devicesToRender.forEach(device => {
        const deviceCard = createDeviceCard(device);
        devicesList.appendChild(deviceCard);
    });
}

// Create device card element
function createDeviceCard(device) {
    const deviceCard = document.createElement('div');
    deviceCard.className = 'device-card';
    deviceCard.dataset.id = device.id;
    
    // Calculate warranty status
    const warrantyInfo = calculateWarrantyStatus(device);
    
    deviceCard.innerHTML = `
        <div class="device-header">
            <h3 class="device-name">${device.name}</h3>
            <div class="device-actions">
                <button class="action-btn edit-btn" data-id="${device.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete-btn" data-id="${device.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        <div class="device-info">
            <div class="info-item">
                <i class="fas fa-calendar"></i>
                <span><span class="info-label">تاريخ الشراء:</span> ${formatDate(device.purchaseDate)}</span>
            </div>
            ${device.purchaseLocation ? `
            <div class="info-item">
                <i class="fas fa-store"></i>
                <span><span class="info-label">مكان الشراء:</span> ${device.purchaseLocation}</span>
            </div>
            ` : ''}
            ${device.serialNumber ? `
            <div class="info-item">
                <i class="fas fa-barcode"></i>
                <span><span class="info-label">الرقم التسلسلي:</span> ${device.serialNumber}</span>
            </div>
            ` : ''}
            ${device.price ? `
            <div class="info-item">
                <i class="fas fa-tag"></i>
                <span><span class="info-label">السعر:</span> ${device.price} درهم</span>
            </div>
            ` : ''}
            ${device.invoiceImage ? `
            <div class="info-item">
                <i class="fas fa-file-invoice"></i>
                <span class="info-label">الفاتورة:</span>
                <div class="invoice-actions">
                    <button class="action-link view-invoice-image" data-image="${device.invoiceImage}">
                        <i class="fas fa-eye"></i> عرض
                    </button>
                    <button class="action-link download-invoice" data-image="${device.invoiceImage}" data-name="${device.name}">
                        <i class="fas fa-download"></i> تحميل
                    </button>
                </div>
            </div>
            ` : ''}
            ${device.notes && device.notes.trim() ? `
            <div class="info-item notes-item">
                <i class="fas fa-sticky-note"></i>
                <div class="notes-content">
                    <span class="info-label">ملاحظات:</span>
                    <p class="device-notes">${device.notes}</p>
                </div>
            </div>
            ` : ''}
            <div class="warranty-status ${warrantyInfo.class}">
                <i class="fas ${warrantyInfo.icon}"></i>
                <span>${warrantyInfo.text}</span>
            </div>
        </div>
    `;
    
    // Add event listeners
    const editBtn = deviceCard.querySelector('.edit-btn');
    const deleteBtn = deviceCard.querySelector('.delete-btn');
    
    editBtn.addEventListener('click', () => openEditDeviceModal(device.id));
    deleteBtn.addEventListener('click', () => openDeleteConfirmModal(device.id));
    
    // Add image view and download listeners
    const viewInvoiceImageBtn = deviceCard.querySelector('.view-invoice-image');
    const downloadInvoiceBtn = deviceCard.querySelector('.download-invoice');
    
    if (viewInvoiceImageBtn) {
        viewInvoiceImageBtn.addEventListener('click', function() {
            viewImage(this.dataset.image, `فاتورة ${device.name}`);
        });
    }
    
    if (downloadInvoiceBtn) {
        downloadInvoiceBtn.addEventListener('click', function() {
            downloadImage(this.dataset.image, `فاتورة ${device.name}`);
        });
    }
    
    return deviceCard;
}

// Calculate warranty status
function calculateWarrantyStatus(device) {
    const purchaseDate = new Date(device.purchaseDate);
    const warrantyLengthMs = device.warrantyLength * 30 * 24 * 60 * 60 * 1000; // Convert months to milliseconds
    const warrantyEndDate = new Date(purchaseDate.getTime() + warrantyLengthMs);
    const today = new Date();
    
    // Calculate days remaining
    const daysRemaining = Math.ceil((warrantyEndDate - today) / (24 * 60 * 60 * 1000));
    
    // Determine warranty status
    if (daysRemaining <= 0) {
        return {
            text: 'انتهى الضمان',
            class: 'warranty-expired',
            icon: 'fa-times-circle'
        };
    } else if (daysRemaining <= 30) {
        return {
            text: `ينتهي الضمان خلال ${daysRemaining} يوم`,
            class: 'warranty-expiring',
            icon: 'fa-exclamation-circle'
        };
    } else {
        return {
            text: `متبقي ${daysRemaining} يوم في الضمان`,
            class: 'warranty-valid',
            icon: 'fa-check-circle'
        };
    }
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
}

// Open add device modal
function openAddDeviceModal() {
    modalTitle.textContent = 'إضافة جهاز جديد';
    deviceForm.reset();
    document.getElementById('device-id').value = '';
    currentDeviceId = null;
    deviceModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // ضبط التمرير على الهواتف
    if (window.innerWidth <= 768) {
        setTimeout(() => {
            document.getElementById('device-name').focus();
        }, 300);
    }
}

// Open edit device modal
function openEditDeviceModal(deviceId) {
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;
    
    modalTitle.textContent = 'تعديل بيانات الجهاز';
    
    // Fill form with device data
    document.getElementById('device-name').value = device.name;
    document.getElementById('purchase-date').value = device.purchaseDate;
    document.getElementById('warranty-length').value = device.warrantyLength;
    document.getElementById('purchase-location').value = device.purchaseLocation || '';
    document.getElementById('serial-number').value = device.serialNumber || '';
    document.getElementById('price').value = device.price || '';
    document.getElementById('notes').value = device.notes || '';
    document.getElementById('device-id').value = device.id;
    
    // Store current device ID
    currentDeviceId = device.id;
    
    // Open modal
    deviceModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Open delete confirmation modal
function openDeleteConfirmModal(deviceId) {
    deleteDeviceId = deviceId;
    confirmModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    deviceModal.classList.remove('active');
    document.body.style.overflow = '';
    deviceForm.reset();
    currentDeviceId = null;
    
    // إلغاء التركيز على الحقول لإخفاء لوحة المفاتيح على الجوال
    if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
    }
}

// Close confirm modal
function closeConfirmModal() {
    confirmModal.classList.remove('active');
    document.body.style.overflow = '';
    deleteDeviceId = null;
}

// Handle form submit
function handleFormSubmit(e) {
    e.preventDefault();
    
    // Get form data
    const deviceName = document.getElementById('device-name').value;
    const purchaseDate = document.getElementById('purchase-date').value;
    const warrantyLength = parseInt(document.getElementById('warranty-length').value);
    const purchaseLocation = document.getElementById('purchase-location').value;
    const serialNumber = document.getElementById('serial-number').value;
    const price = document.getElementById('price').value;
    const notes = document.getElementById('notes').value;
    const invoiceImage = document.getElementById('invoice-image');
    
    // Process invoice image if provided
    let invoiceImagePromise = Promise.resolve(null);
    if (invoiceImage.files.length > 0) {
        invoiceImagePromise = processImage(invoiceImage.files[0]);
    }
    
    // Wait for image processing
    invoiceImagePromise.then((invoiceImageData) => {
        if (currentDeviceId) {
            // Update existing device
            const deviceIndex = devices.findIndex(d => d.id === currentDeviceId);
            if (deviceIndex !== -1) {
                // Only update image if a new one was provided
                const updatedDevice = {
                    ...devices[deviceIndex],
                    name: deviceName,
                    purchaseDate,
                    warrantyLength,
                    purchaseLocation,
                    serialNumber,
                    price,
                    notes,
                    updatedAt: new Date().toISOString()
                };
                
                if (invoiceImageData) {
                    updatedDevice.invoiceImage = invoiceImageData;
                }
                
                devices[deviceIndex] = updatedDevice;
            }
        } else {
            // Add new device
            const newDevice = {
                id: generateId(),
                name: deviceName,
                purchaseDate,
                warrantyLength,
                purchaseLocation,
                serialNumber,
                price,
                notes,
                invoiceImage: invoiceImageData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            devices.push(newDevice);
        }
        
        // Save to localStorage
        saveDevices();
        
        // Close modal and update UI
        closeModal();
        renderDevices();
    });
}

// Process image file
function processImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Resize image to max 800px width or height while maintaining aspect ratio
                let width = img.width;
                let height = img.height;
                const maxSize = 800;
                
                if (width > height && width > maxSize) {
                    height = (height / width) * maxSize;
                    width = maxSize;
                } else if (height > maxSize) {
                    width = (width / height) * maxSize;
                    height = maxSize;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // Draw resized image
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convert to data URL (JPEG at 80% quality)
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                resolve(dataUrl);
            };
            
            img.onerror = function() {
                reject(new Error('Failed to load image'));
            };
            
            img.src = e.target.result;
        };
        
        reader.onerror = function() {
            reject(new Error('Failed to read file'));
        };
        
        reader.readAsDataURL(file);
    });
}

// Confirm delete
function confirmDelete() {
    if (!deleteDeviceId) return;
    
    // Remove device from array
    devices = devices.filter(device => device.id !== deleteDeviceId);
    
    // Save to localStorage
    saveDevices();
    
    // Close confirm modal
    closeConfirmModal();
    
    // Update UI
    renderDevices();
}

// Save devices to localStorage
function saveDevices() {
    localStorage.setItem('devices', JSON.stringify(devices));
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Filter devices based on search input
function filterDevices() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    if (!searchTerm) {
        renderDevices();
        return;
    }
    
    const filteredDevices = devices.filter(device => {
        return (
            device.name.toLowerCase().includes(searchTerm) ||
            (device.serialNumber && device.serialNumber.toLowerCase().includes(searchTerm)) ||
            (device.purchaseLocation && device.purchaseLocation.toLowerCase().includes(searchTerm))
        );
    });
    
    renderDevices(filteredDevices);
}

// Sort devices
function sortDevices() {
    const sortValue = sortBySelect.value;
    let sortedDevices = [...devices];
    
    switch (sortValue) {
        case 'name':
            sortedDevices.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'purchase-date':
            sortedDevices.sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate));
            break;
        case 'expiry':
            sortedDevices.sort((a, b) => {
                // Calculate warranty end date for both devices
                const aEndDate = calculateWarrantyEndDate(a);
                const bEndDate = calculateWarrantyEndDate(b);
                return aEndDate - bEndDate;
            });
            break;
    }
    
    renderDevices(sortedDevices);
}

// Calculate warranty end date
function calculateWarrantyEndDate(device) {
    const purchaseDate = new Date(device.purchaseDate);
    const warrantyLengthMs = device.warrantyLength * 30 * 24 * 60 * 60 * 1000;
    return new Date(purchaseDate.getTime() + warrantyLengthMs);
}

// View image in full screen modal
function viewImage(imageSrc, title) {
    // Create modal elements
    const modal = document.createElement('div');
    modal.className = 'modal image-view-modal active';
    
    modal.innerHTML = `
        <div class="modal-content image-modal-content">
            <div class="modal-header">
                <h2>${title}</h2>
                <button class="close-btn"><i class="fas fa-times"></i></button>
            </div>
            <div class="image-container">
                <img src="${imageSrc}" alt="${title}" id="printable-image">
            </div>
            <div class="modal-footer">
                <button class="btn-primary print-btn"><i class="fas fa-print"></i> طباعة الفاتورة</button>
            </div>
        </div>
    `;
    
    // Add to body
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Add event listeners
    const closeBtn = modal.querySelector('.close-btn');
    const printBtn = modal.querySelector('.print-btn');
    
    closeBtn.addEventListener('click', () => {
        modal.remove();
        document.body.style.overflow = '';
    });
    
    printBtn.addEventListener('click', () => {
        printImage(imageSrc, title);
    });
    
    // Close on click outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    });
}

// Print image
function printImage(imageSrc, title) {
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
        <html>
        <head>
            <title>طباعة ${title}</title>
            <style>
                body {
                    margin: 0;
                    padding: 20px;
                    font-family: 'Tajawal', Arial, sans-serif;
                    text-align: center;
                    direction: rtl;
                }
                h1 {
                    font-size: 18px;
                    margin-bottom: 20px;
                    color: #333;
                }
                img {
                    max-width: 100%;
                    max-height: 90vh;
                }
                @media print {
                    @page {
                        size: auto;
                        margin: 10mm;
                    }
                    body {
                        padding: 0;
                    }
                }
            </style>
        </head>
        <body>
            <h1>${title}</h1>
            <img src="${imageSrc}" alt="${title}">
            <script>
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                    }, 500);
                };
            </script>
        </body>
        </html>
    `);
    
    printWindow.document.close();
}

// Download image
function downloadImage(imageSrc, fileName) {
    const link = document.createElement('a');
    link.href = imageSrc;
    link.download = `${fileName}.jpg`;
    link.click();
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', init); 