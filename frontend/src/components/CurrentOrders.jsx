import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../supabaseClient';

// Delivery timeline steps
const STEPS = [
  { time: 0,  icon: 'ri-search-line',     title: 'Looking for a delivery partner...', detail: "Hang tight, we're finding the best partner for you", color: '#3b82f6' },
  { time: 5,  icon: 'ri-user-star-line',  title: 'Ramesh has been assigned!',         detail: 'Rating: ⭐ 4.8  •  2,400+ deliveries',              color: '#7c3aed' },
  { time: 10, icon: 'ri-store-2-line',    title: 'Arrived at the restaurant',         detail: 'Waiting for your food to be packed',                color: '#f59e0b' },
  { time: 15, icon: 'ri-e-bike-2-line',   title: 'Order picked up!',                  detail: 'Ramesh is on the way to you',                       color: '#f97316' },
  { time: 23, icon: 'ri-map-pin-2-line',  title: 'Almost there!',                     detail: 'Ramesh is nearby — get ready!',                     color: '#84cc16' },
  { time: 30, icon: 'ri-home-heart-line', title: 'Delivered!',                        detail: 'Enjoy your meal! 🎉',                              color: '#10b981' },
];

// Manipal coordinates
const RESTAURANT_POS = [13.3490, 74.7856];
const HOME_POS       = [13.3600, 74.7900];

// Interpolate position along route based on progress (0–1)
function interpolate(start, end, t) {
  return [
    start[0] + (end[0] - start[0]) * t,
    start[1] + (end[1] - start[1]) * t,
  ];
}

