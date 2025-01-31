// Extract Venue ID from URL Path
function getVenueId() {
    const pathParts = window.location.pathname.split('/');
    return pathParts[pathParts.length - 1]; // Get the last part of the path (venue ID)
}

// Utility function to safely set innerHTML
function safeSetInnerHTML(id, html) {
    const element = document.getElementById(id);
    if (element) {
        element.innerHTML = html;
    } else {
        console.warn(`Element with ID '${id}' not found.`);
    }
}

// Function to get today's date in YYYY-MM-DD format in Eastern Time
function getTodayDateEastern() {
    const date = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Function to format a date into a readable format
function formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Function to get the day of the week from a date
function getDayOfWeek(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { timeZone: 'America/New_York', weekday: 'long' });
}

// Function to assign dark colors to each day of the week
function getDayBadge(day) {
    const dayColors = {
        'Sunday': '#8B0000',    // Dark Red
        'Monday': '#FF8C00',    // Dark Orange
        'Tuesday': '#B8860B',   // Dark Goldenrod
        'Wednesday': '#006400', // Dark Green
        'Thursday': '#4682B4',  // Steel Blue
        'Friday': '#4B0082',    // Indigo
        'Saturday': '#2F4F4F'   // Dark Slate Gray
    };

    const color = dayColors[day] || '#2C2C2C'; // Fallback: Dark Gray
    return `<span class="day-badge" style="background-color: ${color}; color: #FFFFFF;">${day}</span>`;
}

// Fetch Band Details for Event Cards
async function fetchBandDetails(bandIds) {
    if (!bandIds || bandIds.length === 0) return [];

    const bandDetails = await Promise.all(bandIds.map(async (bandId) => {
        try {
            const response = await fetch(`/.netlify/functions/band?id=${bandId}`);
            if (!response.ok) {
                console.warn(`Failed to fetch details for band ID: ${bandId}, Status: ${response.status}`);
                return { id: bandId, name: `Unknown Band (${bandId})` };
            }

            const data = await response.json();
            return {
                id: bandId,
                name: data?.band?.name || `Unnamed Band (${bandId})`
            };
        } catch (error) {
            console.warn(`Error fetching band details for ${bandId}: ${error.message}`);
            return { id: bandId, name: `Error Loading Band (${bandId})` };
        }
    }));

    return bandDetails.filter(Boolean);
}

