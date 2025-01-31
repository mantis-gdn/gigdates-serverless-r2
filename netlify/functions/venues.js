const { venues } = require("../../data/venues");

exports.handler = async () => {
    try {
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                venues: venues.map(venue => ({
                    id: venue.id,
                    name: venue.name
                }))
            }),
        };
    } catch (error) {
        console.error('Error fetching venues:', error);
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: 'Internal Server Error' }),
        };
    }
}