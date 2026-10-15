/* Curated locations, with source-backed coordinates. Bortle is fetched separately. */
window.OAJ_KNOWN_ASTRONOMY_SITES = Object.freeze([
  {
    name: 'Keele Observatory',
    latitude: 53.0043,
    longitude: -2.2673,
    type: 'Observatory',
    region: 'Keele University, Staffordshire',
    access: 'Free public sessions: Tuesdays 8–10pm and Saturdays 1–3pm. Check current arrangements before travelling.',
    website: 'https://www.keele.ac.uk/observatory/',
    source: 'https://www.keele.ac.uk/observatory/contactus/'
  },
  {
    name: 'Bannau Brycheiniog (Brecon Beacons) Dark Sky Reserve',
    latitude: 51.8806,
    longitude: -3.4020,
    type: 'Dark sky reserve',
    region: 'Wales, UK',
    access: 'A protected region, not a single observing site. Check land access and choose an authorised viewing spot.',
    website: 'https://bannau.wales/',
    approximateCoordinates: true
  },
  {
    name: 'Exmoor Dark Sky Reserve',
    latitude: 51.2365,
    longitude: -3.8332,
    type: 'Dark sky reserve',
    region: 'England, UK',
    access: 'A designated region, not a single observing site. Check land access and choose an authorised viewing spot.',
    website: 'https://www.exmoor-nationalpark.gov.uk/',
    approximateCoordinates: true
  },
  {
    name: 'Galloway Forest Park',
    latitude: 54.8333,
    longitude: -4.5000,
    type: 'Dark sky park',
    region: 'Scotland, UK',
    access: 'Check current parking, access and opening arrangements before travelling.',
    website: 'https://forestryandland.gov.scot/',
    approximateCoordinates: true
  }
]);