// Fetch Venue Data from API
async function fetchVenueData() {
    const venueId = getVenueId();

    if (!venueId) {
        document.getElementById('venue-name').innerText = 'Venue ID is missing in the URL.';
        console.error('Error: Venue ID is missing in the URL');
        return;
    }

    try {
        const response = await fetch(`/.netlify/functions/venue?id=${venueId}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.venue) {
            throw new Error('Venue data is missing in the response.');
        }

        // Update Page Title Dynamically
        document.title = `${data.venue.name} - Venue - Gigdates.net`;

        // Update Venue Details on the Page
        document.getElementById('venue-name').innerText = data.venue.name || 'Unknown Venue';
        document.getElementById('venue-address').innerText = data.venue.address || 'No Address Provided';
        document.getElementById('venue-phone').innerText = data.venue.phone || 'No Phone Provided';
        document.getElementById('venue-parking').innerText = data.venue.parking || 'Parking details unavailable';
        document.getElementById('venue-seating').innerText = data.venue.seating || 'Seating details unavailable';
        document.getElementById('venue-description').innerText = data.venue.description || 'No description available';

        document.getElementById('venue-social').innerHTML = `
            <a href="${data.venue.socialMedia?.facebook || '#'}" target="_blank">Facebook</a> | 
            <a href="${data.venue.socialMedia?.instagram || '#'}" target="_blank">Instagram</a> | 
            <a href="${data.venue.website || '#'}" target="_blank">Website</a>
        `;

        // Render Upcoming Events
        const eventsContainer = document.getElementById('venue-events');
        if (eventsContainer && data.events && data.events.length > 0) {
            const today = getTodayDateEastern();

            const upcomingEvents = data.events.filter(event => event.date >= today);

            if (upcomingEvents.length > 0) {
                eventsContainer.innerHTML = await Promise.all(upcomingEvents.map(async (event) => {
                    const isToday = event.date === today;
                    const dayOfWeek = getDayOfWeek(event.date);
                    const dayBadge = getDayBadge(dayOfWeek);

                    // Fetch band details if bandIds exist
                    let bandListHTML = '';
                    if (event.bandIds && event.bandIds.length > 0) {
                        const bands = await fetchBandDetails(event.bandIds);
                        bandListHTML = `
                            <p><strong>Bands:</strong> 
                                ${bands.map(band => `<a href="/band/${band.id}" style="color: #4a90e2;">${band.name}</a>`).join(', ')}
                            </p>
                        `;
                    }

                    return `
                        <div class="event-card">
                            <h3>
                                <a href="/event/${event.id}">
                                    ${event.title || 'Unnamed Event'}
                                </a>
                            </h3>
                            <p>
                                <strong>Date:</strong> 
                                ${isToday ? '<span class="today-badge">TODAY</span>' : ''} 
                                ${dayBadge} 
                                ${formatDate(event.date)}
                            </p>
                            <p><strong>Doors:</strong> ${event.doors || 'No Doors Time Provided'}</p>
                           <p><strong>Venue:</strong> 
                                <a href="/venue/${event.venueId}">
                                    ${event.venueName || 'Unknown Venue'}
                                </a>
                            </p>
                            ${bandListHTML}
                        </div>
                    `;
                })).then(eventCards => eventCards.join(''));
            } else {
                eventsContainer.innerHTML = '<p>No upcoming events available for this venue.</p>';
            }
        }

        // Render Past Events
        const pastEventsContainer = document.getElementById('venue-past-events');
        if (pastEventsContainer && data.pastEvents && data.pastEvents.length > 0) {
            const today = getTodayDateEastern();

            const pastEvents = data.pastEvents.filter(event => event.date < today);

            if (pastEvents.length > 0) {
                pastEventsContainer.innerHTML = await Promise.all(pastEvents.map(async (event) => {
                    const isToday = event.date === today;
                    const dayOfWeek = getDayOfWeek(event.date);
                    const dayBadge = getDayBadge(dayOfWeek);

                    // Fetch band details if bandIds exist
                    let bandListHTML = '';
                    if (event.bandIds && event.bandIds.length > 0) {
                        const bands = await fetchBandDetails(event.bandIds);
                        bandListHTML = `
                            <p><strong>Bands:</strong> 
                                ${bands.map(band => `<a href="/band/${band.id}" style="color: #4a90e2;">${band.name}</a>`).join(', ')}
                            </p>
                        `;
                    }

                    return `
                        <div class="event-card">
                            <h3>
                                <a href="/event/${event.id}">
                                    ${event.title || 'Unnamed Event'}
                                </a>
                            </h3>
                            <p>
                                <strong>Date:</strong> 
                                ${isToday ? '<span class="today-badge">TODAY</span>' : ''} 
                                ${dayBadge} 
                                ${formatDate(event.date)}
                            </p>
                            <p><strong>Doors:</strong> ${event.doors || 'No Doors Time Provided'}</p>
                           <p><strong>Venue:</strong> 
                                <a href="/venue/${event.venueId}">
                                    ${event.venueName || 'Unknown Venue'}
                                </a>
                            </p>
                            ${bandListHTML}
                        </div>
                    `;
                })).then(eventCards => eventCards.join(''));
            } else {
                pastEventsContainer.innerHTML = '<p>No past events available for this venue.</p>';
            }
        }
    } catch (error) {
        console.error('Error fetching venue data:', error.message);
        document.getElementById('venue-name').innerText = 'Error fetching venue details.';
    }
}

// Initialize Fetch on Page Load
document.addEventListener('DOMContentLoaded', fetchVenueData);
