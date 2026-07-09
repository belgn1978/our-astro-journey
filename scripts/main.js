// ============================================
// ASTRONOMY CALENDAR JAVASCRIPT WITH AUTO-UPDATE
// ============================================

// ============================================
// AUTO-UPDATE FEATURE ✨
// ============================================
// 
// This calendar now AUTOMATICALLY fetches real space launch data!
// 
// Data Sources:
// - Launch Library 2 API (TheSpaceDevs) - Completely FREE, no API key needed
// - Tracks ALL space agencies: SpaceX, NASA, Blue Origin, Rocket Lab, ESA, JAXA, etc.
// - Updates every time the page loads with the latest launch schedule
//
// The calendar shows:
// 1. STATIC celestial events (eclipses, meteor showers) - manually defined
// 2. DYNAMIC space launches - automatically fetched from API
//
// No maintenance required! The launch schedule updates itself! 🚀
// ============================================

// API Configuration
const LAUNCH_API_URL = 'https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=100&mode=detailed';
const YOUTUBE_CHANNELS = {
  'SpaceX': 'https://www.youtube.com/@SpaceX',
  'NASA': 'https://www.youtube.com/nasa',
  'Blue Origin': 'https://www.youtube.com/@blueorigin',
  'Rocket Lab': 'https://www.youtube.com/@RocketLab',
  'ULA': 'https://www.youtube.com/@ulalaunch',
  'ESA': 'https://www.youtube.com/user/ESA',
  'JAXA': 'https://www.youtube.com/user/jaxachannel',
  'Roscosmos': 'https://www.youtube.com/@tvroscosmos',
  'ISRO': 'https://www.youtube.com/@isroofficial',
  'Arianespace': 'https://www.youtube.com/@Arianespace'
};

// Static Celestial Events (these don't change, so we define them manually)
const celestialEvents = [
  {
    date: '2026-02-17',
    title: 'Total Lunar Eclipse',
    type: 'eclipse',
    description: 'Total lunar eclipse visible from North America, South America, Europe, and Africa. Maximum eclipse at 12:13 UTC.',
    duration: '3h 36m'
  },
  {
    date: '2026-03-20',
    title: 'Spring Equinox',
    type: 'supermoon',
    description: 'First day of spring in the Northern Hemisphere. Day and night are nearly equal in length.',
    duration: 'All day'
  },
  {
    date: '2026-04-08',
    title: 'Lyrids Meteor Shower Peak',
    type: 'meteor',
    description: 'The Lyrids produce about 20 meteors per hour at their peak. Best viewed from a dark location after midnight.',
    duration: 'Night'
  },
  {
    date: '2026-05-07',
    title: 'Eta Aquariids Peak',
    type: 'meteor',
    description: 'Produced by dust particles from Comet Halley. Best viewing in the pre-dawn hours from the Southern Hemisphere.',
    duration: 'Pre-dawn'
  },
  {
    date: '2026-06-21',
    title: 'Summer Solstice',
    type: 'supermoon',
    description: 'Longest day of the year in the Northern Hemisphere. The sun reaches its highest point in the sky.',
    duration: 'All day'
  },
  {
    date: '2026-07-28',
    title: 'Delta Aquariids Peak',
    type: 'meteor',
    description: 'A medium shower producing about 20 meteors per hour at its peak. Best viewing in the Southern Hemisphere.',
    duration: 'Night'
  },
  {
    date: '2026-08-12',
    title: 'Total Solar Eclipse',
    type: 'eclipse',
    description: 'Total solar eclipse visible from Greenland, Iceland, and Spain. Partial eclipse visible from much of Europe and North America.',
    duration: '2m 18s totality'
  },
  {
    date: '2026-08-12',
    title: 'Perseids Meteor Shower Peak',
    type: 'meteor',
    description: 'One of the best meteor showers producing up to 60 meteors per hour. Look for the radiant in the constellation Perseus.',
    duration: 'Night'
  },
  {
    date: '2026-09-22',
    title: 'Autumn Equinox',
    type: 'supermoon',
    description: 'First day of fall in the Northern Hemisphere. Day and night are nearly equal in length.',
    duration: 'All day'
  },
  {
    date: '2026-10-21',
    title: 'Orionids Meteor Shower Peak',
    type: 'meteor',
    description: 'Produced by dust grains from Comet Halley. The Orionids produce 20 meteors per hour at their peak.',
    duration: 'Night'
  },
  {
    date: '2026-11-17',
    title: 'Leonids Meteor Shower Peak',
    type: 'meteor',
    description: 'Famous for producing meteor storms. In typical years produces 15 meteors per hour.',
    duration: 'Night'
  },
  {
    date: '2026-12-14',
    title: 'Geminids Meteor Shower Peak',
    type: 'meteor',
    description: 'The king of meteor showers! Can produce up to 120 multicolored meteors per hour at its peak.',
    duration: 'Night'
  },
  {
    date: '2026-12-21',
    title: 'Winter Solstice',
    type: 'supermoon',
    description: 'Shortest day of the year in the Northern Hemisphere. The sun reaches its lowest point in the sky.',
    duration: 'All day'
  }
];

// Combined events array (celestial + launches)
let astronomyEvents = [...celestialEvents];

// Calendar State
let currentDate = new Date();
let selectedEvent = null;
let launchesLoaded = false;
let mobileCalendarExpanded = false;
let scrollPosition = 0;

