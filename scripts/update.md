# Updated Astronomy Calendar - News Section Integration

## 🎯 What's Changed

The astronomy calendar is now **integrated into the News section** instead of being a separate section. Major space events like **Artemis II**, **SpaceX launches**, and other significant missions are included with **direct links to YouTube channels** for live viewing!

## ✨ New Features

### 1. **Space Launch Events** 🚀
- Artemis II Moon mission (April 2026)
- SpaceX Starship launches
- NASA Europa Clipper milestones
- All with direct YouTube channel links

### 2. **Smart Event Actions**
- **Space Launches**: Click to open YouTube channel (NASA, SpaceX, etc.)
- **Celestial Events**: Click to export to your personal calendar
- Events are color-coded by type

### 3. **Live Stream Indicators**
- Events marked as "Watch Live" have live coverage
- Events marked as "View on YouTube" have recorded content

## 📁 File Structure (Same as Before)

```
your-project/
├── index.html          (✨ UPDATED - Calendar now in News section)
├── styles/
│   ├── reset.css      (unchanged)
│   └── styles.css     (✨ UPDATED - Added launch event styles)
└── scripts/
    └── main.js        (✨ UPDATED - Added space events + YouTube links)
```

## 🎨 Event Types & Colors

| Event Type | Color | Action | Examples |
|------------|-------|--------|----------|
| 🔴 **Launch** | Red | Opens YouTube | Artemis II, SpaceX Starship |
| 🟣 **Eclipse** | Purple | Export to Calendar | Solar/Lunar Eclipses |
| 🟡 **Meteor Shower** | Yellow/Gold | Export to Calendar | Perseids, Geminids |
| 🟤 **Supermoon** | Beige | Export to Calendar | Full Moons, Equinoxes |

## 🔄 How to Keep Events Updated

The calendar is designed to be **easily updated** with new space events as they're announced!

### Adding a New Space Launch

Open `scripts/main.js` and add a new event to the `astronomyEvents` array:

```javascript
{
  date: '2026-XX-XX',           // YYYY-MM-DD format
  title: 'Mission Name',
  type: 'launch',               // This makes it red and clickable
  description: 'Mission details and what to expect',
  duration: 'Launch window',
  youtubeUrl: 'https://www.youtube.com/nasa',  // YouTube channel URL
  liveStream: true              // true = "Watch Live", false = "View on YouTube"
}
```

### YouTube Channel URLs

Common channels for space events:
- **NASA**: `https://www.youtube.com/nasa`
- **SpaceX**: `https://www.youtube.com/@SpaceX`
- **ESA**: `https://www.youtube.com/user/ESA`
- **Blue Origin**: `https://www.youtube.com/@blueorigin`
- **ULA**: `https://www.youtube.com/@ulalaunch`

### Adding Celestial Events

For eclipses, meteor showers, etc. (events without YouTube links):

```javascript
{
  date: '2026-XX-XX',
  title: 'Event Name',
  type: 'eclipse',      // or 'meteor' or 'supermoon'
  description: 'Event description',
  duration: '3h 30m'
  // No youtubeUrl - will show calendar export option
}
```

## 🚀 Current Space Events Included

### 2026 Space Launches & Missions

1. **April 1, 2026** - Artemis II Launch
   - First crewed mission to the Moon since 1972
   - Watch on NASA's YouTube channel

2. **July 15, 2026** - SpaceX Starship Mission
   - Orbital test flight of Starship
   - Watch on SpaceX's YouTube channel

3. **October 15, 2026** - Europa Clipper Flyby
   - First close flyby of Jupiter's moon Europa
   - Coverage on NASA's YouTube channel

## 💡 Usage Tips

### For Visitors:
1. **Navigate to News section** - Scroll down or click "News" in navigation
2. **Browse the calendar** - See moon phases and upcoming events
3. **Click space launch events** - Opens YouTube channel in new tab
4. **Click celestial events** - Export to Google Calendar, Outlook, or Apple Calendar

