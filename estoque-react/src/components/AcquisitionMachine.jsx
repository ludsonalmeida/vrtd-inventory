// src/components/AcquisitionMachine.jsx
import { useEffect, useRef } from 'react';

export default function AcquisitionMachine({
  metaPixelId,
  brand = 'Porks Sobradinho',
  cookieDays = 365,
}) {
  const trackedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const K = {
      consent: 'ma_consent_v1',
      visits:  'ma_visit_count_v1',
      first:   'ma_first_seen_v1',
      banner:  'ma_banner_dismissed_v1',
    };

    const setCookie = (name, value, days) => {
      try {
        const d = new Date();
        d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
        const expires = 'expires=' + d.toUTCString();
        const host = location.hostname;
        const domain = host.startsWith('www.') ? host.slice(4) : host;
        document.cookie = `${name}=${encodeURIComponent(value)};${expires};path=/;SameSite=Lax;domain=${domain}`;
      } catch {}
    };

    const getCookie = (name) => {
      try {
        const n = name + '=';
        const parts = document.cookie.split(';');
        for (let c of parts) {
          c = c.trim();
          if (c.indexOf(n) === 0) return decodeURIComponent(c.substring(n.length));
        }
      } catch {}
      return null;
    };

    const setLS = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
    const getLS = (k) => {
      try {
        const v = localStorage.getItem(k);
        return v ? JSON.parse(v) : null;
      } catch { return null; }
    };

    const saveKV = (key, val) => { setCookie(key, val, cookieDays); setLS(key, val); };
    const readKV = (key) => {
      const vCookie = getCookie(key);
      if (vCookie !== null) { setLS(key, vCookie); return vCookie; }
      const vLS = getLS(key);
      if (vLS !== null) { setCookie(key, vLS, cookieDays); return vLS; }
      return null;
    };

    const loadMetaPixel = (pixelId) => {
      if (!pixelId || window.__MA_FB_INIT__) return;
      (function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
        n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)})(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
      try {
        window.fbq('init', pixelId);
        window.fbq('track', 'PageView');
        window.__MA_FB_INIT__ = true;
      } catch {}
    };

    const trackMeta = (name, params) => {
      try { window.fbq && window.fbq('trackCustom', name, params || {}); } catch {}
    };

    const bumpVisitCount = () => {
      let visits = Number(readKV(K.visits) || 0);
      const firstSeen = readKV(K.first);
      if (!firstSeen) {
        saveKV(K.first, Date.now().toString());
        visits = 1;
      } else {
        visits = Math.max(1, visits + 1);
      }
      saveKV(K.visits, String(visits));
      return visits;
    };

    const getStatus = (v) => (v === 1 ? 'NewCustomer' : 'RecurringCustomer');

    const initTrackingFlow = () => {
      if (trackedRef.current) return; // evita duplicar no mesmo load
      trackedRef.current = true;

      const visits = bumpVisitCount();
      const status = getStatus(visits);

      loadMetaPixel(metaPixelId);

      const baseParams = { brand, customerStatus: status, visitNumber: visits };
      trackMeta('MenuOpen', baseParams);
      if (visits === 1) trackMeta('NewCustomer', baseParams);
      else              trackMeta('RecurringCustomer', baseParams);
    };

    // Já aceitou? (seu fluxo salva em LS/cookie)
    const consentOk =
      readKV(K.consent) === 'granted' ||
      localStorage.getItem('cardapio/lgpdConsent') === '1' ||
      getCookie('lgpd_consent') === 'true';

    if (consentOk) initTrackingFlow();

    // Quando a tela de unidade aceitar, você já dispara esse evento no CardapioLayout
    const onGranted = () => { saveKV(K.consent, 'granted'); initTrackingFlow(); };
    window.addEventListener('ma:consent-granted', onGranted);

    return () => {
      window.removeEventListener('ma:consent-granted', onGranted);
    };
  }, [metaPixelId, brand, cookieDays]);

  return null; // headless
}