// ============================================
// API FETCHING - AUTO-UPDATE LAUNCHES
// ============================================

/**
 * Fetch upcoming space launches from Launch Library API
 */
async function fetchSpaceLaunches() {
  try {
    console.log('🚀 Fetching space launches from API...');
    const response = await fetch(LAUNCH_API_URL);
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`✅ Fetched ${data.results.length} upcoming launches`);
    
    // Convert API data to our event format
    const launchEvents = data.results
      .filter(launch => {
        // Only include launches with dates
        return launch.net && new Date(launch.net) > new Date();
      })
      .map(launch => {
        const launchDate = new Date(launch.net);
        const agency = launch.launch_service_provider?.name || 'Unknown';
        
        // Determine YouTube channel based on agency
        let youtubeUrl = null;
        for (const [key, url] of Object.entries(YOUTUBE_CHANNELS)) {
          if (agency.includes(key)) {
            youtubeUrl = url;
            break;
          }
        }
        
        // If no specific match, try to find a video URL in the API data
        if (!youtubeUrl && launch.vidURLs && launch.vidURLs.length > 0) {
          const firstVideoUrl = launch.vidURLs[0]?.url;
          if (firstVideoUrl && firstVideoUrl.includes('youtube')) {
            // Extract channel from video URL if possible
            youtubeUrl = firstVideoUrl;
          }
        }
        
        return {
          date: toYMDLocal(launchDate),
          title: launch.name || 'Space Launch',
          type: 'launch',
          description: `${agency} - ${launch.mission?.description || 'Launch mission'}`,
          duration: 'Launch window',
          youtubeUrl: youtubeUrl,
          liveStream: true,
          agency: agency,
          location: launch.pad?.location?.name || 'TBD'
        };
      })
      .slice(0, 50); // Limit to 50 launches to keep calendar manageable
    
    // Combine celestial events with launch events
    astronomyEvents = [...celestialEvents, ...launchEvents];
    
    // Sort by date string (YYYY-MM-DD) to avoid timezone parse issues
    astronomyEvents.sort((a, b) => a.date.localeCompare(b.date));
    
    launchesLoaded = true;
    console.log(`📅 Calendar now has ${astronomyEvents.length} total events`);
    
    // Refresh the calendar display
    updateMonth();
    generateEventsList();
    
  } catch (error) {
    console.error('❌ Error fetching space launches:', error);
    console.log('📅 Using static celestial events only');
    // If API fails, we still have our celestial events
    astronomyEvents = [...celestialEvents];
  }
}

// ============================================
// MOON PHASE CALCULATION
// ============================================

/**
 * Calculate moon phase for a given date
 * Returns emoji representing the current moon phase
 */
function getMoonPhase(date) {
  const knownNewMoon = new Date(2026, 0, 7); // Known new moon date
  const daysSinceNew = Math.floor((date - knownNewMoon) / (1000 * 60 * 60 * 24));
  const phase = (daysSinceNew % 29.53) / 29.53;
  
  if (phase < 0.03 || phase > 0.97) return '🌑'; // New Moon
  if (phase < 0.22) return '🌒'; // Waxing Crescent
  if (phase < 0.28) return '🌓'; // First Quarter
  if (phase < 0.47) return '🌔'; // Waxing Gibbous
  if (phase < 0.53) return '🌕'; // Full Moon
  if (phase < 0.72) return '🌖'; // Waning Gibbous
  if (phase < 0.78) return '🌗'; // Last Quarter
  return '🌘'; // Waning Crescent
}

// ============================================
// EVENT MANAGEMENT
// ============================================

/**
 * Get all events for a specific date
 */
function getEventsForDate(date) {
  // Compare using local dates (YYYY-MM-DD) to avoid timezone shifts
  const dateStr = toYMDLocal(date);
  return astronomyEvents.filter(event => event.date === dateStr);
}

// Format a Date as local YYYY-MM-DD
function toYMDLocal(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Parse a YYYY-MM-DD string to a local Date object
function parseYMD(ymd) {
  const parts = String(ymd).split('-').map(Number);
  if (parts.length < 3) return new Date(ymd);
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

function isMobileCalendarView() {
  return window.matchMedia('(max-width: 600px)').matches;
}

function scrollToSection(hash) {
  const target = document.querySelector(hash);
  if (!target) return false;

  const offset = 88;
  const top = target.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: 'smooth' });

  try {
    history.replaceState(null, '', hash);
  } catch (err) {
    console.warn('Hash update failed:', err);
  }

  return true;
}

