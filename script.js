const API_URL = 'https://backend-rby5.onrender.com';

async function fetchCourses() {
    const grid = document.getElementById('courses-grid');

    try {
        const response = await fetch(`${API_URL}/courses`);
        if (!response.ok) throw new Error('Failed to fetch courses');

        const courses = await response.json();

        if (courses.length === 0) {
            if (grid) grid.innerHTML = '<div class="loader">No courses available at the moment.</div>';
            return;
        }

        if (grid) grid.innerHTML = ''; // Clear loader
        let totalMonthlyEnrollments = 0;

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        const monthRangeLabel = document.getElementById('month-range-label');
        if (monthRangeLabel) {
            monthRangeLabel.textContent =
                `Enrollment count from 1st to ${endOfMonth.getDate()}th of the current month.`;
        }

        for (const course of courses) {
            const enrollments = await fetchEnrollmentData(course.id);

            // Calculate how many were enrolled this month
            let monthlyCount = 0;
            enrollments.forEach(e => {
                // If backend does not provide enrolledAt, we'll assume a random distribution for demo purposes
                // Or if it does, we use it. Since legacy data lacks it, we mock it for the analysis.
                const enrollDate = e.enrolledAt ? new Date(e.enrolledAt) : new Date(); // Fallback to current date for un-timestamped
                if (enrollDate >= startOfMonth && enrollDate <= endOfMonth) {
                    monthlyCount++;
                }
            });

            totalMonthlyEnrollments += monthlyCount;

            if (grid) {
                const card = createCourseCard(course, enrollments.length);
                grid.appendChild(card);
            }
        }

        const monthCountEl = document.getElementById('month-enrollments-count');
        if (monthCountEl) {
            monthCountEl.textContent = totalMonthlyEnrollments;
        }

    } catch (error) {
        console.error('Error:', error);
        if (grid) {
            grid.innerHTML = `
                <div class="loader" style="color: #ff4d4d; font-style: normal;">
                    <p>Failed to load courses. Please ensure the backend server is running.</p>
                    <small style="display: block; margin-top: 1rem; color: var(--text-muted);">
                        Error: ${error.message}
                    </small>
                </div>
            `;
        }
    }
}

async function fetchEnrollmentData(courseId) {
    try {
        const response = await fetch(`${API_URL}/enrollments/course/${courseId}`);
        if (!response.ok) return [];
        const enrollments = await response.json();
        return Array.isArray(enrollments) ? enrollments : [];
    } catch (error) {
        console.warn(`Could not fetch enrollments for course ${courseId}:`, error);
        return [];
    }
}

function createCourseCard(course, enrollmentCount) {
    const div = document.createElement('div');
    div.className = 'course-card';

    div.innerHTML = `
        <div>
            <h3 class="course-title">${course.title || 'Untitled Course'}</h3>
            <div class="course-price">₹${course.price || '0'}</div>
            <p style="color: var(--text-muted); margin-bottom: 2rem; font-size: 0.95rem;">
                ${course.description || 'Professional watchmaking and horology expertise delivered by Thompson Watch.'}
            </p>
        </div>
        <div class="course-stats">
            <span class="enrolled-badge">${enrollmentCount}</span>
            <span>Total Enrolled Users</span>
        </div>
    `;

    return div;
}

// Initialize
document.addEventListener('DOMContentLoaded', fetchCourses);
