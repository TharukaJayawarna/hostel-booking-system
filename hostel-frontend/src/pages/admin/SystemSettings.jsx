import React, { useEffect, useState } from 'react';
import api from '../../api/axiosConfig';
import { useNotification } from '../../context/NotificationContext';
import { Settings, Save, Shield } from 'lucide-react';

const SystemSettings = () => {
  const notify = useNotification();
  const [maxDays, setMaxDays] = useState('90');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings/max-days');
        if (res.data.status === 'SUCCESS') {
          setMaxDays(res.data.data);
        }
      } catch (e) {
        console.error("Using default max days");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    
    // Save කිරීමට පෙර අගය පරීක්ෂා කිරීම (Validation)
    if (!maxDays || parseInt(maxDays) < 1) {
        notify.error("Booking duration must be at least 1 day.");
        return;
    }

    try {
      await api.post('/settings/update', { MAX_BOOKING_DAYS: maxDays });
      notify.success("Booking duration updated!");
    } catch (e) {
      notify.error("Failed to update settings");
    }
  };

  const s = {
    container: { fontFamily: "'Inter', sans-serif", color: '#1f2937', paddingBottom: '40px' },
    header: { marginBottom: '30px' },
    title: { fontSize: '28px', fontWeight: '800', color: '#111827', display: 'flex', alignItems: 'center', gap: '12px' },
    card: { background: 'white', padding: '30px', borderRadius: '16px', border: '1px solid #e5e7eb', maxWidth: '600px' },
    inputGroup: { marginBottom: '20px' },
    label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#4b5563', marginBottom: '8px' },
    input: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none' },
    saveBtn: { background: '#4f46e5', color: 'white', padding: '12px 24px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }
  };

  return (
    <div style={s.container}>
      <div style={s.header}>
        <div style={s.title}>
          <div style={{background:'#e0e7ff', padding:'10px', borderRadius:'12px', color:'#4338ca'}}><Settings size={28}/></div>
          System Settings
        </div>
      </div>

      <div style={s.card}>
        <form onSubmit={handleSave}>
          <div style={{marginBottom:'20px', fontSize:'16px', fontWeight:'700', display:'flex', alignItems:'center', gap:'8px'}}>
             <Shield size={18} color="#dc2626"/> Booking Restrictions
          </div>
          
          <div style={s.inputGroup}>
            <label style={s.label}>Max Booking Duration (Days)</label>
            <input 
                type="number" 
                value={maxDays} 
                // 1. අගය වෙනස් වන විට ඍණ අගයක් දැයි පරීක්ෂා කිරීම
                onChange={(e) => {
                    const val = e.target.value;
                    // අගය හිස් නම් හෝ 0 ට වැඩි නම් පමණක් යාවත්කාලීන කරන්න
                    if (val === '' || parseInt(val) >= 0) {
                        setMaxDays(val);
                    }
                }}
                // 2. යතුරු පුවරුවෙන් ඍණ ලකුණ (-) සහ 'e' අකුර ටයිප් කිරීම වැළැක්වීම
                onKeyDown={(e) => {
                    if(e.key === '-' || e.key === 'e' || e.key === 'E') {
                        e.preventDefault();
                    }
                }}
                style={s.input} 
                min="1"
                placeholder="90"
            />
            <div style={{fontSize:'12px', color:'#9ca3af', marginTop:'5px'}}>
                Students cannot book a room for more than this number of days.
            </div>
          </div>

          <button type="submit" style={s.saveBtn}>
            <Save size={18}/> Update Settings
          </button>
        </form>
      </div>
    </div>
  );
};

export default SystemSettings;