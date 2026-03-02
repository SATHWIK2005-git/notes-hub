// Admin Panel JavaScript

let currentApplicationId = null;
let currentAdminSection = 'applications';

document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
    
    // Login form handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Status filter
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', loadApplications);
    }

    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            loadStatistics();
            loadCurrentAdminSection();
        });
    }

    const tabApplications = document.getElementById('tabApplications');
    if (tabApplications) {
        tabApplications.addEventListener('click', () => switchAdminSection('applications'));
    }

    const tabStudents = document.getElementById('tabStudents');
    if (tabStudents) {
        tabStudents.addEventListener('click', () => switchAdminSection('students'));
    }

    const tabNotes = document.getElementById('tabNotes');
    if (tabNotes) {
        tabNotes.addEventListener('click', () => switchAdminSection('notes'));
    }

    const tabReviews = document.getElementById('tabReviews');
    if (tabReviews) {
        tabReviews.addEventListener('click', () => switchAdminSection('reviews'));
    }

    // Modal close
    const closeBtn = document.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeDetailModal);
    }

    window.onclick = function(event) {
        const modal = document.getElementById('detailModal');
        if (event.target == modal) {
            closeDetailModal();
        }
    };
});

// Check if admin is authenticated
async function checkAuthentication() {
    try {
        const response = await fetch('/api/admin/check-auth');
        const data = await response.json();

        if (data.authenticated) {
            showDashboard(data.username);
            loadStatistics();
            switchAdminSection('applications');
        } else {
            showLoginScreen();
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        showLoginScreen();
    }
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');

    try {
        const response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            showDashboard(username);
            loadStatistics();
            switchAdminSection('applications');
        } else {
            errorDiv.textContent = data.error || 'Login failed';
        }
    } catch (error) {
        console.error('Login error:', error);
        errorDiv.textContent = 'An error occurred. Please try again.';
    }
}

