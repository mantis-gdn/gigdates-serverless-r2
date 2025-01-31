const { bands } = require('../../data/bands');
const { events } = require('../../data/events');

// Utility function to get today's date in YYYY-MM-DD format
function getTodayDateEastern() {
    const date = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Fetch band details and associated events
exports.handler = async (event) => {
    try {
        const bandId = event.queryStringParameters?.id;

        if (!bandId) {
            console.error('Band ID missing from query parameters');
            return {
                statusCode: 400,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ error: 'Band ID is required' }),
            };
        }

        const band = bands.find(b => b.id === bandId);

        if (!band) {
            console.error(`Band not found for ID: ${bandId}`);
            return {
                statusCode: 404,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ error: 'Band not found' }),
            };
        }

        const today = getTodayDateEastern();

        // Separate events into past and future/today categories
        const pastEvents = events
            .filter(event => 
                event.bandIds && 
                event.bandIds.includes(bandId) && 
                event.schedule?.date < today // Past events
            )
            .sort((a, b) => new Date(b.schedule?.date) - new Date(a.schedule?.date)) // Sort by date descending
            .map(event => ({
                id: event.id,
                title: event.title || 'Unnamed Event',
                date: event.schedule?.date || 'No Date Provided',
                time: event.schedule?.show || 'No Time Provided',
                venue: event.venue || 'Unknown Venue',
                venueId: event.venueId || null,
                bandIds: event.bandIds || []
            }));

        const futureEvents = events
            .filter(event => 
                event.bandIds && 
                event.bandIds.includes(bandId) && 
                event.schedule?.date >= today // Today or future events
            )
            .sort((a, b) => new Date(a.schedule?.date) - new Date(b.schedule?.date)) // Sort by date ascending
            .map(event => ({
                id: event.id,
                title: event.title || 'Unnamed Event',
                date: event.schedule?.date || 'No Date Provided',
                time: event.schedule?.doors || 'No Time Provided',
                venue: event.venue || 'Unknown Venue',
                venueId: event.venueId || null,
                bandIds: event.bandIds || []
            }));

        // Fetch band names for each event
        const enrichEventsWithBands = (events) => 
            events.map(event => {
                const eventBands = event.bandIds.map(bandId => {
                    const foundBand = bands.find(b => b.id === bandId);
                    return foundBand ? foundBand.name : `Unknown Band (${bandId})`;
                });
                return { ...event, bands: eventBands };
            });

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                band: {
                    id: band.id,
                    name: band.name,
                    genre: band.genre || 'No Genre Provided',
                    description: band.description || 'No description available',
                    website: band.website || '#',
                    interview: band.interview || 'No interview available',
                    socialMedia: {
                        facebook: band.socialMedia?.facebook || '#',
                        instagram: band.socialMedia?.instagram || '#',
                    },
                    members: band.members || []
                },
                events: {
                    past: enrichEventsWithBands(pastEvents),
                    future: enrichEventsWithBands(futureEvents)
                }
            }),
        };
    } catch (error) {
        console.error('Server Error:', error);
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: 'Internal Server Error' }),
        };
    }
};
