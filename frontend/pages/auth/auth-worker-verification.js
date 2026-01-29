// ============================================
// WORKER VERIFICATION - AADHAAR & OTP
// ============================================

let currentStep = 1;
let aadhaarNumber = '';
let verificationData = {
    aadhaar: '',
    name: '',
    phone: '',
    otp: '',
    documentUrl: '',
    verified: false,
    verifiedAt: null
};

// ============================================
// STEP 1: AADHAAR VERIFICATION
// ============================================

// Auto-focus next input
document.querySelectorAll('.aadhaar-input').forEach((input, index, inputs) => {
    input.addEventListener('input', (e) => {
        // Only allow numbers
        e.target.value = e.target.value.replace(/[^0-9]/g, '');

        // Auto-focus next input
        if (e.target.value.length === 4 && index < inputs.length - 1) {
            inputs[index + 1].focus();
        }
    });

    input.addEventListener('keydown', (e) => {
        // Backspace to previous input
        if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
            inputs[index - 1].focus();
        }
    });

    // Paste handling
    input.addEventListener('paste', (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '');

        if (pastedData.length === 12) {
            inputs[0].value = pastedData.substring(0, 4);
            inputs[1].value = pastedData.substring(4, 8);
            inputs[2].value = pastedData.substring(8, 12);
            inputs[2].focus();
        }
    });
});

// Aadhaar Form Submission
document.getElementById('aadhaarForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const inputs = document.querySelectorAll('.aadhaar-input');
    const aadhaarParts = Array.from(inputs).map(input => input.value);

    // Validate all parts are filled
    if (aadhaarParts.some(part => part.length !== 4)) {
        showToast('Please enter complete Aadhaar number', 'error');
        return;
    }

    aadhaarNumber = aadhaarParts.join('');
    const name = document.getElementById('aadhaarName').value;

    // Validate Aadhaar (basic check)
    if (!validateAadhaar(aadhaarNumber)) {
        showToast('Invalid Aadhaar number', 'error');
        return;
    }

    showLoading('Verifying Aadhaar...');

    try {
        // Simulate API call to verify Aadhaar
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Store verification data
        verificationData.aadhaar = aadhaarNumber;
        verificationData.name = name;

        // Get user phone from signup
        const userData = Storage.get('karyasetu_user');
        verificationData.phone = userData?.phone || '9876543210';

        hideLoading();
        showToast('Aadhaar verified successfully!', 'success');

        // Send OTP
        await sendOTP();

        // Move to next step
        setTimeout(() => goToStep(2), 500);

    } catch (error) {
        hideLoading();
        showToast('Verification failed. Please try again.', 'error');
    }
});

// Aadhaar validation (Verhoeff algorithm simulation)
function validateAadhaar(aadhaar) {
    if (aadhaar.length !== 12) return false;
    if (!/^\d{12}$/.test(aadhaar)) return false;

    // Basic validation (in production, use proper Verhoeff algorithm)
    const firstDigit = parseInt(aadhaar[0]);
    if (firstDigit === 0 || firstDigit === 1) return false;

    return true;
}

// ============================================
// STEP 2: MOBILE OTP VERIFICATION
// ============================================

let otpTimer = 120; // 2 minutes
let otpInterval = null;

async function sendOTP() {
    showLoading('Sending OTP...');

    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mask phone number
        const phone = verificationData.phone;
        const masked = `+91 ${phone.substring(0, 3)}**** ${phone.substring(7)}`;
        document.getElementById('maskedPhone').textContent = masked;

        hideLoading();
        showToast(`OTP sent to ${masked}`, 'success');

        // Start OTP timer
        startOTPTimer();

    } catch (error) {
        hideLoading();
        showToast('Failed to send OTP', 'error');
    }
}

