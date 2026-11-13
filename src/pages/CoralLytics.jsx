import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import csvUrl from '../../global_bleaching_environmental.csv?url';
import coralMapUrl from './coral-map.png';
import './CoralLytics.css';

const MAP_WIDTH = 960;
const MAP_HEIGHT = 480;
const MIN_LATITUDE = -60;
const MAX_LATITUDE = 80;
const NO_DATA = 'nd';
const DEFAULT_MAP_VIEW = { x: 60, y: 60, width: 840, height: 420 };
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const SEASONS = ['DJF', 'MAM', 'JJA', 'SON'];
const seasonForMonth = (month) => (
  month === 12 || month <= 2 ? 'DJF'
    : month <= 5 ? 'MAM'
      : month <= 8 ? 'JJA' : 'SON'
);
const COLUMNS = [
  'Sample_ID', 'Site_ID', 'Site_Name', 'Country_Name', 'Ocean_Name',
  'Realm_Name', 'Ecoregion_Name', 'Substrate_Name', 'Latitude_Degrees',
  'Longitude_Degrees', 'Date', 'Date_Year', 'Date_Month', 'Bleaching_Level',
  'Percent_Bleaching', 'Temperature_Kelvin', 'Temperature_Mean',
  'Temperature_Minimum', 'Temperature_Maximum', 'SSTA', 'SSTA_DHW',
  'Exposure', 'Turbidity', 'Depth_m', 'Site_Comments', 'Sample_Comments',
  'Bleaching_Comments',
];

function parseCsvRow(line) {
  const fields = [];
  let value = '';
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === ',' && !quoted) {
      fields.push(value);
      value = '';
    } else {
      value += character;
    }
  }
  fields.push(value);
  return fields;
}