export default function CurrentOrders({ orderId, orderTotal, onOrderComplete }) {
  const mapRef     = useRef(null);   // DOM node
  const leafletRef = useRef(null);   // L.map instance
  const bikeMarker = useRef(null);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const completedRef = useRef(false);

  /* ── init Leaflet map once ────────────────────────────── */
  useEffect(() => {
    if (!mapRef.current || leafletRef.current) return;

    const map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: false })
      .setView(RESTAURANT_POS, 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    // Route polyline
    L.polyline([RESTAURANT_POS, HOME_POS], {
      color: '#f59e0b', weight: 4, dashArray: '10, 8', opacity: 0.8,
    }).addTo(map);

    // Restaurant marker
    L.marker(RESTAURANT_POS, {
      icon: L.divIcon({
        html: `<div style="background:#f59e0b;color:white;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 2px 8px rgba(0,0,0,0.3)">🏪</div>`,
        className: '', iconAnchor: [18, 18],
      }),
    }).addTo(map).bindPopup('<b>Restaurant</b><br/>Preparing your food');

    // Home marker
    L.marker(HOME_POS, {
      icon: L.divIcon({
        html: `<div style="background:#10b981;color:white;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 2px 8px rgba(0,0,0,0.3)">🏠</div>`,
        className: '', iconAnchor: [18, 18],
      }),
    }).addTo(map).bindPopup('<b>Your Home</b><br/>Delivery address');

    leafletRef.current = map;

    return () => {
      map.remove();
      leafletRef.current = null;
    };
  }, []);

  /* ── 30-second delivery timer ─────────────────────────── */
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed(prev => {
        const next = prev + 1;

        // Update step
        let stepIdx = 0;
        for (let i = STEPS.length - 1; i >= 0; i--) {
          if (next >= STEPS[i].time) { stepIdx = i; break; }
        }
        setCurrentStepIndex(stepIdx);

        // Move bike marker once partner picks up (t=15)
        if (next >= 15 && next <= 30 && leafletRef.current) {
          const t = (next - 15) / 15;
          const pos = interpolate(RESTAURANT_POS, HOME_POS, t);

          if (!bikeMarker.current) {
            bikeMarker.current = L.marker(pos, {
              icon: L.divIcon({
                html: `<div style="background:#7c3aed;color:white;border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 2px 10px rgba(0,0,0,0.4);animation:pulse 1s infinite">🛵</div>`,
                className: '', iconAnchor: [20, 20],
              }),
            }).addTo(leafletRef.current).bindPopup('<b>Ramesh</b><br/>On the way!');
          } else {
            bikeMarker.current.setLatLng(pos);
          }

          // Pan map to follow bike
          leafletRef.current.panTo(pos, { animate: true, duration: 0.8 });
        }

        // Delivered
        if (next >= 30 && !completedRef.current) {
          completedRef.current = true;
          clearInterval(timer);

          // Update status in DB
          if (orderId) {
            supabase
              .from('orders')
              .update({ status: 'delivered', updated_at: new Date().toISOString() })
              .eq('order_id', orderId)
              .then(({ error }) => {
                if (error) console.warn('Could not update order status:', error.message);
              });
          }

          setTimeout(() => {
            if (onOrderComplete) onOrderComplete();
          }, 2000);
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [orderId, onOrderComplete]);

  const progress = Math.min((secondsElapsed / 30) * 100, 100);
  const currentStep = STEPS[currentStepIndex];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full flex flex-col overflow-auto gap-5">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Tracking Order <span className="text-amber-500">#{orderId || '—'}</span>
          </h2>
          <p className="text-gray-500 text-sm mt-1">Live delivery tracking • Manipal</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${secondsElapsed < 30 ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
          <span className={`text-xs font-bold uppercase tracking-wider ${secondsElapsed < 30 ? 'text-green-600' : 'text-gray-400'}`}>
            {secondsElapsed < 30 ? 'Live' : 'Delivered'}
          </span>
        </div>
      </div>

      {/* Status card */}
      <div
        className="rounded-xl p-4 flex items-center gap-4 border transition-all duration-700"
        style={{ backgroundColor: currentStep.color + '15', borderColor: currentStep.color + '40' }}
      >
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0 text-white"
          style={{ backgroundColor: currentStep.color }}>
          <i className={currentStep.icon}></i>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-base">{currentStep.title}</h3>
          <p className="text-gray-500 text-sm mt-0.5">{currentStep.detail}</p>
        </div>
        {secondsElapsed < 30 && (
          <div className="text-right flex-shrink-0">
            <div className="text-2xl font-black text-gray-800">{30 - secondsElapsed}s</div>
            <div className="text-xs text-gray-400">left</div>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-linear bg-amber-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          <span className={secondsElapsed >= 0  ? 'text-amber-500' : ''}>Placed</span>
          <span className={secondsElapsed >= 10 ? 'text-amber-500' : ''}>Packed</span>
          <span className={secondsElapsed >= 15 ? 'text-amber-500' : ''}>On way</span>
          <span className={secondsElapsed >= 30 ? 'text-green-500' : ''}>Delivered ✓</span>
        </div>
      </div>

      {/* Leaflet Map */}
      <div
        ref={mapRef}
        className="rounded-xl overflow-hidden border-2 border-gray-100 flex-shrink-0"
        style={{ height: '280px', zIndex: 0 }}
      />

      {/* Timeline */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-3">Delivery Timeline</h3>
        <div className="space-y-1.5">
          {STEPS.map((step, idx) => {
            const isDone    = secondsElapsed >= step.time;
            const isCurrent = idx === currentStepIndex;
            return (
              <div
                key={idx}
                className={`flex items-center gap-3 p-2.5 rounded-lg transition-all duration-500 ${
                  isCurrent ? 'border' : ''
                } ${!isDone ? 'opacity-30' : ''}`}
                style={isCurrent ? { backgroundColor: step.color + '12', borderColor: step.color + '40' } : {}}
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs text-white transition-all"
                  style={{ backgroundColor: isDone ? step.color : '#e5e7eb' }}>
                  {isDone ? <i className="ri-check-line text-xs"></i> : <span className="text-gray-400 font-bold text-[10px]">{idx + 1}</span>}
                </div>
                <p className="text-xs font-semibold truncate" style={{ color: isCurrent ? step.color : isDone ? '#374151' : '#9ca3af' }}>
                  {step.title}
                </p>
                {isCurrent && secondsElapsed < 30 && (
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse ml-auto flex-shrink-0"
                    style={{ backgroundColor: step.color }} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
