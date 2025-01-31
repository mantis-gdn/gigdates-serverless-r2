// main.js


// Function to load content into a container
async function loadComponent(id, filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${filePath}`);
        }
        const content = await response.text();
        document.getElementById(id).innerHTML = content;
    } catch (error) {
        console.error(`Error loading component: ${filePath}`, error);
    }
}

// Display Current Date in Header
function displayCurrentDate() {
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        const date = new Date();
        const formattedDate = date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'America/New_York'
        });
        dateElement.innerText = `Today's Date\n${formattedDate}`;
    }
}

// Load Header and Footer, then display the current date
document.addEventListener('DOMContentLoaded', async () => {
    await loadComponent('header', '/includes/header.html');
    await loadComponent('footer', '/includes/footer.html');
    displayCurrentDate(); // Ensure the date function runs after header loads
});

