## Running the project

In one terminal:

- `cd server`
- `npm install`
- Create a `.env` file (see `server/.env.example`) and set `JWT_SECRET`
- `npm start`

In a second terminal:

- `cd frontend`
- `npm install`
- `npm run dev`

there are 4 premade logins 1 basic user 3 producers and 1 admin:

basic user: email:user@user.com Password:User1234

first producer: email:producer@producer.com password:Producer123

second producer: email:producer1@producer.com password:Producer123

third producer: email:producer2@producer.com password:Producer123

admin: email:Admin@admin.com password:Admin123

## Security notes (for assessment evidence)

- Passwords are stored hashed (bcrypt)
- JWT auth is required for protected routes; `JWT_SECRET` must be configured via `.env`
- Admin/producer endpoints are role-protected server-side (not just hidden in the UI)