function renderMobileUpcomingView() {
  const container = document.getElementById('mobileUpcomingList');
  if (!container) return;

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const visibleDays = mobileCalendarExpanded ? daysInMonth : Math.min(7, daysInMonth);

  const dayCards = [];
  for (let day = 1; day <= visibleDays; day++) {
    const dayDate = new Date(year, month, day);
    const dateStr = toYMDLocal(dayDate);
    const eventsForDay = astronomyEvents.filter((event) => event.date === dateStr);
    const labels = eventsForDay.slice(0, 2).map((event) => {
      const icon = event.type === 'eclipse' ? '🌙' : event.type === 'meteor' ? '☄️' : event.type === 'launch' ? '🚀' : '⭐';
      return `<span class="mobile-upcoming-event">${icon} ${event.title}</span>`;
    }).join('');
    const moreCount = eventsForDay.length > 2 ? `<span class="mobile-upcoming-more">+${eventsForDay.length - 2} more</span>` : '';
    const dayLabel = dayDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    dayCards.push(`
      <div class="mobile-upcoming-day">
        <div class="mobile-upcoming-date">${dayLabel}</div>
        <div class="mobile-upcoming-events">
          ${eventsForDay.length > 0 ? labels + moreCount : '<span class="mobile-upcoming-event">No events</span>'}
        </div>
      </div>
    `);
  }

  const toggleLabel = daysInMonth > 7 ? (mobileCalendarExpanded ? 'Show less' : 'View more') : '';
  const toggleMarkup = daysInMonth > 7 ? `<button class="mobile-upcoming-toggle" type="button">${toggleLabel}</button>` : '';

  container.innerHTML = `
    <div class="mobile-upcoming-header">
      <div>
        <div class="mobile-upcoming-title">Upcoming days</div>
        <div class="mobile-upcoming-subtitle">${monthNames[month]} ${year}</div>
      </div>
      ${toggleMarkup}
    </div>
    <div class="mobile-upcoming-days">
      ${dayCards.join('')}
    </div>
  `;

  const toggleButton = container.querySelector('.mobile-upcoming-toggle');
  if (toggleButton) {
    toggleButton.addEventListener('click', () => {
      mobileCalendarExpanded = !mobileCalendarExpanded;
      renderMobileUpcomingView();
    });
  }
}

function renderCalendarView() {
  if (isMobileCalendarView()) {
    renderMobileUpcomingView();
    return;
  }

  generateCalendar();
}

// ============================================
// CALENDAR GENERATION
// ============================================

/**
 * Generate the calendar grid for the current month
 */
function generateCalendar() {
  const grid = document.getElementById('calendarGrid');
  if (!grid) return;
  
  grid.innerHTML = '';

  // Add day headers
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  days.forEach(day => {
    const header = document.createElement('div');
    header.className = 'day-header';
    header.textContent = day;
    grid.appendChild(header);
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const prevLastDate = new Date(year, month, 0).getDate();

  const today = new Date();

  // Previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    const dayDiv = createDayElement(
      new Date(year, month - 1, prevLastDate - i),
      true
    );
    grid.appendChild(dayDiv);
  }

  // Current month days
  for (let date = 1; date <= lastDate; date++) {
    const dayDiv = createDayElement(
      new Date(year, month, date),
      false,
      today.getDate() === date && today.getMonth() === month && today.getFullYear() === year
    );
    grid.appendChild(dayDiv);
  }

  // Next month days
  const remainingDays = 42 - (firstDay + lastDate);
  for (let date = 1; date <= remainingDays; date++) {
    const dayDiv = createDayElement(
      new Date(year, month + 1, date),
      true
    );
    grid.appendChild(dayDiv);
  }
}

/**
 * Create a single day element for the calendar
 */
function createDayElement(date, otherMonth, isToday = false) {
  const dayDiv = document.createElement('div');
  dayDiv.className = 'calendar-day';
  if (otherMonth) dayDiv.classList.add('other-month');
  if (isToday) dayDiv.classList.add('today');

  const dayNumber = document.createElement('div');
  dayNumber.className = 'day-number';
  dayNumber.textContent = date.getDate();
  dayDiv.appendChild(dayNumber);

  const moonPhase = document.createElement('div');
  moonPhase.className = 'moon-phase';
  moonPhase.textContent = getMoonPhase(date);
  dayDiv.appendChild(moonPhase);

  const events = getEventsForDate(date);
  if (events.length > 0) {
    dayDiv.addEventListener('click', () => showEventDetails(date));
  }

  // Create an event list wrapper that shows up to 3 items to avoid resizing
  if (events.length > 0) {
    const eventList = document.createElement('div');
    eventList.className = 'event-list';

    events.forEach((event, idx) => {
      const eventIndicator = document.createElement('div');
      eventIndicator.className = `event-indicator ${event.type}`;
      const displayTitle = event.agency ?
        `${event.agency}: ${event.title.substring(0, 24)}` :
        `${event.title.substring(0, 28)}`;
      // choose icon based on event type
      let iconClass = 'fa-star';
      if (event.type === 'eclipse') iconClass = 'fa-moon';
      else if (event.type === 'meteor') iconClass = 'fa-meteor';
      else if (event.type === 'launch') iconClass = 'fa-rocket';
      eventIndicator.innerHTML = `<i class="fas ${iconClass}"></i> ${displayTitle}`;
      eventIndicator.addEventListener('click', (e) => {
        e.stopPropagation();
        showEventDetails(date);
      });

      // Add up to 3 visible items into the compact list
      if (idx < 3) {
        eventList.appendChild(eventIndicator);
      }
    });

    // If there are more than 3 events, add a "+N more" indicator that opens details
    if (events.length > 3) {
      const moreCount = document.createElement('div');
      moreCount.className = 'more-indicator';
      moreCount.textContent = `+${events.length - 3} more`;
      moreCount.addEventListener('click', (e) => {
        e.stopPropagation();
        showEventDetails(date);
      });
      eventList.appendChild(moreCount);
    }

    dayDiv.appendChild(eventList);
  }

  return dayDiv;
}

