# LinkedIn Job Scraper Microservice

A Node.js microservice that scrapes job data from LinkedIn job postings using Puppeteer and Browserless.io.

## Features

- Scrapes detailed job information from LinkedIn job URLs
- Anti-detection measures to prevent blocking
- Rate limiting for API protection
- Proper error handling and logging
- Deployment-ready for Railway

## Prerequisites

- Node.js >= 18.0.0
- Browserless.io API key
- Railway account (for deployment)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd linkedin-scraper
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```env
   PORT=3000
   NODE_ENV=development
   BROWSERLESS_API_KEY=your_browserless_api_key
   BROWSERLESS_URL=https://chrome.browserless.io
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   LOG_LEVEL=info
   ```

## Development

To run the service locally:

```bash
npm run dev
```

To build the project:

```bash
npm run build
```

To run in production mode:

```bash
npm start
```

## API Usage

### Scrape Job Data

**Endpoint:** `POST /api/linkedin/scrape`

**Request Body:**
```json
{
  "url": "https://www.linkedin.com/jobs/view/[job-id]"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "Job Title",
    "company": "Company Name",
    "location": "Job Location",
    "description": "Full job description",
    "employmentType": "Full-time",
    "postedDate": "Posted 2 days ago",
    "requirements": ["Requirement 1", "Requirement 2"],
    "skills": ["Skill 1", "Skill 2"]
  }
}
```

## Deployment to Railway

1. Create a new project on Railway

2. Connect your GitHub repository to Railway

3. Add the following environment variables in Railway:
   - `PORT`
   - `NODE_ENV=production`
   - `BROWSERLESS_API_KEY`
   - `BROWSERLESS_URL`
   - `RATE_LIMIT_WINDOW_MS`
   - `RATE_LIMIT_MAX_REQUESTS`
   - `LOG_LEVEL`

4. Deploy the service:
   - Railway will automatically deploy your service when you push to the main branch
   - You can also trigger manual deployments from the Railway dashboard

## Error Handling

The service includes comprehensive error handling:

- Invalid URLs return 400 Bad Request
- Rate limiting errors return 429 Too Many Requests
- Scraping errors return 500 Internal Server Error
- All errors include descriptive messages

## Security Measures

- Helmet.js for security headers
- CORS protection
- Rate limiting
- Input validation
- Environment variable configuration
- No sensitive data exposure

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License 