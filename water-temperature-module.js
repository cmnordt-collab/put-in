// ============================================================================
// Water Temperature Fetcher Module
// Fetches real-time temps from USGS (inland) and NOAA (coastal/sounds)
// ============================================================================

/**
 * Converts Celsius to Fahrenheit and rounds to 1 decimal place
 * @param {number} celsius
 * @returns {number} Fahrenheit rounded to 1 decimal
 */
const celsiusToFahrenheit = (celsius) => {
  return Math.round((celsius * 1.8 + 32) * 10) / 10;
};

/**
 * Fetches water temperature from USGS endpoint by Site Number
 * @param {string} siteNumber - USGS Site Number (e.g., '02096500')
 * @returns {Promise<string>} Temperature string or fallback message
 */
const fetchUSGSTemperature = async (siteNumber) => {
  try {
    const url = new URL('https://waterservices.usgs.gov/nwis/iv/');
    url.searchParams.append('sites', siteNumber);
    url.searchParams.append('parameterCd', '00010'); // Water Temperature
    url.searchParams.append('format', 'json');

    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn(`USGS fetch failed for ${siteNumber}: ${response.status}`);
      return 'Temp Unavailable';
    }

    const data = await response.json();

    // Navigate safely through USGS JSON structure
    const values = data?.value?.timeSeries?.[0]?.values?.[0]?.value;
    
    if (!values || values.length === 0) {
      return 'Temp Unavailable';
    }

    // Get the most recent value
    const latestReading = values[values.length - 1];
    const celsius = parseFloat(latestReading?.value);

    if (isNaN(celsius)) {
      return 'Temp Unavailable';
    }

    const fahrenheit = celsiusToFahrenheit(celsius);
    return `${fahrenheit}°F`;

  } catch (error) {
    console.error(`USGS fetch error for ${siteNumber}:`, error);
    return 'Temp Unavailable';
  }
};

/**
 * Fetches water temperature from NOAA endpoint by Station ID
 * @param {string} stationId - NOAA Station ID (e.g., '8656483')
 * @returns {Promise<string>} Temperature string or fallback message
 */
const fetchNOAATemperature = async (stationId) => {
  try {
    const url = new URL('https://api.tidesandcurrents.noaa.gov/api/prod/datagetter/');
    url.searchParams.append('station', stationId);
    url.searchParams.append('product', 'water_temperature');
    url.searchParams.append('datum', 'mllw');
    url.searchParams.append('units', 'english');
    url.searchParams.append('time_zone', 'lst_ldt');
    url.searchParams.append('format', 'json');
    url.searchParams.append('application', 'Put-In');

    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`NOAA fetch failed for ${stationId}: ${response.status}`);
      return 'Temp Unavailable';
    }

    const data = await response.json();

    // Handle NOAA error responses
    if (data?.error) {
      console.warn(`NOAA API error for ${stationId}:`, data.error);
      return 'Temp Unavailable';
    }

    // Navigate safely through NOAA payload array
    const payload = data?.data;
    
    if (!Array.isArray(payload) || payload.length === 0) {
      return 'Temp Unavailable';
    }

    // Get the most recent payload object
    const latestReading = payload[payload.length - 1];
    const fahrenheit = parseFloat(latestReading?.t);

    if (isNaN(fahrenheit)) {
      return 'Temp Unavailable';
    }

    return `${fahrenheit}°F`;

  } catch (error) {
    console.error(`NOAA fetch error for ${stationId}:`, error);
    return 'Temp Unavailable';
  }
};

/**
 * Unified fetcher that determines source and delegates
 * @param {string} siteId - Site/Station ID
 * @param {string} source - 'usgs' or 'noaa'
 * @returns {Promise<string>} Temperature string or fallback
 */
const fetchWaterTemperature = async (siteId, source = 'usgs') => {
  if (source === 'usgs') {
    return fetchUSGSTemperature(siteId);
  } else if (source === 'noaa') {
    return fetchNOAATemperature(siteId);
  }
  return 'Invalid Source';
};

// ============================================================================
// DOM MANIPULATION EXAMPLE
// ============================================================================

/**
 * Updates a DOM element with fetched water temperature
 * @param {string} elementId - Target element ID
 * @param {string} siteId - USGS Site Number or NOAA Station ID
 * @param {string} source - 'usgs' or 'noaa'
 */
const updateTemperatureDisplay = async (elementId, siteId, source = 'usgs') => {
  const element = document.getElementById(elementId);
  
  if (!element) {
    console.warn(`Element with ID "${elementId}" not found`);
    return;
  }

  // Show loading state
  element.textContent = 'Loading...';

  // Fetch and display temperature
  const temperature = await fetchWaterTemperature(siteId, source);
  element.textContent = temperature;
};

/**
 * Batch update multiple locations
 * Useful for initializing a page with multiple sensors
 */
const updateAllTemperatures = async (locationMap) => {
  /**
   * locationMap structure:
   * {
   *   'element-id-1': { siteId: '02096500', source: 'usgs' },
   *   'element-id-2': { siteId: '8656483', source: 'noaa' }
   * }
   */
  const promises = Object.entries(locationMap).map(
    ([elementId, { siteId, source }]) =>
      updateTemperatureDisplay(elementId, siteId, source)
  );

  await Promise.all(promises);
};

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*
// Single fetch (standalone)
(async () => {
  const tempUSGS = await fetchWaterTemperature('02096500', 'usgs');
  console.log('Haw River temp:', tempUSGS);

  const tempNOAA = await fetchWaterTemperature('8656483', 'noaa');
  console.log('Pamlico Sound temp:', tempNOAA);
})();

// Update single DOM element
document.addEventListener('DOMContentLoaded', () => {
  updateTemperatureDisplay('water-temp-haw-river', '02096500', 'usgs');
});

// Update multiple locations on page load
document.addEventListener('DOMContentLoaded', () => {
  updateAllTemperatures({
    'temp-haw-river': { siteId: '02096500', source: 'usgs' },
    'temp-cape-fear': { siteId: '02105769', source: 'usgs' },
    'temp-pamlico-sound': { siteId: '8656483', source: 'noaa' },
    'temp-neuse-estuary': { siteId: '8655242', source: 'noaa' }
  });
});

// Refresh temps every 30 minutes
setInterval(() => {
  updateAllTemperatures({
    'temp-haw-river': { siteId: '02096500', source: 'usgs' },
    'temp-pamlico-sound': { siteId: '8656483', source: 'noaa' }
  });
}, 30 * 60 * 1000);
*/

// Export for module usage (if using ES6 modules)
export {
  celsiusToFahrenheit,
  fetchUSGSTemperature,
  fetchNOAATemperature,
  fetchWaterTemperature,
  updateTemperatureDisplay,
  updateAllTemperatures
};