### For You (Website Owner):
1. **Check space news sites** regularly:
   - NASA.gov
   - SpaceX.com
   - Space.com
   - NASASpaceflight.com

2. **Add new events** as they're announced (usually 3-6 months in advance)

3. **Update launch dates** if they slip (space launches often get delayed)

4. **Test links** before big events to make sure they work

## 🎨 Customization

### Change Launch Event Color
In `styles/styles.css`, find:
```css
:root {
  --color-launch: #ff4757;  /* Change this to your preferred color */
}
```

### Add More Event Types
1. Add new color variable to CSS
2. Add new legend item in HTML
3. Add new type in JavaScript events
4. Add corresponding CSS styles

Example - Adding "Conjunction" events:
```css
/* In styles.css */
:root {
  --color-conjunction: #00d2d3;
}

.event-indicator.conjunction {
  background: rgba(0, 210, 211, 0.3);
  border-left: 3px solid var(--color-conjunction);
}

.event-card.conjunction {
  border-left-color: var(--color-conjunction);
}

.legend-color.conjunction {
  background: var(--color-conjunction);
}
```

## 📱 Mobile Experience

The calendar is fully responsive:
- **Desktop**: Full calendar grid with all features
- **Tablet**: Stacked controls, compact view
- **Mobile**: Simplified layout, easy touch targets
- **All devices**: Smooth animations and transitions

## 🔗 External Resources for Event Updates

Stay updated on space events:
- **NASA Events Calendar**: https://www.nasa.gov/nasalive/
- **SpaceX Launch Schedule**: https://www.spacex.com/launches/
- **Rocket Launch Live**: https://www.rocketlaunch.live/
- **Space Launch Schedule**: https://spacelaunchschedule.com/

## 🐛 Troubleshooting

### YouTube Link Not Opening?
- Check if pop-up blocker is enabled
- Verify the URL is correct in the JavaScript
- Make sure the YouTube channel is public

### Event Not Showing?
- Check date format is YYYY-MM-DD
- Verify the event is within the calendar date range
- Check browser console for errors (F12)

### Wrong Button Showing?
- Events WITH `youtubeUrl` show "Watch Live" button
- Events WITHOUT `youtubeUrl` show "Add to Calendar" button
- Check if `youtubeUrl` property exists in your event object

## 📊 Event Statistics

Current calendar includes:
- **16 total events**
- **3 space launches/missions** (with YouTube links)
- **2 eclipses**
- **6 meteor showers**
- **5 seasonal/astronomical events**

## 🎯 Future Enhancements

Ideas for expansion:
1. **RSS feed integration** - Auto-fetch NASA/SpaceX launch schedules
2. **Countdown timers** - Show time until next launch
3. **Weather integration** - Check viewing conditions for celestial events
4. **ISS tracking** - When it passes overhead
5. **Notification system** - Browser notifications for upcoming events

## ✅ Checklist for Updates

When adding a new event:
- [ ] Date is correct (YYYY-MM-DD)
- [ ] Title is clear and concise
- [ ] Type matches one of: launch, eclipse, meteor, supermoon
- [ ] Description is informative
- [ ] YouTube URL is tested (if applicable)
- [ ] liveStream flag is set correctly (if applicable)
- [ ] Event appears in correct month
- [ ] Click action works (opens YouTube or shows export modal)

## 🎓 Learning Resources

If you want to learn more about upcoming space events:
- **NASA YouTube**: Live launches, press conferences, mission updates
- **Everyday Astronaut**: In-depth launch coverage and explanations
- **Scott Manley**: Space mission analysis
- **NASA Jet Propulsion Laboratory**: Deep space mission updates

---

Remember: Space is constantly evolving with new missions announced regularly. Check back frequently to keep your calendar current with the latest launches and celestial events! 🌟