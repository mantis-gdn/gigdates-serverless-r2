const { Client, fql } = require('fauna');

const client = new Client({
  secret: process.env.FAUNA_SECRET_KEY,
});

exports.handler = async (event) => {
  const { headers } = event;
  const referer = headers.referer;

  // If there's no referer, return early
  if (!referer) {
    return {
      statusCode: 400,
      body: 'Bad Request: Missing Referer Header',
    };
  }

  const { pathname } = new URL(referer);

  try {
    // Insert a new document for each page view
    await client.query(
      fql`
        hits.create({ pathname: ${pathname}, timestamp: Time.now() })
      `
    );
  } catch (error) {
    console.error('Error tracking page view:', error);
  }

  return {
    statusCode: 200,
    body: 'R0lGODlhAQABAJAAAP8AAAAAACH5BAUQAAAALAAAAAABAAEAAAICBAEAOw==',
    headers: { 'content-type': 'image/gif' },
    isBase64Encoded: true,
  };
};
