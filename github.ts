// https://github.com/settings/tokens
const token = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
const username = PropertiesService.getScriptProperties().getProperty('GITHUB_USERNAME');
const webhookUrl = PropertiesService.getScriptProperties().getProperty('SLACK_WEBHOOK_URL');

function mainGithub() {
  const body = formatGitHubEvents(token, username);
  postSlack(body);
}

function formatGitHubEvents(token, username) {
  const options : GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
     'method' : 'get',
     "headers" : { 'Authorization': 'token ' + token }
  };
  const requestUrl = 'https://api.github.com/users/' + username + '/events';
  const response = UrlFetchApp.fetch(requestUrl, options);

  const events = JSON.parse(response.getContentText());

  const today = new Date();
  today.setHours(0);
  today.setMinutes(0);
  today.setSeconds(0);

  const set = [];

  let content = '';
  for (let i = 0; i < events.length; i++) {
    const event = events[i];

    const createdAt = new Date(event['created_at']);

    if (createdAt.getTime() < today.getTime()) {
      break;
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
  return content;
}

function postSlack(body) {
  const payload = JSON.stringify({'text' : body});

  const options : GoogleAppsScript.URL_Fetch.URLFetchRequestOptions =
      {
        'method' : 'post',
        'contentType' : 'application/json',
        'payload' : payload
      };

  UrlFetchApp.fetch(webhookUrl, options);
}