function startOTPTimer() {
    otpTimer = 120;
    document.getElementById('resendOtpBtn').disabled = true;

    otpInterval = setInterval(() => {
        otpTimer--;

        const minutes = Math.floor(otpTimer / 60);
        const seconds = otpTimer % 60;
        const timerElement = document.getElementById('otpTimer');

        timerElement.innerHTML = `OTP expires in <strong>${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}</strong>`;

        if (otpTimer <= 30) {
            timerElement.classList.add('expired');
        }

        if (otpTimer <= 0) {
            clearInterval(otpInterval);
            timerElement.innerHTML = '<strong>OTP expired</strong>';
            document.getElementById('resendOtpBtn').disabled = false;
        }
    }, 1000);
}

// OTP Input handling
const otpInputs = document.querySelectorAll('.otp-input');

otpInputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
        // Only allow numbers
        e.target.value = e.target.value.replace(/[^0-9]/g, '');

        // Auto-focus next input
        if (e.target.value && index < otpInputs.length - 1) {
            otpInputs[index + 1].focus();
        }

        // Auto-verify when all filled
        if (index === otpInputs.length - 1 && e.target.value) {
            const otp = Array.from(otpInputs).map(inp => inp.value).join('');
            if (otp.length === 6) {
                setTimeout(() => verifyOTP(), 500);
            }
        }
    });

    input.addEventListener('keydown', (e) => {
        // Backspace to previous input
        if (e.key === 'Backspace' && !e.target.value && index > 0) {
            otpInputs[index - 1].focus();
        }
    });

    // Paste handling
    input.addEventListener('paste', (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '');

        if (pastedData.length === 6) {
            otpInputs.forEach((inp, i) => {
                inp.value = pastedData[i] || '';
            });
            otpInputs[5].focus();
            setTimeout(() => verifyOTP(), 500);
        }
    });
});

// Verify OTP
document.getElementById('verifyOtpBtn').addEventListener('click', verifyOTP);

async function verifyOTP() {
    const otp = Array.from(otpInputs).map(input => input.value).join('');

    if (otp.length !== 6) {
        showToast('Please enter complete OTP', 'error');
        return;
    }

    showLoading('Verifying OTP...');

    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        // In demo, accept any 6-digit OTP
        // In production, verify with backend

        verificationData.otp = otp;

        clearInterval(otpInterval);
        hideLoading();
        showToast('Mobile number verified!', 'success');

        setTimeout(() => goToStep(3), 500);

    } catch (error) {
        hideLoading();
        showToast('Invalid OTP. Please try again.', 'error');

        // Clear OTP inputs
        otpInputs.forEach(input => input.value = '');
        otpInputs[0].focus();
    }
}

// Resend OTP
document.getElementById('resendOtpBtn').addEventListener('click', async () => {
    await sendOTP();
});

// ============================================
// STEP 3: DOCUMENT UPLOAD
// ============================================

const documentUpload = document.getElementById('documentUpload');
const aadhaarFile = document.getElementById('aadhaarFile');
const filePreview = document.getElementById('filePreview');
const uploadDocBtn = document.getElementById('uploadDocBtn');

documentUpload.addEventListener('click', () => {
    aadhaarFile.click();
});

// Drag and drop
documentUpload.addEventListener('dragover', (e) => {
    e.preventDefault();
    documentUpload.style.borderColor = 'var(--primary-500)';
});

documentUpload.addEventListener('dragleave', () => {
    documentUpload.style.borderColor = 'var(--border-primary)';
});

documentUpload.addEventListener('drop', (e) => {
    e.preventDefault();
    documentUpload.style.borderColor = 'var(--border-primary)';

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFileUpload(files[0]);
    }
});

aadhaarFile.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFileUpload(e.target.files[0]);
    }
});

function handleFileUpload(file) {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
        showToast('Please upload JPG, PNG, or PDF file', 'error');
        return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
        showToast('File size must be less than 5MB', 'error');
        return;
    }

    // Show preview
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileSize').textContent = formatFileSize(file.size);
    filePreview.classList.add('show');
    documentUpload.classList.add('has-file');
    uploadDocBtn.disabled = false;

    // Store file (in production, upload to server)
    verificationData.documentUrl = URL.createObjectURL(file);

    showToast('Document uploaded successfully', 'success');
}