function parseNumber(value) {
  if (!value || value === NO_DATA) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function parseSurveys(text) {
  const lines = text.split(/\r?\n/);
  const header = parseCsvRow(lines[0]);
  const indices = Object.fromEntries(COLUMNS.map((column) => [column, header.indexOf(column)]));
  const surveys = [];

  for (let lineIndex = 1; lineIndex < lines.length; lineIndex += 1) {
    if (!lines[lineIndex]) continue;
    const values = parseCsvRow(lines[lineIndex]);
    const field = (name) => values[indices[name]] ?? '';
    const latitude = parseNumber(field('Latitude_Degrees'));
    const longitude = parseNumber(field('Longitude_Degrees'));
    const year = parseNumber(field('Date_Year'));
    const month = parseNumber(field('Date_Month'));
    if (latitude === null || longitude === null || year === null || month === null || month < 1 || month > 12) continue;

    surveys.push({
      id: `${field('Sample_ID')}-${lineIndex}`,
      sampleId: field('Sample_ID'),
      siteId: field('Site_ID'),
      site: field('Site_Name'),
      country: field('Country_Name'),
      ocean: field('Ocean_Name'),
      realm: field('Realm_Name'),
      ecoregion: field('Ecoregion_Name'),
      substrate: field('Substrate_Name'),
      latitude,
      longitude,
      date: field('Date'),
      year,
      month,
      dateTime: Date.UTC(year, month - 1, 15),
      period: `${year}-${String(month).padStart(2, '0')}`,
      level: field('Bleaching_Level'),
      percent: parseNumber(field('Percent_Bleaching')),
      temperature: parseNumber(field('Temperature_Kelvin')),
      meanTemperature: parseNumber(field('Temperature_Mean')),
      minimumTemperature: parseNumber(field('Temperature_Minimum')),
      maximumTemperature: parseNumber(field('Temperature_Maximum')),
      ssta: parseNumber(field('SSTA')),
      dhw: parseNumber(field('SSTA_DHW')),
      exposure: field('Exposure'),
      turbidity: parseNumber(field('Turbidity')),
      depth: parseNumber(field('Depth_m')),
      comments: field('Bleaching_Comments') || field('Sample_Comments') || field('Site_Comments'),
    });
  }
  return surveys;
}

function coordinates(longitude, latitude) {
  return {
    x: ((longitude + 180) / 360) * MAP_WIDTH,
    y: ((MAX_LATITUDE - latitude) / (MAX_LATITUDE - MIN_LATITUDE)) * MAP_HEIGHT,
  };
}

function pointFromPointer(clientX, clientY, svg) {
  const matrix = svg.getScreenCTM();
  if (!matrix) return null;
  const point = svg.createSVGPoint();
  point.x = clientX;
  point.y = clientY;
  const mapPoint = point.matrixTransform(matrix.inverse());
  return {
    x: mapPoint.x,
    y: mapPoint.y,
  };
}

function pointerFromMapPoint(point, svg) {
  const matrix = svg.getScreenCTM();
  if (!matrix) return null;
  const svgPoint = svg.createSVGPoint();
  svgPoint.x = point.x;
  svgPoint.y = point.y;
  const screenPoint = svgPoint.matrixTransform(matrix);
  return { x: screenPoint.x, y: screenPoint.y };
}

function matchesFilters(survey, filters) {
  return (!filters.ocean || survey.ocean === filters.ocean)
    && (!filters.realm || survey.realm === filters.realm)
    && (!filters.ecoregion || survey.ecoregion === filters.ecoregion)
    && (!filters.substrate || survey.substrate === filters.substrate)
    && (filters.minTemperature === '' || survey.meanTemperature !== null
      && survey.meanTemperature - 273.15 >= Number(filters.minTemperature))
    && (filters.maxTemperature === '' || survey.meanTemperature !== null
      && survey.meanTemperature - 273.15 <= Number(filters.maxTemperature))
    && (filters.minDepth === '' || survey.depth !== null && survey.depth >= Number(filters.minDepth))
    && (filters.maxDepth === '' || survey.depth !== null && survey.depth <= Number(filters.maxDepth));
}

function fitMapView(surveys) {
  if (!surveys.length) return DEFAULT_MAP_VIEW;
  const points = surveys.map((survey) => coordinates(survey.longitude, survey.latitude));
  const minX = Math.min(...points.map((point) => point.x));
  const maxX = Math.max(...points.map((point) => point.x));
  const minY = Math.min(...points.map((point) => point.y));
  const maxY = Math.max(...points.map((point) => point.y));
  const width = Math.min(MAP_WIDTH, Math.max(180, (maxX - minX) * 1.25, (maxY - minY) * 2.5));
  const height = width / 2;
  const x = Math.max(0, Math.min(MAP_WIDTH - width, (minX + maxX - width) / 2));
  const y = Math.max(0, Math.min(MAP_HEIGHT - height, (minY + maxY - height) / 2));
  return { x, y, width, height };
}

function severity(survey) {
  if (survey.percent === null) return 'unreported';
  if (survey.percent >= 50) return 'high';
  if (survey.percent >= 20) return 'moderate';
  return 'low';
}

function markerRadius(survey) {
  if (survey.percent === null) return 3.8;
  return 3.5 + Math.sqrt(Math.max(0, survey.percent) / 100) * 7.5;
}

function bleachingColor(percent) {
  if (percent === null) return '#D9DEE2';
  const amount = Math.max(0, Math.min(100, percent)) / 100;
  const start = [217, 75, 75];
  const end = [255, 255, 255];
  const channels = start.map((channel, index) => Math.round(channel + (end[index] - channel) * amount));
  return `rgb(${channels.join(', ')})`;
}

function formatValue(value, digits = 1) {
  return value === null || value === undefined ? 'Not reported' : Number(value).toFixed(digits);
}

function formatPeriod(period) {
  if (!period) return '—';
  const [year, month] = period.split('-').map(Number);
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

function optionsFor(surveys, key) {
  return [...new Set(surveys.map((survey) => survey[key]).filter((value) => value && value !== NO_DATA))]
    .sort((left, right) => left.localeCompare(right));
}

function summarizeYearCounts(surveys) {
  const grouped = new Map();
  for (const survey of surveys) {
    grouped.set(survey.year, (grouped.get(survey.year) ?? 0) + 1);
  }
  return [...grouped].map(([year, count]) => ({ year, count })).sort((left, right) => left.year - right.year);
}

function surveyCorrelation(surveys) {
  const paired = surveys.filter((survey) => survey.percent !== null && survey.dhw !== null);
  if (paired.length < 2) return { value: null, count: paired.length };
  const meanPercent = paired.reduce((total, survey) => total + survey.percent, 0) / paired.length;
  const meanDhw = paired.reduce((total, survey) => total + survey.dhw, 0) / paired.length;
  const covariance = paired.reduce((total, survey) => total + (survey.percent - meanPercent) * (survey.dhw - meanDhw), 0);
  const percentVariance = paired.reduce((total, survey) => total + (survey.percent - meanPercent) ** 2, 0);
  const dhwVariance = paired.reduce((total, survey) => total + (survey.dhw - meanDhw) ** 2, 0);
  const denominator = Math.sqrt(percentVariance * dhwVariance);
  return { value: denominator ? covariance / denominator : null, count: paired.length };
}

function SurveyTimeSeriesChart({ surveys, metric, label, unit, color, maximum, dateStart, dateEnd, selectedSeason, showTrend, onSelectSurvey }) {
  const chartRef = useRef(null);
  const left = 64;
  const right = 944;
  const top = 14;
  const bottom = 116;
  const startTime = Date.parse(`${dateStart}T00:00:00Z`);
  const endTime = Date.parse(`${dateEnd}T23:59:59Z`);
  const timeRange = Math.max(1, endTime - startTime);
  const xForDate = useCallback((time) => left + ((time - startTime) / timeRange) * (right - left), [left, right, startTime, timeRange]);
  const yForValue = useCallback((value) => bottom - (value / maximum) * (bottom - top), [bottom, maximum, top]);
  const chartSurveys = useMemo(() => surveys.filter((survey) => (
    survey[metric] !== null && survey.dateTime >= startTime && survey.dateTime <= endTime
  )), [surveys, metric, startTime, endTime]);
  const seasonPaths = useMemo(() => {
    const paths = Object.fromEntries(SEASONS.map((season) => [season, '']));
    const counts = Object.fromEntries(SEASONS.map((season) => [season, 0]));
    for (const survey of chartSurveys) {
      const season = seasonForMonth(survey.month);
      const x = xForDate(survey.dateTime).toFixed(1);
      const y = yForValue(survey[metric]).toFixed(1);
      paths[season] += `M${x} ${y}m-1.6 0a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0-3.2 0`;
      counts[season] += 1;
    }
    return SEASONS.map((season) => ({ season, path: paths[season], count: counts[season] }));
  }, [chartSurveys, metric, xForDate, yForValue]);
  const trend = useMemo(() => {
    if (!showTrend) return null;
    const points = chartSurveys.filter((survey) => !selectedSeason || seasonForMonth(survey.month) === selectedSeason);
    if (points.length < 2) return null;
    const origin = startTime;
    const meanX = points.reduce((total, survey) => total + survey.dateTime - origin, 0) / points.length;
    const meanY = points.reduce((total, survey) => total + survey[metric], 0) / points.length;
    const covariance = points.reduce((total, survey) => total + ((survey.dateTime - origin - meanX) * (survey[metric] - meanY)), 0);
    const variance = points.reduce((total, survey) => total + ((survey.dateTime - origin - meanX) ** 2), 0);
    if (!variance) return null;
    const slope = covariance / variance;
    const first = meanY + slope * (0 - meanX);
    const last = meanY + slope * (endTime - origin - meanX);
    return `M${left} ${yForValue(first).toFixed(1)}L${right} ${yForValue(last).toFixed(1)}`;
  }, [chartSurveys, endTime, left, metric, right, selectedSeason, showTrend, startTime, yForValue]);
  const ticks = useMemo(() => {
    const span = endTime - startTime;
    const count = span < 1000 * 60 * 60 * 24 * 180 ? 2 : 5;
    return Array.from({ length: count }, (_, index) => {
      const time = startTime + (span * index) / (count - 1);
      const date = new Date(time);
      const labelText = span > 1000 * 60 * 60 * 24 * 365 * 3
        ? String(date.getUTCFullYear())
        : date.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
      return { x: xForDate(time), label: labelText };
    });
  }, [endTime, startTime, xForDate]);
  const handlePointerUp = (event) => {
    const svg = chartRef.current;
    if (!svg) return;
    const point = pointFromPointer(event.clientX, event.clientY, svg);
    if (!point) return;
    let nearest = null;
    let distance = 10;
    for (const survey of chartSurveys) {
      const current = Math.hypot(xForDate(survey.dateTime) - point.x, yForValue(survey[metric]) - point.y);
      if (current < distance) {
        nearest = survey;
        distance = current;
      }
    }
    if (nearest) onSelectSurvey(nearest);
  };
  const axisTicks = metric === 'percent' ? [0, 25, 50, 75, 100] : [0, 0.25, 0.5, 0.75, 1].map((fraction) => maximum * fraction);
  return (
    <section className="coral-series-chart" aria-label={`${label} individual survey time series`}>
      <div className="coral-series-heading"><strong>{label}</strong><span>{unit} · {chartSurveys.length.toLocaleString()} plotted surveys</span></div>
      <svg ref={chartRef} className="coral-trend coral-scatter-chart" viewBox="0 0 960 155" role="img" aria-label={`${chartSurveys.length} individual survey measurements of ${label} over time`} onPointerUp={handlePointerUp}>
        <defs><clipPath id={`clip-${metric}`}><rect x={left} y={top} width={right - left} height={bottom - top} /></clipPath></defs>
        {axisTicks.map((tick) => {
          const y = yForValue(tick);
          return <g key={tick}><line x1={left} x2={right} y1={y} y2={y} className="coral-chart-grid" /><text x={left - 8} y={y + 4} textAnchor="end" className="coral-chart-label">{metric === 'percent' ? tick : tick.toFixed(0)}</text></g>;
        })}
        <g clipPath={`url(#clip-${metric})`}>
          {seasonPaths.map(({ season, path, count }) => path && (
            <path key={season} d={path} fill={color} opacity={selectedSeason ? (selectedSeason === season ? 0.88 : 0.12) : 0.5}>
              <title>{season}: {count.toLocaleString()} observations</title>
            </path>
          ))}
          {trend && <path d={trend} className="coral-scatter-trend" stroke={color} />}
        </g>
        {ticks.map(({ x, label: tickLabel }) => <g key={`${x}-${tickLabel}`}><line x1={x} x2={x} y1={bottom} y2={bottom + 4} className="coral-chart-grid" /><text x={x} y="141" textAnchor="middle" className="coral-chart-label">{tickLabel}</text></g>)}
        <rect x={left} y={top} width={right - left} height={bottom - top} className="coral-chart-hit-area" aria-hidden="true" />
      </svg>
      {chartSurveys.length === 0 && <p className="coral-series-empty">No reported values in this time range.</p>}
    </section>
  );
}

export default function CoralLytics() {
  const [surveys, setSurveys] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('');
  const [showTrend, setShowTrend] = useState(false);
  const [requestedChartStart, setRequestedChartStart] = useState('');
  const [requestedChartEnd, setRequestedChartEnd] = useState('');
  const [mapView, setMapView] = useState(DEFAULT_MAP_VIEW);
  const [filters, setFilters] = useState({
    ocean: '', realm: '', ecoregion: '', substrate: '',
    minTemperature: '', maxTemperature: '', minDepth: '', maxDepth: '',
  });
  const [selectedId, setSelectedId] = useState(null);
  const [lassoIds, setLassoIds] = useState([]);
  const [lasso, setLasso] = useState(null);
  const pointerStart = useRef(null);
  const mapSvgRef = useRef(null);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Coral-lytics';
    return () => { document.title = previousTitle; };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch(csvUrl, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`CSV request failed (${response.status})`);
        return response.text();
      })
      .then((text) => {
        const parsed = parseSurveys(text);
        if (!parsed.length) throw new Error('No valid survey records were found in the CSV.');
        setSurveys(parsed);
        const periodCounts = new Map();
        parsed.forEach(({ period }) => periodCounts.set(period, (periodCounts.get(period) ?? 0) + 1));
        setSelectedPeriod([...periodCounts.entries()].sort((left, right) => right[1] - left[1])[0][0]);
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setLoadError(error.message);
      });
    return () => controller.abort();
  }, []);

  const baseSurveys = useMemo(() => surveys.filter((survey) => matchesFilters(survey, filters)), [surveys, filters]);
  const visibleSurveys = useMemo(() => baseSurveys.filter((survey) => (
    survey.period === selectedPeriod && Math.abs(survey.latitude) <= 60
  )).sort((left, right) => {
    if (left.percent === null) return 1;
    if (right.percent === null) return -1;
    return right.percent - left.percent;
  }), [baseSurveys, selectedPeriod]);
  const yearCounts = useMemo(() => summarizeYearCounts(surveys), [surveys]);
  const periodCounts = useMemo(() => {
    const counts = new Map();
    surveys.forEach(({ period }) => counts.set(period, (counts.get(period) ?? 0) + 1));
    return [...counts.entries()].sort(([left], [right]) => left.localeCompare(right));
  }, [surveys]);
  const periodIndex = Math.max(0, periodCounts.findIndex(([period]) => period === selectedPeriod));
  const selectedYear = selectedPeriod ? Number(selectedPeriod.slice(0, 4)) : null;
  const siteCount = useMemo(() => new Set(baseSurveys.map((survey) => survey.siteId)).size, [baseSurveys]);
  const averageBleaching = useMemo(() => {
    const values = baseSurveys.filter((survey) => survey.percent !== null);
    return values.length ? values.reduce((total, survey) => total + survey.percent, 0) / values.length : null;
  }, [baseSurveys]);
  const averageSsta = useMemo(() => {
    const values = baseSurveys.filter((survey) => survey.ssta !== null);
    return values.length ? values.reduce((total, survey) => total + survey.ssta, 0) / values.length : null;
  }, [baseSurveys]);
  const temperatureBounds = useMemo(() => {
    const values = surveys.map((survey) => survey.meanTemperature).filter((value) => value !== null);
    return values.length ? [Math.min(...values) - 273.15, Math.max(...values) - 273.15] : [0, 40];
  }, [surveys]);
  const depthBounds = useMemo(() => {
    const values = surveys.map((survey) => survey.depth).filter((value) => value !== null);
    return values.length ? [Math.min(...values), Math.max(...values)] : [0, 100];
  }, [surveys]);
  const chartDateBounds = useMemo(() => {
    if (!surveys.length) return { start: '', end: '' };
    const dates = surveys.map((survey) => new Date(survey.dateTime).toISOString().slice(0, 10));
    dates.sort();
    return { start: dates[0], end: dates.at(-1) };
  }, [surveys]);
  const chartStartDate = requestedChartStart || chartDateBounds.start;
  const chartEndDate = requestedChartEnd || chartDateBounds.end;
  const chartWindowSurveys = useMemo(() => {
    if (!chartStartDate || !chartEndDate) return [];
    const start = Date.parse(`${chartStartDate}T00:00:00Z`);
    const end = Date.parse(`${chartEndDate}T23:59:59Z`);
    return baseSurveys.filter((survey) => survey.dateTime >= start && survey.dateTime <= end);
  }, [baseSurveys, chartEndDate, chartStartDate]);
  const correlation = useMemo(() => surveyCorrelation(
    selectedSeason
      ? chartWindowSurveys.filter((survey) => seasonForMonth(survey.month) === selectedSeason)
      : chartWindowSurveys,
  ), [chartWindowSurveys, selectedSeason]);
  const dhwMaximum = useMemo(() => {
    const values = baseSurveys.map((survey) => survey.dhw).filter((value) => value !== null);
    return Math.max(10, Math.ceil(Math.max(...values, 0) / 10) * 10);
  }, [baseSurveys]);
  const selectedSurvey = visibleSurveys.find((survey) => survey.id === selectedId) ?? visibleSurveys[0] ?? null;
  const surveyById = useMemo(() => new Map(visibleSurveys.map((survey) => [survey.id, survey])), [visibleSurveys]);
  const notableYears = [...yearCounts].sort((left, right) => right.count - left.count).slice(0, 4);
  const realms = optionsFor(surveys.filter((survey) => !filters.ocean || survey.ocean === filters.ocean), 'realm');
  const ecoregions = optionsFor(surveys.filter((survey) => (
    (!filters.ocean || survey.ocean === filters.ocean) && (!filters.realm || survey.realm === filters.realm)
  )), 'ecoregion');

  const changePeriod = (period) => {
    setSelectedPeriod(period);
    setLasso(null);
    setLassoIds([]);
  };

  const selectChartSurvey = (survey) => {
    changePeriod(survey.period);
    setSelectedId(survey.id);
  };

  const changeChartStart = (value) => {
    setRequestedChartStart(value);
    if (value > chartEndDate) setRequestedChartEnd(value);
  };

  const changeChartEnd = (value) => {
    setRequestedChartEnd(value);
    if (value < chartStartDate) setRequestedChartStart(value);
  };

  const resetChartZoom = () => {
    setRequestedChartStart('');
    setRequestedChartEnd('');
  };

  const changeYear = (year) => {
    const yearPeriods = periodCounts.filter(([period]) => period.startsWith(`${year}-`));
    const busiestPeriod = yearPeriods.sort((left, right) => right[1] - left[1])[0]?.[0];
    if (busiestPeriod) changePeriod(busiestPeriod);
  };

  const updateFilter = (key, value) => {
    const nextFilters = {
      ...filters,
      [key]: value,
      ...(key === 'ocean' || key === 'realm' ? { ecoregion: '' } : {}),
    };
    setFilters(nextFilters);
    setLassoIds([]);
    if (key === 'realm' || key === 'ecoregion' || key === 'ocean') {
      setLasso(null);
      setMapView(
        nextFilters.realm || nextFilters.ecoregion
          ? fitMapView(surveys.filter((survey) => matchesFilters(survey, nextFilters)))
          : DEFAULT_MAP_VIEW,
      );
    }
  };

  const finishMapGesture = (event) => {
    const start = pointerStart.current;
    if (!start) return;
    pointerStart.current = null;
    const svg = mapSvgRef.current;
    if (!svg) return;
    const point = pointFromPointer(event.clientX, event.clientY, svg);
    if (!point) return;
    if (Math.hypot(event.clientX - start.clientX, event.clientY - start.clientY) > 6) {
      const region = {
        left: Math.min(start.x, point.x), right: Math.max(start.x, point.x),
        top: Math.min(start.y, point.y), bottom: Math.max(start.y, point.y),
      };
      const selected = visibleSurveys.filter((survey) => {
        const projected = coordinates(survey.longitude, survey.latitude);
        return projected.x >= region.left && projected.x <= region.right && projected.y >= region.top && projected.y <= region.bottom;
      });
      setLassoIds(selected.map((survey) => survey.id));
      setLasso({ selectedCount: selected.length });
      if (selected.length) {
        setMapView(fitMapView(selected));
        setSelectedId(selected[0].id);
      }
      return;
    }

    setLasso(null);
    setLassoIds([]);
    let nearest = null;
    let nearestDistance = 12;
    for (const survey of visibleSurveys) {
      const projected = coordinates(survey.longitude, survey.latitude);
      const screenPoint = pointerFromMapPoint(projected, svg);
      if (!screenPoint) continue;
      const currentDistance = Math.hypot(screenPoint.x - event.clientX, screenPoint.y - event.clientY);
      if (currentDistance < nearestDistance) {
        nearest = survey;
        nearestDistance = currentDistance;
      }
    }
    if (nearest) setSelectedId(nearest.id);
  };

  const selectedCoordinates = selectedSurvey ? coordinates(selectedSurvey.longitude, selectedSurvey.latitude) : null;
  const zoomed = mapView.x !== DEFAULT_MAP_VIEW.x || mapView.y !== DEFAULT_MAP_VIEW.y || mapView.width !== DEFAULT_MAP_VIEW.width;
  const clearFilters = () => {
    setFilters({ ocean: '', realm: '', ecoregion: '', substrate: '', minTemperature: '', maxTemperature: '', minDepth: '', maxDepth: '' });
    setLasso(null);
    setLassoIds([]);
    setMapView(DEFAULT_MAP_VIEW);
  };

  return (
    <div className="page coral-page">
      <header className="coral-header">
        <div>
          <p className="coral-eyebrow"><span className="coral-status-dot" /> OCEAN OBSERVATION / DATA EXPLORER</p>
          <h1>Coral-lytics<span className="coral-title-period">.</span></h1>
          <p className="coral-intro">A field guide to coral bleaching, ocean heat, and the surveys that connect them.</p>
        </div>
        <div className="coral-source-mark"><span>CORAL BLEACHING</span><strong>SURVEY DATA</strong><small>1980 — 2020</small></div>
      </header>

      {loadError ? (
        <div className="coral-load-error" role="alert">
          <strong>Survey data could not be loaded.</strong>
          <span>{loadError}</span>
          <span>Check that <code>global_bleaching_environmental.csv</code> is available to the app.</span>
        </div>
      ) : surveys.length === 0 ? (
        <div className="coral-loading" role="status"><span className="coral-loader" /> Loading global survey data…</div>
      ) : (
        <>
          <section className="coral-kpis" aria-label="Overview statistics">
            <div className="coral-kpi"><span>Survey records</span><strong>{baseSurveys.length.toLocaleString()}</strong><small>within current filters</small></div>
            <div className="coral-kpi"><span>Survey locations</span><strong>{siteCount.toLocaleString()}</strong><small>distinct site identifiers</small></div>
            <div className="coral-kpi"><span>Mean bleaching</span><strong>{averageBleaching === null ? '—' : <>{averageBleaching.toFixed(1)}<i>%</i></>}</strong><small>reported survey average</small></div>
            <div className="coral-kpi"><span>Mean heat anomaly</span><strong>{averageSsta === null ? '—' : <>{averageSsta.toFixed(1)}<i>°C</i></>}</strong><small>sea surface temperature</small></div>
          </section>

          <section className="coral-filterbar" aria-label="Survey filters">
            <div className="coral-filter-heading"><span className="coral-filter-icon">⌕</span><strong>Refine surveys</strong></div>
            <label>Ocean
              <select value={filters.ocean} onChange={(event) => updateFilter('ocean', event.target.value)}>
                <option value="">All oceans</option>
                {optionsFor(surveys, 'ocean').map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>
            <label>Realm
              <select value={filters.realm} onChange={(event) => updateFilter('realm', event.target.value)}>
                <option value="">All realms</option>
                {realms.map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>
            <label>Ecoregion
              <select value={filters.ecoregion} onChange={(event) => updateFilter('ecoregion', event.target.value)}>
                <option value="">All ecoregions</option>
                {ecoregions.map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>
            <label>Substrate
              <select value={filters.substrate} onChange={(event) => updateFilter('substrate', event.target.value)}>
                <option value="">All substrates</option>
                {optionsFor(surveys, 'substrate').map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>
            <button type="button" className="coral-clear-filters" onClick={clearFilters}>Clear</button>
            <details className="coral-advanced-filter">
              <summary>Temperature &amp; depth</summary>
              <div className="coral-range-filters">
                <fieldset>
                  <legend>Mean temperature (°C)</legend>
                  <label>Min<input type="number" step="0.1" min={temperatureBounds[0].toFixed(1)} max={temperatureBounds[1].toFixed(1)} placeholder={temperatureBounds[0].toFixed(1)} value={filters.minTemperature} onChange={(event) => updateFilter('minTemperature', event.target.value)} /></label>
                  <label>Max<input type="number" step="0.1" min={temperatureBounds[0].toFixed(1)} max={temperatureBounds[1].toFixed(1)} placeholder={temperatureBounds[1].toFixed(1)} value={filters.maxTemperature} onChange={(event) => updateFilter('maxTemperature', event.target.value)} /></label>
                </fieldset>
                <fieldset>
                  <legend>Survey depth (m)</legend>
                  <label>Min<input type="number" step="1" min={depthBounds[0]} max={depthBounds[1]} placeholder={depthBounds[0].toFixed(0)} value={filters.minDepth} onChange={(event) => updateFilter('minDepth', event.target.value)} /></label>
                  <label>Max<input type="number" step="1" min={depthBounds[0]} max={depthBounds[1]} placeholder={depthBounds[1].toFixed(0)} value={filters.maxDepth} onChange={(event) => updateFilter('maxDepth', event.target.value)} /></label>
                </fieldset>
              </div>
            </details>
          </section>

          <div className="coral-dashboard">
            <section className="coral-panel coral-map-panel">
              <div className="coral-panel-heading">
                <div><p className="coral-section-kicker">01 / SPATIAL DISTRIBUTION</p><h2>Bleaching around the reef</h2></div>
                <div className="coral-map-count"><strong>{visibleSurveys.length.toLocaleString()}</strong><span>surveys · {formatPeriod(selectedPeriod)}</span></div>
              </div>
              <p className="coral-panel-caption">Drag across the map to select surveys and zoom in; click near a dot to inspect its field record.</p>
              <div className="coral-map-wrap">
                <svg ref={mapSvgRef} className="coral-map" viewBox={`${mapView.x} ${mapView.y} ${mapView.width} ${mapView.height}`} preserveAspectRatio="none" role="img" aria-label={`Map showing ${visibleSurveys.length} survey locations in ${formatPeriod(selectedPeriod)}`}>
                  <rect width={MAP_WIDTH} height={MAP_HEIGHT} className="coral-map-water" />
                  <image href={coralMapUrl} x="0" y="0" width={MAP_WIDTH} height={MAP_HEIGHT} preserveAspectRatio="none" />
                  {[-30, 0, 30, 60].map((latitude) => {
                    const y = coordinates(0, latitude).y;
                    return <g key={latitude}><line x1="0" x2={MAP_WIDTH} y1={y} y2={y} className="coral-map-grid" /><text x="12" y={y - 5} className="coral-map-coordinate">{latitude}°</text></g>;
                  })}
                  {[-120, -60, 0, 60, 120].map((longitude) => {
                    const x = coordinates(longitude, 0).x;
                    return <line key={longitude} x1={x} x2={x} y1="0" y2={MAP_HEIGHT} className="coral-map-grid coral-map-grid-vertical" />;
                  })}
                  <text x="145" y="150" className="coral-map-place">PACIFIC</text>
                  <text x="488" y="132" className="coral-map-place">ATLANTIC</text>
                  <text x="710" y="196" className="coral-map-place">INDIAN</text>
                  {visibleSurveys.map((survey) => {
                    const point = coordinates(survey.longitude, survey.latitude);
                    const selected = survey.id === selectedId;
                    return <circle key={survey.id} cx={point.x} cy={point.y} r={markerRadius(survey) + (selected ? 1 : 0)} style={{ fill: bleachingColor(survey.percent) }} className={`coral-map-dot coral-severity-${severity(survey)}${selected ? ' coral-map-dot-selected' : ''}${lassoIds.includes(survey.id) ? ' coral-map-dot-lassoed' : ''}`} />;
                  })}
                  {selectedCoordinates && <circle cx={selectedCoordinates.x} cy={selectedCoordinates.y} r="10" className="coral-map-selection-ring" />}
                  {lasso?.left !== undefined && <rect x={lasso.left} y={lasso.top} width={lasso.right - lasso.left} height={lasso.bottom - lasso.top} className="coral-lasso-box" />}
                  <rect
                    width={MAP_WIDTH}
                    height={MAP_HEIGHT}
                    className="coral-map-interaction"
                    onPointerDown={(event) => {
                      const svg = mapSvgRef.current;
                      const point = svg && pointFromPointer(event.clientX, event.clientY, svg);
                      if (!point) return;
                      pointerStart.current = {
                        ...point,
                        clientX: event.clientX,
                        clientY: event.clientY,
                      };
                      event.currentTarget.setPointerCapture(event.pointerId);
                      setLasso(null);
                    }}
                    onPointerMove={(event) => {
                      if (!pointerStart.current) return;
                      const svg = mapSvgRef.current;
                      const current = svg && pointFromPointer(event.clientX, event.clientY, svg);
                      if (!current) return;
                      setLasso({
                        left: Math.min(pointerStart.current.x, current.x),
                        right: Math.max(pointerStart.current.x, current.x),
                        top: Math.min(pointerStart.current.y, current.y),
                        bottom: Math.max(pointerStart.current.y, current.y),
                        selectedCount: 0,
                      });
                    }}
                    onPointerUp={finishMapGesture}
                    onPointerCancel={() => { pointerStart.current = null; setLasso(null); }}
                  />
                </svg>
              </div>
              <div className="coral-map-footer">
                <div className="coral-legend" aria-label="Marker color represents percentage bleached">
                  <span>0%</span>
                  <span className="coral-bleaching-gradient" />
                  <span>100%</span>
                  <small>COLOR = % BLEACHED</small>
                  <span className="coral-missing-key" />
                  <small>No reported percent</small>
                </div>
                <div className="coral-size-legend" aria-label="Marker size represents percentage bleached">
                  <span>SIZE = % BLEACHED</span>
                  <i className="coral-size-key coral-size-key-small" />
                  <small>0</small>
                  <i className="coral-size-key coral-size-key-medium" />
                  <small>50</small>
                  <i className="coral-size-key coral-size-key-large" />
                  <small>100%</small>
                </div>
                <div className="coral-map-actions">
                  {lasso && <span className="coral-lasso-count">{lasso.selectedCount} in selection · zoomed</span>}
                  {zoomed && <button type="button" className="coral-reset-zoom" onClick={() => { setMapView(DEFAULT_MAP_VIEW); setLasso(null); setLassoIds([]); }}>Reset zoom</button>}
                </div>
              </div>
              <div className="coral-timeline">
                <div className="coral-timeline-heading"><span>Survey month · year</span><strong>{formatPeriod(selectedPeriod)}</strong></div>
                <input aria-label="Survey month and year" type="range" min="0" max={Math.max(0, periodCounts.length - 1)} value={periodIndex} onChange={(event) => changePeriod(periodCounts[Number(event.target.value)]?.[0] ?? selectedPeriod)} />
                <div className="coral-timeline-labels"><span>{formatPeriod(periodCounts[0]?.[0])}</span><span>{formatPeriod(periodCounts.at(-1)?.[0])}</span></div>
                <div className="coral-year-jumps">
                  <span>Jump to a survey-rich year</span>
                  {notableYears.map((point) => <button key={point.year} type="button" className={point.year === selectedYear ? 'active' : ''} onClick={() => changeYear(point.year)}>{point.year}<small>{point.count.toLocaleString()}</small></button>)}
                </div>
              </div>
            </section>

            <aside className="coral-panel coral-detail-panel">
              <div className="coral-panel-heading">
                <div><p className="coral-section-kicker">02 / FIELD NOTE</p><h2>Survey details</h2></div>
                <span className={`coral-detail-badge coral-severity-${selectedSurvey ? severity(selectedSurvey) : 'unreported'}`}>{selectedSurvey ? severity(selectedSurvey) : '—'}</span>
              </div>
              {selectedSurvey ? (
                <>
                  <div className="coral-site-title"><strong>{selectedSurvey.site && selectedSurvey.site !== NO_DATA ? selectedSurvey.site : `Survey ${selectedSurvey.sampleId}`}</strong><span>{selectedSurvey.country && selectedSurvey.country !== NO_DATA ? selectedSurvey.country : selectedSurvey.ecoregion}</span></div>
                  <div className="coral-coordinate-line">{selectedSurvey.latitude.toFixed(3)}° {selectedSurvey.latitude < 0 ? 'S' : 'N'} · {Math.abs(selectedSurvey.longitude).toFixed(3)}° {selectedSurvey.longitude < 0 ? 'W' : 'E'} <span>·</span> {selectedSurvey.date || selectedSurvey.year}</div>
                  <div className="coral-primary-metric"><span>Reported bleaching</span><strong>{selectedSurvey.percent === null ? '—' : <>{selectedSurvey.percent.toFixed(0)}<i>%</i></>}</strong><small>survey-level percent bleached</small></div>
                  <dl className="coral-detail-grid">
                    <div><dt>Sea temperature</dt><dd>{selectedSurvey.meanTemperature === null ? 'Not reported' : `${(selectedSurvey.meanTemperature - 273.15).toFixed(1)} °C`}<small>{formatValue(selectedSurvey.temperature, 2)} K field value</small></dd></div>
                    <div><dt>Temperature range</dt><dd>{selectedSurvey.minimumTemperature === null || selectedSurvey.maximumTemperature === null ? 'Not reported' : `${(selectedSurvey.minimumTemperature - 273.15).toFixed(1)} – ${(selectedSurvey.maximumTemperature - 273.15).toFixed(1)} °C`}</dd></div>
                    <div><dt>Heat anomaly · SSTA</dt><dd>{selectedSurvey.ssta === null ? 'Not reported' : `${selectedSurvey.ssta > 0 ? '+' : ''}${selectedSurvey.ssta.toFixed(2)} °C`}</dd></div>
                    <div><dt>Degree heating weeks</dt><dd>{formatValue(selectedSurvey.dhw, 2)}</dd></div>
                    <div><dt>Substrate</dt><dd>{selectedSurvey.substrate === NO_DATA ? 'Not reported' : selectedSurvey.substrate}</dd></div>
                    <div><dt>Depth</dt><dd>{selectedSurvey.depth === null ? 'Not reported' : `${selectedSurvey.depth} m`}</dd></div>
                    <div><dt>Exposure</dt><dd>{selectedSurvey.exposure === NO_DATA ? 'Not reported' : selectedSurvey.exposure}</dd></div>
                    <div><dt>Turbidity</dt><dd>{formatValue(selectedSurvey.turbidity, 4)}</dd></div>
                  </dl>
                  <div className="coral-region-note"><span>{selectedSurvey.ocean}</span><span>{selectedSurvey.realm}</span><span>{selectedSurvey.ecoregion}</span></div>
                  {selectedSurvey.comments && selectedSurvey.comments !== NO_DATA && <details className="coral-comments"><summary>Survey notes</summary><p>{selectedSurvey.comments}</p></details>}
                  <p className="coral-data-note">Colony counts and a separate bleaching yes/no flag are not included in this source file.</p>
                </>
              ) : <p className="coral-empty-note">No surveys match these filters in {formatPeriod(selectedPeriod)}. Try another month or clear a filter.</p>}
            </aside>
          </div>

          <section className="coral-panel coral-trend-panel">
            <div className="coral-panel-heading coral-trend-heading">
              <div><p className="coral-section-kicker">03 / HEAT &amp; BLEACHING</p><h2>How do the signals move together?</h2></div>
              <div className="coral-trend-summary">
                <p>Individual survey observations · click a point to inspect it</p>
                <div className="coral-correlation-stat"><span>PEARSON r · BLEACHING × DHW</span><strong>{correlation.value === null ? '—' : correlation.value.toFixed(2)}</strong><small>{correlation.count.toLocaleString()} paired surveys</small></div>
              </div>
            </div>
            <p className="coral-series-note">Each mark is one survey’s reported value (not an annual average). Choose a season to emphasize it and fade other seasons; toggle the linear trend line. Set start and end dates to zoom the shared time window. Click a plotted point to select its survey on the map. Correlation is across paired survey-level observations and does not imply causation.</p>
            <div className="coral-signal-controls">
              <label>Highlight season
                <select value={selectedSeason} onChange={(event) => setSelectedSeason(event.target.value)}>
                  <option value="">All seasons</option>
                  {SEASONS.map((season) => <option key={season} value={season}>{season}</option>)}
                </select>
              </label>
              <label className="coral-trend-toggle"><input type="checkbox" checked={showTrend} onChange={(event) => setShowTrend(event.target.checked)} /> Show trend line</label>
              <label>From
                <input type="date" min={chartDateBounds.start} max={chartEndDate} value={chartStartDate} onChange={(event) => changeChartStart(event.target.value)} />
              </label>
              <label>To
                <input type="date" min={chartStartDate} max={chartDateBounds.end} value={chartEndDate} onChange={(event) => changeChartEnd(event.target.value)} />
              </label>
              <button type="button" className="coral-chart-reset" onClick={resetChartZoom} disabled={!requestedChartStart && !requestedChartEnd}>Reset zoom</button>
            </div>
            <div className="coral-season-legend" aria-label="Season color emphasis">
              <span><i className="coral-season-swatch" />Highlighted season</span>
              <span className="faded"><i className="coral-season-swatch" />Other seasons</span>
              <small>{selectedSeason ? `${selectedSeason} selected` : 'All seasons shown'}</small>
            </div>
            {chartWindowSurveys.length ? (
              <div className="coral-series-grid">
                <SurveyTimeSeriesChart surveys={chartWindowSurveys} metric="percent" label="Reported bleaching" unit="Percent bleached (%)" color="#4E79A7" maximum={100} dateStart={chartStartDate} dateEnd={chartEndDate} selectedSeason={selectedSeason} showTrend={showTrend} onSelectSurvey={selectChartSurvey} />
                <SurveyTimeSeriesChart surveys={chartWindowSurveys} metric="dhw" label="Degree heating weeks" unit="SSTA_DHW (°C-weeks)" color="#F28E2B" maximum={dhwMaximum} dateStart={chartStartDate} dateEnd={chartEndDate} selectedSeason={selectedSeason} showTrend={showTrend} onSelectSurvey={selectChartSurvey} />
              </div>
            ) : <p className="coral-empty-note">Choose broader filters or a different date range to view survey observations.</p>}
            {lassoIds.length > 0 && (
              <div className="coral-lasso-summary">
                <strong>{lassoIds.length.toLocaleString()} surveys selected</strong>
                <span>{lassoIds.slice(0, 5).map((id) => surveyById.get(id)).filter(Boolean).map((survey) => survey.site && survey.site !== NO_DATA ? survey.site : `Survey ${survey.sampleId}`).join(' · ')}</span>
                {lassoIds.length > 5 && <small>and {lassoIds.length - 5} more in the map selection</small>}
                <button type="button" onClick={() => { setLassoIds([]); setLasso(null); }}>Clear selection</button>
              </div>
            )}
          </section>

          <footer className="coral-footnote">
            <span>Source: global_bleaching_environmental.csv · {surveys.length.toLocaleString()} records</span>
            <span>Date-only records · temperature values in the source are Kelvin; displayed survey means are converted to °C.</span>
            <span>Coastlines: Natural Earth 1:50m, rendered with Cartopy.</span>
          </footer>
        </>
      )}
    </div>
  );
}