/**
 * Update the current month display
 */
function updateMonth() {
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const monthDisplay = document.getElementById('currentMonth');
  if (monthDisplay) {
    monthDisplay.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  }
  renderCalendarView();
}

// ============================================
// EVENTS LIST GENERATION
// ============================================

/**
 * Generate the events list view
 */
function generateEventsList() {
  const eventsList = document.getElementById('eventsList');
  if (!eventsList) return;
  
  eventsList.innerHTML = '';

  const sortedEvents = [...astronomyEvents].sort((a, b) => a.date.localeCompare(b.date));

  sortedEvents.forEach(event => {
    const eventCard = document.createElement('div');
    eventCard.className = `event-card ${event.type}`;
    
    const eventDate = parseYMD(event.date);
    const dateStr = eventDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    // Create button based on event type
    let buttonHTML = '';
    if (event.youtubeUrl) {
      const buttonIcon = event.liveStream ? 'fa-video' : 'fa-youtube';
      const buttonText = event.liveStream ? 'Watch Live' : 'View on YouTube';
      buttonHTML = `
        <button class="export-btn watch-btn" data-url="${event.youtubeUrl}">
          <i class="fab ${buttonIcon}"></i> ${buttonText}
        </button>
      `;
    } else {
      buttonHTML = `
        <button class="export-btn">
          <i class="fas fa-calendar-plus"></i> Add to Calendar
        </button>
      `;
    }

    // Add location for launch events
    const locationHTML = event.location ? `<div class="event-location"><i class="fas fa-map-marker-alt"></i> ${event.location}</div>` : '';

    eventCard.innerHTML = `
      <div class="event-date">${dateStr}</div>
      <div class="event-title">${event.title}</div>
      <div class="event-description">${event.description}</div>
      ${locationHTML}
      ${buttonHTML}
    `;
    
    // Add event listener to button
    const btn = eventCard.querySelector('.export-btn, .watch-btn');
    if (event.youtubeUrl) {
      btn.addEventListener('click', () => {
        window.open(event.youtubeUrl, '_blank');
      });
    } else {
      btn.addEventListener('click', () => showEventDetails(event));
    }
    
    eventsList.appendChild(eventCard);
  });
}

// ============================================
// MODAL MANAGEMENT
// ============================================

/**
 * Show event details in modal
 */
function showEventDetails(target) {
  let eventDate = null;
  if (target instanceof Date) eventDate = target;
  else if (typeof target === 'string') eventDate = parseYMD(target);
  else if (target && target.date) eventDate = parseYMD(target.date);
  else return;
  const events = getEventsForDate(eventDate);
  if (!events.length) return;

  selectedEvent = events[0];
  const modal = document.getElementById('exportModal');
  const body = document.getElementById('eventDetailsBody');
  const title = document.getElementById('modalTitle');
  if (!modal || !body || !title) return;

  const dateStr = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  title.textContent = `Events on ${dateStr}`;
  body.innerHTML = events.map(event => {
    const detailsButton = event.youtubeUrl ?
      `<button class="details-btn watch-btn" data-url="${event.youtubeUrl}"><i class="fas fa-video"></i> Watch Live</button>` :
      '';

    const locationHTML = event.location ? `<div class="event-location"><i class="fas fa-map-marker-alt"></i> ${event.location}</div>` : '';

    return `
      <div class="event-details-card ${event.type}">
        <div class="event-details-header">
          <div>
            <div class="event-title">${event.title}</div>
            <div class="event-date">${event.date}</div>
          </div>
          ${detailsButton}
        </div>
        <div class="event-description">${event.description}</div>
        ${locationHTML}
      </div>
    `;
  }).join('');

  modal.classList.add('active');

  body.querySelectorAll('.details-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      window.open(btn.dataset.url, '_blank');
    });
  });
}

/**
 * Close the modal
 */
function closeModal() {
  const modal = document.getElementById('exportModal');
  if (modal) {
    modal.classList.remove('active');
  }
  selectedEvent = null;
}

// ============================================
// CALENDAR EXPORT FUNCTIONALITY
// ============================================

/**
 * Export event to various calendar formats
 */