document.getElementById('removeFile').addEventListener('click', () => {
    aadhaarFile.value = '';
    filePreview.classList.remove('show');
    documentUpload.classList.remove('has-file');
    uploadDocBtn.disabled = true;
    verificationData.documentUrl = '';
});

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

uploadDocBtn.addEventListener('click', async () => {
    if (!verificationData.documentUrl) {
        showToast('Please upload a document', 'error');
        return;
    }

    showLoading('Processing document...');

    try {
        // Simulate document processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        hideLoading();
        showToast('Document verified successfully!', 'success');

        setTimeout(() => goToStep(4), 500);

    } catch (error) {
        hideLoading();
        showToast('Document verification failed', 'error');
    }
});

// ============================================
// STEP 4: COMPLETION
// ============================================

document.getElementById('continueToProfile').addEventListener('click', () => {
    // Mark as verified
    verificationData.verified = true;
    verificationData.verifiedAt = new Date().toISOString();

    // Store verification data
    Storage.set('worker_verification', verificationData);

    // Update user profile
    const userProfile = Storage.get('karyasetu_user_profile') || {};
    userProfile.verified = true;
    userProfile.verifiedAt = verificationData.verifiedAt;
    userProfile.aadhaarVerified = true;
    userProfile.mobileVerified = true;
    userProfile.documentVerified = true;
    Storage.set('karyasetu_user_profile', userProfile);

    showToast('Redirecting to profile setup...', 'success');

    setTimeout(() => {
        window.location.href = '../onboarding/worker-about.html';
    }, 1500);
});

// ============================================
// STEP NAVIGATION
// ============================================

function goToStep(step) {
    // Hide all steps
    document.querySelectorAll('.verification-step-content').forEach(content => {
        content.classList.remove('active');
    });

    // Show current step
    document.getElementById(`step${step}`).classList.add('active');

    // Update step indicators
    document.querySelectorAll('.step').forEach((stepEl, index) => {
        stepEl.classList.remove('active', 'completed');

        if (index + 1 < step) {
            stepEl.classList.add('completed');
        } else if (index + 1 === step) {
            stepEl.classList.add('active');
        }
    });

    currentStep = step;

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// AUTHENTICATION CHECK
// ============================================

// Check if user is logged in
const userData = Storage.get('karyasetu_user');
if (!userData || !userData.loggedIn) {
    window.location.href = 'signup.html';
}

// Check if already verified
const existingVerification = Storage.get('worker_verification');
if (existingVerification && existingVerification.verified) {
    showToast('You are already verified!', 'info');
    setTimeout(() => {
        window.location.href = '../onboarding/worker-about.html';
    }, 2000);
}

// ============================================
// SECURITY FEATURES
// ============================================

// Prevent screenshots (basic)
document.addEventListener('keyup', (e) => {
    if (e.key === 'PrintScreen') {
        navigator.clipboard.writeText('');
        showToast('Screenshots are disabled for security', 'warning');
    }
});

// Prevent right-click on sensitive areas
document.querySelectorAll('.aadhaar-input, .otp-input').forEach(input => {
    input.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showToast('This action is disabled for security', 'warning');
    });
});

// Session timeout (10 minutes)
let sessionTimeout = setTimeout(() => {
    showToast('Session expired for security. Please start again.', 'error');
    setTimeout(() => {
        window.location.href = 'signup.html';
    }, 2000);
}, 10 * 60 * 1000);

// Reset timeout on activity
document.addEventListener('click', () => {
    clearTimeout(sessionTimeout);
    sessionTimeout = setTimeout(() => {
        showToast('Session expired for security. Please start again.', 'error');
        setTimeout(() => {
            window.location.href = 'signup.html';
        }, 2000);
    }, 10 * 60 * 1000);
});

console.log('🔒 Worker Verification System Loaded');
