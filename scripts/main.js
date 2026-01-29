// ============================================
// ASTRONOMY CALENDAR JAVASCRIPT
// ============================================

// ============================================
// HOW TO KEEP EVENTS UPDATED
// ============================================
// 
// This calendar includes major space events like Artemis II, SpaceX launches, etc.
// To add new events as they're announced:
//
// 1. Add a new event object to the astronomyEvents array below
// 2. For space launches and live events, include:
//    - youtubeUrl: The YouTube channel where it will be streamed
//    - liveStream: true if it's a live event, false if it's recorded content
//
// Example of adding a new launch:
// {
//   date: '2026-XX-XX',
//   title: 'New Space Mission',
//   type: 'launch',  // Options: 'eclipse', 'meteor', 'supermoon', 'launch'
//   description: 'Description of the mission',
//   duration: 'Launch window',
//   youtubeUrl: 'https://www.youtube.com/nasa',
//   liveStream: true
// }
//
// When clicked, events with youtubeUrl will open the YouTube channel directly
// Events without youtubeUrl will show the calendar export modal
// ============================================

// Astronomy Events Data for 2026
const astronomyEvents = [
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
    date: '2026-04-01',
    title: 'Artemis II Launch',
    type: 'launch',
    description: 'NASA\'s Artemis II mission will send astronauts around the Moon for the first time since 1972. First crewed mission of the Artemis program.',
    duration: 'Launch window',
    youtubeUrl: 'https://www.youtube.com/nasa',
    liveStream: true
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
    date: '2026-07-15',
    title: 'SpaceX Starship Mission',
    type: 'launch',
    description: 'SpaceX Starship orbital test flight. Watch the most powerful rocket ever built attempt to reach orbit.',
    duration: 'Launch window',
    youtubeUrl: 'https://www.youtube.com/@SpaceX',
    liveStream: true
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
    date: '2026-10-15',
    title: 'Europa Clipper Flyby',
    type: 'launch',
    description: 'NASA\'s Europa Clipper spacecraft performs its first close flyby of Jupiter\'s moon Europa, searching for signs of habitability.',
    duration: 'Mission milestone',
    youtubeUrl: 'https://www.youtube.com/nasa',
    liveStream: false
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

// Calendar State
let currentDate = new Date(2026, 0, 1); // Start at January 2026
let selectedEvent = null;

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
  const dateStr = date.toISOString().split('T')[0];
  return astronomyEvents.filter(event => event.date === dateStr);
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
  events.forEach(event => {
    const eventIndicator = document.createElement('div');
    eventIndicator.className = `event-indicator ${event.type}`;
    eventIndicator.innerHTML = `<i class="fas fa-star"></i> ${event.title.substring(0, 15)}...`;
    eventIndicator.onclick = (e) => {
      e.stopPropagation();
      // If event has YouTube link, open it directly
      if (event.youtubeUrl) {
        window.open(event.youtubeUrl, '_blank');
      } else {
        showEventDetails(event);
      }
    };
    dayDiv.appendChild(eventIndicator);
  });

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
  generateCalendar();
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

  const sortedEvents = [...astronomyEvents].sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );

  sortedEvents.forEach(event => {
    const eventCard = document.createElement('div');
    eventCard.className = `event-card ${event.type}`;
    
    const eventDate = new Date(event.date);
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

    eventCard.innerHTML = `
      <div class="event-date">${dateStr}</div>
      <div class="event-title">${event.title}</div>
      <div class="event-description">${event.description}</div>
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
function showEventDetails(event) {
  selectedEvent = event;
  const modal = document.getElementById('exportModal');
  if (modal) {
    modal.classList.add('active');
  }
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

  const startDate = new Date(event.date);
  const endDate = new Date(startDate);
  endDate.setHours(endDate.getHours() + 1);

  const formatDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  if (type === 'google') {
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${formatDate(startDate)}/${formatDate(endDate)}&details=${encodeURIComponent(event.description)}&location=Sky`;
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
LOCATION:Sky
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
  // Check if we're on a page with the calendar
  const calendarGrid = document.getElementById('calendarGrid');
  if (calendarGrid) {
    updateMonth();
    generateEventsList();
    initializeEventListeners();
    
    console.log('Astronomy Calendar initialized successfully!');
  }
});

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Add a custom event (for future expansion)
 */
function addCustomEvent(event) {
  astronomyEvents.push(event);
  updateMonth();
  generateEventsList();
}

/**
 * Get all events for a specific month
 */
function getEventsForMonth(year, month) {
  return astronomyEvents.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate.getFullYear() === year && eventDate.getMonth() === month;
  });
}

// Export functions for potential use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    astronomyEvents,
    getMoonPhase,
    getEventsForDate,
    addCustomEvent,
    getEventsForMonth
  };
}