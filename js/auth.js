// DOM elements for authentication
const loginModal = document.getElementById('login-modal');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const logoutButton = document.getElementById('logout-button');
const dashboardButton = document.getElementById('dashboard-button');
const authButtons = document.getElementById('auth-buttons');
const logoutContainer = document.getElementById('logout-container');
const studentDashboard = document.getElementById('student-dashboard');
const teacherDashboard = document.getElementById('teacher-dashboard');
const homePage = document.getElementById('home-page');
const userProfileNav = document.getElementById('user-profile-nav');
const profilePicture = document.getElementById('profile-picture');
const userName = document.getElementById('user-name');
const studentGreeting = document.getElementById('student-greeting');
const teacherGreeting = document.getElementById('teacher-greeting');
const studentName = document.getElementById('student-name');
const teacherName = document.getElementById('teacher-name');
const studentEmail = document.getElementById('student-email');
const teacherEmail = document.getElementById('teacher-email');
const studentAvatar = document.getElementById('student-avatar');
const teacherAvatar = document.getElementById('teacher-avatar');

// Show login modal
function showLoginModal() {
  loginModal.style.display = 'flex';
  switchAuthTab(document.querySelector('.auth-tab.active'), 'login-tab-content');
}

// Show signup modal with optional user type
function showSignupModal(userType = '') {
  loginModal.style.display = 'flex';
  switchAuthTab(document.querySelectorAll('.auth-tab')[1], 'signup-tab-content');
  
  if (userType) {
    const userTypeSelect = document.getElementById('user-type');
    if (userTypeSelect) {
      userTypeSelect.value = userType;
    }
  }
}

// Close modal
function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

// Switch between login and signup tabs
function switchAuthTab(clickedTab, tabContentId) {
  // Remove active class from all tabs
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  // Add active class to clicked tab
  clickedTab.classList.add('active');
  
  // Hide all tab contents
  document.querySelectorAll('.auth-tab-content').forEach(content => {
    content.classList.remove('active');
  });
  // Show selected tab content
  document.getElementById(tabContentId).classList.add('active');
}

// Sign in with email and password
async function signInWithEmailPassword(email, password) {
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    closeModal('login-modal');
    return userCredential.user;
  } catch (error) {
    document.getElementById('login-error').textContent = error.message;
    throw error;
  }
}

// Sign up with email and password
async function signUpWithEmailPassword(email, password, displayName, userType) {
  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    // Update the user's display name
    await user.updateProfile({
      displayName: displayName
    });
    
    // Store additional user information in Firestore
    await db.collection('users').doc(user.uid).set({
      displayName: displayName,
      email: email,
      userType: userType,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    closeModal('login-modal');
    return user;
  } catch (error) {
    document.getElementById('signup-error').textContent = error.message;
    throw error;
  }
}

// Sign in with Google
async function signInWithGoogle() {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await firebase.auth().signInWithPopup(provider);
        const user = result.user;

        // Get the user's role from Firestore
        const db = firebase.firestore();
        const doc = await db.collection("users").doc(user.uid).get();

        if (doc.exists) {
            const userData = doc.data();

            // Redirect based on role
            if (userData.role === "student") {
                window.location.href = "../student-dashboard.html";
            } else if (userData.role === "teacher") {
                window.location.href = "../teacher-dashboard.html";
            } else {
                alert("Role not assigned! Contact admin.");
            }
        } else {
            alert("User not found in database.");
        }
    } catch (error) {
        console.error("Error during sign-in:", error);
    }
}


// Sign out
async function signOut() {
  try {
    await auth.signOut();
    console.log("User signed out successfully");
    
    // Explicitly reset UI state
    authButtons.style.display = 'flex';
    logoutContainer.style.display = 'none';
    userProfileNav.style.display = 'none';
    homePage.style.display = 'block';
    studentDashboard.style.display = 'none';
    teacherDashboard.style.display = 'none';
    
    // Reset profile elements
    profilePicture.src = 'assets/default-avatar.png';
    userName.textContent = 'User';
    
    // Clear any stored session data
    sessionStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
    
    // Redirect to home page if needed
    if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
      window.location.href = '/';
    }
  } catch (error) {
    console.error("Sign out error:", error);
    alert("Error signing out: " + error.message);
    throw error;
  }
}

