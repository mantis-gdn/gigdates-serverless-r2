// Fetch and Display All Bands
async function fetchAndDisplayVenues() {
    try {
        const response = await fetch('/.netlify/functions/venues');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        const venuesContainer = document.getElementById('venues-container');
        if (data.venues && data.venues.length > 0) {
            venuesContainer.innerHTML = data.venues.map(venue => `
                <div class="venue">
                    <h2><a href="/venue/${venue.id}">${venue.name}</a></h2>
                </div>
            `).join('');
        } else {
            venuesContainer.innerHTML = '<p>No venues found</p>';
        }
    } catch (error) {
        console.error('Error fetching venues:', error);
        const venuesContainer = document.getElementById('venues-container');
        venuesContainer.innerHTML = '<p>Failed to load venues</p>';
    }
}

// Call the function after defining it
fetchAndDisplayVenues();
