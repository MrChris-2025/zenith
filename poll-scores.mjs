import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';

if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  console.error("ERROR: Missing FIREBASE_SERVICE_ACCOUNT secret.");
  process.exit(1);
}

let secretStr = process.env.FIREBASE_SERVICE_ACCOUNT;
secretStr = secretStr.replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"');
secretStr = secretStr.replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'");

let serviceAccount;
try {
  serviceAccount = JSON.parse(secretStr);
} catch (err) {
  console.error("ERROR: Failed to parse credentials.");
  process.exit(1);
}

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
const messaging = getMessaging();

const scoreCache = new Map();

const SPORTS_CONFIG = [
  { sport: 'baseball', league: 'mlb' },
  { sport: 'football', league: 'nfl' },
  { sport: 'basketball', league: 'nba' },
  { sport: 'hockey', league: 'nhl' },
  { sport: 'soccer', league: 'eng.1' }
];

async function checkScoresForSport(sport, league) {
  const url = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/scoreboard`;
  let hasLiveGames = false;

  try {
    const response = await fetch(url);
    if (!response.ok) return false;
    const data = await response.json();
    const events = data.events || [];

    for (const event of events) {
      const state = event.status?.type?.state;
      if (state === 'in') {
        hasLiveGames = true;
      }

      const competition = event.competitions[0];
      const competitors = competition.competitors;
      const home = competitors.find(c => c.homeAway === 'home') || competitors[0];
      const away = competitors.find(c => c.homeAway === 'away') || competitors[1];

      const currentAwayScore = Number(away.score || 0);
      const currentHomeScore = Number(home.score || 0);
      const inningStatusText = event.status?.type?.detail || '';

      const awayName = away.team.shortDisplayName || away.team.displayName;
      const homeName = home.team.shortDisplayName || home.team.displayName;

      if (scoreCache.has(event.id)) {
        const cached = scoreCache.get(event.id);
        const awayScored = currentAwayScore > cached.awayScore;
        const homeScored = currentHomeScore > cached.homeScore;

        if (awayScored || homeScored) {
          const title = `Score Update: ${awayName} vs ${homeName}`;
          const body = `${awayName} ${currentAwayScore} - ${currentHomeScore} ${homeName} (${inningStatusText})`;

          console.log(`[ALERT] ${body}`);
          await triggerNotifications(event.id, away.team.id, home.team.id, title, body);
        }
      }

      scoreCache.set(event.id, {
        awayScore: currentAwayScore,
        homeScore: currentHomeScore
      });

      await db.collection('game_states').doc(event.id).set({
        awayScore: currentAwayScore,
        homeScore: currentHomeScore,
        updatedAt: Date.now()
      });
    }
  } catch (err) {
    console.error(`Error polling ${sport}/${league}:`, err.message);
  }

  return hasLiveGames;
}

async function triggerNotifications(eventId, awayTeamId, homeTeamId, title, body) {
  try {
    const tokensSet = new Set();
    const targets = [
      `game_${eventId}`,
      `team_${awayTeamId}`,
      `team_${homeTeamId}`
    ];

    const snapshot = await db.collection('subscriptions').where('topic', 'in', targets).get();
    if (snapshot.empty) return;

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.token) tokensSet.add(data.token);
    });

    const tokens = Array.from(tokensSet);
    if (tokens.length === 0) return;

    await messaging.sendEachForMulticast({
      tokens: tokens,
      notification: { title, body }
    });
    console.log(`Sent alerts to ${tokens.length} devices.`);
  } catch (err) {
    console.error('Error sending push:', err);
  }
}

async function runContinuous() {
  console.log('Poller started.');
  const startTime = Date.now();
  const fifteenMinutes = 15 * 60 * 1000;

  while (Date.now() - startTime < fifteenMinutes) {
    let anySportLive = false;

    for (const config of SPORTS_CONFIG) {
      const isLive = await checkScoresForSport(config.sport, config.league);
      if (isLive) {
        anySportLive = true;
      }
    }

    if (!anySportLive) {
      console.log('No active games in progress. Exiting loop to prevent rate-limiting.');
      break;
    }

    // Sleep for 15 seconds
    await new Promise(resolve => setTimeout(resolve, 15000));
  }
  console.log('Cycle complete.');
}

runContinuous();
