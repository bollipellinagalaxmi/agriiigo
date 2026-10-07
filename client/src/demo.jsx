import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, LocateFixed, MapPin, Search, Tractor } from 'lucide-react';
import { equipmentTypes } from './api';

const places = [
  { name: 'Hyderabad', lat: 17.385, lng: 78.4867 },
  { name: 'Delhi', lat: 28.6139, lng: 77.209 },
  { name: 'Mumbai', lat: 19.076, lng: 72.8777 },
  { name: 'Nirmal', lat: 19.0968, lng: 78.3441 },
  { name: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
];

const templates = [
  { type: 'Tractor', brand: 'Demo Mahindra', model: '575 DI', service: 'Ploughing', price: 900, unit: 'acre', owner: 'Demo Owner 01', rating: 4.8 },
  { type: 'Harvester', brand: 'Demo Kubota', model: 'DC-68G', service: 'Harvesting', price: 2500, unit: 'acre', owner: 'Demo Owner 02', rating: 4.7 },
  { type: 'Transportation', brand: 'Demo Tata', model: '407', service: 'Transportation', price: 1500, unit: 'trip', owner: 'Demo Owner 03', rating: 4.6 },
  { type: 'Rotavator', brand: 'Demo Mahindra', model: 'Gyrovator', service: 'Cultivation', price: 1100, unit: 'acre', owner: 'Demo Owner 04', rating: 4.9 },
  { type: 'Seeder', brand: 'Demo John Deere', model: 'Seed Drill', service: 'Seeding', price: 750, unit: 'acre', owner: 'Demo Owner 05', rating: 4.6 },
  { type: 'Sprayer', brand: 'Demo Honda', model: 'Power Sprayer', service: 'Spraying', price: 350, unit: 'acre', owner: 'Demo Owner 06', rating: 4.5 },
  { type: 'Cultivator', brand: 'Demo FieldPro', model: 'Cultivator 9T', service: 'Cultivation', price: 800, unit: 'acre', owner: 'Demo Owner 07', rating: 4.7 },
  { type: 'Thresher', brand: 'Demo AgriMax', model: 'Multi Crop', service: 'Threshing', price: 1200, unit: 'hour', owner: 'Demo Owner 08', rating: 4.4 },
];

function kmBetween(a, b) {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function demoListings(center) {
  return templates.map((item, index) => {
    const distance = 3.2 + ((index * 17 + Math.round(Math.abs(center.lat * 10))) % 54) / 10;
    const angle = ((index * 137.5 + Math.round(Math.abs(center.lng * 10))) % 360) * Math.PI / 180;
    const dLat = Math.cos(angle) * distance / 111.32;
    const dLng = Math.sin(angle) * distance / (111.32 * Math.max(0.25, Math.cos(center.lat * Math.PI / 180)));
    const coords = { lat: center.lat + dLat, lng: center.lng + dLng };
    return { ...item, id: 'demo-equipment-' + index, distance: kmBetween(center, coords), coords, registration: 'DEMO ONLY — NOT A REAL VEHICLE' };
  });
}

const stages = ['REQUESTED', 'ACCEPTED', 'OWNER_EN_ROUTE', 'ARRIVED', 'SERVICE_STARTED', 'PAYMENT_PENDING', 'COMPLETED'];
const nextStage = { REQUESTED: 'ACCEPTED', ACCEPTED: 'OWNER_EN_ROUTE', OWNER_EN_ROUTE: 'ARRIVED', ARRIVED: 'SERVICE_STARTED', SERVICE_STARTED: 'PAYMENT_PENDING', PAYMENT_PENDING: 'COMPLETED' };
const stageLabel = { REQUESTED: 'Request received', ACCEPTED: 'Owner accepted', OWNER_EN_ROUTE: 'Machinery on the way', ARRIVED: 'Arrived at field', SERVICE_STARTED: 'Service in progress', PAYMENT_PENDING: 'Demo payment', COMPLETED: 'Service completed', REJECTED: 'Request declined' };

export default function DemoExperience() {
  const [placeName, setPlaceName] = useState('Hyderabad');
  const [customName, setCustomName] = useState('');
  const [center, setCenter] = useState({ lat: places[0].lat, lng: places[0].lng });
  const [manualLat, setManualLat] = useState(String(places[0].lat));
  const [manualLng, setManualLng] = useState(String(places[0].lng));
  const [locationNote, setLocationNote] = useState('');
  const [filterType, setFilterType] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [view, setView] = useState('choose');
  const [ownerView, setOwnerView] = useState(false);
  const [booking, setBooking] = useState(null);
  const [bookingError, setBookingError] = useState('');
  const [ownerTab, setOwnerTab] = useState('equipment');
  const [ownerEquipment, setOwnerEquipment] = useState([]);
  const [ownerAvailability, setOwnerAvailability] = useState(null);
  const [ownerNotice, setOwnerNotice] = useState('');
  const [operatorType, setOperatorType] = useState('OWNER');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [operatorReady, setOperatorReady] = useState(false);

  const listings = useMemo(() => demoListings(center), [center]);
  const visible = listings.filter(item => (!filterType || item.type === filterType) && (!search || (item.brand + ' ' + item.model + ' ' + item.service).toLowerCase().includes(search.toLowerCase())));
  const displayPlace = placeName === 'Other location' && customName.trim() ? customName.trim() : placeName;

  function choosePlace(name) {
    setPlaceName(name);
    const found = places.find(place => place.name === name);
    if (found) {
      setCenter({ lat: found.lat, lng: found.lng });
      setManualLat(String(found.lat));
      setManualLng(String(found.lng));
      setLocationNote('');
    } else { setCustomName(''); setManualLat(''); setManualLng(''); setLocationNote('Enter a city label and coordinates, or use your device location.'); }
  }

  function applyManualLocation(event) {
    event.preventDefault();
    const lat = Number(manualLat), lng = Number(manualLng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      setLocationNote('Enter a valid latitude and longitude.');
      return;
    }
    setCenter({ lat, lng });
    setLocationNote('Demo machinery is now shown around ' + displayPlace + '.');
  }

  function useDeviceLocation() {
    if (!navigator.geolocation) return setLocationNote('Device location is unavailable. Choose a city or enter coordinates.');
    setLocationNote('Checking device location…');
    navigator.geolocation.getCurrentPosition(position => {
      const lat = position.coords.latitude, lng = position.coords.longitude;
      setCenter({ lat, lng });
      setManualLat(String(lat.toFixed(6)));
      setManualLng(String(lng.toFixed(6)));
      setPlaceName('My selected location');
      setLocationNote('Demo machinery is shown around your selected location.');
    }, () => setLocationNote('Location permission was unavailable. Choose a city or enter coordinates.'), { timeout: 10000 });
  }

  function createBooking(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (String(form.get('start')) >= String(form.get('end'))) { setBookingError('End time must be after start time.'); return; }
    setBookingError('');
    const request = {
      id: 'DEMO-' + String(Date.now()).slice(-6),
      item: selected,
      field: String(form.get('field') || 'Demo Field'),
      area: String(form.get('area') || '3'),
      date: String(form.get('date') || ''),
      notes: String(form.get('notes') || ''),
      start: String(form.get('start') || ''),
      end: String(form.get('end') || ''),
      status: 'REQUESTED',
      place: displayPlace,
    };
    setBooking(request);
    setView('booking');
    setOwnerView(false);
  }

  function advanceBooking(status) {
    if (!booking) return;
    if (booking.status === 'ACCEPTED' && status === 'OWNER_EN_ROUTE' && !operatorReady) {
      setOwnerNotice('Confirm who will operate the equipment before marking it on the way.');
      return;
    }
    setBooking({ ...booking, status });
    setOwnerNotice('');
  }

  function addDemoEquipment(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const equipment = {
      type: String(form.get('type')), brand: String(form.get('brand')).trim(),
      model: String(form.get('model')).trim(), registration: String(form.get('registration')).trim(),
      year: String(form.get('year')), capacity: String(form.get('capacity')).trim(),
    };
    setOwnerEquipment(items => [...items, equipment]);
    setOwnerNotice('Demo equipment added to this page only.');
    event.currentTarget.reset();
  }

  function publishDemoAvailability(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const start = String(form.get('start')), end = String(form.get('end'));
    if (start >= end) { setOwnerNotice('End time must be after start time.'); return; }
    setOwnerAvailability({ date: String(form.get('date')), start, end, service: String(form.get('service')), price: String(form.get('price')), unit: String(form.get('unit')) });
    setOwnerNotice('Demo availability and pricing published in this page only.');
  }

  function confirmOperator(event) {
    event.preventDefault();
    if (operatorType === 'DRIVER' && (!driverName.trim() || !driverPhone.trim())) {
      setOwnerNotice('Enter the demo driver name and phone number.');
      return;
    }
    setOperatorReady(true);
    setOwnerNotice(operatorType === 'DRIVER' ? 'Demo driver details confirmed.' : 'You are set as the demo operator.');
  }

  const today = new Date();
  const tomorrowDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  const tomorrow = [tomorrowDate.getFullYear(), String(tomorrowDate.getMonth() + 1).padStart(2, '0'), String(tomorrowDate.getDate()).padStart(2, '0')].join('-');

  function openOwnerDemo() {
    const item = listings[0];
    setBooking({
      id: 'DEMO-OWNER-001', item, field: 'Demo North Field', area: '3',
      date: tomorrow, start: '08:00', end: '10:00', notes: 'Sample request for the owner demo.',
      status: 'REQUESTED', place: displayPlace,
    });
    setOwnerView(true);
    setOwnerTab('equipment');
    setOperatorReady(false);
    setOwnerNotice('');
    setView('owner-dashboard');
  }

  function chooseDemoRole(role) {
    if (role === 'owner') return openOwnerDemo();
    setBooking(null);
    setSelected(null);
    setOwnerView(false);
    setView('browse');
  }

  return <div className="demo-shell">
    <header className="demo-nav"><Link className="demo-brand" to="/">Agriiigo</Link><span className="demo-mode-pill">DEMO MODE</span>{view !== 'choose' && <button className="demo-exit" type="button" onClick={() => { setBooking(null); setSelected(null); setView('choose'); }}>Switch demo</button>}<Link className="demo-exit" to="/">Exit demo</Link></header>
    <main className="demo-main">
      <section className="demo-disclosure"><b>Agriiigo prototype — Demo Version</b><p>Explore how farmers discover and request agricultural machinery. All machinery, owners, availability, locations, prices, bookings, payments and navigation here are simulated. No real booking or payment is made.</p></section>
      {view === 'choose' && <section className="demo-role-chooser">
        <div className="demo-heading"><div><span className="eyebrow">CHOOSE A DEMO</span><h1>Explore Agriiigo as a farmer or equipment owner</h1><p>Choose a separate walkthrough. Both use simulated data and need no login.</p></div></div>
        <div className="demo-role-grid">
          <article className="demo-role-card"><span className="demo-badge">FARMER DEMO</span><h2>Find and book equipment</h2><p>Choose a location, compare simulated machinery, request a time, then follow the booking and payment steps.</p><button className="btn" type="button" onClick={() => chooseDemoRole('farmer')}>Start farmer demo <ArrowRight size={16}/></button></article>
          <article className="demo-role-card"><span className="demo-badge">OWNER DEMO</span><h2>Manage a booking request</h2><p>Open a sample request and follow each owner action from reviewing the request through completion.</p><button className="btn" type="button" onClick={() => chooseDemoRole('owner')}>Start owner demo <ArrowRight size={16}/></button></article>
        </div>
        <section className="demo-owner-guide"><h2>Owner demo steps</h2><ol><li>Review the farmer’s field, requested date and time, notes, and simulated price.</li><li>Accept the request to begin, or reject it to show a declined request.</li><li>After accepting, update the status in order: machinery on the way, arrived, and service in progress.</li><li>After the service, mark the simulated payment received to complete the request.</li></ol><p>Every action here is simulated. No real farmer, owner, booking, or payment is involved.</p></section>
      </section>}

      {view === 'owner-dashboard' && booking && <section className="demo-owner-dashboard panel">
        <div className="demo-workflow-head"><div><span className="eyebrow">OWNER DEMO DASHBOARD</span><h1>Manage equipment and requests</h1><p>Follow the owner setup and booking process with simulated information.</p></div><span className="demo-badge">DEMO ONLY</span></div>
        <div className="demo-owner-tabs" role="tablist" aria-label="Owner demo steps">
          <button type="button" className={ownerTab === 'equipment' ? 'active' : ''} onClick={() => { setOwnerTab('equipment'); setOwnerNotice(''); }}>1. Add equipment</button>
          <button type="button" className={ownerTab === 'availability' ? 'active' : ''} onClick={() => { setOwnerTab('availability'); setOwnerNotice(''); }}>2. Availability & pricing</button>
          <button type="button" className={ownerTab === 'requests' ? 'active' : ''} onClick={() => { setOwnerTab('requests'); setOwnerNotice(''); }}>3. Booking request</button>
        </div>
        {ownerNotice && <div className="demo-safety-note" role="status">{ownerNotice}</div>}

        {ownerTab === 'equipment' && <div className="demo-owner-panel"><h2>Add equipment</h2><p>Enter sample listing details. Registration information is clearly marked as simulated and stays in this page.</p><form className="demo-owner-form" onSubmit={addDemoEquipment}>
          <label>Equipment type<select name="type" required>{equipmentTypes.map(type => <option key={type}>{type}</option>)}</select></label>
          <label>Brand<input name="brand" placeholder="e.g. Demo Mahindra" required /></label>
          <label>Model<input name="model" placeholder="e.g. 575 DI" required /></label>
          <label>Registration number<input name="registration" placeholder="DEMO-ONLY-123" required /></label>
          <label>Year<input name="year" type="number" min="1980" max="2099" defaultValue={2024} required /></label>
          <label>Capacity / HP<input name="capacity" placeholder="e.g. 45 HP" required /></label>
          <div className="demo-disclaimer-inline">DEMO ONLY — do not enter real registration or personal information.</div><button className="btn" type="submit">Add demo equipment</button>
        </form>{ownerEquipment.length > 0 && <div className="demo-owner-list"><h3>Your demo equipment</h3>{ownerEquipment.map((item,index) => <article key={index}><span className="demo-badge">DEMO</span><b>{item.brand} {item.model}</b><span>{item.type} · {item.year} · {item.capacity}</span><small>Registration: {item.registration} (simulated)</small></article>)}</div>}</div>}

        {ownerTab === 'availability' && <div className="demo-owner-panel"><h2>Publish availability and pricing</h2><p>Choose a date, time window, service, and demo rate. This does not publish real availability.</p><form className="demo-owner-form" onSubmit={publishDemoAvailability}>
          <label>Date<input name="date" type="date" min={tomorrow} defaultValue={tomorrow} required /></label><label>Start time<input name="start" type="time" defaultValue="08:00" required /></label><label>End time<input name="end" type="time" defaultValue="17:00" required /></label>
          <label>Service<select name="service"><option>Ploughing</option><option>Cultivation</option><option>Harvesting</option><option>Transportation</option><option>Seeding</option><option>Spraying</option><option>Threshing</option></select></label>
          <label>Price (₹)<input name="price" type="number" min="1" defaultValue="900" required /></label><label>Price unit<select name="unit"><option value="acre">Per acre</option><option value="hour">Per hour</option><option value="trip">Per trip</option></select></label>
          <button className="btn" type="submit">Publish demo availability</button>
        </form>{ownerAvailability && <div className="demo-owner-list"><h3>Published demo slot</h3><article><span className="demo-badge">SIMULATED AVAILABILITY</span><b>{ownerAvailability.date} · {ownerAvailability.start}–{ownerAvailability.end}</b><span>{ownerAvailability.service} · ₹{ownerAvailability.price}/{ownerAvailability.unit}</span></article></div>}</div>}

        {ownerTab === 'requests' && <div className="demo-owner-panel"><div className="demo-request-card">
          <header className="demo-request-hero"><div className="demo-request-machine"><Tractor size={34}/></div><div className="demo-request-title"><span className="eyebrow">INCOMING BOOKING · {booking.id}</span><h2>{booking.item.brand} {booking.item.model}</h2><p>{booking.item.type} · Demo equipment</p></div><span className={'demo-request-status ' + booking.status.toLowerCase()}>{stageLabel[booking.status]}</span></header>
          <div className="demo-request-content"><div className="demo-request-details">
            <div className="demo-request-detail"><small>REQUESTED BY</small><b>Demo Farmer</b></div><div className="demo-request-detail"><small>FIELD LOCATION</small><b>{booking.field}, {booking.place}</b></div><div className="demo-request-detail"><small>DATE & TIME</small><b>{booking.date} · {booking.start}–{booking.end}</b></div><div className="demo-request-detail"><small>SERVICE</small><b>{booking.item.service} · {booking.area} acres</b></div>
            {booking.notes && <div className="demo-request-note"><small>FARMER NOTE</small><p>{booking.notes}</p></div>}
          </div><aside className="demo-request-rate"><span>DEMO SERVICE RATE</span><strong>₹{booking.item.price}<small> / {booking.item.unit}</small></strong><p>Simulated rate · no real payment</p><span className="demo-badge">SIMULATED REQUEST</span></aside></div>
          <div className="demo-request-progress"><div><b>Request progress</b><span>{stageLabel[booking.status]}</span></div><div className="demo-timeline">{stages.map((stage,index)=><span className={stages.indexOf(booking.status)>=index?'done':''} key={stage}><i>{index+1}</i>{stageLabel[stage]}</span>)}</div></div>
          <div className="demo-request-actions">
            {booking.status === 'REQUESTED' && <><p>Review the schedule and service, then choose how to respond.</p><div className="demo-action-row"><button className="btn" onClick={() => { advanceBooking('ACCEPTED'); setOwnerNotice('Request accepted in this demo. Next, confirm who will operate the equipment.'); }}>Accept request <Check size={16}/></button><button className="btn btn-outline" onClick={() => advanceBooking('REJECTED')}>Decline request</button></div></>}
            {booking.status === 'ACCEPTED' && <><p>Choose who will operate the equipment before starting the journey.</p><form className="demo-owner-form demo-operator-form" onSubmit={confirmOperator}><label>Operator<select value={operatorType} onChange={event => { setOperatorType(event.target.value); setOperatorReady(false); }}><option value="OWNER">I will operate it</option><option value="DRIVER">Assign a driver</option></select></label>{operatorType === 'DRIVER' && <><label>Driver name<input value={driverName} onChange={event => setDriverName(event.target.value)} required /></label><label>Driver phone<input value={driverPhone} onChange={event => setDriverPhone(event.target.value)} inputMode="tel" required /></label></>}<button className="btn" type="submit">Confirm operator</button>{operatorReady && <span className="demo-badge">OPERATOR CONFIRMED</span>}</form></>}
            {booking.status === 'REJECTED' && <p>This request was declined in the demo. No real booking was affected.</p>}
            {nextStage[booking.status] && booking.status !== 'REQUESTED' && booking.status !== 'REJECTED' && <button className="btn" onClick={() => advanceBooking(nextStage[booking.status])}>{booking.status === 'PAYMENT_PENDING' ? 'Simulate payment received' : 'Update status: ' + stageLabel[nextStage[booking.status]]}<ArrowRight size={16}/></button>}
            {booking.status === 'PAYMENT_PENDING' && <div className="demo-safety-note"><b>Payment step.</b> Record simulated payment to complete the walkthrough. No money is charged or transferred.</div>}{booking.status === 'COMPLETED' && <div className="demo-safety-note">Request complete. You have finished the owner demo.</div>}
          </div>
        </div></div>}
        <div className="demo-owner-guide"><h2>Owner process, step by step</h2><ol><li>Add the equipment details and simulated registration number.</li><li>Publish the date, time, service, and price you offer.</li><li>Review the incoming request and accept or reject it.</li><li>If accepted, choose yourself or enter a demo driver’s details.</li><li>Update journey status to on the way, arrived, then service in progress.</li><li>After service, simulate receiving payment to complete the request.</li></ol><p>This owner dashboard uses page-only demo state. It does not save data to the database or contact anyone.</p></div>
      </section>}

      {view === 'browse' && <>
        <div className="demo-heading"><div><span className="eyebrow">FARMER DEMO</span><h1>Find machinery near your location</h1><p>Choose any listed city, use your device location, or enter coordinates. Demo listings are generated consistently around your selection.</p></div></div>
        <form className="demo-location panel" onSubmit={applyManualLocation}>
          {placeName === 'Other location' && <label>City or area<input value={customName} onChange={event => setCustomName(event.target.value)} placeholder="e.g. Pune" required /></label>}<label>Location<select value={placeName} onChange={event => choosePlace(event.target.value)}>{places.map(place => <option key={place.name}>{place.name}</option>)}<option>Other location</option>{placeName === 'My selected location' && <option>My selected location</option>}</select></label>
          <label>Latitude<input type="number" step="any" value={manualLat} onChange={event => setManualLat(event.target.value)} required /></label>
          <label>Longitude<input type="number" step="any" value={manualLng} onChange={event => setManualLng(event.target.value)} required /></label>
          <button className="btn" type="submit"><MapPin size={16}/> Show nearby demo machinery</button>
          <button className="btn btn-outline" type="button" onClick={useDeviceLocation}><LocateFixed size={16}/> Use my location</button>
          {locationNote && <small className="demo-location-note">{locationNote}</small>}
        </form>
        <div className="demo-results-head"><div><span className="demo-badge">SIMULATED RESULTS</span><h2>Demo machinery near {displayPlace}</h2><p>Approximate distances are calculated from the selected coordinates. Listings are not real or actually available.</p></div><span className="demo-count">{visible.length} listings</span></div>
        <div className="demo-filters"><label><Search size={16}/><input placeholder="Search equipment or service" value={search} onChange={event => setSearch(event.target.value)}/></label><select value={filterType} onChange={event => setFilterType(event.target.value)}><option value="">All equipment types</option>{equipmentTypes.map(type => <option key={type}>{type}</option>)}</select></div>
        {visible.length ? <div className="demo-grid">{visible.map(item => <article className="demo-card" key={item.id}><div className="demo-card-art"><Tractor size={54}/><span className="demo-badge">DEMO MACHINERY</span></div><div className="demo-card-body"><small>{item.type}</small><h3>{item.brand} {item.model}</h3><p>{item.service} · ₹{item.price}/{item.unit}</p><div className="demo-card-meta"><span><MapPin size={14}/> {item.distance.toFixed(1)} km (simulated)</span><span>★ {item.rating} demo rating</span></div><p className="demo-owner">{item.owner} · Demo account</p><button className="btn btn-small" onClick={() => { setSelected(item); setView('detail'); }}>View demo details <ArrowRight size={15}/></button></div></article>)}</div> : <div className="panel demo-empty"><b>No matching demo machinery.</b><p>Try another equipment type or search.</p><button className="btn btn-outline" onClick={() => { setSearch(''); setFilterType(''); }}>Explore all demo machinery</button></div>}
        <section className="demo-owner-preview"><div><span className="eyebrow">OWNER WORKFLOW</span><h2>See how owners manage requests</h2><p>Demo owners can review an incoming request, accept or reject it, update journey and service statuses, and simulate completion.</p><button className="btn" type="button" onClick={openOwnerDemo}>Open owner demo <ArrowRight size={16}/></button></div><div className="demo-owner-steps"><span><Check size={16}/> Review request details</span><span><Check size={16}/> Accept or reject the request</span><span><Check size={16}/> Update journey and service status</span><span><Check size={16}/> Simulate payment completion</span></div></section>
      </>}

      {view === 'detail' && selected && <section className="demo-detail panel"><button className="link-button" onClick={() => setView('browse')}><ArrowLeft size={16}/> Back to results</button><div className="demo-detail-grid"><div className="demo-detail-art"><Tractor size={100}/><span className="demo-badge">DEMO MACHINERY</span></div><div><span className="eyebrow">{selected.type}</span><h1>{selected.brand} {selected.model}</h1><p>{selected.service} service · ₹{selected.price} per {selected.unit}</p><p>Demo availability: daily 08:00–17:00 · simulated only.</p><div className="demo-detail-facts"><span>Distance<b>{selected.distance.toFixed(1)} km · simulated</b></span><span>Rating<b>{selected.rating} · demo rating</b></span><span>Owner<b>{selected.owner} · demo account</b></span><span>Registration<b>{selected.registration}</b></span></div><p className="demo-disclaimer-inline">This listing and its owner are simulated. No real vehicle or registration number is represented.</p><button className="btn" onClick={() => setView('book')}>Request demo booking <ArrowRight size={16}/></button></div></div></section>}

      {view === 'book' && selected && <section className="demo-booking panel"><button className="link-button" onClick={() => setView('detail')}><ArrowLeft size={16}/> Back to machinery</button><span className="eyebrow">DEMO BOOKING</span><h1>Request {selected.brand} {selected.model}</h1><p>This request stays in this browser session and does not create a real booking.</p><form className="form-stack" onSubmit={createBooking}><label>Demo field name<input name="field" required defaultValue="North Demo Field"/></label><div className="form-row"><label>Field area (acres)<input name="area" type="number" min="0.1" step="0.1" required defaultValue="3"/></label><label>Service<input readOnly value={selected.service}/></label></div><div className="form-row"><label>Date<input name="date" type="date" required min={tomorrow} defaultValue={tomorrow}/></label><label>Start time<input name="start" type="time" required defaultValue="09:00"/></label><label>End time<input name="end" type="time" required defaultValue="11:00"/></label></div><label>Notes for demo owner<textarea name="notes" placeholder="Optional notes"/></label><div className="demo-disclaimer-inline">Demo availability: daily 08:00–17:00 (simulated). DEMO REQUEST — no real owner is contacted and no real booking or payment is created.</div>{bookingError && <div className="alert error">{bookingError}</div>}<button className="btn">Confirm demo request <ArrowRight size={16}/></button></form></section>}

      {view === 'booking' && booking && <section className="demo-workflow panel"><div className="demo-workflow-head"><div><span className="demo-badge">DEMO BOOKING</span><h1>Request {booking.id}</h1><p>{booking.item.brand} {booking.item.model} · {booking.item.service} · {booking.date} · {booking.start}–{booking.end}</p></div><button className="btn btn-outline" onClick={() => { setBooking(null); setView('browse'); }}>Start a new demo</button></div><div className="demo-safety-note"><b>Demo transaction.</b> This request is simulated and no real owner, machinery or payment is involved.</div>{['OWNER_EN_ROUTE','ARRIVED','SERVICE_STARTED'].includes(booking.status) && <div className="demo-map-card"><div className="demo-map-head"><span className="demo-badge">DEMO LOCATION — SIMULATED</span><small>No live GPS is used in this demo.</small></div><div className="demo-map-scene"><div className="demo-map-route"/><span className="demo-map-point demo-map-field"><MapPin size={18}/><b>{booking.field}</b></span><span className="demo-map-point demo-map-owner"><Tractor size={22}/><b>{booking.status === 'OWNER_EN_ROUTE' ? 'Machinery approaching' : booking.status === 'ARRIVED' ? 'Arrived at demo field' : 'Service in progress'}</b></span></div></div>}<div className="demo-status"><span className="demo-badge">{stageLabel[booking.status]}</span><div className="demo-timeline">{stages.map((stage, index) => <span className={stages.indexOf(booking.status) >= index ? 'done' : ''} key={stage}><i>{index + 1}</i>{stageLabel[stage]}</span>)}</div></div><div className="demo-switch"><button className={!ownerView ? 'active' : ''} onClick={() => setOwnerView(false)}>Farmer view</button><button className={ownerView ? 'active' : ''} onClick={() => setOwnerView(true)}>Demo owner view</button></div>
          {ownerView && <aside className="demo-owner-guide"><h2>Owner walkthrough</h2><ol><li>Review the request details, field, schedule, notes, and demo price.</li><li>Choose <b>Accept demo request</b> or <b>Reject demo request</b>.</li><li>After accepting, use the status button to move through on the way, arrived, and service in progress.</li><li>When payment is pending, choose <b>Simulate payment received</b> to finish the walkthrough.</li></ol><p>These controls change only this simulated request in this page.</p></aside>}
          {!ownerView ? <div className="demo-view-card"><h2>Farmer booking view</h2><p><b>Demo owner:</b> {booking.item.owner}</p><p><b>Field:</b> {booking.field} · {booking.area} acres · {booking.place}</p><p><b>Status:</b> {stageLabel[booking.status]}</p>{booking.status === 'PAYMENT_PENDING' && <div className="demo-safety-note"><b>Demo payment.</b> Payment simulation only — no money will be charged.</div>}{booking.status === 'COMPLETED' && <div className="demo-safety-note">Demo service completed. Thank you for exploring Agriiigo.</div>}</div> : <div className="demo-view-card"><h2>Incoming request · {booking.item.owner}</h2><p><b>Machinery:</b> {booking.item.brand} {booking.item.model} · <span className="demo-badge">DEMO</span></p><p><b>Field:</b> {booking.field} · {booking.area} acres</p><p><b>Requested schedule:</b> {booking.date}, {booking.start}–{booking.end}</p><p><b>Demo price:</b> ₹{booking.item.price}/{booking.item.unit}</p><p><b>Registration:</b> DEMO ONLY — NOT A REAL VEHICLE</p>{booking.notes && <p><b>Farmer notes:</b> {booking.notes}</p>}{booking.status === 'REQUESTED' && <div className="demo-action-row"><button className="btn" onClick={() => advanceBooking('ACCEPTED')}>Accept demo request</button><button className="btn btn-outline" onClick={() => advanceBooking('REJECTED')}>Reject demo request</button></div>}{booking.status === 'REJECTED' && <p>This demo request was declined. No real request was sent.</p>}{nextStage[booking.status] && booking.status !== 'REQUESTED' && <button className="btn" onClick={() => advanceBooking(nextStage[booking.status])}>{booking.status === 'PAYMENT_PENDING' ? 'Simulate payment received' : 'Update demo status: ' + stageLabel[nextStage[booking.status]]}<ArrowRight size={16}/></button>}{booking.status === 'PAYMENT_PENDING' && <div className="demo-safety-note"><b>Payment simulation only.</b> This button records no real money.</div>}</div>}
        </section>}
      <footer className="demo-footer"><span>Agriiigo Demo Mode · Simulated data only</span><Link to="/">Return to Agriiigo home</Link></footer>
    </main>
  </div>;
}
