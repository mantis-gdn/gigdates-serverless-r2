const { venues } = require('../../data/venues');
const { events } = require('../../data/events');

// Utility function to get today's date in YYYY-MM-DD format
function getTodayDateEastern() {
    const date = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

exports.handler = async (event) => {
    try {
        const venueId = event.queryStringParameters?.id;

        if (!venueId) {
            console.error('Venue ID missing from query parameters');
            return {
                statusCode: 400,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ error: 'Venue ID is required' }),
            };
        }

        const venue = venues.find(v => v.id === venueId);

        if (!venue) {
            console.error(`Venue not found for ID: ${venueId}`);
            return {
                statusCode: 404,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ error: 'Venue not found' }),
            };
        }

        const today = getTodayDateEastern();

        const venueEvents = events
            .filter(event => event.venueId === venueId && event.schedule?.date >= today) // Filter future events
            .sort((a, b) => new Date(a.schedule?.date) - new Date(b.schedule?.date)) // Sort by date ascending
            .map(event => ({
                id: event.id,
                title: event.title || 'Unnamed Event',
                date: event.schedule?.date || 'No Date Provided',
                doors: event.schedule?.doors || 'No Doors Time Provided',
                show: event.schedule?.show || 'No Show Time Provided',
                venueName: event.venue || 'Unknown Venue',
                venueId: event.venueId || null,
                bandIds: event.bandIds || [] // Include bandIds in the response
            }));

            const venuePastEvents = events
            .filter(event => event.venueId === venueId && event.schedule?.date < today) // Filter future events
            .sort((a, b) => new Date(a.schedule?.date) - new Date(b.schedule?.date)) // Sort by date ascending
            .map(event => ({
                id: event.id,
                title: event.title || 'Unnamed Event',
                date: event.schedule?.date || 'No Date Provided',
                doors: event.schedule?.doors || 'No Doors Time Provided',
                show: event.schedule?.show || 'No Show Time Provided',
                venueName: event.venue || 'Unknown Venue',
                venueId: event.venueId || null,
                bandIds: event.bandIds || [] // Include bandIds in the response
            }));

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                venue: {
                    id: venue.id,
                    name: venue.name,
                    address: venue.address || 'No Address Provided',
                    phone: venue.phone || 'No Phone Provided',
                    website: venue.website || '#',
                    eventsLink: venue.eventsLink || '#',
                    seating: venue.seating || 'Seating details unavailable',
                    parking: venue.parking || 'Parking details unavailable',
                    description: venue.description || 'No description available',
                    socialMedia: {
                        facebook: venue.socialMedia?.facebook || '#',
                        instagram: venue.socialMedia?.instagram || '#',
                        website: venue.socialMedia?.website || '#',
                    }
                },
                events: venueEvents,
                pastEvents: venuePastEvents
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
