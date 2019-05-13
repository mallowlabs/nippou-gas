const calendarIds = PropertiesService.getScriptProperties().getProperty('CALENDAR_IDS').split(',');
const webhookUrl = PropertiesService.getScriptProperties().getProperty('SLACK_WEBHOOK_URL');

function mainGcal() {
  if (isHoliday_(new Date())) {
    return;
  }
  postEventsToSlack_(0);
  postEventsToSlack_(getNextWeekday_());
}

function postEventsToSlack_(offset) {
  const events = getEventsInToday_(calendarIds, offset);
  const body = formatAllEvents_(events);
  postSlack_(body);
}

function formatAllEvents_(events) {
  let body = '';
  for (let i = 0; i < events.length; i++) {
    body += formatEvent_(events[i]) + "\n";
  }
  if (body === '') {
    body = '予定はありません';
  }
  return body;
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

function formatEvent_(event) {
  const from = Utilities.formatDate(event.getStartTime(), 'Asia/Tokyo', 'HH:mm');
  const to   = Utilities.formatDate(event.getEndTime(), 'Asia/Tokyo', 'HH:mm');
  return '* ' + from + '-' + to + ' ' + event.getTitle();
}

function getEventsInToday_(calendarIds, offset) {
  const from = new Date();
  from.setDate(from.getDate() + offset);
  from.setHours(0);
  from.setMinutes(0);
  from.setSeconds(0);

  const to = new Date();
  to.setDate(to.getDate() + offset);
  to.setHours(23);
  to.setMinutes(59);
  to.setSeconds(59);

  let allEvents = [];

  for (let i = 0; i < calendarIds.length; i++) {
    const calendar = CalendarApp.getCalendarById(calendarIds[i]);
    const events = calendar.getEvents(from, to);
    allEvents = allEvents.concat(events);
  }

  allEvents.sort(function(a, b) {
    return a.getStartTime().getTime() - b.getStartTime().getTime();
  });

  return allEvents;
}

function isHoliday_(day: Date): Boolean {
  const weekInt = day.getDay();
  if (weekInt <= 0 || 6 <= weekInt) {
    return true;
  }

  const calendarId = "ja.japanese#holiday@group.v.calendar.google.com";
  const calendar = CalendarApp.getCalendarById(calendarId);
  const todayEvents = calendar.getEventsForDay(day);
  return (todayEvents.length > 0);
}

function getNextWeekday_(): Number {
  for (let i = 1; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    if (!isHoliday_(d)) {
      return i;
    }
  }
  return 30;
}
