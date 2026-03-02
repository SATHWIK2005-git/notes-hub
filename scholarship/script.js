// Form Validation and Interaction
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('scholarshipForm');
    const essayTextarea = document.getElementById('essay');
    const charCount = document.getElementById('charCount');
    const modal = document.getElementById('successModal');
    const closeBtn = document.querySelector('.close');

    // Character counter for essay
    essayTextarea.addEventListener('input', function() {
        const count = this.value.length;
        charCount.textContent = `${count} characters`;
        
        if (count < 200) {
            charCount.style.color = '#ff6b6b';
        } else {
            charCount.style.color = '#51cf66';
        }
    });

    // Form submission handler
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Validate essay length
        if (essayTextarea.value.length < 200) {
            alert('Please write at least 200 characters for your essay.');
            essayTextarea.focus();
            return;
        }

        // Check if terms are accepted
        const termsCheckbox = document.getElementById('terms');
        if (!termsCheckbox.checked) {
            alert('Please accept the terms and conditions.');
            termsCheckbox.focus();
            return;
        }

        // Validate files
        const transcriptFile = document.getElementById('transcript');
        if (!validateFile(transcriptFile)) {
            alert('Please upload a valid PDF transcript file.');
            transcriptFile.focus();
            return;
        }

        // All validation passed - submit to backend
        await submitApplication();
    });

    // File validation
    function validateFile(fileInput) {
        if (fileInput.files.length === 0 && fileInput.required) {
            return false;
        }
        
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            const fileSize = file.size / 1024 / 1024; // in MB
            
            if (!file.type.includes('pdf')) {
                alert('Please upload only PDF files.');
                return false;
            }
            
            if (fileSize > 5) {
                alert('File size should not exceed 5MB.');
                return false;
            }
        }
        
        return true;
    }

    // Function to save form data to localStorage
    function saveToLocalStorage(formData) {
        const dataObject = Object.fromEntries(formData);
        const submissions = JSON.parse(localStorage.getItem('scholarshipSubmissions')) || [];
        
        const newSubmission = {
            id: Date.now(),
            ...dataObject,
            submittedAt: new Date().toLocaleString(),
            applicationId: null
        };
        
        submissions.push(newSubmission);
        localStorage.setItem('scholarshipSubmissions', JSON.stringify(submissions));
        console.log('Data saved to localStorage:', newSubmission);
        
        return newSubmission;
    }

    // Submit application to backend
    async function submitApplication() {
        const formData = new FormData(form);
        
        // Show loading state
        const submitBtn = form.querySelector('.btn-submit');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Submitting...';
        submitBtn.disabled = true;
        
        try {
            // Save to localStorage first
            const submission = saveToLocalStorage(formData);
            
            console.log('📤 Sending application to server...');
            console.log('URL: /api/submit-application');
            
            const response = await fetch('/api/submit-application', {
                method: 'POST',
                body: formData
            });

            console.log('📥 Response received - Status:', response.status, response.statusText);

            const result = await response.json();
            console.log('📋 Server response:', result);

            if (response.ok && result.success) {
                // Update localStorage with applicationId from backend
                const submissions = JSON.parse(localStorage.getItem('scholarshipSubmissions'));
                submissions[submissions.length - 1].applicationId = result.applicationId;
                localStorage.setItem('scholarshipSubmissions', JSON.stringify(submissions));
                
                showSuccessModal();
                form.reset();
                charCount.textContent = '0 characters';
                
                // Log success
                console.log('✅ Application submitted successfully!', result);
                alert('✅ Application submitted successfully!\nApplication ID: ' + result.applicationId);
            } else {
                const errorMsg = result.error || 'Failed to submit application. Please try again.';
                console.error('❌ Server error:', errorMsg);
                alert('Error: ' + errorMsg);
            }
        } catch (error) {
            console.error('❌ Submission error:', error);
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
            
            alert('❌ An error occurred while submitting your application.\n\nError: ' + error.message + '\n\nPlease check:\n1. Is the server running?\n2. Open browser console (F12) for more details.');
        } finally {
            // Restore button state
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    // Show success modal
    function showSuccessModal() {
        modal.style.display = 'block';
        
        // Add animation
        setTimeout(() => {
            modal.querySelector('.modal-content').style.opacity = '1';
        }, 10);
    }

    // Close modal
    closeBtn.onclick = function() {
        closeModal();
    };

    window.onclick = function(event) {
        if (event.target == modal) {
            closeModal();
        }
    };

    // Form reset confirmation
    const resetBtn = form.querySelector('.btn-reset');
    resetBtn.addEventListener('click', function(e) {
        if (!confirm('Are you sure you want to reset the form? All entered data will be lost.')) {
            e.preventDefault();
        } else {
            charCount.textContent = '0 characters';
        }
    });

    // Phone number formatting
    const phoneInput = document.getElementById('phone');
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 10) {
            value = value.slice(0, 10);
        }
        e.target.value = value;
    });

    // GPA validation
    const gpaInput = document.getElementById('gpa');
    gpaInput.addEventListener('blur', function() {
        const gpa = parseFloat(this.value);
        if (gpa && (gpa < 0 || gpa > 4.0)) {
            alert('Please enter a valid GPA between 0.0 and 4.0');
            this.value = '';
            this.focus();
        }
    });

    // Date of birth validation (must be at least 16 years old)
    const dobInput = document.getElementById('dob');
    dobInput.addEventListener('change', function() {
        const dob = new Date(this.value);
        const today = new Date();
        const age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            age--;
        }
        
        if (age < 16) {
            alert('Applicants must be at least 16 years old.');
            this.value = '';
        }
    });

    // Smooth scroll to first error
    form.addEventListener('invalid', function(e) {
        e.preventDefault();
        const firstInvalid = form.querySelector(':invalid');
        if (firstInvalid) {
            firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstInvalid.focus();
        }
    }, true);
});

