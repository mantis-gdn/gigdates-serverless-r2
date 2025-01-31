// netlify/functions/events.js
const { events } = require('../../data/events');
const { bands } = require('../../data/bands'); // <-- Make sure you have a bands.js or similar file

// Utility function to get today's date in YYYY-MM-DD format (Eastern Time)
function getTodayDateEastern() {
  const date = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

exports.handler = async () => {
  try {
    // 1) Keep the existing filter/sort logic
    const today = getTodayDateEastern();

    // Convert 'today' string to a Date for comparison
    const todayDate = new Date(today);

    // Create a date 14 days from now
    const fourteenDaysFromToday = new Date(today);
    fourteenDaysFromToday.setDate(todayDate.getDate() + 14);

    // Filter and sort
    const filteredAndSortedEvents = events
      .filter((event) => {
        const eventDate = new Date(event.schedule?.date);
        return eventDate >= todayDate && eventDate < fourteenDaysFromToday;
      })
      .sort((a, b) => new Date(a.schedule?.date) - new Date(b.schedule?.date));

    // 2) For each event, attach detailed band info using bandIds
    const eventsWithBandData = filteredAndSortedEvents.map((event) => {
      let eventBands = [];

      // If the event has bandIds, map them to actual band data
      if (event.bandIds && Array.isArray(event.bandIds)) {
        eventBands = event.bandIds.map((bandId) => {
          // Find the matching band in the bands array
          const matchedBand = bands.find((b) => b.id === bandId);
          if (matchedBand) {
            return {
              id: matchedBand.id,
              name: matchedBand.name,
              genre: matchedBand.genre,
              // Add any other band fields you need
            };
          }
          // Fallback if no band is found
          return { id: bandId, error: 'Band not found' };
        });
      }

      // Return the event data plus an array of band details
      return {
        id: event.id,
        genre: event.genre,
        title: event.title,
        date: event.schedule?.date || 'No Date Provided',
        time: event.schedule?.doors || 'No Time Provided',
        venueName: event.venue,
        venueId: event.venueId,
        bandIds: event.bandIds || [],
        bands: eventBands, // <-- new field containing actual band info
      };
    });

    // 3) Return as JSON
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: eventsWithBandData }),
    };
  } catch (error) {
    console.error('Error fetching events:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};
