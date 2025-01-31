const { events } = require('../../data/events');

exports.handler = async (event) => {
    try {
        const eventId = event.queryStringParameters?.id;

        if (!eventId) {
            console.error('Event ID missing from query parameters');
            return {
                statusCode: 400,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ error: 'Event ID is required' }),
            };
        }

        const eventData = events.find(e => e.id == eventId);

        if (!eventData) {
            console.error(`Event not found for ID: ${eventId}`);
            return {
                statusCode: 404,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ error: 'Event not found' }),
            };
        }

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: eventData.id,
                title: eventData.title,
                genre: eventData.genre || 'No Genre Provided',
                date: eventData.schedule?.date || 'No Date Provided',
                doors: eventData.schedule?.doors || 'No Time Provided',
                show: eventData.schedule?.show || 'No Time Provided',
                venue: eventData.venue || 'Unknown Venue',
                venueId: eventData.venueId || 'Unknown Venue ID',
                bandIds: eventData.bandIds || [], // Include bandIds explicitly
                preview: eventData.preview || 'No Preview Available',
                review: eventData.review || 'No Review Available',
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
