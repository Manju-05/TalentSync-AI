# Career Compass

AI Job Portal Frontend

Create a clean, modern, and responsive Job Portal frontend using React with a simple UI. Use a blue and white color theme with rounded cards and minimal design.

Pages

1. Home Page

Hero section with title:
"AI Job Portal"

Subtitle:
"Register your profile, get matched with jobs, and receive AI career guidance."

Three buttons:

Register

Find Jobs

Career Guidance

2. Registration Page

Create a registration form with these fields:

Full Name

Email

Skills (comma separated)

Preferred Roles

Experience Level (Dropdown: Fresher, Junior, Mid, Senior)

Location

When the user clicks Register, send a POST request to:

https://mahakal-ujjain.app.n8n.cloud/webhook/register

Content-Type:
application/json

Request Body:

{
  "full_name": "",
  "email": "",
  "skills": "",
  "preferred_roles": "",
  "experience_level": "",
  "location": ""
}


After successful registration:

Show a success message.

Display the returned user_id.

Save the user_id in localStorage.

3. Job Matching Page

Create a simple page with:

Input field for User ID

Button: "Find Matching Jobs"

Call the Job Matching webhook (placeholder URL).

Display returned jobs as cards showing:

Job Title

Company

Location

Matching Skills

Apply button (opens job URL in a new tab)

If no jobs are found, show:
"No matching jobs available."

4. AI Career Guidance Page

Create:

User ID input

Question textarea

Button: "Ask AI"

Call the Career Guidance webhook (placeholder URL).

Display the AI response inside a clean card.

Navbar

Include:

Home

Register

Find Jobs

Career Guidance

Footer

Simple footer:

"© 2026 AI Job Portal"

Design

Responsive for desktop and mobile

Rounded cards

Soft shadows

Blue primary color

White background

Nice spacing

Simple animations on hover

Loading spinner while API calls are running

Error message if API request fails

Success toast after registration

Keep the project simple, clean, and easy to maintain. Do not add authentication, database logic, or unnecessary features. Only build the frontend and connect it to the provided registration API.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/2af748aa-377a-4591-b80e-1107f1a322dc).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
