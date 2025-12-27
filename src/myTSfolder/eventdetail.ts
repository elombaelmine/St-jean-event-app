import { DataStore, Users } from './models/model.js';

// 1. Security check (Same as your Admin page)
const currentUserJson = sessionStorage.getItem('currentUser');
if (!currentUserJson) {
    window.location.href = 'login.html';
}

function loadDetails(): void {
    // 2. Get the saved ID and convert to Number
    const selectedIdStr = localStorage.getItem('selectedEventId');
    if (!selectedIdStr) {
        window.location.href = 'admin.html';
        return;
    }
    const eventId = parseInt(selectedIdStr);

    // 3. Find the event in the DataStore
    const event = DataStore.events.find(e => e.id === eventId);
    
    if (event) {
        // Update header info
        (document.getElementById('detail-title') as HTMLElement).innerText = event.title.toUpperCase();
        (document.getElementById('detail-date') as HTMLElement).innerText = new Date(event.date).toLocaleDateString();
        (document.getElementById('detail-category') as HTMLElement).innerText = event.category;
        (document.getElementById('detail-max') as HTMLElement).innerText = event.maxCapacity.toString();

        // 4. Get live stats for Capacity
        const stats = DataStore.getEventStats(eventId);
        (document.getElementById('detail-count') as HTMLElement).innerText = stats.count.toString();

        // 5. Filter and show Registered Students
        const listContainer = document.getElementById('attendee-list') as HTMLElement;
        listContainer.innerHTML = ''; 

        // Filter registrations by this specific event ID
        const eventRegistrations = DataStore.registrations.filter(r => r.eventId === eventId);

        if (eventRegistrations.length === 0) {
            listContainer.innerHTML = '<li class="no-data">No students registered yet.</li>';
        } else {
            eventRegistrations.forEach(reg => {
                const li = document.createElement('li');
                li.className = 'attendee-item';
                li.innerHTML = `
                    <span class="student-name">${reg.userFullName}</span>
                    <span class="reg-label">Status: Registered</span>
                `;
                listContainer.appendChild(li);
            });
        }
    }
}

window.onload = loadDetails;