// Handle logout
async function handleLogout() {
    try {
        await fetch('/api/admin/logout', { method: 'POST' });
        showLoginScreen();
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Show/hide screens
function showLoginScreen() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('adminDashboard').style.display = 'none';
}

function showDashboard(username) {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'block';
    document.getElementById('adminUsername').textContent = `Welcome, ${username}`;
}

function switchAdminSection(sectionName) {
    currentAdminSection = sectionName;

    const sectionMap = {
        applications: 'applicationsSection',
        students: 'studentsSection',
        notes: 'notesSection',
        reviews: 'reviewsSection'
    };

    Object.values(sectionMap).forEach((sectionId) => {
        const section = document.getElementById(sectionId);
        if (section) section.style.display = 'none';
    });

    const activeSection = document.getElementById(sectionMap[sectionName]);
    if (activeSection) {
        activeSection.style.display = 'block';
    }

    const tabs = [
        { id: 'tabApplications', section: 'applications' },
        { id: 'tabStudents', section: 'students' },
        { id: 'tabNotes', section: 'notes' },
        { id: 'tabReviews', section: 'reviews' }
    ];

    tabs.forEach((tab) => {
        const element = document.getElementById(tab.id);
        if (!element) return;
        element.style.opacity = tab.section === sectionName ? '1' : '0.7';
    });

    loadCurrentAdminSection();
}

function loadCurrentAdminSection() {
    if (currentAdminSection === 'students') {
        loadStudents();
        return;
    }

    if (currentAdminSection === 'notes') {
        loadNotes();
        return;
    }

    if (currentAdminSection === 'reviews') {
        loadReviews();
        return;
    }

    loadApplications();
}

// Load statistics
async function loadStatistics() {
    try {
        const response = await fetch('/api/admin/statistics');
        const stats = await response.json();

        document.getElementById('totalApps').textContent = stats.total;
        document.getElementById('pendingApps').textContent = stats.pending;
        document.getElementById('approvedApps').textContent = stats.approved;
        document.getElementById('rejectedApps').textContent = stats.rejected;

        const totalStudents = document.getElementById('totalStudents');
        if (totalStudents) totalStudents.textContent = stats.totalStudents ?? 0;

        const totalNotes = document.getElementById('totalNotes');
        if (totalNotes) totalNotes.textContent = stats.totalNotes ?? 0;

        const totalReviews = document.getElementById('totalReviews');
        if (totalReviews) totalReviews.textContent = stats.totalReviews ?? 0;
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

// Load applications
async function loadApplications() {
    const tbody = document.getElementById('applicationsBody');
    const statusFilter = document.getElementById('statusFilter').value;

    tbody.innerHTML = '<tr><td colspan="8" class="loading">Loading applications...</td></tr>';

    try {
        const response = await fetch(`/api/admin/applications?status=${statusFilter}`);
        const applications = await response.json();

        if (applications.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="loading">No applications found</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        applications.forEach(app => {
            const row = createApplicationRow(app);
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading applications:', error);
        tbody.innerHTML = '<tr><td colspan="8" class="loading" style="color: red;">Error loading applications</td></tr>';
    }
}

async function loadStudents() {
    const tbody = document.getElementById('studentsBody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="7" class="loading">Loading students...</td></tr>';

    try {
        const response = await fetch('/api/admin/students');
        const students = await response.json();

        if (!Array.isArray(students) || students.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="loading">No students found</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        students.forEach((student) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>#${student.id}</td>
                <td>${student.fullName}</td>
                <td>${student.email}</td>
                <td>${student.institution || '-'}</td>
                <td>${student.program || '-'}</td>
                <td>${student.year || '-'}</td>
                <td>${new Date(student.createdAt).toLocaleDateString()}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading students:', error);
        tbody.innerHTML = '<tr><td colspan="7" class="loading" style="color: red;">Error loading students</td></tr>';
    }
}

async function loadNotes() {
    const tbody = document.getElementById('notesBody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="8" class="loading">Loading notes...</td></tr>';

    try {
        const response = await fetch('/api/admin/notes');
        const notes = await response.json();

        if (!Array.isArray(notes) || notes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="loading">No notes found</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        notes.forEach((note) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>#${note.id}</td>
                <td>${note.title}</td>
                <td>${note.categoryIcon || '📄'} ${note.categoryName}</td>
                <td>${note.uploaderName}</td>
                <td>${note.rating > 0 ? Number(note.rating).toFixed(1) : '0.0'} (${note.reviewCount || 0})</td>
                <td>${note.downloads || 0}</td>
                <td>${new Date(note.createdAt).toLocaleDateString()}</td>
                <td>
                    <button class="action-btn btn-danger" onclick="deleteNote(${note.id}, '${String(note.title).replace(/'/g, "\\'")}')">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading notes:', error);
        tbody.innerHTML = '<tr><td colspan="8" class="loading" style="color: red;">Error loading notes</td></tr>';
    }
}

async function loadReviews() {
    const tbody = document.getElementById('reviewsBody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="7" class="loading">Loading reviews...</td></tr>';

    try {
        const response = await fetch('/api/admin/reviews');
        const reviews = await response.json();

        if (!Array.isArray(reviews) || reviews.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="loading">No reviews found</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        reviews.forEach((review) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>#${review.id}</td>
                <td>${review.noteTitle}</td>
                <td>${review.categoryName}</td>
                <td>${review.reviewerName}</td>
                <td>⭐ ${review.rating}</td>
                <td>${review.comment || '-'}</td>
                <td>${new Date(review.createdAt).toLocaleDateString()}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading reviews:', error);
        tbody.innerHTML = '<tr><td colspan="7" class="loading" style="color: red;">Error loading reviews</td></tr>';
    }
}

async function deleteNote(noteId, noteTitle) {
    if (!confirm(`Delete note "${noteTitle}"? This will also remove its reviews.`)) {
        return;
    }

    try {
        const response = await fetch(`/api/admin/notes/${noteId}`, {
            method: 'DELETE'
        });

        const data = await response.json();
        if (response.ok) {
            alert('Note deleted successfully');
            loadNotes();
            loadReviews();
        } else {
            alert(data.error || 'Failed to delete note');
        }
    } catch (error) {
        console.error('Error deleting note:', error);
        alert('An error occurred while deleting the note');
    }
}

// Create application table row
function createApplicationRow(app) {
    const tr = document.createElement('tr');
    
    const statusClass = `status-${app.status}`;
    const date = new Date(app.submittedAt).toLocaleDateString();

    tr.innerHTML = `
        <td>#${app.id}</td>
        <td>${app.fullName}</td>
        <td>${app.email}</td>
        <td>${app.institution}</td>
        <td>${app.gpa}</td>
        <td><span class="status-badge ${statusClass}">${app.status.replace('_', ' ')}</span></td>
        <td>${date}</td>
        <td>
            <div class="action-btns">
                <button class="action-btn btn-primary" onclick="viewApplication(${app.id})">View</button>
                <button class="action-btn btn-success" onclick="updateStatus(${app.id}, 'approved')">Approve</button>
                <button class="action-btn btn-danger" onclick="updateStatus(${app.id}, 'rejected')">Reject</button>
            </div>
        </td>
    `;

    return tr;
}

// View application details
async function viewApplication(id) {
    try {
        const response = await fetch(`/api/admin/applications/${id}`);
        const app = await response.json();

        currentApplicationId = id;

        const detailDiv = document.getElementById('applicationDetail');
        detailDiv.innerHTML = `
            <div class="detail-section">
                <h3>Personal Information</h3>
                <div class="detail-row">
                    <span class="detail-label">Full Name:</span>
                    <span class="detail-value">${app.fullName}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Email:</span>
                    <span class="detail-value">${app.email}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Phone:</span>
                    <span class="detail-value">${app.phone}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Date of Birth:</span>
                    <span class="detail-value">${new Date(app.dob).toLocaleDateString()}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Address:</span>
                    <span class="detail-value">${app.address}</span>
                </div>
            </div>

            <div class="detail-section">
                <h3>Academic Information</h3>
                <div class="detail-row">
                    <span class="detail-label">Institution:</span>
                    <span class="detail-value">${app.institution}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Program/Major:</span>
                    <span class="detail-value">${app.program}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">GPA:</span>
                    <span class="detail-value">${app.gpa}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Year of Study:</span>
                    <span class="detail-value">${app.year}</span>
                </div>
            </div>

            <div class="detail-section">
                <h3>Essay</h3>
                <div class="essay-text">${app.essay}</div>
            </div>

            ${app.activities ? `
            <div class="detail-section">
                <h3>Extracurricular Activities</h3>
                <div class="essay-text">${app.activities}</div>
            </div>
            ` : ''}

            <div class="detail-section">
                <h3>Documents</h3>
                ${app.transcriptPath ? `
                <div class="detail-row">
                    <span class="detail-label">Transcript:</span>
                    <a href="/api/admin/download/${app.transcriptPath}" class="file-link" target="_blank">📄 Download Transcript</a>
                </div>
                ` : '<p>No transcript uploaded</p>'}
                ${app.recommendationPath ? `
                <div class="detail-row">
                    <span class="detail-label">Recommendation:</span>
                    <a href="/api/admin/download/${app.recommendationPath}" class="file-link" target="_blank">📄 Download Recommendation</a>
                </div>
                ` : '<p>No recommendation letter uploaded</p>'}
            </div>

            <div class="detail-section">
                <h3>Application Status</h3>
                <div class="detail-row">
                    <span class="detail-label">Current Status:</span>
                    <span class="status-badge status-${app.status}">${app.status.replace('_', ' ')}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Submitted:</span>
                    <span class="detail-value">${new Date(app.submittedAt).toLocaleString()}</span>
                </div>
                ${app.updatedAt ? `
                <div class="detail-row">
                    <span class="detail-label">Last Updated:</span>
                    <span class="detail-value">${new Date(app.updatedAt).toLocaleString()}</span>
                </div>
                ` : ''}
                
                <div class="status-actions">
                    <button class="btn-warning" onclick="updateStatusFromModal('under_review')">Mark Under Review</button>
                    <button class="btn-success" onclick="updateStatusFromModal('approved')">Approve</button>
                    <button class="btn-danger" onclick="updateStatusFromModal('rejected')">Reject</button>
                </div>
            </div>
        `;

        document.getElementById('detailModal').style.display = 'block';
    } catch (error) {
        console.error('Error loading application:', error);
        alert('Failed to load application details');
    }
}

// Close detail modal
function closeDetailModal() {
    document.getElementById('detailModal').style.display = 'none';
    currentApplicationId = null;
}

// Update status
async function updateStatus(id, status) {
    if (!confirm(`Are you sure you want to ${status} this application?`)) {
        return;
    }

    try {
        const response = await fetch(`/api/admin/applications/${id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Status updated successfully!');
            loadApplications();
            loadStatistics();
        } else {
            alert(data.error || 'Failed to update status');
        }
    } catch (error) {
        console.error('Error updating status:', error);
        alert('An error occurred while updating status');
    }
}

// Update status from modal
async function updateStatusFromModal(status) {
    if (!currentApplicationId) return;
    
    await updateStatus(currentApplicationId, status);
    closeDetailModal();
}

// Delete application
async function deleteApplication() {
    if (!currentApplicationId) return;

    if (!confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(`/api/admin/applications/${currentApplicationId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (response.ok) {
            alert('Application deleted successfully!');
            closeDetailModal();
            loadApplications();
            loadStatistics();
        } else {
            alert(data.error || 'Failed to delete application');
        }
    } catch (error) {
        console.error('Error deleting application:', error);
        alert('An error occurred while deleting');
    }
}
