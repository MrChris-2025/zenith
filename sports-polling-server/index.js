import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import fs from 'fs';

// Load your service account key securely
const serviceAccount = JSON.parse(
  fs.readFileSync('./service-account.json', 'utf8')
);

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
const messaging = getMessaging();

// In-memory cache to prevent constant Firestore reads/writes
const scoreCache = new Map();

// Configure the sports and leagues to poll
const SPORTS_CONFIG = [
  { sport: 'baseball', league: 'mlb' },
  { sport: 'football', league: 'nfl' },
  { sport: 'basketball', league: 'nba' },
  { sport: 'hockey', league: 'nhl' },
  { sport: 'soccer', league: 'eng.1' }
];

async function checkScoresForSport(sport, league) {
  const url = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/scoreboard`;
  try {
    const response = await fetch(url);
    if (!response.ok) return;
    const data = await response.json();
    const events = data.events || [];

    for (const event of events) {
      const competition = event.competitions[0];
      const competitors = competition.competitors;
      const home = competitors.find(c => c.homeAway === 'home') || competitors[0];
      const away = competitors.find(c => c.homeAway === 'away') || competitors[1];

      const currentAwayScore = Number(away.score || 0);
      const currentHomeScore = Number(home.score || 0);
      const inningStatusText = event.status?.type?.detail || '';

      const awayName = away.team.shortDisplayName || away.team.displayName;
      const homeName = home.team.shortDisplayName || home.team.displayName;

      // Check if we already have this game in cache
      if (scoreCache.has(event.id)) {
        const cached = scoreCache.get(event.id);
        const awayScored = currentAwayScore > cached.awayScore;
        const homeScored = currentHomeScore > cached.homeScore;

        if (awayScored || homeScored) {
          const scoringTeamName = awayScored ? awayName : homeName;
          const title = `SCORE UPDATE: ${awayName} vs ${homeName}`;
          const body = `${scoringTeamName} scored! Score is now ${awayName} ${currentAwayScore} - ${currentHomeScore} ${homeName} (${inningStatusText})`;

          console.log(`[ALERT] ${body}`);
          await triggerNotifications(event.id, away.team.id, home.team.id, title, body);
        }
      }

      // Update scoring cache
      scoreCache.set(event.id, {
        awayScore: currentAwayScore,
        homeScore: currentHomeScore
      });
    }
  } catch (err) {
    console.error(`Error polling ${sport}/${league}:`, err.message);
  }
}

async function triggerNotifications(eventId, awayTeamId, homeTeamId, title, body) {
  try {
    const tokensSet = new Set();

    // Map possible subscription topics for this event
    const targets = [
      `game_${eventId}`,
      `team_${awayTeamId}`,
      `team_${homeTeamId}`
    ];

    // Query Firestore subscriptions collection
    const subscriptionsRef = db.collection('subscriptions');
    const snapshot = await subscriptionsRef.where('topic', 'in', targets).get();

    if (snapshot.empty) {
      console.log(`No active subscriptions found for this score update.`);
      return;
    }

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.token) {
        tokensSet.add(data.token);
      }
    });

    const tokens = Array.from(tokensSet);
    console.log(`Sending alerts to ${tokens.length} registered devices...`);

    // Dispatch native push notifications using Multicast
    const response = await messaging.sendEachForMulticast({
      tokens: tokens,
      notification: {
        title: title,
        body: body
      }
    });

    console.log(`Successfully sent ${response.successCount} messages; ${response.failureCount} failed.`);
  } catch (err) {
    console.error('Error sending push notifications:', err);
  }
}

async function pollAllSports() {
  console.log(`[${new Date().toISOString()}] Polling live scores...`);
  for (const config of SPORTS_CONFIG) {
    await checkScoresForSport(config.sport, config.league);
  }
}

// Ensure ES Modules syntax compatibility
if (!fs.existsSync('./package.json')) {
  console.error('Ensure you run npm init to configure your project before launching.');
  process.exit(1);
}

// Add "type": "module" to package.json automatically if not present
const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
if (pkg.type !== 'module') {
  pkg.type = 'module';
  fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2));
}

// Poll live scores every 15 seconds
setInterval(pollAllSports, 15000);
pollAllSports(); // Initial execution
