import { DataStore, StJeanEvent, Users } from './models/model.js';

// 1. Check if user is logged in
const currentUserJson = sessionStorage.getItem('currentUser');
if (!currentUserJson) {
    window.location.href = 'login.html';
}
const currentUser: Users = JSON.parse(currentUserJson!);

// 2. Select Elements
const eventsContainer = document.getElementById('student-events-container') as HTMLDivElement;
const searchInput = document.querySelector('.Search-field') as HTMLInputElement;
const categoryFilter = document.getElementById('filter-Category') as HTMLSelectElement;
const statusFilter = document.getElementById('filter-status') as HTMLSelectElement;
const logoutBtn = document.getElementById('logoutBtn') as HTMLButtonElement;

// 3. Render Events Function
function renderEvents(): void {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;
    const selectedStatus = statusFilter.value;
    const now = new Date();

    // Filter logic
    const filteredEvents = DataStore.events.filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(searchTerm) || 
                              event.location.toLowerCase().includes(searchTerm);
        const matchesCategory = selectedCategory === 'ALL' || event.category === selectedCategory;
        
        const eventDate = new Date(event.date);
        const matchesStatus = selectedStatus === 'ALL' || 
                             (selectedStatus === 'Upcoming' && eventDate >= now) || 
                             (selectedStatus === 'Past' && eventDate < now);

        return matchesSearch && matchesCategory && matchesStatus;
    });

    // Generate HTML
    eventsContainer.innerHTML = '';
    
    if (filteredEvents.length === 0) {
        eventsContainer.innerHTML = '<p class="no-events">No events found matching your criteria.</p>';
        return;
    }

    filteredEvents.forEach(event => {
        const stats = DataStore.getEventStats(event.id);
        const isFull = stats.count >= event.maxCapacity;
        
        const card = document.createElement('div');
        card.className = 'event-card';
        card.innerHTML = `
            <div class="event-info">
                <h3>${event.title}</h3>
                <p><strong>Category:</strong> ${event.category}</p>
                <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
                <p><strong>Location:</strong> ${event.location}</p>
                <p><strong>Capacity:</strong> ${stats.count} / ${event.maxCapacity}</p>
            </div>
            <button class="reg-btn" ${isFull ? 'disabled' : ''} data-id="${event.id}">
                ${isFull ? 'Full' : 'Register Now'}
            </button>
        `;
        eventsContainer.appendChild(card);
    });

    // Attach registration listeners
    document.querySelectorAll('.reg-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const eventId = parseInt((e.target as HTMLButtonElement).getAttribute('data-id')!);
            handleRegistration(eventId);
        });
    });
}

// 4. Handle Registration
function handleRegistration(eventId: number): void {
    const result = DataStore.registerUser(eventId, currentUser.id, currentUser.fullName);
    alert(result.message);
    if (result.success) {
        renderEvents(); // Refresh UI to update capacity numbers
    }
}

// 5. Event Listeners
searchInput.addEventListener('input', renderEvents);
categoryFilter.addEventListener('change', renderEvents);
statusFilter.addEventListener('change', renderEvents);

logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'login.html';
});

// Initial Render
renderEvents();