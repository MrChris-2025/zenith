// netlify/functions/send-alert.js
const webpush = require('web-push');

webpush.setVapidDetails(
  'mailto:admin@sportsalerts.local',
  'BC-LY0azo2sZzvZ4ZoQnZwnpLpIwhrOFsDTQ9YbiuSdWLNqKQYdNGmMM9Am6IH-Zd9rBPg7gcXOEYiFyNsz2Fh8',
  'bUQTKoJ0x0VyvRiu9s9gniOLO4yVeT5B5VLy9JMNaxY'
);

exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod === 'GET') {
    try {
      const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams');
      const data = await res.json();
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    } catch (error) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
    }
  }

  if (event.httpMethod === 'POST') {
    try {
      const { subscription, teamId, type } = JSON.parse(event.body);
      
      if (!subscription || !subscription.endpoint) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing active client subscription tokens.' }) };
      }

      let title = "Sports Alert";
      let message = "No new updates found.";
      let targetUrl = "https://www.espn.com/nfl/";

      if (type === 'scores') {
        const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard');
        const data = await res.json();
        const game = data.events?.find(e => e.competitions[0].competitors.some(c => c.team.id === teamId));
        
        if (game) {
          const comp = game.competitions[0];
          title = `${game.shortName} Live Score`;
          message = `${comp.competitors[1].team.displayName} ${comp.competitors[1].score} @ ${comp.competitors[0].team.displayName} ${comp.competitors[0].score} (${game.status.type.detail})`;
        } else {
          title = "Score Update";
          message = "Selected team is not playing today.";
        }
      } 
      else if (type === 'news') {
        const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/football/nfl/news');
        const data = await res.json();
        const article = data.articles?.find(a => a.categories?.some(c => c.id === parseInt(teamId)) || a.description?.toLowerCase().includes(teamId)) || data.articles?.[0];
        
        if (article) {
          title = article.headline || "NFL Breaking News";
          message = article.description || "Tap to read the latest update.";
          targetUrl = article.links?.web?.href || targetUrl;
        }
      }

      const payload = JSON.stringify({ title, body: message, url: targetUrl });

      await webpush.sendNotification(subscription, payload);

      return { 
        statusCode: 200, 
        headers, 
        body: JSON.stringify({ success: true }) 
      };

    } catch (error) {
      return { 
        statusCode: 500, 
        headers, 
        body: JSON.stringify({ error: error.message }) 
      };
    }
  }
};
