# CCG Warehouse App

A small, password-gated internal app for Capital City Games & Music staff to
browse inventory, update game status, and manage work orders — reading and
writing directly to your existing Airtable base. Nothing about your Airtable
data changes; this is just a nicer front door to it.

## What's inside

- **Login** — one shared password for the whole shop (not per-person accounts)
- **Who are you** — right after the password, pick your name from a short list. Stored in your browser only (not a real login) and used to auto-fill "assigned to" on new work orders and stamp a "Last Updated By" field, so the boss can tell who touched what. Tap your name in the top bar to switch on a shared device.
- **Dashboard** — Boss Requests front page: open, flagged work orders first
- **Inventory board** — filter by status, tap a game to edit it
- **Game detail** — update status, location, notes
- **Add a game** — quick intake form for new arrivals
- **Work orders** — list, create (with a "flag for boss" option), and edit

## One-time setup (about 15 minutes)

### 1. Get an Airtable Personal Access Token

1. Go to https://airtable.com/create/tokens
2. Click **Create new token**
3. Name it something like "CCG Warehouse App"
4. Scopes: add `data.records:read`, `data.records:write`, and `schema.bases:read` (the last one is needed so the Brand/Manufacturer dropdown can always show your current, up-to-date list of options)
5. Access: add the **Capital City Games & Music Inventory** base
6. Create it, and copy the token (starts with `pat...`) — you won't see it again

### 2. Push this project to GitHub

```bash
cd ccg-warehouse-app
git init
git add .
git commit -m "Initial commit"
```
Then create a new repository on GitHub and push it there (GitHub will show you
the exact commands after you create the repo — usually `git remote add origin ...`
followed by `git push -u origin main`).

### 3. Deploy on Vercel

1. Go to https://vercel.com and sign in (GitHub login is easiest)
2. Click **Add New → Project**, and import the GitHub repo you just pushed
3. Before deploying, expand **Environment Variables** and add:

| Name | Value |
|---|---|
| `AIRTABLE_TOKEN` | the `pat...` token from step 1 |
| `AIRTABLE_BASE_ID` | `appYLjHsk6nraaz62` |
| `APP_PASSWORD` | whatever password you want staff to use |
| `SESSION_SECRET` | any long random string (mash the keyboard) |

4. Click **Deploy**

That's it — Vercel gives you a URL like `ccg-warehouse-app.vercel.app`. Share
that link and the password with your 4 people. Bookmark it / "Add to Home
Screen" on phones for an app-like icon.

## Making changes later

Come back to this conversation (or a new one) and ask for changes — new
fields, new pages, different colors, whatever. Whoever's helping you edits
the code, you push the updated files to the same GitHub repo, and Vercel
redeploys automatically within a minute or two. No manual re-upload needed.

## A couple of known things to clean up in Airtable

- You now have two similar date fields on Inventory: an old, unused **"Sold
  Date"** and a new **"Date Sold"** (which this app and the pickup-tracking
  formula actually use). Worth deleting the old "Sold Date" to avoid confusion.
- Make sure the Inventory **Status** field has all of these options exactly:
  Just Received, In Progress, In Repair, Ready for Auction, Going to Auction,
  Sale Ready, Project Only, On Route, On Location, Sold - Awaiting Pickup, Sold.
  If any are missing, add them in Airtable — the app will show an error if
  someone tries to save a status that doesn't exist yet as an option.

## Local development (optional)

If you want to run it on your own computer before deploying:

```bash
npm install
cp .env.example .env.local   # then fill in the same 4 values as above
npm run dev
```
Open http://localhost:3000