function exportToCalendar(type, event) {
  if (!event) return;

  const startDate = parseYMD(event.date);
  const endDate = new Date(startDate);
  endDate.setHours(endDate.getHours() + 1);

  const formatDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  if (type === 'google') {
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${formatDate(startDate)}/${formatDate(endDate)}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location || 'Sky')}`;
    window.open(url, '_blank');
  } else if (type === 'ical' || type === 'apple' || type === 'outlook') {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Astronomy Calendar//EN
BEGIN:VEVENT
UID:${event.date}-${event.title.replace(/\s+/g, '-')}@astronomycalendar.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location || 'Sky'}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title.replace(/\s+/g, '-')}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  closeModal();
}

// ============================================
// EVENT LISTENERS
// ============================================

/**
 * Initialize all event listeners when DOM is ready
 */
function initializeEventListeners() {
  // Previous month button
  const prevBtn = document.getElementById('prevMonth');
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      currentDate.setMonth(currentDate.getMonth() - 1);
      updateMonth();
    });
  }

  // Next month button
  const nextBtn = document.getElementById('nextMonth');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentDate.setMonth(currentDate.getMonth() + 1);
      updateMonth();
    });
  }

  // View toggle buttons
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const view = btn.dataset.view;
      const monthView = document.getElementById('monthView');
      const eventsView = document.getElementById('eventsView');
      
      if (monthView && eventsView) {
        if (view === 'month') {
          monthView.style.display = 'block';
          eventsView.style.display = 'none';
        } else {
          monthView.style.display = 'none';
          eventsView.style.display = 'block';
        }
      }
    });
  });

  // Close modal button
  const closeBtn = document.getElementById('closeModal');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  // Export options
  document.querySelectorAll('.export-option').forEach(option => {
    option.addEventListener('click', () => {
      exportToCalendar(option.dataset.export, selectedEvent);
    });
  });

  // Close modal when clicking outside
  const modal = document.getElementById('exportModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target.id === 'exportModal') {
        closeModal();
      }
    });
  }
}

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize the calendar when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize the mobile navigation on every page where it exists.
  initializeMobileMenu();
  window.addEventListener('resize', () => {
    renderCalendarView();
  });

  // Check if we're on a page with the calendar
  const calendarGrid = document.getElementById('calendarGrid');
  if (calendarGrid) {
    // Show initial calendar with celestial events
    updateMonth();
    generateEventsList();
    initializeEventListeners();
    
    // Fetch space launches in the background
    fetchSpaceLaunches();
    
    console.log('✨ Astronomy Calendar initialized successfully!');
    console.log('🚀 Fetching latest space launch data...');
  }
  initializeDropdownToggle();
  
  // Initialize weather and dark sky features
  initializeWeatherWidget();
  
  // Setup image download watermarks
  setupImageDownloadWatermarks();
  
  // Protect images from right-click context menu
  protectImages();
  
  // Enable nav debug when requested via URL (?debug=nav) or localStorage flag
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('debug') === 'nav' || localStorage.getItem('debugNav') === '1') {
      initializeNavDebugging();
      console.log('🐞 Nav debug: enabled');
    }
  } catch (err) {}
});

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Manually refresh launch data (can be called from console)
 */
function refreshLaunches() {
  console.log('🔄 Manually refreshing space launches...');
  fetchSpaceLaunches();
}

function setBodyScrollLock(lock) {
  if (lock) {
    scrollPosition = window.scrollY || window.pageYOffset || 0;
    document.documentElement.classList.add('nav-open');
    document.body.classList.add('nav-open');
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.documentElement.style.paddingRight = `${scrollbarWidth}px`;
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  } else {
    document.documentElement.classList.remove('nav-open');
    document.body.classList.remove('nav-open');
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    document.documentElement.style.paddingRight = '';
    document.body.style.paddingRight = '';
  }
}

function initializeMobileMenu() {
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenuClose = document.getElementById('mobile-menu-close');
  const nav = document.getElementById('mobile-navigation-main');
  const backdrop = document.getElementById('mobile-nav-backdrop');

  if (!mobileMenuButton || !mobileMenuClose || !nav || !backdrop) {
    console.error('❌ Mobile menu elements not found');
    return;
  }

  const isSmallScreen = () => window.matchMedia('(max-width: 600px)').matches;

  const closeMenu = () => {
    nav.classList.remove('open');
    backdrop.classList.remove('active');
    setBodyScrollLock(false);
    mobileMenuButton.setAttribute('aria-expanded', 'false');
    nav.setAttribute('aria-hidden', 'true');
    backdrop.setAttribute('aria-hidden', 'true');
  };

  const openMenu = () => {
    if (!isSmallScreen()) return;
    nav.classList.add('open');
    backdrop.classList.add('active');
    setBodyScrollLock(true);
    mobileMenuButton.setAttribute('aria-expanded', 'true');
    nav.setAttribute('aria-hidden', 'false');
    backdrop.setAttribute('aria-hidden', 'false');
  };

  mobileMenuButton.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (nav.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  mobileMenuClose.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    closeMenu();
  });

  backdrop.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    closeMenu();
  });

  document.addEventListener('click', (event) => {
    if (!nav.classList.contains('open')) return;
    if (nav.contains(event.target) || mobileMenuButton.contains(event.target)) return;
    closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('open')) {
      closeMenu();
    }
  });

  window.addEventListener('resize', () => {
    if (!isSmallScreen()) {
      closeMenu();
    }
  });

  const bindAnchorNavigation = (container) => {
    container.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (event) => {
        const href = link.getAttribute('href');
        if (!href || !href.startsWith('#')) return;

        link.classList.add('nav-link-active');
        setTimeout(() => link.classList.remove('nav-link-active'), 300);

        closeMenu();

        if (window.innerWidth <= 600) {
          requestAnimationFrame(() => {
            const target = document.querySelector(href);
            if (target) {
              target.scrollIntoView({ behavior: 'smooth', block: 'start' });
              target.setAttribute('tabindex', '-1');
              target.focus({ preventScroll: true });
            } else {
              try { location.hash = href; } catch (e) {}
            }
          });
        }
      });
    });
  };

  bindAnchorNavigation(nav);
  bindAnchorNavigation(document.getElementById('navigation-main'));

}

function initializeDropdownToggle() {
  const dropdownToggle = document.getElementById('projects-toggle');
  const projectsSubmenu = document.getElementById('projects-submenu');
  const dropdown = dropdownToggle?.closest('.dropdown');

  if (!dropdownToggle || !projectsSubmenu || !dropdown) return;

  const updateDropdownState = (isOpen) => {
    dropdown.classList.toggle('open', isOpen);
    dropdownToggle.setAttribute('aria-expanded', String(isOpen));
    projectsSubmenu.setAttribute('aria-hidden', String(!isOpen));
  };

  const toggleDropdown = () => {
    const isOpen = dropdownToggle.getAttribute('aria-expanded') === 'true';
    updateDropdownState(!isOpen);
  };

  dropdownToggle.addEventListener('click', (event) => {
    event.preventDefault();
    toggleDropdown();
  });

  dropdownToggle.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleDropdown();
    }
  });


/**
 * Debugging and monitoring helper for mobile navigation issues.
 * Activates when URL contains ?debug=nav or localStorage.debugNav === '1'.
 */
function initializeNavDebugging() {
  const createPanel = () => {
    const panel = document.createElement('div');
    panel.className = 'debug-log-panel';
    panel.innerHTML = '<h4>Nav Debug</h4>';
    document.body.appendChild(panel);
    return panel;
  };

  const panel = createPanel();

  const log = (msg) => {
    console.log(msg);
    const entry = document.createElement('div');
    entry.className = 'debug-log-entry';
    entry.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
    panel.appendChild(entry);
    panel.scrollTop = panel.scrollHeight;
  };

  // Highlight and log clicks/touches and detect top-most overlay elements
  document.addEventListener('click', (e) => {
    const x = e.clientX, y = e.clientY;
    const el = document.elementFromPoint(x, y);
    log(`click -> target: ${el ? el.tagName + (el.id ? '#'+el.id : '') + (el.className ? ' .' + el.className.split(' ').join('.') : '') : 'none'}`);
    if (el) {
      el.classList.add('debug-outline');
      setTimeout(() => el.classList.remove('debug-outline'), 1200);
    }
    // Also log the element at the same point using z-index heuristics
    const candidates = Array.from(document.querySelectorAll('body *')).filter(n => n.nodeType === 1);
    const overlays = candidates.filter(n => {
      const s = window.getComputedStyle(n);
      return (s.position === 'fixed' || s.position === 'absolute') && Number((s.zIndex || 0)) >= 100;
    });
    if (overlays.length) {
      log(`potential overlays (z>=100): ${overlays.slice(0,5).map(o => o.tagName + (o.id?('#'+o.id):'') + (o.className?('.'+o.className.split(' ').join('.')):'' )).join(', ')}`);
    }
  }, { capture: true });

  // Monitor state changes to modal, mobile nav, and backdrop
  const observeTargets = ['exportModal', 'mobile-navigation-main', 'mobile-nav-backdrop'];
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(m => {
      const t = m.target;
      if (t && observeTargets.includes(t.id)) {
        log(`mutation: ${t.id} changed -> class='${t.className}' aria-hidden='${t.getAttribute('aria-hidden')}'`);
      }
    });
  });

  observeTargets.forEach(id => {
    const node = document.getElementById(id);
    if (node) observer.observe(node, { attributes: true, attributeFilter: ['class', 'aria-hidden', 'style'] });
  });

  // Periodically log whether modal or backdrop are visible
  const poll = setInterval(() => {
    const modal = document.getElementById('exportModal');
    const nav = document.getElementById('mobile-navigation-main');
    const backdrop = document.getElementById('mobile-nav-backdrop');
    const modalActive = modal && modal.classList.contains('active');
    const navOpen = nav && nav.classList.contains('open');
    const backdropActive = backdrop && backdrop.classList.contains('active');
    log(`state: modalActive=${modalActive} navOpen=${navOpen} backdropActive=${backdropActive} body.nav-open=${document.body.classList.contains('nav-open')}`);
  }, 3500);

  // Make debug togglable with localStorage key
  const toggleBtn = document.createElement('button');
  toggleBtn.textContent = 'Stop Debug';
  toggleBtn.style.display = 'block';
  toggleBtn.style.marginTop = '8px';
  toggleBtn.addEventListener('click', () => {
    clearInterval(poll);
    observer.disconnect();
    panel.remove();
    localStorage.removeItem('debugNav');
    log('Nav debug stopped');
  });
  panel.appendChild(toggleBtn);
}
  document.addEventListener('click', (event) => {
    if (!dropdown.contains(event.target)) {
      updateDropdownState(false);
    }
  });
}

/**
 * Add watermark to image when it's being downloaded
 * Creates a watermarked version and triggers the download
 */
function createWatermarkedImage(imgElement) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      
      const ctx = canvas.getContext('2d');
      
      // Draw the original image
      ctx.drawImage(img, 0, 0);
      
      // Add semi-transparent overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add watermark text
      ctx.font = `bold ${Math.max(24, canvas.width / 12)}px Arial`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.globalAlpha = 0.6;
      
      // Rotate and add watermark
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(-Math.PI / 4);
      ctx.fillText('Our Astro Journey', 0, 0);
      ctx.restore();
      
      resolve(canvas);
    };
    
    img.src = imgElement.src || imgElement.currentSrc;
  });
}

/**
 * Intercept image link clicks to add watermark before download
 */
function setupImageDownloadWatermarks() {
  const imageLinks = document.querySelectorAll('.img-link');
  
  imageLinks.forEach(link => {
    link.addEventListener('click', async (e) => {
      e.preventDefault();
      
      const img = link.querySelector('img');
      if (!img) return;
      
      // Create watermarked version
      const watermarkedCanvas = await createWatermarkedImage(img);
      
      // Get filename from link href
      const href = link.getAttribute('href');
      const filename = href.split('/').pop() || 'image.jpg';
      
      // Convert canvas to blob and download
      watermarkedCanvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 'image/jpeg', 0.95);
    });
  });
}

/**
 * Prevent context menu on images (right-click)
 */
function protectImages() {
  const images = document.querySelectorAll('img.image');
  images.forEach(img => {
    img.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      return false;
    });
  });
}

const DARK_SKY_SITES = [
  { name: 'Brecon Beacons Dark Sky Reserve', lat: 51.8806, lon: -3.4020, region: 'Wales, UK' },
  { name: 'Exmoor Dark Sky Reserve', lat: 51.2365, lon: -3.8332, region: 'England, UK' },
  { name: 'Galloway Forest Park', lat: 54.8333, lon: -4.5000, region: 'Scotland, UK' },
  { name: 'Kerry International Dark Sky Reserve', lat: 52.0466, lon: -9.5314, region: 'Ireland' },
  { name: 'Northumberland National Park', lat: 55.2179, lon: -2.2230, region: 'England, UK' },
  { name: 'Aoraki Mackenzie Dark Sky Reserve', lat: -44.0070, lon: 170.1170, region: 'New Zealand' },
  { name: 'Cherry Springs State Park', lat: 41.6634, lon: -77.8168, region: 'Pennsylvania, USA' },
  { name: 'Mauna Kea Summit', lat: 19.8207, lon: -155.4681, region: 'Hawaii, USA' },
  { name: 'NamibRand Nature Reserve', lat: -24.7700, lon: 15.9650, region: 'Namibia' },
  { name: 'Pic du Midi Observatory', lat: 42.9361, lon: 0.1430, region: 'France' }
];

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2))
    * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getWeatherDescription(weatherCode) {
  const codes = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Freezing drizzle',
    57: 'Freezing drizzle',
    61: 'Light rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Freezing rain',
    67: 'Freezing rain',
    71: 'Light snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Rain showers',
    81: 'Moderate showers',
    82: 'Violent showers',
    85: 'Snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with hail',
    99: 'Thunderstorm with heavy hail'
  };
  return codes[weatherCode] || 'Unknown conditions';
}

function calculateFeelsLike(temperature, windspeed) {
  if (typeof temperature !== 'number' || typeof windspeed !== 'number') return '—';
  if (temperature >= 10 || windspeed < 4.8) {
    return `${Math.round(temperature)}°C`;
  }

  const windChill = 13.12 + 0.6215 * temperature - 11.37 * Math.pow(windspeed, 0.16) + 0.3965 * temperature * Math.pow(windspeed, 0.16);
  return `${Math.round(windChill)}°C`;
}

function formatLocationName(place) {
  if (!place) return 'Local area';
  if (place.name && place.country) {
    return `${place.name}, ${place.country}`;
  }
  return place.name || place.admin1 || place.country || 'Local area';
}

function setWeatherStatus(message, isError = false) {
  const statusEl = document.getElementById('weather-status');
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.style.color = isError ? '#ffb3b3' : 'rgba(255, 255, 255, 0.85)';
}

function setDarkSkyStatus(message, isError = false) {
  const statusEl = document.getElementById('darksky-status');
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.style.color = isError ? '#ffb3b3' : 'rgba(255, 255, 255, 0.85)';
}

function toggleWeatherCard(visible) {
  const card = document.getElementById('weather-card');
  if (!card) return;
  card.classList.toggle('hidden', !visible);
  card.setAttribute('aria-hidden', String(!visible));
}

function buildDarkSkyList(latitude, longitude) {
  const list = document.getElementById('darksky-list');
  if (!list) return;

  const nearbySites = DARK_SKY_SITES
    .map(site => ({
      ...site,
      distance: calculateDistanceKm(latitude, longitude, site.lat, site.lon)
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5);

  list.innerHTML = '';
  if (!nearbySites.length) {
    list.innerHTML = '<p class="darksky-empty">No nearby dark sky sites could be found.</p>';
    return;
  }

  nearbySites.forEach(site => {
    const item = document.createElement('div');
    item.className = 'darksky-site';
    item.innerHTML = `
      <strong>${site.name}</strong>
      <span>${site.region}</span>
      <span>${site.distance.toFixed(1)} km away</span>
      <a href="https://www.google.com/maps/search/${encodeURIComponent(site.name + ', ' + site.region)}" target="_blank" rel="noopener noreferrer">View on map</a>
    `;
    list.appendChild(item);
  });
}

async function fetchWeatherData(latitude, longitude, label) {
  setWeatherStatus('Getting weather data…');
  toggleWeatherCard(false);

  try {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=relativehumidity_2m&timezone=auto`;
    const response = await fetch(weatherUrl);
    if (!response.ok) {
      throw new Error('Weather service unavailable');
    }
    const data = await response.json();
    const current = data.current_weather;
    const humidityIndex = data.hourly?.time?.indexOf(current?.time);
    const humidity = humidityIndex >= 0 ? data.hourly.relativehumidity_2m[humidityIndex] : null;

    if (!current) {
      throw new Error('Current weather unavailable');
    }

    const locationName = label || `Lat ${latitude.toFixed(2)}, Lon ${longitude.toFixed(2)}`;
    document.getElementById('weather-temp').textContent = `${Math.round(current.temperature)}°C`;
    document.getElementById('weather-desc').textContent = getWeatherDescription(current.weathercode);
    document.getElementById('weather-location-name').textContent = locationName;
    document.getElementById('weather-feels').textContent = calculateFeelsLike(current.temperature, current.windspeed);
    document.getElementById('weather-wind').textContent = `${Math.round(current.windspeed)} km/h`;
    document.getElementById('weather-humidity').textContent = humidity !== null ? `${Math.round(humidity)}%` : '—';
    setWeatherStatus(`Weather for ${locationName}`);
    toggleWeatherCard(true);
    buildDarkSkyList(latitude, longitude);
  } catch (error) {
    setWeatherStatus('Unable to load weather data. Try again later.', true);
    toggleWeatherCard(false);
    const list = document.getElementById('darksky-list');
    if (list) {
      list.innerHTML = '<p class="darksky-empty">Nearby dark sky sites are unavailable right now.</p>';
    }
    console.error(error);
  }
}