// Ensure the logout button has the correct event listener
document.addEventListener('DOMContentLoaded', () => {
  // Existing event listeners...
  
  // Make sure logout button has the correct handler
  if (logoutButton) {
    // Remove any existing event listeners to prevent duplicates
    logoutButton.replaceWith(logoutButton.cloneNode(true));
    
    // Get fresh reference and add listener
    const refreshedLogoutButton = document.getElementById('logout-button');
    refreshedLogoutButton.addEventListener('click', () => {
      signOut()
        .then(() => {
          console.log("Logout complete and UI updated");
        })
        .catch(err => {
          console.error("Logout error:", err);
        });
    });
  }
  
  // Other existing event listeners...
});

// Update UI based on authentication state
function updateUI(user) {
  if (user) {
    // User is signed in
    authButtons.style.display = 'none';
    logoutContainer.style.display = 'flex';
    userProfileNav.style.display = 'block';
    
    // Update user profile
    if (user.photoURL) {
      profilePicture.src = user.photoURL;
      studentAvatar.src = user.photoURL;
      teacherAvatar.src = user.photoURL;
    }
    
    userName.textContent = user.displayName || 'User';
    
    // Get user data from Firestore
    db.collection('users').doc(user.uid).get()
      .then((doc) => {
        if (doc.exists) {
          const userData = doc.data();
          
          // Update UI based on user type
          if (userData.userType === 'student') {
            homePage.style.display = 'none';
            studentDashboard.style.display = 'block';
            teacherDashboard.style.display = 'none';
            
            studentName.textContent = userData.displayName || user.displayName || 'Student';
            studentEmail.textContent = userData.email || user.email;
            studentGreeting.textContent = userData.displayName || user.displayName || 'Student';
            
            // Load student-specific data
            loadStudentData(user.uid);
          } else if (userData.userType === 'teacher') {
            homePage.style.display = 'none';
            studentDashboard.style.display = 'none';
            teacherDashboard.style.display = 'block';
            
            teacherName.textContent = userData.displayName || user.displayName || 'Teacher';
            teacherEmail.textContent = userData.email || user.email;
            teacherGreeting.textContent = userData.displayName || user.displayName || 'Teacher';
            
            // Load teacher-specific data
            loadTeacherData(user.uid);
          }
        } else {
          console.log("No user data found in Firestore");
        }
      })
      .catch((error) => {
        console.error("Error getting user data:", error);
      });
  } else {
    // User is signed out
    authButtons.style.display = 'flex';
    logoutContainer.style.display = 'none';
    userProfileNav.style.display = 'none';
    homePage.style.display = 'block';
    studentDashboard.style.display = 'none';
    teacherDashboard.style.display = 'none';
    
    // Reset profile
    profilePicture.src = 'assets/default-avatar.png';
    userName.textContent = 'User';
  }
}

// Handle dashboard button click
function handleDashboardClick() {
  const user = auth.currentUser;
  if (user) {
    db.collection('users').doc(user.uid).get()
      .then((doc) => {
        if (doc.exists) {
          const userData = doc.data();
          if (userData.userType === 'student') {
            homePage.style.display = 'none';
            studentDashboard.style.display = 'block';
            teacherDashboard.style.display = 'none';
          } else if (userData.userType === 'teacher') {
            homePage.style.display = 'none';
            studentDashboard.style.display = 'none';
            teacherDashboard.style.display = 'block';
          }
        }
      })
      .catch((error) => {
        console.error("Error getting user data:", error);
      });
  }
}

