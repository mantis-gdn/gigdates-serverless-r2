// Fetch and Display All Bands
async function fetchAndDisplayBands() {
    try {
        const response = await fetch('/.netlify/functions/bands');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        const bandsContainer = document.getElementById('bands-container');
        if (data.bands && data.bands.length > 0) {
            bandsContainer.innerHTML = data.bands.map(band => `
                <div class="band">
                    <h2><a href="/band/${band.id}">${band.name}</a></h2>
                    <p>${band.genre}</p>
                </div>
            `).join('');
        } else {
            bandsContainer.innerHTML = '<p>No bands found</p>';
        }
    } catch (error) {
        console.error('Error fetching bands:', error);
        const bandsContainer = document.getElementById('bands-container');
        bandsContainer.innerHTML = '<p>Failed to load bands</p>';
    }
}

// Call the function after defining it
fetchAndDisplayBands();
