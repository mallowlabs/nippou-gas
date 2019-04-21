var calendarIds = PropertiesService.getScriptProperties().getProperty('CALENDAR_IDS').split(',');
var webhookUrl = PropertiesService.getScriptProperties().getProperty('SLACK_WEBHOOK_URL');

function mainGcal() {
  if (isHoliday()) {
    return;
  }
  postEventsToSlack(0);
  postEventsToSlack(1);
}

function postEventsToSlack(offset) {
  var events = getEventsInToday(calendarIds, offset);
  var body = formatAllEvents(events);
  postSlack(body);
}

function formatAllEvents(events) {
  var body = '';
  for (var i = 0; i < events.length; i++) {
    body += formatEvent(events[i]) + "\n";
  }
  if (body === '') {
    body = '予定はありません';
  }
  return body;
}

function postSlack(body) {
  var payload = JSON.stringify({'text' : body});

  var options : GoogleAppsScript.URL_Fetch.URLFetchRequestOptions =
      {
        'method' : 'post',
        'contentType' : 'application/json',
        'payload' : payload
      };

  UrlFetchApp.fetch(webhookUrl, options);
}

function formatEvent(event) {
  var from = Utilities.formatDate(event.getStartTime(), 'Asia/Tokyo', 'HH:mm');
  var to   = Utilities.formatDate(event.getEndTime(), 'Asia/Tokyo', 'HH:mm');
  return '* ' + from + '-' + to + ' ' + event.getTitle();
}

function getEventsInToday(calendarIds, offset) {
  var from = new Date();
  from.setDate(from.getDate() + offset);
  from.setHours(0);
  from.setMinutes(0);
  from.setSeconds(0);

  var to = new Date();
  to.setDate(to.getDate() + offset);
  to.setHours(23);
  to.setMinutes(59);
  to.setSeconds(59);

  var allEvents = [];

  for (var i = 0; i < calendarIds.length; i++) {
    var calendar = CalendarApp.getCalendarById(calendarIds[i]);
    var events = calendar.getEvents(from, to);
    allEvents = allEvents.concat(events);
  }

  allEvents.sort(function(a, b) {
    return a.getStartTime().getTime() - b.getStartTime().getTime();
  });

  return allEvents;
}

function isHoliday() {
  var today = new Date();

  var weekInt = today.getDay();
  if (weekInt <= 0 || 6 <= weekInt) {
    return true;
  }

  var calendarId = "ja.japanese#holiday@group.v.calendar.google.com";
  var calendar = CalendarApp.getCalendarById(calendarId);
  var todayEvents = calendar.getEventsForDay(today);
  return (todayEvents.length > 0);
}