// Load student data from Firestore
function loadStudentData(userId) {
  // Assignments data
  db.collection('assignments')
    .where('studentId', '==', userId)
    .get()
    .then((querySnapshot) => {
      const assignments = [];
      querySnapshot.forEach((doc) => {
        assignments.push({ id: doc.id, ...doc.data() });
      });
      
      // Update UI with assignment data
      const pendingCount = assignments.filter(a => a.status === 'pending').length;
      const completedCount = assignments.filter(a => a.status === 'completed').length;
      const avgScore = assignments.filter(a => a.score).reduce((acc, curr) => acc + curr.score, 0) / 
                      assignments.filter(a => a.score).length || 0;
      
      document.getElementById('pending-assignments').textContent = `${pendingCount} Assignments`;
      document.getElementById('completed-assignments').textContent = `${completedCount} Assignments`;
      document.getElementById('average-score').textContent = `${avgScore.toFixed(1)}%`;
      
      // Update upcoming assignments list
      const upcomingList = document.getElementById('upcoming-assignments-list');
      const upcomingAssignments = assignments.filter(a => a.status === 'pending')
                                  .sort((a, b) => a.dueDate - b.dueDate)
                                  .slice(0, 3);
      
      if (upcomingAssignments.length > 0) {
        upcomingList.innerHTML = '';
        upcomingAssignments.forEach(assignment => {
          upcomingList.innerHTML += `
            <div class="assignment-item">
              <div class="assignment-title">${assignment.title}</div>
              <div class="assignment-info">
                <span class="assignment-subject">${assignment.subject}</span>
                <span class="assignment-due">Due: ${formatDate(assignment.dueDate)}</span>
              </div>
              <button class="btn btn-primary btn-sm">Start</button>
            </div>
          `;
        });
      }
      
      // Update assignments grid
      const assignmentsGrid = document.getElementById('assignments-grid');
      if (assignments.length > 0) {
        assignmentsGrid.innerHTML = '';
        assignments.forEach(assignment => {
          assignmentsGrid.innerHTML += `
            <div class="assignment-card ${assignment.status}">
              <div class="assignment-status">${capitalizeFirstLetter(assignment.status)}</div>
              <h3>${assignment.title}</h3>
              <div class="assignment-subject">${assignment.subject}</div>
              <div class="assignment-due">Due: ${formatDate(assignment.dueDate)}</div>
              <div class="assignment-card-footer">
                ${assignment.status === 'pending' 
                  ? `<button class="btn btn-primary btn-sm" onclick="showAssignmentUploadModal('${assignment.id}', '${assignment.title}')">Submit</button>` 
                  : assignment.status === 'graded' 
                    ? `<div class="assignment-score">${assignment.score}%</div>` 
                    : `<div class="assignment-status-badge">Submitted</div>`}
              </div>
            </div>
          `;
        });
      }
    })
    .catch((error) => {
      console.error("Error loading student assignments:", error);
    });
}

