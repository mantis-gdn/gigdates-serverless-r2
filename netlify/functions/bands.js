const { bands } = require("../../data/bands");

exports.handler = async () => {
    try {
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                bands: bands.map(band => ({
                    id: band.id,
                    name: band.name,
                    genre: band.genre
                }))
            }),
        };
    } catch (error) {
        console.error('Error fetching bands:', error);
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: 'Internal Server Error' }),
        };
    }
}