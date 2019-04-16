// https://github.com/settings/tokens
var token = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
var username = PropertiesService.getScriptProperties().getProperty('GITHUB_USERNAME');
var webhookUrl = PropertiesService.getScriptProperties().getProperty('SLACK_WEBHOOK_URL');

function mainGithub() {
  var body = formatGitHubEvents(token, username);
  postSlack(body);
}

function formatGitHubEvents(token, username) {
  var options = {
     'method' : 'get',
     "headers" : { 'Authorization': 'token ' + token }
  };
  var requestUrl = 'https://api.github.com/users/' + username + '/events';
  var response = UrlFetchApp.fetch(requestUrl, options);
  
  var events = JSON.parse(response.getContentText());
  
  var today = new Date();
  today.setHours(0);
  today.setMinutes(0);
  today.setSeconds(0);
  
  var set = [];
  
  var content = '';
  for (var i = 0; i < events.length; i++) {
    var event = events[i];
    
    var createdAt = new Date(event['created_at']);
  
    if (createdAt.getTime() < today.getTime()) {
      break;
    }

    var pullRequest = event['payload']['pull_request'];
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
  var payload = JSON.stringify({'text' : body});
  
  var options =
      {
        'method' : 'post',
        'contentType' : 'application/json',
        'payload' : payload
      };
  
  UrlFetchApp.fetch(webhookUrl, options);
}

