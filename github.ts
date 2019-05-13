// https://github.com/settings/tokens
const token = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
const username = PropertiesService.getScriptProperties().getProperty('GITHUB_USERNAME');
const webhookUrl = PropertiesService.getScriptProperties().getProperty('SLACK_WEBHOOK_URL');

function mainGithub() {
  let body = formatGitHubEvents_(token, username);
  if (body === '') {
    body = ':octocat: PR はありません。';
  }
  postSlack_(body);
}

function formatGitHubEvents_(token, username) {
  const today = new Date();
  today.setHours(0);
  today.setMinutes(0);
  today.setSeconds(0);

  const options : GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    'method' : 'get',
    "headers" : { 'Authorization': 'token ' + token }
  };

  const set = [];

  let content = '';

  for (let page = 1; page < 10; page++) {
    const requestUrl = `https://api.github.com/users/${username}/events?page=${page}`;
    const response = UrlFetchApp.fetch(requestUrl, options);

    const events = JSON.parse(response.getContentText());

    for (let i = 0; i < events.length; i++) {
      const event = events[i];

      const createdAt = new Date(event['created_at']);

      if (createdAt.getTime() < today.getTime()) {
        return content;
      }

      const pullRequest = event['payload']['pull_request'];
      if (!!pullRequest && set.indexOf(pullRequest['html_url']) < 0) {
        content += '* :octocat: [' + pullRequest['title'] + '](' + pullRequest['html_url']
                   + ') by @[' + pullRequest['user']['login'] + '](' + pullRequest['user']['html_url'] + ')';
        if (!!pullRequest['merged_at']) {
          content += " **merged!**";
        }
        content += "\n";
        set.push(pullRequest['html_url']);
      }
    }
  }
  return content;
}

function postSlack_(body) {
  const payload = JSON.stringify({'text' : body});

  const options : GoogleAppsScript.URL_Fetch.URLFetchRequestOptions =
      {
        'method' : 'post',
        'contentType' : 'application/json',
        'payload' : payload
      };

  UrlFetchApp.fetch(webhookUrl, options);
}

