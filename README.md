# Rebuilt - FRC Scouting System

**Rebuilt** is a mobile-first scouting application designed specifically for ball-heavy FRC games. Built for **Team Hyper 69** with a focus on super-accurate counts and prediction data, as inspired by the [ChiefDelphi scouting discussion](https://www.chiefdelphi.com/t/rebuilt-scouting-systems/510647/5).

## Features

### 🎯 Match Scouting
- **Fast, chunky counters** for ball scoring (high/low made/miss)
- **Large tap targets** optimized for mobile scouting
- **Undo functionality** for last 3 actions
- **Error checking** before submission (catches unrealistic totals)
- **Live totals display** showing accuracy and handled vs scored
- **Cycle tracking** with timing data
- **Auto/Teleop/Endgame** sections with phase indicators

### 📊 Analytics & Predictions
- **Rebuilt Rating** (EPA-like metric) for team evaluation
- **Match predictions** based on logged scout data
- **Team dashboards** with scoring trends, cycle stats, and consistency metrics
- **Picklist view** with sorting and filtering
- **Role finder** to identify high scorers, consistent performers, etc.

### 🎨 Design
- **Team Hyper 69 theme**: Blue primary (#0066CC) with orange secondary (#FF6600)
- **Mobile-first** design with bottom navigation
- **Haptic feedback** simulation for button presses
- **Visual phase indicators** showing match progress

## Getting Started

### Development

First, install dependencies:

```bash
npm install
```

Create a `.env.local` file in the root directory:

```bash
SCOUT_PASSWORD=your_access_code_here
NODE_ENV=development
```

Replace `your_access_code_here` with your team's shared access code.

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You'll be redirected to `/login` if you're not authenticated.

### Deployment (Vercel)

1. **Set Environment Variable**: In your Vercel project settings, add:
   - `SCOUT_PASSWORD`: Your team's shared access code
   - `NODE_ENV`: `production`

2. **Deploy**: Push to your connected Git repository or use `vercel deploy`

3. **Access**: Scouts will be redirected to `/login` and need to enter the access code to use the app. Sessions last 12 hours.

### Build for Production

```bash
npm run build
npm start
```

## Architecture

- **Framework**: Next.js 16 with React 19
- **Styling**: Tailwind CSS v4
- **Storage**: LocalStorage (can be extended to sync to backend)
- **Type Safety**: TypeScript

## Key Philosophy

As stated in the ChiefDelphi post that inspired this:

> "My team is really big on getting accurate data for everything... we use it to predict future matches... Accurately counting is also really important..."

Rebuilt addresses this with:
- ✅ Large, easy-to-tap buttons to reduce counting errors
- ✅ Error checks for unrealistic totals before submission
- ✅ Separation of handled vs scored balls to avoid undercounting
- ✅ Analytics that compute EPA-style ratings for match predictions
- ✅ Picklists built directly from accurate ball counts and consistency metrics

## Data Structure

Scout data is stored per-match-per-robot and includes:
- Auto: Ball counts, starting position, mobility
- Teleop: Ball counts, cycles, feed-only, fumbled
- Endgame: Climb, parked, defense metrics, notes, tags

All data is stored in LocalStorage and can be exported to CSV from the Settings tab.

## License

Built for Team Hyper 69.