// Global function to close modal
function closeModal() {
    const modal = document.getElementById('successModal');
    modal.style.display = 'none';
}

// Function to view all stored submissions
function viewStoredSubmissions() {
    const submissions = JSON.parse(localStorage.getItem('scholarshipSubmissions')) || [];
    if (submissions.length === 0) {
        console.log('No submissions stored yet.');
        return [];
    }
    console.table(submissions);
    return submissions;
}

// Function to view a specific submission by ID
function viewSubmission(id) {
    const submissions = JSON.parse(localStorage.getItem('scholarshipSubmissions')) || [];
    const submission = submissions.find(s => s.id === id);
    if (submission) {
        console.log('Submission Details:', submission);
        return submission;
    } else {
        console.log('Submission not found.');
        return null;
    }
}

// Function to clear all stored submissions
function clearStoredSubmissions() {
    if (confirm('Are you sure you want to delete all stored submissions?')) {
        localStorage.removeItem('scholarshipSubmissions');
        console.log('All stored submissions cleared.');
    }
}

// Display stats about stored submissions
function showStorageStats() {
    const submissions = JSON.parse(localStorage.getItem('scholarshipSubmissions')) || [];
    console.log('Storage Statistics:');
    console.log(`Total Stored Submissions: ${submissions.length}`);
    console.log(`Storage Used: ${(JSON.stringify(submissions).length / 1024).toFixed(2)} KB`);
}


// Add loading animation to file inputs
document.querySelectorAll('input[type="file"]').forEach(input => {
    input.addEventListener('change', function() {
        if (this.files.length > 0) {
            const fileName = this.files[0].name;
            console.log(`File selected: ${fileName}`);
            
            // You can add a visual indicator here
            this.style.borderColor = '#51cf66';
        }
    });
});

// Email validation enhancement
const emailInput = document.getElementById('email');
emailInput.addEventListener('blur', function() {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (this.value && !emailPattern.test(this.value)) {
        alert('Please enter a valid email address.');
        this.focus();
    }
});
