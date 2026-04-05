import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../supabaseClient';

// Delivery timeline steps
const STEPS = [
  { id: 'confirmed', icon: 'ri-check-double-line', title: 'Order Confirmed', detail: 'The restaurant has received your order', color: '#10b981' },
  { id: 'preparing', icon: 'ri-restaurant-line', title: 'Preparing your meal', detail: 'Our chefs are working their magic', color: '#f59e0b' },
  { id: 'dispatched', icon: 'ri-e-bike-2-line', title: 'On the way!', detail: 'Ramesh has picked up your order', color: '#3b82f6' },
  { id: 'delivered', icon: 'ri-home-heart-line', title: 'Delivered!', detail: 'Enjoy your meal! 🎉', color: '#10b981' },
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

export default function CurrentOrders({ orderId, orderTotal, onOrderComplete, dispatchedAt }) {
  const mapRef     = useRef(null);   // DOM node
  const leafletRef = useRef(null);   // L.map instance
  const bikeMarker = useRef(null);
  const completedRef = useRef(false);
  const [prepProgress, setPrepProgress] = useState(0);
  const [deliveryProgress, setDeliveryProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const totalPrepTime = 30; // 30 seconds for demo prep
  const totalDeliveryTime = 30; // 30 seconds for demo delivery

  useEffect(() => {
    const updateProgress = () => {
      // Fetch current status from DB
      supabase
        .from('orders')
        .select('order_status, dispatched_at, order_date')
        .eq('order_id', orderId)
        .maybeSingle()
        .then(({ data }) => {
          if (!data) return;

          const status = data.order_status;
          const orderTime = new Date(data.order_date).getTime();
          const now = new Date().getTime();
          const elapsedFromOrder = Math.floor((now - orderTime) / 1000);

          if (['Pending', 'Confirmed', 'Preparing'].includes(status)) {
            const progress = Math.min((elapsedFromOrder / totalPrepTime) * 100, 99);
            setPrepProgress(progress);
            setCurrentStepIndex(status === 'Preparing' ? 1 : 0);
          } else if (status === 'Dispatched') {
            setPrepProgress(100);
            const dispatchTime = new Date(data.dispatched_at).getTime();
            const elapsedFromDispatch = Math.floor((now - dispatchTime) / 1000);
            const progress = Math.min((elapsedFromDispatch / totalDeliveryTime) * 100, 100);
            setDeliveryProgress(progress);
            setCurrentStepIndex(2);

            // Move bike marker (0-100% of delivery)
            if (leafletRef.current) {
              const t = progress / 100;
              const pos = interpolate(RESTAURANT_POS, HOME_POS, t);
              if (!bikeMarker.current) {
                bikeMarker.current = L.marker(pos, {
                  icon: L.divIcon({
                    html: `<div style="background:#3b82f6;color:white;border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 2px 10px rgba(0,0,0,0.4);animation:pulse 1s infinite">🛵</div>`,
                    className: '', iconAnchor: [20, 20],
                  }),
                }).addTo(leafletRef.current).bindPopup('<b>Ramesh</b><br/>On the way!');
              } else {
                bikeMarker.current.setLatLng(pos);
              }
              leafletRef.current.panTo(pos, { animate: true });
            }

            // Auto-complete demo
            if (progress >= 100 && !completedRef.current) {
              completedRef.current = true;
              supabase.from('orders').update({ order_status: 'Delivered' }).eq('order_id', orderId).then(() => {
                if (onOrderComplete) onOrderComplete();
              });
            }
          } else if (status === 'Delivered') {
            setPrepProgress(100);
            setDeliveryProgress(100);
            setCurrentStepIndex(3);
          }
        });
    };

    updateProgress();
    const interval = setInterval(updateProgress, 2000); // Poll every 2s
    return () => clearInterval(interval);
  }, [orderId, onOrderComplete]);
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
          <div className={`w-2.5 h-2.5 rounded-full ${deliveryProgress < 100 ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
          <span className={`text-xs font-bold uppercase tracking-wider ${deliveryProgress < 100 ? 'text-green-600' : 'text-gray-400'}`}>
            {deliveryProgress < 100 ? 'Live Tracking' : 'Delivered'}
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
        {deliveryProgress < 100 && deliveryProgress > 0 && (
          <div className="text-right flex-shrink-0">
            <div className="text-2xl font-black text-gray-800">{Math.ceil(totalDeliveryTime * (1 - deliveryProgress/100))}s</div>
            <div className="text-xs text-gray-400">left</div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div>
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex justify-between">
              Preparation <span>{Math.round(prepProgress)}%</span>
           </p>
           <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
             <div className="h-full rounded-full transition-all duration-700 bg-amber-500" style={{ width: `${prepProgress}%` }} />
           </div>
        </div>
        <div>
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex justify-between">
              Delivery <span>{Math.round(deliveryProgress)}%</span>
           </p>
           <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
             <div className="h-full rounded-full transition-all duration-700 bg-blue-500" style={{ width: `${deliveryProgress}%` }} />
           </div>
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
            const isDone    = idx < currentStepIndex || (idx === 3 && deliveryProgress === 100);
            const isCurrent = idx === currentStepIndex;
            return (
              <div
                key={idx}
                className={`flex items-center gap-3 p-2.5 rounded-lg transition-all duration-500 ${
                  isCurrent ? 'border' : ''
                } ${!isDone && !isCurrent ? 'opacity-30' : ''}`}
                style={isCurrent ? { backgroundColor: step.color + '12', borderColor: step.color + '40' } : {}}
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs text-white transition-all"
                  style={{ backgroundColor: isDone || isCurrent ? step.color : '#e5e7eb' }}>
                  {isDone ? <i className="ri-check-line text-xs"></i> : <span className="text-gray-400 font-bold text-[10px]">{idx + 1}</span>}
                </div>
                <p className="text-xs font-semibold truncate" style={{ color: isCurrent ? step.color : isDone ? '#374151' : '#9ca3af' }}>
                  {step.title}
                </p>
                {isCurrent && (
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
