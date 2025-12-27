import { DataStore, EventCategory, Users, StJeanEvent } from './models/model.js';

// 1. Security: Ensure only Admins can be here
const currentUserJson = sessionStorage.getItem('currentUser');
if (!currentUserJson) {
    window.location.href = 'login.html';
} else {
    const user: Users = JSON.parse(currentUserJson);
    if (user.role !== 'Admin') {
        alert("Access Denied. Admins only.");
        window.location.href = 'student.html';
    }
}

const adminUser: Users = JSON.parse(currentUserJson!);

// 2. Select Elements
const eventTitle = document.getElementById('event-title') as HTMLInputElement;
const eventDate = document.getElementById('event-date') as HTMLInputElement;
const eventCategory = document.getElementById('event-category') as HTMLSelectElement;
const eventDesc = document.getElementById('event-desc') as HTMLInputElement;
const eventLocation = document.getElementById('event-location') as HTMLInputElement;
const eventCapacity = document.getElementById('event-capacity') as HTMLInputElement;
const eventImage = document.getElementById('event-image') as HTMLInputElement;
const createBtn = document.getElementById('createEventBtn') as HTMLButtonElement;
const eventsContainer = document.getElementById('events-container') as HTMLDivElement;
const logoutBtn = document.getElementById('logoutBtn') as HTMLButtonElement;

// 3. Render Managed Events
function renderAdminEvents(): void {
    eventsContainer.innerHTML = '';
    
    if (DataStore.events.length === 0) {
        eventsContainer.innerHTML = '<p>No events created yet.</p>';
        return;
    }

    DataStore.events.forEach(event => {
        const stats = DataStore.getEventStats(event.id);
        const eventRow = document.createElement('div');
        eventRow.className = 'admin-event-row';
        
        // Added cursor pointer and hover transition via JS styles
        eventRow.style.borderBottom = "1px solid #001F3F";
        eventRow.style.padding = "15px";
        eventRow.style.cursor = "pointer";
        eventRow.style.transition = "background 0.3s";
        eventRow.style.borderRadius = "15px"; // Matches your curved theme
        
        eventRow.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div class="clickable-area" style="flex-grow: 1;">
                    <strong style="color: #001F3F; font-size: 1.1rem;">${event.title}</strong> 
                    <span style="color: #D4AF37; font-weight: 600;">[${event.category}]</span><br>
                    <small style="color: #555;">${event.date} | ${event.location}</small><br>
                    <small style="font-weight: 600;">Attendees: ${stats.count} / ${event.maxCapacity}</small>
                </div>
                <button class="delete-btn" data-id="${event.id}" 
                    style="background: #ff4d4d; color: #fff; border: none; padding: 8px 15px; border-radius: 20px; cursor: pointer; margin-left: 10px;">
                    Delete
                </button>
            </div>
        `;

        // CLICK LOGIC: Go to details page if clicking the text area (not the delete button)
        eventRow.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            // If they clicked the delete button, don't go to details
            if (target.classList.contains('delete-btn')) return;

            // Save the ID so the details page knows which event to show
            localStorage.setItem('selectedEventId', event.id.toString());
            window.location.href = 'eventdetail.html';
        });

        eventsContainer.appendChild(eventRow);
    });

    // Attach Delete Listeners (Keep this as you had it)
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevents the row click from firing
            const idAttr = (e.target as HTMLButtonElement).getAttribute('data-id');
            if (idAttr && confirm("Are you sure you want to delete this event?")) {
                DataStore.deleteEvent(parseInt(idAttr));
                renderAdminEvents();
            }
        });
    });
}

// 4. Handle Create Event
createBtn.addEventListener('click', () => {
    const title = eventTitle.value.trim();
    const date = eventDate.value;
    const category = eventCategory.value as EventCategory;
    const description = eventDesc.value.trim();
    const location = eventLocation.value.trim();
    const maxCapacity = parseInt(eventCapacity.value);
    const imageUrl = eventImage.value.trim();

    if (!title || !date || !location || isNaN(maxCapacity)) {
        alert("Please fill in all required fields.");
        return;
    }

    DataStore.addEvent({
        title,
        description,
        date,
        location,
        category,
        maxCapacity,
        imageUrl: imageUrl || undefined,
        organizerId: adminUser.id
    });

    alert("Event Published!");
    
    // Clear Form
    [eventTitle, eventDesc, eventLocation, eventImage].forEach(input => input.value = '');
    
    renderAdminEvents();
});

// 5. Logout
logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'login.html';
});

// Initial Render
renderAdminEvents();