// Load teacher data from Firestore
function loadTeacherData(userId) {
  // Load students data
  db.collection('users')
    .where('teacherId', '==', userId)
    .where('userType', '==', 'student')
    .get()
    .then((querySnapshot) => {
      const students = [];
      querySnapshot.forEach((doc) => {
        students.push({ id: doc.id, ...doc.data() });
      });
      
      document.getElementById('student-count').textContent = `${students.length} Students`;
      
      // Update students list
      const studentsList = document.getElementById('students-list');
      if (students.length > 0) {
        studentsList.innerHTML = '';
        students.forEach(student => {
          studentsList.innerHTML += `
            <div class="student-card">
              <div class="student-avatar">
                <img src="${student.photoURL || 'assets/default-avatar.png'}" alt="${student.displayName}">
              </div>
              <div class="student-info">
                <h3>${student.displayName}</h3>
                <p>${student.email}</p>
              </div>
              <div class="student-stats">
                <div class="student-stat">
                  <span class="stat-value">85%</span>
                  <span class="stat-label">Average</span>
                </div>
                <div class="student-stat">
                  <span class="stat-value">12</span>
                  <span class="stat-label">Completed</span>
                </div>
              </div>
              <button class="btn btn-outline btn-sm">View Details</button>
            </div>
          `;
        });
      }
    })
    .catch((error) => {
      console.error("Error loading students:", error);
    });
  
  // Load assignments data
  db.collection('assignments')
    .where('teacherId', '==', userId)
    .get()
    .then((querySnapshot) => {
      const assignments = [];
      querySnapshot.forEach((doc) => {
        assignments.push({ id: doc.id, ...doc.data() });
      });
      
      document.getElementById('teacher-assignment-count').textContent = `${assignments.length} Assignments`;
      
      // Calculate pending and completed gradings
      const pendingGrading = assignments.filter(a => a.status === 'completed').length;
      const completedGrading = assignments.filter(a => a.status === 'graded').length;
      
      document.getElementById('pending-grading').textContent = `${pendingGrading} To Grade`;
      document.getElementById('completed-grading').textContent = `${completedGrading} Completed`;
      
      // Update teacher assignments list
      const teacherAssignmentsList = document.getElementById('teacher-assignments-list');
      if (assignments.length > 0) {
        teacherAssignmentsList.innerHTML = '';
        assignments.forEach(assignment => {
          teacherAssignmentsList.innerHTML += `
            <div class="teacher-assignment-card">
              <div class="assignment-header">
                <h3>${assignment.title}</h3>
                <div class="assignment-actions">
                  <button class="btn btn-outline btn-sm">Edit</button>
                  <button class="btn btn-outline btn-sm">Delete</button>
                </div>
              </div>
              <div class="assignment-info">
                <div class="assignment-detail">
                  <span class="detail-label">Subject:</span>
                  <span class="detail-value">${assignment.subject}</span>
                </div>
                <div class="assignment-detail">
                  <span class="detail-label">Due Date:</span>
                  <span class="detail-value">${formatDate(assignment.dueDate)}</span>
                </div>
                <div class="assignment-detail">
                  <span class="detail-label">Status:</span>
                  <span class="detail-value">${
                    assignment.submissions 
                      ? `${assignment.submissions.length} Submissions` 
                      : 'No Submissions'
                  }</span>
                </div>
              </div>
              <div class="assignment-footer">
                <button class="btn btn-primary btn-sm">View Submissions</button>
              </div>
            </div>
          `;
        });
      }
      
      // Update recent submissions
      const recentSubmissions = document.getElementById('recent-submissions');
      const submissions = assignments
        .filter(a => a.status === 'completed')
        .sort((a, b) => b.submittedAt - a.submittedAt)
        .slice(0, 5);
      
      if (submissions.length > 0) {
        recentSubmissions.innerHTML = '';
        submissions.forEach(submission => {
          recentSubmissions.innerHTML += `
            <div class="submission-item">
              <div class="submission-info">
                <div class="submission-student">${submission.studentName}</div>
                <div class="submission-assignment">${submission.title}</div>
                <div class="submission-date">Submitted: ${formatDate(submission.submittedAt)}</div>
              </div>
              <button class="btn btn-primary btn-sm">Grade</button>
            </div>
          `;
        });
      }
    })
    .catch((error) => {
      console.error("Error loading teacher assignments:", error);
    });
}

// Helper function to format date
function formatDate(timestamp) {
  if (!timestamp) return 'N/A';
  
  const date = timestamp instanceof Date ? timestamp : timestamp.toDate();
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric'
  });
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Functions for teacher dashboard
function showAddStudentModal() {
  // Implementation for adding students
  console.log("Add student modal would show here");
}

function showCreateAssignmentModal() {
  // Implementation for creating assignments
  console.log("Create assignment modal would show here");
}

function switchTeacherSection(sectionId) {
  // Hide all dashboard sections
  document.querySelectorAll('.dashboard-section').forEach(section => {
    section.classList.remove('active');
  });
  
  // Show the selected section
  document.getElementById(sectionId).classList.add('active');
  
  // Update sidebar menu active state
  document.querySelectorAll('.sidebar-menu li').forEach(item => {
    item.classList.remove('active');
    if (item.dataset.target === sectionId) {
      item.classList.add('active');
    }
  });
}