async function geocodePlace(query) {
  const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`;
  const response = await fetch(geocodeUrl);
  if (!response.ok) {
    throw new Error('Geocoding failed');
  }
  const data = await response.json();
  return data.results && data.results.length ? data.results[0] : null;
}

async function reverseGeocodeCoordinates(latitude, longitude) {
  const reverseUrl = `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&count=1&language=en&format=json`;
  const response = await fetch(reverseUrl);
  if (!response.ok) {
    throw new Error('Reverse geocoding failed');
  }
  const data = await response.json();
  return data.results && data.results.length ? data.results[0] : null;
}

async function handleWeatherSearch() {
  const input = document.getElementById('weather-location-input');
  if (!input) return;
  const query = input.value.trim();
  if (!query) {
    setWeatherStatus('Please enter a town, city, or postcode.', true);
    return;
  }

  setWeatherStatus('Looking up location…');
  const place = await geocodePlace(query);
  if (!place) {
    setWeatherStatus('Location not found. Try a different town, city, or postcode.', true);
    return;
  }

  await fetchWeatherData(place.latitude, place.longitude, formatLocationName(place));
}

async function handleDarkSkySearch() {
  const input = document.getElementById('darksky-location-input');
  if (!input) return;
  const query = input.value.trim();
  if (!query) {
    setDarkSkyStatus('Please enter a town, city, or postcode.', true);
    return;
  }

  setDarkSkyStatus('Looking up location…');
  const place = await geocodePlace(query);
  if (!place) {
    setDarkSkyStatus('Location not found. Try a different town, city, or postcode.', true);
    return;
  }

  await fetchWeatherData(place.latitude, place.longitude, formatLocationName(place));
  setDarkSkyStatus(`Showing dark sky sites near ${formatLocationName(place)}`);
}

async function requestWeatherLocation() {
  if (!navigator.geolocation) {
    setWeatherStatus('Geolocation is not available in this browser.', true);
    return;
  }

  setWeatherStatus('Requesting your location…');
  navigator.geolocation.getCurrentPosition(async (position) => {
    try {
      const geoPlace = await reverseGeocodeCoordinates(position.coords.latitude, position.coords.longitude);
      const label = formatLocationName(geoPlace);
      await fetchWeatherData(position.coords.latitude, position.coords.longitude, label);
    } catch (error) {
      setWeatherStatus('Unable to determine your location. Try the manual search.', true);
      console.error(error);
    }
  }, (error) => {
    console.error(error);
    setWeatherStatus('Location permission denied or unavailable. Use the manual search instead.', true);
  }, {
    enableHighAccuracy: false,
    timeout: 15000,
    maximumAge: 300000
  });
}

function initializeWeatherWidget() {
  const searchBtn = document.getElementById('weather-search-btn');
  const locationBtn = document.getElementById('weather-location-btn');
  const searchInput = document.getElementById('weather-location-input');
  const darkSkySearchBtn = document.getElementById('darksky-search-btn');
  const darkSkyInput = document.getElementById('darksky-location-input');

  if (searchBtn) {
    searchBtn.addEventListener('click', handleWeatherSearch);
  }

  if (locationBtn) {
    locationBtn.addEventListener('click', requestWeatherLocation);
  }

  if (searchInput) {
    searchInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleWeatherSearch();
      }
    });
  }

  if (darkSkySearchBtn) {
    darkSkySearchBtn.addEventListener('click', handleDarkSkySearch);
  }

  if (darkSkyInput) {
    darkSkyInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleDarkSkySearch();
      }
    });
  }
}

/**
 * Get all events for a specific month
 */
function getEventsForMonth(year, month) {
  return astronomyEvents.filter(event => {
    const eventDate = parseYMD(event.date);
    return eventDate.getFullYear() === year && eventDate.getMonth() === month;
  });
}

// Export functions for potential use in other scripts or console
if (typeof window !== 'undefined') {
  window.refreshLaunches = refreshLaunches;
  window.astronomyEvents = astronomyEvents;
  window.setupImageDownloadWatermarks = setupImageDownloadWatermarks;
}