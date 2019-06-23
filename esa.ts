import { webhookUrl } from './_slack'

const esaTeams = PropertiesService.getScriptProperties().getProperty('ESA_TEAMS').split(',');
const esaToken = PropertiesService.getScriptProperties().getProperty('ESA_TOKEN');
const esaUser = PropertiesService.getScriptProperties().getProperty('ESA_USER');

function mainEsa(): void {
    const today = new Date();
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);

    let contents = '';
    for(let team of esaTeams) {
        const posts = fetchEsa_(team);
        for(let post of posts) {
            if (new Date(post.created_at) < today) {
                break;
            }
            contents += `* :esa: [${post.name}](${post.url})\n`;
        }
    }
    if (contents === '') {
        contents = ':esa: 作成した記事はありません。'
    }
    postSlack_(contents);
}

function fetchEsa_(team: string): any[] {
    const options : GoogleAppsScript.URL_Fetch.URLFetchRequestOptions =
    {
        'method' : 'get',
        'contentType' : 'application/json',
        'headers' : { 'Authorization': `Bearer ${esaToken}` }
    };
    const response = UrlFetchApp.fetch(`https://api.esa.io/v1/teams/${team}/posts?sort=created&q=user%3A${esaUser}`, options);
    return JSON.parse(response.getContentText()).posts;
}

function postSlack_(body: string): void {
    const payload = JSON.stringify({'text' : body});

    const options : GoogleAppsScript.URL_Fetch.URLFetchRequestOptions =
    {
        'method' : 'post',
        'contentType' : 'application/json',
        'payload' : payload
    };

    UrlFetchApp.fetch(webhookUrl(), options);
}
