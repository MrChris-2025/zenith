import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';

if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  console.error("ERROR: Missing FIREBASE_SERVICE_ACCOUNT secret in GitHub repository settings.");
  process.exit(1);
}

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
const messaging = getMessaging();

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

      const gameDocRef = db.collection('game_states').doc(event.id);
      const gameDoc = await gameDocRef.get();

      let previousAwayScore = 0;
      let previousHomeScore = 0;

      if (gameDoc.exists) {
        const cached = gameDoc.data();
        previousAwayScore = cached.awayScore;
        previousHomeScore = cached.homeScore;

        const awayScored = currentAwayScore > previousAwayScore;
        const homeScored = currentHomeScore > previousHomeScore;

        if (awayScored || homeScored) {
          const scoringTeamName = awayScored ? awayName : homeName;
          const title = `SCORE UPDATE: ${awayName} vs ${homeName}`;
          const body = `${scoringTeamName} scored! Score is now ${awayName} ${currentAwayScore} - ${currentHomeScore} ${homeName} (${inningStatusText})`;

          console.log(`[ALERT] ${body}`);
          await triggerNotifications(event.id, away.team.id, home.team.id, title, body);
        }
      }

      await gameDocRef.set({
        awayScore: currentAwayScore,
        homeScore: currentHomeScore,
        updatedAt: Date.now()
      });
    }
  } catch (err) {
    console.error(`Error polling ${sport}/${league}:`, err.message);
  }
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
    console.log(`Successfully sent alerts to ${tokens.length} devices.`);
  } catch (err) {
    console.error('Error sending push:', err);
  }
}

async function runContinuous() {
  console.log('Continuous sports score check active. Polling every 15 seconds...');
  const startTime = Date.now();
  const twoHours = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

  while (Date.now() - startTime < twoHours) {
    for (const config of SPORTS_CONFIG) {
      await checkScoresForSport(config.sport, config.league);
    }
    // Sleep for 15 seconds
    await new Promise(resolve => setTimeout(resolve, 15000));
  }
  console.log('2-hour polling cycle complete. Exiting safely.');
}

runContinuous();