// Functions for student dashboard
function showAssignmentUploadModal(assignmentId, title) {
  const modal = document.getElementById('assignment-upload-modal');
  document.getElementById('assignment-title').value = title;
  
  // You would store the assignment ID in a data attribute or hidden field
  document.getElementById('assignment-upload-form').dataset.assignmentId = assignmentId;
  
  modal.style.display = 'flex';
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Login form submission
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      
      signInWithEmailPassword(email, password)
        .catch(err => console.error("Login error:", err));
    });
  }
  
  // Signup form submission
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('signup-name').value;
      const email = document.getElementById('signup-email').value;
      const password = document.getElementById('signup-password').value;
      const userType = document.getElementById('user-type').value;
      
      if (!userType) {
        document.getElementById('signup-error').textContent = "Please select a user type";
        return;
      }
      
      signUpWithEmailPassword(email, password, name, userType)
        .catch(err => console.error("Signup error:", err));
    });
  }
  
  // Logout button
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      signOut()
        .catch(err => console.error("Logout error:", err));
    });
  }
  
  // Dashboard button
  if (dashboardButton) {
    dashboardButton.addEventListener('click', handleDashboardClick);
  }
  
  // Auth state change listener
  auth.onAuthStateChanged((user) => {
    updateUI(user);
  });
  
  // Student dashboard sidebar navigation
  document.querySelectorAll('.sidebar-menu li').forEach(item => {
    item.addEventListener('click', () => {
      const targetSection = item.getAttribute('data-target');
      
      // Update active class in sidebar
      document.querySelectorAll('.sidebar-menu li').forEach(li => {
        li.classList.remove('active');
      });
      item.classList.add('active');
      
      // Show the target section, hide others
      document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.remove('active');
      });
      document.getElementById(targetSection).classList.add('active');
    });
  });
  
  // File upload preview
  const fileInput = document.getElementById('assignment-file');
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const filePreview = document.getElementById('file-preview');
      const file = e.target.files[0];
      
      if (file) {
        filePreview.innerHTML = `
          <div class="file-preview-item">
            <i class="fas ${getFileIcon(file.name)}"></i>
            <div class="file-info">
              <span class="file-name">${file.name}</span>
              <span class="file-size">${formatFileSize(file.size)}</span>
            </div>
            <button type="button" class="remove-file" onclick="removeFile()">×</button>
          </div>
        `;
      } else {
        filePreview.innerHTML = '';
      }
    });
  }
  
  // Assignment upload form submission
  const assignmentUploadForm = document.getElementById('assignment-upload-form');
  if (assignmentUploadForm) {
    assignmentUploadForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const assignmentId = assignmentUploadForm.dataset.assignmentId;
      const file = document.getElementById('assignment-file').files[0];
      const notes = document.getElementById('assignment-notes').value;
      
      if (!file) {
        document.getElementById('upload-error').textContent = "Please select a file to upload";
        return;
      }
      
      // Here you would upload the file to Firebase Storage
      // This is a placeholder for demonstration
      console.log(`Submitting assignment ${assignmentId} with file ${file.name} and notes: ${notes}`);
      
      // Close the modal after submission
      closeModal('assignment-upload-modal');
      
      // Update the UI to reflect the change
      alert("Assignment submitted successfully!");
    });
  }
});

// Helper functions for file handling
function getFileIcon(filename) {
  const extension = filename.split('.').pop().toLowerCase();
  
  if (['pdf'].includes(extension)) {
    return 'fa-file-pdf';
  } else if (['doc', 'docx'].includes(extension)) {
    return 'fa-file-word';
  } else if (['txt'].includes(extension)) {
    return 'fa-file-alt';
  } else {
    return 'fa-file';
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function removeFile() {
  document.getElementById('assignment-file').value = '';
  document.getElementById('file-preview').innerHTML = '';
}

// Function to scroll to features section
function scrollToFeatures() {
  document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
}

// Function for theme toggle
function toggleTheme() {
  document.body.classList.toggle('dark-theme');
  const themeIcon = document.querySelector('#theme-toggle-btn i');
  
  if (document.body.classList.contains('dark-theme')) {
    themeIcon.classList.remove('fa-moon');
    themeIcon.classList.add('fa-sun');
    localStorage.setItem('theme', 'dark');
  } else {
    themeIcon.classList.remove('fa-sun');
    themeIcon.classList.add('fa-moon');
    localStorage.setItem('theme', 'light');
  }
}

// Function for showing new discussion topic modal
function showNewTopicModal() {
  // Implementation for new discussion topic modal
  console.log("New topic modal would show here");
}

// Initialize theme based on user preference
window.onload = function() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
    const themeIcon = document.querySelector('#theme-toggle-btn i');
    themeIcon.classList.remove('fa-moon');
    themeIcon.classList.add('fa-sun');
  }
  
  // Mobile menu toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('show');
    });
  }
};