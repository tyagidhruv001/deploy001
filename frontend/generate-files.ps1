# KaryaSetu Frontend File Generator
# This script creates all remaining frontend files for the blue-collar platform

$baseDir = "c:/Users/chaud/OneDrive/Desktop/KaryaSetu/blue-collar-platform/frontend"

# Function to create a file with content
function Create-File {
    param(
        [string]$Path,
        [string]$Content
    )
    
    $dir = Split-Path -Parent $Path
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
    
    Set-Content -Path $Path -Value $Content -Encoding UTF8
    Write-Host "Created: $Path" -ForegroundColor Green
}

Write-Host "Generating KaryaSetu Frontend Files..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Create onboarding files
$customerOnboarding = @"
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Customer Onboarding - KaryaSetu</title>
  <link rel="stylesheet" href="../css/theme.css">
  <link rel="stylesheet" href="../css/main.css">
  <link rel="stylesheet" href="onboarding.css">
</head>
<body>
  <div class="onboarding-container gradient-mesh">
    <div class="onboarding-card card-glass">
      <div class="onboarding-header">
        <h1>Tell us about yourself</h1>
        <p>Help us personalize your experience</p>
      </div>
      
      <form class="onboarding-form" id="customerOnboardingForm">
        <div class="input-group">
          <label class="input-label">Location</label>
          <input type="text" class="input-field" id="location" placeholder="Enter your city" required>
        </div>
        
        <div class="input-group">
          <label class="input-label">Address</label>
          <textarea class="input-field" id="address" rows="3" placeholder="Enter your full address" required></textarea>
        </div>
        
        <button type="submit" class="btn btn-primary btn-lg">Complete Setup</button>
      </form>
    </div>
  </div>
  
  <script src="../js/utils.js"></script>
  <script>
    document.getElementById('customerOnboardingForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const profile = {
        location: document.getElementById('location').value,
        address: document.getElementById('address').value,
        role: 'customer'
      };
      localStorage.setItem('karyasetu_user_profile', JSON.stringify(profile));
      window.location.href = '../dashboard/dashboard.html';
    });
  </script>
</body>
</html>
"@

Create-File "$baseDir/onboarding/customer-about.html" $customerOnboarding

$workerOnboarding = @"
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Worker Onboarding - KaryaSetu</title>
  <link rel="stylesheet" href="../css/theme.css">
  <link rel="stylesheet" href="../css/main.css">
  <link rel="stylesheet" href="onboarding.css">
</head>
<body>
  <div class="onboarding-container gradient-mesh">
    <div class="onboarding-card card-glass">
      <div class="onboarding-header">
        <h1>Worker Profile Setup</h1>
        <p>Complete your profile to start receiving jobs</p>
      </div>
      
      <form class="onboarding-form" id="workerOnboardingForm">
        <div class="input-group">
          <label class="input-label">Select Your Skills</label>
          <div class="skills-grid">
            <label class="skill-checkbox"><input type="checkbox" value="mechanic"> 🔧 Mechanic</label>
            <label class="skill-checkbox"><input type="checkbox" value="plumber"> 🚰 Plumber</label>
            <label class="skill-checkbox"><input type="checkbox" value="electrician"> ⚡ Electrician</label>
            <label class="skill-checkbox"><input type="checkbox" value="carpenter"> 🪚 Carpenter</label>
            <label class="skill-checkbox"><input type="checkbox" value="painter"> 🎨 Painter</label>
            <label class="skill-checkbox"><input type="checkbox" value="tailor"> 🧵 Tailor</label>
          </div>
        </div>
        
        <div class="input-group">
          <label class="input-label">Experience Level</label>
          <select class="input-field" id="experience" required>
            <option value="">Select experience</option>
            <option value="beginner">Beginner (0-2 years)</option>
            <option value="skilled">Skilled (2-5 years)</option>
            <option value="expert">Expert (5+ years)</option>
          </select>
        </div>
        
        <div class="input-group">
          <label class="input-label">Location</label>
          <input type="text" class="input-field" id="location" placeholder="Enter your city" required>
        </div>
        
        <button type="submit" class="btn btn-primary btn-lg">Complete Setup</button>
      </form>
    </div>
  </div>
  
  <script src="../js/utils.js"></script>
  <script>
    document.getElementById('workerOnboardingForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const skills = Array.from(document.querySelectorAll('.skill-checkbox input:checked')).map(cb => cb.value);
      const profile = {
        skills,
        experience: document.getElementById('experience').value,
        location: document.getElementById('location').value,
        role: 'worker'
      };
      localStorage.setItem('karyasetu_user_profile', JSON.stringify(profile));
      window.location.href = '../dashboard/dashboard.html';
    });
  </script>
</body>
</html>
"@

Create-File "$baseDir/onboarding/worker-about.html" $workerOnboarding

$onboardingCSS = @"
.onboarding-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
}

.onboarding-card {
  width: 100%;
  max-width: 600px;
  padding: var(--spacing-3xl);
  border-radius: var(--radius-2xl);
}

.onboarding-header {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}

.skill-checkbox {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-base);
}

.skill-checkbox:hover {
  border-color: var(--primary-500);
}

.skill-checkbox input:checked + label,
.skill-checkbox:has(input:checked) {
  background: var(--primary-500);
  border-color: var(--primary-500);
  color: white;
}
"@

Create-File "$baseDir/onboarding/onboarding.css" $onboardingCSS

Write-Host "`nOnboarding files created!" -ForegroundColor Green

Write-Host "`nAll files generated successfully!" -ForegroundColor Green
Write-Host "You can now open index.html to view the application." -ForegroundColor Yellow
"@
<parameter name="Complexity">4
