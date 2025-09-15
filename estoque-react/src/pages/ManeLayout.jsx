import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  IconButton,
  BottomNavigation,
  BottomNavigationAction,
  useTheme,
  useMediaQuery,
  Divider,
  Fade,
  InputBase,
  Tooltip,
  GlobalStyles,
  Chip,
  Skeleton,
  Slide,
  Button,
  Rating,
  Modal,
} from '@mui/material';
import { keyframes } from '@mui/system';

import HomeIcon from '@mui/icons-material/Home';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';

const palette = {
  page: '#FFFFFF',
  cream: '#FBF5E9',
  bannerRed: '#E6564F',
  headerGreen: '#0F5132',
  textPrimary: '#12100B',
  textMuted: '#7D8B84',
  divider: '#E8E0D3',
  ring: '#0F7B4D',
  heart: '#E05657',
  promoBg: '#FFE8E6',
  promoFg: '#C63830',
};

const SIZES = { thumb: 104, actionsCol: 56, title: 15.5, price: 14.5 };
const NAV_H = 'calc(64px + env(safe-area-inset-bottom))';
const SINGLE_UNIT = 'Sobradinho, Distrito Federal';

const GA_ID = import.meta.env?.VITE_GA_ID || 'G-XXXXXXXXXX';
const FB_PIXEL_ID = import.meta.env?.VITE_FB_PIXEL_ID || '000000000000000';

/* ===================== HELPERS: LGPD + NEW/RECURRING ===================== */
const CONSENT_KEY = 'cardapio/lgpdConsent';         // '1' => consentido
const CID_KEY     = 'cardapio/customer_id';         // ID único do cliente
const VISITS_KEY  = 'cardapio/visits';              // contador total
const FIRST_KEY   = 'cardapio/first_visit_mark';    // flag de 1ª visita (vira returning depois)
const COOKIE_DAYS = 395;                            // ~13 meses
const SESSION_MARK = 'cardapio/session/visit_counted'; // evita contar 2x por sessão

function setCookie(name, value, days){
  try{
    const d = new Date(); d.setTime(d.getTime() + days*24*60*60*1000);
    let cookie = `${name}=${encodeURIComponent(value)}; expires=${d.toUTCString()}; path=/; SameSite=Lax`;
    if (location.protocol === 'https:') cookie += '; Secure';
    document.cookie = cookie;
  }catch{}
}
function getCookie(name){
  try{
    const parts = document.cookie ? document.cookie.split(';') : [];
    const prefix = name + '=';
    for (let i=0;i<parts.length;i++){
      const c = parts[i].trim();
      if (c.indexOf(prefix) === 0) return decodeURIComponent(c.substring(prefix.length));
    }
  }catch{}
  return null;
}
function delCookie(name){
  try{ document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`; }catch{}
}

function lsGet(k){ try{ return localStorage.getItem(k); }catch{ return null; } }
function lsSet(k,v){ try{ localStorage.setItem(k,v); }catch{} }
function lsDel(k){ try{ localStorage.removeItem(k); }catch{} }

function genId(){
  try{ return crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()); }
  catch{ return String(Date.now()); }
}
function ensureCustomerId(){
  let id = lsGet(CID_KEY) || getCookie(CID_KEY);
  if (!id){ id = genId(); lsSet(CID_KEY, id); setCookie(CID_KEY, id, COOKIE_DAYS); }
  if (!getCookie(CID_KEY)) setCookie(CID_KEY, id, COOKIE_DAYS);
  return id;
}
function getCustomerStatus(){ return getCookie(FIRST_KEY) ? 'returning' : 'new'; }
function markFirstIfNeeded(){ if (!getCookie(FIRST_KEY)) setCookie(FIRST_KEY, '1', COOKIE_DAYS); }
function getVisits(){
  const v = parseInt(lsGet(VISITS_KEY) || getCookie(VISITS_KEY) || '0', 10);
  return Number.isFinite(v) ? v : 0;
}
function incrementVisits(){
  const n = getVisits() + 1;
  lsSet(VISITS_KEY, String(n));
  setCookie(VISITS_KEY, String(n), COOKIE_DAYS);
  return n;
}
function withCustomerStatus(obj = {}){ return { ...obj, customer_status: getCustomerStatus() }; }

/* ===================== Review (Google) ===================== */
const GOOGLE_REVIEW_CID = '2138163599891563158'; // Porks Sobradinho
const REVIEW_URLS = [
  `https://search.google.com/local/writereview?cid=${GOOGLE_REVIEW_CID}&hl=pt-BR`,
  `https://www.google.com/maps?cid=${GOOGLE_REVIEW_CID}&hl=pt-BR`,
  `https://www.google.com.br/maps?cid=${GOOGLE_REVIEW_CID}&hl=pt-BR`,
];

function GoogleGlyph({ size = 22 }) {
  return (
    <Box sx={{ width: size, height: size, display: 'inline-flex' }} aria-hidden>
      <svg viewBox="0 0 48 48" width={size} height={size}>
        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 36 24 36c-6.6 0-12-5.4-12-12S17.4 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C33.9 6.3 29.2 4 24 4 16.1 4 9.4 8.5 6.3 14.7z" />
        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16.2 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C33.9 6.3 29.2 4 24 4 16.1 4 9.4 8.5 6.3 14.7z" />
        <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.7 13.6-4.7l-6.3-5.2C29.3 36 26.8 37 24 37c-5.2 0-9.6-3.5-11.1-8.2l-6.6 5.1C9.4 39.5 16.1 44 24 44z" />
        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.4-4.2 6-8.3 6-3.1 0-5.9-1.8-7.2-4.4l-6.6 5.1C15.4 39.5 19.5 42 24 42c10.4 0 19-7.5 19-20 0-1.1-.1-2.3-.4-3.5z" />
      </svg>
    </Box>
  );
}

/* ===================== Slides & Items (mock) ===================== */
const slides = [
  { title1: 'Queridinhos', title2: 'dos Chefs', desc: 'Sábado, domingo e feriados — O dia todo', image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=1200&q=80&auto=format&fit=crop' },
  { title1: 'Festival de', title2: 'Massas', desc: 'Clássicos italianos com 20% OFF', image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=1200&q=80&auto=format&fit=crop' },
  { title1: 'Churrasco', title2: 'Premium', desc: 'Cortes nobres na brasa', image: 'https://images.unsplash.com/photo-1558036117-15d82a90b9b3?w=1200&q=80&auto=format&fit=crop' },
];

const sampleItems = [
  { id: 'poke', title: 'Jurassine de Cupim', subtitle: 'Cupim e cebola caramelizada. Tomilho, salsa de kimchi, carne desfiada...', subtitle2: 'Acompanha batatas chips com creme de mostarda.', price: '49.00', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&q=80&auto=format&fit=crop', liked: false },
  { id: 'tabua', title: 'Tábua N°1 para Compartilhar', subtitle: 'BSB Grill', subtitle2: 'Bife ancho, bife …', price: '289.00', image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=1200&q=80&auto=format&fit=crop', liked: false },
  { id: 'camarao', title: 'Nosso Camarão Internacional', subtitle: 'Casa Mar', subtitle2: '', price: '129.90', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80&auto=format&fit=crop', liked: false },
];

const samplePromos = [
  { id: 'promo-pizza', title: 'Pizza Margherita', subtitle: 'Forno Nápoles', subtitle2: 'Massa fina, tomate e manjericão.', price: '39.90', oldPrice: '54.90', image: 'https://images.unsplash.com/photo-1548365328-9f547fb0953c?w=1000&q=80&auto=format&fit=crop', liked: false },
  { id: 'promo-pasta', title: 'Penne ao Ragu', subtitle: 'Trattoria Bella', subtitle2: 'Ragu de carne cozido lentamente.', price: '47.90', oldPrice: '62.90', image: 'https://images.unsplash.com/photo-1542444459-db63c1f6a68d?w=1000&q=80&auto=format&fit=crop', liked: false },
  { id: 'promo-burg', title: 'Burger Artesanal Cheddar', subtitle: 'Smoke House', subtitle2: 'Pão brioche, cheddar e bacon.', price: '29.90', oldPrice: '41.90', image: 'https://images.unsplash.com/photo-1551782450-17144c3aee06?w=1000&q=80&auto=format&fit=crop', liked: false },
];

/* ===================== Analytics (GA4 + Meta) com consent/ID/visitas ===================== */
const Analytics = (() => {
  let inited = false;

  const loadScript = (src, id) =>
    new Promise((resolve, reject) => {
      if (id && document.getElementById(id)) return resolve();
      const s = document.createElement('script');
      if (id) s.id = id;
      s.async = true;
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });

  const init = async () => {
    if (inited) return;
    const consent = localStorage.getItem(CONSENT_KEY) === '1';
    if (!consent) return;

    // GA4
    if (!window.dataLayer) window.dataLayer = [];
    if (!window.gtag) { window.gtag = function () { window.dataLayer.push(arguments); }; }
    await loadScript(`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`, 'ga4-script');
    window.gtag('js', new Date());
    // evita page_view duplicado
    window.gtag('config', GA_ID, { send_page_view: false });

    // Meta Pixel
    if (!window.fbq) {
      const n = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      n.queue = []; n.loaded = true; n.version = '2.0'; window.fbq = n;
      await loadScript('https://connect.facebook.net/en_US/fbevents.js', 'fb-pixel-script');
    }
    window.fbq('init', FB_PIXEL_ID);

    inited = true;
  };

  const initIfNeeded = () => init();

  const consentGranted = () => {
    // Atualiza consent (se GA já existir)
    try {
      window.gtag?.('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
      });
    } catch {}
    try { window.fbq?.('consent', 'grant'); } catch {}
  };

  // Identifica cliente + incrementa visita (apenas 1x por sessão)
  const identifyAndCount = () => {
    if (localStorage.getItem(CONSENT_KEY) !== '1') return null;
    if (sessionStorage.getItem(SESSION_MARK) === '1') {
      // já contamos nesta sessão
      const customer_id = lsGet(CID_KEY) || getCookie(CID_KEY) || '';
      return { customer_id, customer_status: getCustomerStatus(), visits: getVisits() };
    }

    const customer_id     = ensureCustomerId();
    const customer_status = getCustomerStatus(); // 'new' | 'returning'
    const visits          = incrementVisits();
    if (customer_status === 'new') markFirstIfNeeded();

    sessionStorage.setItem(SESSION_MARK, '1');

    // dataLayer (útil para debug/integrações)
    try { window.dataLayer?.push({ event: 'customer_identified', customer_id, status: customer_status, visits }); } catch {}
    try { window.dataLayer?.push({ event: 'visit_counted', visits, first_time: visits === 1 }); } catch {}

    // Meta
    try { window.fbq?.('trackCustom', 'CustomerIdentified', { customer_id, status: customer_status, visits }); } catch {}
    try { window.fbq?.('trackCustom', 'VisitCounted', { visits, first_time: visits === 1 }); } catch {}

    // GA4
    try { window.gtag?.('event', 'customer_identified', { vrtd_customer_id: customer_id, status: customer_status, visits }); } catch {}
    try { window.gtag?.('event', 'visit_counted', { visits, first_time: visits === 1 ? 'true' : 'false' }); } catch {}

    return { customer_id, customer_status, visits };
  };

  // Eventos padrão (com customer_status no Meta)
  const page = ({ name }) => {
    try {
      window.gtag?.('event', 'page_view', {
        page_title: name,
        page_location: window.location.href,
        page_path: window.location.pathname,
      });
    } catch {}
    try { window.fbq?.('track', 'PageView', withCustomerStatus()); } catch {}
  };

  const viewItem = (item) => {
    const price = parseFloat(item.price) || 0;
    try {
      window.gtag?.('event', 'view_item', {
        currency: 'BRL',
        value: price,
        items: [{ item_id: item.id, item_name: item.title, item_category: item.subtitle || '', price }],
      });
    } catch {}
    try {
      window.fbq?.('track', 'ViewContent', withCustomerStatus({
        content_ids: [item.id],
        content_name: item.title,
        content_type: 'product',
        value: price,
        currency: 'BRL'
      }));
    } catch {}
  };

  const like = (item, liked) => {
    const price = parseFloat(item.price) || 0;
    try {
      window.gtag?.('event', liked ? 'add_to_wishlist' : 'remove_from_wishlist', {
        currency: 'BRL',
        value: price,
        items: [{ item_id: item.id, item_name: item.title, item_category: item.subtitle || '', price }],
      });
    } catch {}
    try {
      if (liked) {
        window.fbq?.('track', 'AddToWishlist', withCustomerStatus({
          content_ids: [item.id], content_name: item.title, content_type: 'product', value: price, currency: 'BRL'
        }));
      } else {
        window.fbq?.('trackCustom', 'RemoveFromWishlist', withCustomerStatus({
          content_ids: [item.id], content_name: item.title
        }));
      }
    } catch {}
  };

  const selectUnit = (unit) => {
    try { window.gtag?.('event', 'select_location', { location_id: unit }); } catch {}
    try { window.fbq?.('trackCustom', 'SelectLocation', withCustomerStatus({ location: unit })); } catch {}
  };

  const rate = (item, stars) => {
    try {
      window.gtag?.('event', 'rate_item', {
        value: stars,
        items: [{ item_id: item.id, item_name: item.title }],
      });
    } catch {}
    try {
      window.fbq?.('trackCustom', 'RateItem', withCustomerStatus({
        content_ids: [item.id], content_name: item.title, value: stars
      }));
    } catch {}
  };

  return { init, initIfNeeded, consentGranted, identifyAndCount, page, viewItem, like, selectUnit, rate };
})();

/* ===================== UI animations ===================== */
const pop = keyframes`0%{transform:scale(1)}35%{transform:scale(1.28)}100%{transform:scale(1)}`;
const ringExpand = keyframes`0%{transform:scale(.4);opacity:.55}70%{transform:scale(1.6);opacity:.12}100%{transform:scale(1.9);opacity:0}`;
const makeParticle = (dx, dy) => keyframes`0%{transform:translate(0,0);opacity:1}100%{transform:translate(${dx}px,${dy}px);opacity:0}`;
const appear = keyframes`0%{opacity:0;transform:translateY(8px)}100%{opacity:1;transform:translateY(0)}`;
const fadeIn = keyframes`0%{opacity:0}100%{opacity:1}`;
const skBg = '#E8E5DB';

/* ---- HEART ---- */
function HeartBurst({ liked, onClick, withTooltip = false, tooltipOpen = false, tooltipRef = null, burstKey = 0 }) {
  const particles = Array.from({ length: 8 }).map((_, i) => {
    const angle = (i / 8) * Math.PI * 2, r = 22;
    const kf = makeParticle(Math.cos(angle) * r, Math.sin(angle) * r);
    return <Box key={`${burstKey}-${i}`} sx={{ position: 'absolute', left: '50%', top: '50%', width: 5, height: 5, borderRadius: '50%', bgcolor: palette.heart, transform: 'translate(-50%,-50%)', animation: `${kf} 520ms ease-out forwards`, pointerEvents: 'none' }} />;
  });
  const icon = liked
    ? <FavoriteIcon sx={{ color: palette.heart, animation: burstKey ? `${pop} 360ms ease-out` : 'none' }} />
    : <FavoriteBorderIcon sx={{ color: '#9AA0A6', animation: burstKey ? `${pop} 360ms ease-out` : 'none' }} />;
  const btn =
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      {burstKey ? <Box sx={{ position: 'absolute', inset: -2, borderRadius: '999px', border: `2px solid ${palette.heart}`, animation: `${ringExpand} 620ms ease-out`, pointerEvents: 'none' }} /> : null}
      {burstKey ? particles : null}
      <IconButton size="small" onClick={onClick} sx={{ p: 0.5, position: 'relative', zIndex: 1 }} aria-label="favoritar" ref={tooltipRef}>
        {icon}
      </IconButton>
    </Box>;
  return withTooltip ? (
    <Tooltip
      title="Favorite-me!"
      placement="top"
      arrow
      open={tooltipOpen}
      PopperProps={{ disablePortal: false }}
      slotProps={{
        tooltip: {
          sx: {
            bgcolor: palette.heart,
            color: '#fff',
            fontWeight: 700,
            fontSize: 12,
            px: 1.25,
            py: 0.75,
            borderRadius: 1.5,
            boxShadow: '0 8px 24px rgba(0,0,0,.25)',
          },
        },
        arrow: { sx: { color: palette.heart } },
      }}
    >
      {btn}
    </Tooltip>
  ) : btn;
}

/* ---- SKELETONS ---- */
const RowSkeleton = () => (
  <Box sx={{ py: 1, display: 'grid', gridTemplateColumns: `${SIZES.thumb}px minmax(0,1fr) ${SIZES.actionsCol}px`, columnGap: 1.5, alignItems: 'center' }}>
    <Skeleton variant="rounded" width={SIZES.thumb} height={SIZES.thumb} sx={{ borderRadius: 2, bgcolor: skBg }} animation="wave" />
    <Box sx={{ minWidth: 0, mr: 1 }}>
      <Skeleton variant="text" width="80%" height={20} sx={{ bgcolor: skBg }} animation="wave" />
      <Skeleton variant="text" width="60%" height={18} sx={{ bgcolor: skBg }} animation="wave" />
      <Skeleton variant="text" width="40%" height={18} sx={{ bgcolor: skBg }} animation="wave" />
      <Skeleton variant="text" width="30%" height={20} sx={{ mt: .4, bgcolor: skBg }} animation="wave" />
    </Box>
    <Box sx={{ display: 'flex', gap: 1, justifySelf: 'end', alignItems: 'center' }}>
      <Skeleton variant="circular" width={18} height={18} sx={{ bgcolor: skBg }} animation="wave" />
      <Skeleton variant="circular" width={24} height={24} sx={{ bgcolor: skBg }} animation="wave" />
    </Box>
  </Box>
);

const SectionSkeleton = ({ rows = 3 }) => (
  <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, backgroundColor: palette.cream, border: 'none' }}>
    <Skeleton variant="text" width="40%" height={28} sx={{ mb: 1.5, bgcolor: skBg }} animation="wave" />
    {Array.from({ length: rows }).map((_, i) => (
      <Box key={i}>
        <RowSkeleton />
        {i < rows - 1 && <Divider sx={{ my: .5, borderColor: palette.divider }} />}
      </Box>
    ))}
  </Paper>
);

const SearchRowSkeleton = () => (
  <Box sx={{ display: 'grid', gridTemplateColumns: '64px 1fr 40px', columnGap: 1.5, alignItems: 'center', py: 1 }}>
    <Skeleton variant="rounded" width={64} height={64} sx={{ borderRadius: 2, bgcolor: skBg }} animation="wave" />
    <Box>
      <Skeleton variant="text" width="70%" height={18} sx={{ bgcolor: skBg }} animation="wave" />
      <Skeleton variant="text" width="50%" height={16} sx={{ bgcolor: skBg }} animation="wave" />
    </Box>
    <Skeleton variant="circular" width={28} height={28} sx={{ bgcolor: skBg }} animation="wave" />
  </Box>
);

/* ---- GATE ---- */
function UnitConsentScreen({ onAccepted }) {
  const [show] = useState(true);
  const acceptAndContinue = async () => {
    const unit = SINGLE_UNIT;

    // dá o consent
    localStorage.setItem(CONSENT_KEY, '1');
    localStorage.setItem('cardapio/unit', unit);
    try { document.cookie = `lgpd_consent=true; Max-Age=${60 * 60 * 24 * 180}; Path=/; SameSite=Lax`; } catch {}

    // carrega tags e atualiza consent depois de carregar
    await Analytics.init();
    Analytics.consentGranted();

    // identifica + conta visita (1x por sessão)
    Analytics.identifyAndCount();

    // evento de seleção de unidade
    Analytics.selectUnit(unit);

    // opcional: dataLayer informativo
    try { window.dataLayer?.push({ event: 'lgpd_consent_granted', unit }); } catch {}

    onAccepted(unit);
  };
  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: palette.headerGreen,
      color: '#fff',
      position: 'relative',
      pt: 'calc(env(safe-area-inset-top) + 28px)',
      pb: 'calc(env(safe-area-inset-bottom) + 120px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Typography sx={{ fontFamily: "'Alfa Slab One', Georgia, serif", fontSize: 48, lineHeight: .9 }}>ma</Typography>
        <Typography sx={{ fontFamily: "'Alfa Slab One', Georgia, serif", fontSize: 48, lineHeight: .9, mt: -1 }}>né</Typography>
      </Box>
      <Typography sx={{ opacity: .85, mt: 4, px: 3, textAlign: 'center' }}>
        Selecione a unidade para continuar.
      </Typography>
      <Slide direction="up" in={show}>
        <Paper elevation={12} sx={{
          position: 'fixed',
          left: 0, right: 0, bottom: 0,
          borderTopLeftRadius: 16, borderTopRightRadius: 16,
          p: 2,
          bgcolor: '#fff',
          color: palette.textPrimary,
          pb: 'calc(env(safe-area-inset-bottom) + 12px)',
        }}>
          <Typography sx={{ fontWeight: 700, mb: 1, color: palette.headerGreen }}>
            Escolha a unidade
          </Typography>
          <Paper
            variant="outlined"
            onClick={acceptAndContinue}
            sx={{
              borderColor: '#EEE6D7',
              backgroundColor: '#fff',
              borderRadius: 2,
              p: 1,
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              '&:active': { transform: 'scale(0.995)' },
              transition: 'transform .06s ease',
            }}
          >
            <Box sx={{ width: 34, display: 'grid', placeItems: 'center' }}>
              <LocationOnRoundedIcon sx={{ color: palette.ring }} />
            </Box>
            <Typography sx={{ flex: 1, fontWeight: 700, color: palette.textPrimary }}>
              {SINGLE_UNIT}
            </Typography>
            <KeyboardArrowRightRoundedIcon sx={{ color: '#9AA0A6' }} />
          </Paper>
          <Typography sx={{ color: '#7A7A7A', fontSize: 12, mt: 1.25 }}>
            Ao tocar na unidade, você aceita a LGPD, o uso de cookies e o tratamento de dados para personalização e conversões.
          </Typography>
        </Paper>
      </Slide>
    </Box>
  );
}

/* ---- Helpers de busca (JS puro) ---- */
const normalize = (s) =>
  (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const tokenize = (s) =>
  normalize(s).split(/[^a-z0-9]+/).filter(Boolean);

/* ---- INNER ---- */
function CardapioInner() {
  const [nav, setNav] = useState('inicio');
  const savedFavIds = (() => { try { return JSON.parse(localStorage.getItem('cardapio/favs') || '[]'); } catch { return []; } })();
  const [items, setItems] = useState(() => sampleItems.map(it => ({ ...it, liked: savedFavIds.includes(it.id) })));
  const [promos, setPromos] = useState(() => samplePromos.map(it => ({ ...it, liked: savedFavIds.includes(it.id) })));
  const [loading, setLoading] = useState(true);
  const [slide, setSlide] = useState(0);
  const firstHeartRef = useRef(null);
  const [tipOpen, setTipOpen] = useState(false);
  const [burstMap, setBurstMap] = useState({});
  const [likedFlash, setLikedFlash] = useState({});
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [detail, setDetail] = useState(null);
  const [ratings, setRatings] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cardapio/ratings') || '{}'); } catch { return {}; }
  });
  const [notice, setNotice] = useState(null); // { item, stars }
  const [reviewSheetOpen, setReviewSheetOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const openReviewFlow = async () => {
    const shareUrl = REVIEW_URLS[1];
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Avaliar no Google',
          text: 'Deixe sua recomendação para o Porks Sobradinho',
          url: shareUrl,
        });
        return;
      } catch {}
    }
    setReviewSheetOpen(true);
  };

  const copyReviewLink = async () => {
    try {
      await navigator.clipboard.writeText(REVIEW_URLS[1]);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt('Copie o link abaixo:', REVIEW_URLS[1]);
    }
  };

  // Inicia tags se já houver consent e identifica/conta 1x por sessão
  useEffect(() => {
    Analytics.initIfNeeded().then(() => {
      if (localStorage.getItem(CONSENT_KEY) === '1') {
        Analytics.identifyAndCount();
      }
      Analytics.page({ name: 'inicio' });
    });
  }, []);

  useEffect(() => { const t = setTimeout(() => setLoading(false), 1500); return () => clearTimeout(t); }, []);
  useEffect(() => { const id = setInterval(() => setSlide(s => (s + 1) % slides.length), 5000); return () => clearInterval(id); }, []);
  useEffect(() => { const id = requestAnimationFrame(() => { if (firstHeartRef.current) setTipOpen(true); }); return () => cancelAnimationFrame(id); }, [items.length]);
  useEffect(() => {
    const likedIds = [...items, ...promos].filter(x => x.liked).map(x => x.id);
    try { localStorage.setItem('cardapio/favs', JSON.stringify(likedIds)); } catch {}
    try { document.cookie = `cardapio/favs=${encodeURIComponent(likedIds.join(','))}; Max-Age=${60 * 60 * 24 * 180}; Path=/; SameSite=Lax`; } catch {}
  }, [items, promos]);
  useEffect(() => { Analytics.page({ name: nav }); }, [nav]);

  /* Busca: debounced e prefixo por palavra (acento-insensível) */
  useEffect(() => {
    if (!searchOpen) return;
    const q = normalize(searchText);
    if (!q) { setSearchResults([]); setSearchLoading(false); return; }
    setSearchLoading(true);

    const run = () => {
      const all = [...items, ...promos];
      const terms = q.split(' ').filter(Boolean);

      const scoreItem = (it) => {
        const text = `${it.title} ${it.subtitle || ''} ${it.subtitle2 || ''}`;
        const toks = tokenize(text);
        let score = 0;
        for (const t of terms) {
          const inTitleTokens = tokenize(it.title).some(tok => tok.startsWith(t));
          const inAnyTokens = toks.some(tok => tok.startsWith(t));
          const inAnyText = normalize(text).includes(t);
          if (inTitleTokens) score += 3;
          else if (inAnyTokens) score += 2;
          else if (inAnyText) score += 1;
          else return -1;
        }
        if (it.liked) score += 0.25;
        return score;
      };

      const matched = all
        .map(it => ({ it, score: scoreItem(it) }))
        .filter(x => x.score >= 0)
        .sort((a, b) => b.score - a.score)
        .map(x => x.it);

      setSearchResults(matched);
      setSearchLoading(false);
    };

    const t = setTimeout(run, 180);
    return () => clearTimeout(t);
  }, [searchText, searchOpen, items, promos]);

  const triggerBurst = (id) => {
    setBurstMap(m => {
      const next = (m[id] || 0) + 1;
      setTimeout(() => setBurstMap(mm => { const cp = { ...mm }; delete cp[id]; return cp; }), 700);
      return { ...m, [id]: next };
    });
  };
  const isLiked = (id) =>
    items.some(i => i.id === id && i.liked) || promos.some(p => p.id === id && p.liked);
  const toggleLikeById = (id) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, liked: !it.liked } : it));
    setPromos(prev => prev.map(it => it.id === id ? { ...it, liked: !it.liked } : it));
  };
  const handleFavoriteClick = (item, e) => {
    e?.stopPropagation();

    const wasLiked = isLiked(item.id);

    triggerBurst(item.id);
    if (tipOpen) setTipOpen(false);

    toggleLikeById(item.id);

    const nowLiked = !wasLiked;

    if (!wasLiked) {
      setLikedFlash(m => ({ ...m, [item.id]: true }));
      setTimeout(() => setLikedFlash(m => { const cp = { ...m }; delete cp[item.id]; return cp; }), 900);

      setRatings(prev => {
        const next = { ...prev, [item.id]: 0 };
        try { localStorage.setItem('cardapio/ratings', JSON.stringify(next)); } catch {}
        return next;
      });
    }

    Analytics.like(item, nowLiked);
  };
  const openSearch = () => setSearchOpen(true);
  const closeSearch = () => { setSearchOpen(false); setSearchLoading(false); setSearchText(''); setSearchResults([]); };
  const openDetail = (it) => { setDetail(it); Analytics.viewItem(it); };
  const closeDetail = () => setDetail(null);

  const handleRate = (item, value, e) => {
    e?.stopPropagation?.();
    const stars = Number(value) || 0;
    setRatings(prev => {
      const next = { ...prev, [item.id]: stars };
      try { localStorage.setItem('cardapio/ratings', JSON.stringify(next)); } catch {}
      return next;
    });
    setNotice({ item, stars });
    Analytics.rate(item, stars);
  };

  const favorites = [...items, ...promos].filter(x => x.liked);
  const showSugSkel = loading || items.length === 0;
  const showPromoSkel = loading || promos.length === 0;

  const handleOpenFromSearch = (it) => {
    closeSearch();
    setTimeout(() => openDetail(it), 0);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: palette.page, pt: { xs: 'calc(env(safe-area-inset-top) + 12px)', sm: 0 }, pb: { xs: 'calc(10px + env(safe-area-inset-bottom))', sm: 10 } }}>
      <GlobalStyles styles={{
        '.search-ov *:focus, .search-ov *:focus-visible': { outline: 'none !important', boxShadow: 'none !important' },
        '.search-ov input, .search-ov .MuiInputBase-input, .search-ov .MuiInputBase-root': { outline: 'none !important', boxShadow: 'none !important' },
        '.search-ov input::-moz-focus-inner': { border: 0 },
      }} />

      {/* Banner */}
      <Box sx={{ mx: 2, mt: 2, borderRadius: 2.5, overflow: 'hidden', position: 'relative', height: { xs: 220, sm: 260 }, bgcolor: palette.bannerRed }}>
        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', height: '100%', transition: 'transform .5s ease', transform: `translateX(-${slide * 100}%)` }}>
          {slides.map((s, i) => (
            <Box key={i} sx={{
              minWidth: '100%', height: '100%', position: 'relative',
              backgroundImage: `linear-gradient(90deg, ${palette.bannerRed} 0%, ${palette.bannerRed} 64%, rgba(230,86,79,0) 64%), url('${s.image}')`,
              backgroundSize: 'cover, contain', backgroundRepeat: 'no-repeat, no-repeat',
              backgroundPosition: 'left center, right -8px center',
            }}>
              <Box sx={{ px: 3, py: { xs: 3.2, sm: 3.5 }, width: '64%' }}>
                <Typography sx={{ color: '#fff', fontSize: 'clamp(22px, 6vw, 30px)', lineHeight: 1.02, fontFamily: "'Alfa Slab One', Georgia, serif", fontWeight: 400 }}>
                  {s.title1}<Box component="span" sx={{ display: 'block' }}>{s.title2}</Box>
                </Typography>
                <Typography sx={{ color: '#FFEFEA', mt: 1.2, fontSize: { xs: 13.5, sm: 14.5 }, fontWeight: 500 }}>{s.desc}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
        <Box sx={{ position: 'absolute', left: '50%', bottom: 10, transform: 'translateX(-50%)', display: 'flex', gap: 1.25 }}>
          {slides.map((_, i) => (<Box key={i} onClick={() => setSlide(i)} sx={{ width: 8, height: 8, borderRadius: '50%', cursor: 'pointer', bgcolor: i === slide ? '#fff' : 'rgba(255,255,255,.5)', outline: '2px solid rgba(255,255,255,.25)' }} />))}
        </Box>
      </Box>

      {/* Seções */}
      <Box sx={{ mx: 2, mt: 2, mb: '70px' }}>
        {showSugSkel ? (
          <SectionSkeleton rows={3} />
        ) : (
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, backgroundColor: palette.cream, border: 'none' }}>
            <Typography sx={{ mb: 1.5, color: palette.headerGreen, fontSize: 22, fontFamily: "'Alfa Slab One', Georgia, serif", fontWeight: 400 }}>
              Sugestões do dia
            </Typography>
            <Grid container direction="column">
              {items.map((item, idx) => {
                const burstKey = burstMap[item.id] || 0;
                return (
                  <Box key={item.id}>
                    <Box
                      onClick={() => openDetail(item)}
                      sx={{ py: 1, display: 'grid', gridTemplateColumns: `${SIZES.thumb}px minmax(0,1fr) ${SIZES.actionsCol}px`, columnGap: 1.5, alignItems: 'center', cursor: 'pointer' }}
                    >
                      <Box sx={{ width: SIZES.thumb, height: SIZES.thumb, borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
                        <Box component="img" src={item.image} alt={item.title} sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      </Box>
                      <Box sx={{ minWidth: 0, mr: 1 }}>
                        <Typography sx={{ fontFamily: '"Bitter", serif', fontWeight: 700, color: palette.textPrimary, fontSize: SIZES.title, lineHeight: 1.15, whiteSpace: 'normal', wordBreak: 'break-word', hyphens: 'auto' }}>
                          {item.title}
                        </Typography>
                        {item.subtitle && <Typography sx={{ mt: .25, fontSize: '0.9em', color: palette.textMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{item.subtitle}</Typography>}
                        {item.subtitle2 && <Typography sx={{ fontSize: '0.9em', color: palette.textMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{item.subtitle2}</Typography>}
                        <Typography sx={{ mt: .6, fontFamily: '"Bitter", serif', fontWeight: 700, color: palette.textPrimary, fontSize: SIZES.price }}>
                          R$ {item.price}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifySelf: 'end' }} onClick={(e) => e.stopPropagation()}>
                        <Box sx={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${palette.ring}`, backgroundColor: palette.cream, flexShrink: 0 }} aria-label="disponível" />
                        <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                          {idx === 0
                            ? <HeartBurst liked={item.liked} onClick={(e) => handleFavoriteClick(item, e)} withTooltip tooltipOpen={tipOpen} tooltipRef={firstHeartRef} burstKey={burstKey} />
                            : <HeartBurst liked={item.liked} onClick={(e) => handleFavoriteClick(item, e)} burstKey={burstKey} />}
                          <Fade in={!!likedFlash[item.id]} timeout={{ enter: 120, exit: 250 }}>
                            <Typography sx={{ position: 'absolute', top: 'calc(100% + 2px)', left: '50%', transform: 'translateX(-50%)', fontSize: 11, fontWeight: 800, color: palette.heart, whiteSpace: 'nowrap', pointerEvents: 'none' }}>
                              Gostei
                            </Typography>
                          </Fade>
                        </Box>
                      </Box>
                    </Box>
                    {idx < items.length - 1 && <Divider sx={{ my: .5, borderColor: palette.divider }} />}
                  </Box>
                );
              })}
            </Grid>
          </Paper>
        )}

        {showPromoSkel ? (
          <Box sx={{ mt: 2 }}><SectionSkeleton rows={3} /></Box>
        ) : (
          <Paper elevation={0} sx={{ mt: 2, p: 2, borderRadius: 2.5, backgroundColor: palette.cream, border: 'none' }}>
            <Typography sx={{ mb: 1.5, color: palette.headerGreen, fontSize: 22, fontFamily: "'Alfa Slab One', Georgia, serif", fontWeight: 400 }}>
              Promoções do dia
            </Typography>
            <Grid container direction="column">
              {promos.map((item, idx) => {
                const burstKey = burstMap[item.id] || 0;
                return (
                  <Box key={item.id}>
                    <Box
                      onClick={() => openDetail(item)}
                      sx={{ py: 1, display: 'grid', gridTemplateColumns: `${SIZES.thumb}px minmax(0,1fr) ${SIZES.actionsCol}px`, columnGap: 1.5, alignItems: 'center', cursor: 'pointer' }}
                    >
                      <Box sx={{ width: SIZES.thumb, height: SIZES.thumb, borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
                        <Box component="img" src={item.image} alt={item.title} sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      </Box>
                      <Box sx={{ minWidth: 0, mr: 1 }}>
                        <Typography sx={{ fontFamily: '"Bitter", serif', fontWeight: 700, color: palette.textPrimary, fontSize: SIZES.title, lineHeight: 1.15, whiteSpace: 'normal', wordBreak: 'break-word', hyphens: 'auto' }}>
                          {item.title}
                        </Typography>
                        {item.subtitle && <Typography sx={{ mt: .25, fontSize: '0.9em', color: palette.textMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{item.subtitle}</Typography>}
                        {item.subtitle2 && <Typography sx={{ fontSize: '0.9em', color: palette.textMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{item.subtitle2}</Typography>}
                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: .6, flexWrap: 'wrap' }}>
                          <Typography sx={{ fontFamily: '"Bitter", serif', fontWeight: 700, color: palette.textPrimary, fontSize: SIZES.price }}>
                            R$ {item.price}
                          </Typography>
                          <Typography sx={{ color: '#9AA0A6', textDecoration: 'line-through', fontWeight: 600, fontSize: 13 }}>
                            R$ {item.oldPrice}
                          </Typography>
                          <Chip
                            label={`-${Math.max(0, Math.round((1 - parseFloat(item.price) / parseFloat(item.oldPrice)) * 100))}%`}
                            size="small"
                            sx={{ bgcolor: palette.promoBg, color: palette.promoFg, fontWeight: 700, height: 22, borderRadius: '12px', fontSize: 12 }}
                          />
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifySelf: 'end' }} onClick={(e) => e.stopPropagation()}>
                        <Box sx={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${palette.ring}`, backgroundColor: palette.cream, flexShrink: 0 }} aria-label="disponível" />
                        <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                          <HeartBurst liked={item.liked} onClick={(e) => handleFavoriteClick(item, e)} burstKey={burstKey} />
                          <Fade in={!!likedFlash[item.id]} timeout={{ enter: 120, exit: 250 }}>
                            <Typography sx={{ position: 'absolute', top: 'calc(100% + 2px)', left: '50%', transform: 'translateX(-50%)', fontSize: 11, fontWeight: 800, color: palette.heart, whiteSpace: 'nowrap', pointerEvents: 'none' }}>
                              Gostei
                            </Typography>
                          </Fade>
                        </Box>
                      </Box>
                    </Box>
                    {idx < promos.length - 1 && <Divider sx={{ my: .5, borderColor: palette.divider }} />}
                  </Box>
                );
              })}
            </Grid>
          </Paper>
        )}
      </Box>

      {/* Overlay de Favoritos */}
      {/* ... (sem alterações na UI a partir daqui) ... */}

      {/* Bottom Nav fixa */}
      <Box sx={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: (t) => t.zIndex.appBar }}>
        <BottomNavigation
          value={nav}
          onChange={(_, v) => { setNav(v); if (v === 'busca') openSearch(); }}
          showLabels
          sx={{
            bgcolor: '#fff',
            borderTop: '1px solid rgba(0,0,0,0.06)',
            height: NAV_H,
            pb: 'env(safe-area-inset-bottom)',
            '& .MuiBottomNavigationAction-label': { fontSize: '0.652rem', transition: 'none' },
            '& .Mui-selected .MuiBottomNavigationAction-label': { fontSize: '0.652rem' },
          }}
        >
          <BottomNavigationAction label="Início" value="inicio" icon={<HomeIcon />} />
          <BottomNavigationAction label="Restaurantes" value="rest" icon={<RestaurantIcon />} />
          <BottomNavigationAction
            label="Busca"
            value="busca"
            icon={<SearchIcon />}
            sx={{
              px: .5, borderRadius: 0, backgroundColor: 'transparent',
              '& .MuiSvgIcon-root': { fontSize: 22, color: palette.ring },
              '& .MuiBottomNavigationAction-label': { fontWeight: 700, color: palette.ring },
              '&.Mui-selected': { boxShadow: `inset 0 -2px 0 ${palette.ring}` },
            }}
          />
          <BottomNavigationAction label="Favoritos" value="fav" icon={<FavoriteBorderIcon />} />
          <BottomNavigationAction label="Opções" value="menu" icon={<MenuIcon />} />
        </BottomNavigation>
      </Box>

          {/* Overlay de Busca com resultados em tempo real */}
      {searchOpen && (
        <Box sx={{ position: 'fixed', inset: 0, zIndex: (t) => t.zIndex.tooltip + 10 }}>
          {/* Fundo: fecha a busca */}
          <Box
            onClick={() => {
              // track: search_closed
              try { window.gtag?.('event', 'search_closed', { reason: 'backdrop' }); } catch {}
              try { window.fbq?.('trackCustom', 'SearchClosed', { reason: 'backdrop' }); } catch {}
              closeSearch();
            }}
            sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,.18)', backdropFilter: 'blur(2px)' }}
          />

          <Fade in={searchOpen}>
            <Paper
              elevation={0}
              component="form"
              onSubmit={(e) => { e.preventDefault(); }}
              className="search-ov"
              sx={{
                position: 'absolute',
                left: '50%',
                top: '14%',
                transform: 'translate(-50%, 0)',
                width: { xs: '90%', sm: 560 },
                p: 1,
                borderRadius: 999,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                bgcolor: '#fff',
                border: '1px solid #eaeaea',
                boxShadow: '0 18px 60px rgba(0,0,0,.08)',
                transition: 'box-shadow .2s ease, transform .2s ease',
                zIndex: (t) => t.zIndex.tooltip + 11,
                '&:focus-within': {
                  boxShadow: '0 18px 60px rgba(15,123,77,.16), 0 0 0 3px rgba(15,123,77,.12)',
                },
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  // track: search_closed
                  try { window.gtag?.('event', 'search_closed', { reason: 'escape' }); } catch {}
                  try { window.fbq?.('trackCustom', 'SearchClosed', { reason: 'escape' }); } catch {}
                  closeSearch();
                }
              }}
            >
              <Box sx={{ ml: .5, width: 36, height: 36, borderRadius: '50%', background: '#F5F7F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SearchIcon sx={{ fontSize: 22, color: palette.ring }} />
              </Box>

              <InputBase
                type="text"
                inputProps={{ inputMode: 'search', 'aria-label': 'Buscar' }}
                autoFocus
                value={searchText}
                // TRACKING: dispara "search_opened" no primeiro foco
                onFocus={(e) => {
                  const el = e.target;
                  if (!el.dataset.openTracked) {
                    el.dataset.openTracked = '1';
                    try { window.gtag?.('event', 'search_opened'); } catch {}
                    try { window.fbq?.('trackCustom', 'SearchOpened'); } catch {}
                  }
                }}
                // TRACKING: registra o termo a cada mudança “nova”
                onChange={(e) => {
                  const q = e.target.value;
                  setSearchText(q);
                  const norm = (q || '').trim().toLowerCase();
                  if (!norm) return;

                  // evita emitir repetido para o mesmo valor
                  if (e.target.dataset.prevq !== norm) {
                    e.target.dataset.prevq = norm;
                    try { window.gtag?.('event', 'search_query', { query: norm.slice(0, 64), length: norm.length }); } catch {}
                    try { window.fbq?.('trackCustom', 'SearchQuery', { query: norm }); } catch {}
                  }
                }}
                placeholder="Buscar pratos, restaurantes…"
                sx={{
                  flex: 1, fontSize: 16, fontWeight: 700, color: palette.textPrimary, px: 1, '::placeholder': { color: '#9AA0A6' },
                  '& .MuiInputBase-input': { border: 0, outline: 'none !important', boxShadow: 'none !important', backgroundColor: 'transparent', appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none', WebkitTapHighlightColor: 'transparent' },
                  '& .MuiInputBase-input:focus, & .MuiInputBase-input:focus-visible': { outline: 'none !important', boxShadow: 'none !important' },
                  '& input::-webkit-search-decoration, & input::-webkit-search-cancel-button, & input::-webkit-search-results-button, & input::-webkit-search-results-decoration': { display: 'none' },
                }}
              />

              {searchText && (
                <IconButton
                  aria-label="limpar"
                  onClick={() => {
                    // track: limpar
                    try { window.gtag?.('event', 'search_cleared'); } catch {}
                    try { window.fbq?.('trackCustom', 'SearchCleared'); } catch {}
                    setSearchText('');
                  }}
                  sx={{ mr: .5 }}
                >
                  <CloseIcon />
                </IconButton>
              )}
            </Paper>
          </Fade>

          {/* Resultados */}
          <Box
            sx={{
              position: 'absolute',
              left: '50%',
              top: 'calc(14% + 72px)',
              transform: 'translateX(-50%)',
              width: { xs: '90%', sm: 560 },
              bgcolor: '#fff',
              borderRadius: 2,
              p: 2,
              boxShadow: '0 14px 40px rgba(0,0,0,.10)',
              maxHeight: { xs: '60vh', sm: 480 },
              overflow: 'auto',
            }}
          >
            <Typography sx={{ fontWeight: 700, color: '#7B7B7B', fontSize: 12, mb: 1 }}>RESULTADOS</Typography>

            {!searchText && (
              <Typography sx={{ color: '#9AA0A6', fontSize: 14, textAlign: 'center', py: 3 }}>
                Digite para buscar pratos, restaurantes…
              </Typography>
            )}

            {searchText && searchLoading && (
              <Box>
                <SearchRowSkeleton /><Divider />
                <SearchRowSkeleton /><Divider />
                <SearchRowSkeleton /><Divider />
                <SearchRowSkeleton /><Divider />
                <SearchRowSkeleton />
              </Box>
            )}

            {searchText && !searchLoading && searchResults.length === 0 && (
              <Typography sx={{ color: '#9AA0A6', fontSize: 14, textAlign: 'center', py: 3 }}>
                Nenhum item encontrado para “{searchText}”.
              </Typography>
            )}

            {searchText && !searchLoading && searchResults.length > 0 && (
              <Box>
                {searchResults.map((item, idx) => (
                  <Box key={`sr-${item.id}`}>
                    <Box
                      onClick={() => {
                        // track: clique em resultado
                        try {
                          window.gtag?.('event', 'search_result_click', {
                            item_id: item.id, item_name: item.title, position: idx + 1
                          });
                        } catch {}
                        try {
                          window.fbq?.('trackCustom', 'SearchResultClick', {
                            content_ids: [item.id], content_name: item.title, position: idx + 1
                          });
                        } catch {}
                        handleOpenFromSearch(item);
                      }}
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: '64px 1fr 40px',
                        columnGap: 1.5,
                        alignItems: 'center',
                        py: 1,
                        cursor: 'pointer',
                        '&:active': { transform: 'scale(.997)' },
                        transition: 'transform .06s ease',
                      }}
                    >
                      <Box sx={{ width: 64, height: 64, borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
                        <Box component="img" src={item.image} alt={item.title} sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 800, color: palette.textPrimary, fontSize: 15, lineHeight: 1.15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.title}
                        </Typography>
                        {(item.subtitle || item.subtitle2) && (
                          <Typography sx={{ mt: .25, fontSize: 13, color: palette.textMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.subtitle || item.subtitle2}
                          </Typography>
                        )}
                      </Box>
                      <IconButton
                        aria-label="abrir"
                        onClick={(e) => {
                          e.stopPropagation();
                          // track: clique no caret
                          try {
                            window.gtag?.('event', 'search_result_click', {
                              item_id: item.id, item_name: item.title, position: idx + 1, via: 'chevron'
                            });
                          } catch {}
                          try {
                            window.fbq?.('trackCustom', 'SearchResultClick', {
                              content_ids: [item.id], content_name: item.title, position: idx + 1, via: 'chevron'
                            });
                          } catch {}
                          handleOpenFromSearch(item);
                        }}
                      >
                        <ChevronRightRoundedIcon />
                      </IconButton>
                    </Box>
                    {idx < searchResults.length - 1 && <Divider sx={{ my: .5, borderColor: palette.divider }} />}
                  </Box>
                ))}
              </Box>
            )}

            {/* Botão fechar resultados */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
              <Button
                size="small"
                variant="text"
                onClick={() => {
                  try { window.gtag?.('event', 'search_closed', { reason: 'button' }); } catch {}
                  try { window.fbq?.('trackCustom', 'SearchClosed', { reason: 'button' }); } catch {}
                  closeSearch();
                }}
              >
                Fechar busca
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      {/* Detalhe do item */}
      {detail && (
        <Box sx={{ position: 'fixed', inset: 0, bgcolor: '#fff', zIndex: (t) => t.zIndex.tooltip + 20, display: 'flex', flexDirection: 'column', animation: `${fadeIn} 120ms ease-out` }}>
          <Box sx={{ position: 'relative', height: { xs: '42vh', sm: '50vh' }, overflow: 'hidden' }}>
            <Box component="img" src={detail.image} alt={detail.title} sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 80, background: 'linear-gradient(to top, rgba(0,0,0,.22), transparent)' }} />
            <Box sx={{ position: 'absolute', left: 0, right: 0, top: { xs: 'calc(env(safe-area-inset-top) + 28px)', sm: 28 }, px: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <IconButton onClick={closeDetail} sx={{ bgcolor: 'rgba(0,0,0,.55)', '&:hover': { bgcolor: 'rgba(0,0,0,.65)' }, boxShadow: '0 2px 12px rgba(0,0,0,.35)' }}>
                <ArrowBackRoundedIcon sx={{ color: '#fff' }} />
              </IconButton>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton onClick={() => handleFavoriteClick(detail)} sx={{ bgcolor: 'rgba(0,0,0,.55)', '&:hover': { bgcolor: 'rgba(0,0,0,.65)' }, boxShadow: '0 2px 12px rgba(0,0,0,.35)' }}>
                  {isLiked(detail.id) ? <FavoriteIcon sx={{ color: palette.heart }} /> : <FavoriteBorderIcon sx={{ color: '#fff' }} />}
                </IconButton>
                <IconButton
                  onClick={() => {
                    const payload = { title: detail.title, text: `Olha este prato: ${detail.title}`, url: typeof window !== 'undefined' ? window.location.href : '' };
                    if (navigator.share) navigator.share(payload).catch(() => { });
                    else { try { navigator.clipboard?.writeText(`${payload.text} ${payload.url}`); } catch { } }
                  }}
                  sx={{ bgcolor: 'rgba(0,0,0,.55)', '&:hover': { bgcolor: 'rgba(0,0,0,.65)' }, boxShadow: '0 2px 12px rgba(0,0,0,.35)' }}
                >
                  <ShareRoundedIcon sx={{ color: '#fff' }} />
                </IconButton>
              </Box>
            </Box>
          </Box>
          <Box sx={{ flex: 1, overflow: 'auto', px: 2, pt: 5, pb: 2, animation: `${appear} 180ms ease` }}>
            <Typography sx={{ fontFamily: "'Bitter', serif", fontWeight: 800, fontSize: 26, color: palette.textPrimary, mb: 1 }}>
              {detail.title}
            </Typography>
            {(detail.subtitle || detail.subtitle2) && (
              <Typography sx={{ color: palette.textMuted, lineHeight: 1.6, mb: 2 }}>
                {detail.subtitle} {detail.subtitle2 ? ` ${detail.subtitle2}` : ''}
              </Typography>
            )}
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <Typography sx={{ fontFamily: "'Bitter', serif", fontWeight: 800, fontSize: 22, color: palette.textPrimary }}>
                R$ {detail.price}
              </Typography>
              {detail.oldPrice && (
                <>
                  <Typography sx={{ color: '#9AA0A6', textDecoration: 'line-through', fontWeight: 600, fontSize: 14 }}>
                    R$ {detail.oldPrice}
                  </Typography>
                  <Chip
                    label={`-${Math.max(0, Math.round((1 - parseFloat(detail.price) / parseFloat(detail.oldPrice)) * 100))}%`}
                    size="small"
                    sx={{ bgcolor: palette.promoBg, color: palette.promoFg, fontWeight: 700, height: 22, borderRadius: '12px', fontSize: 12 }}
                  />
                </>
              )}
            </Box>
            <Paper elevation={0} sx={{ border: '1px solid #eee', borderRadius: 2.5, p: 1.2, display: 'flex', alignItems: 'center', gap: 1.2, mb: 3 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: 50, bgcolor: '#FF6A33', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 12 }}>
                ALOOM
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 700, color: palette.textPrimary }}>Aloom</Typography>
                <Typography sx={{ color: palette.textMuted, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Experimente o extraordinário!
                </Typography>
              </Box>
              <ChevronRightRoundedIcon />
            </Paper>
            <Typography sx={{ fontFamily: "'Bitter', serif", fontWeight: 800, fontSize: 18, color: palette.textPrimary, mb: 1 }}>
              Sugestão de acompanhamento
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 8 }}>
              <Chip label="Batata rústica" />
              <Chip label="Salada verde" />
              <Chip label="Molho da casa" />
            </Box>
          </Box>
        </Box>
      )}

      {/* Folha de avaliação (não navega sozinho) */}
      <Modal open={reviewSheetOpen} onClose={() => setReviewSheetOpen(false)}>
        <Box
          sx={{
            position: 'absolute', left: '50%', top: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: 520 },
            bgcolor: '#fff', color: palette.textPrimary,
            borderRadius: 3, boxShadow: '0 30px 90px rgba(0,0,0,.28)',
            p: { xs: 2, sm: 3 }
          }}
        >
          {/* Cabeçalho */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <GoogleGlyph size={24} />
            <Typography sx={{ fontWeight: 900, letterSpacing: .2 }}>
              Avaliar no Google
            </Typography>
          </Box>

          {/* Resumo das estrelas que o usuário escolheu */}
          {notice?.stars ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography sx={{ fontWeight: 800 }}>Sua avaliação:</Typography>
              <Rating value={notice.stars} readOnly size="small"
                sx={{ '& .MuiRating-icon': { fontSize: 18 } }} />
              <Typography sx={{ color: palette.textMuted }}>
                ({notice.stars} {notice.stars === 1 ? 'estrela' : 'estrelas'})
              </Typography>
            </Box>
          ) : null}

          <Typography sx={{ color: palette.textMuted, mb: 2 }}>
            Obrigado por avaliar! Você pode abrir o fluxo de recomendação no app do Google ou copiar o link.
          </Typography>

          {/* Ações */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.25, mb: 2 }}>
            <Button
              onClick={copyReviewLink}
              startIcon={<ShareRoundedIcon />}
              variant="contained"
              sx={{
                flex: 1,
                bgcolor: palette.headerGreen,
                '&:hover': { bgcolor: '#0c4027' },
                borderRadius: 2, fontWeight: 900, textTransform: 'none'
              }}
            >
              {copied ? 'Link copiado!' : 'Copiar link'}
            </Button>

            <Button
              onClick={() => { const w = window.open(REVIEW_URLS[1], '_blank', 'noopener,noreferrer'); try { if (w) w.opener = null; } catch { } }}
              variant="outlined"
              sx={{
                flex: 1,
                borderRadius: 2, fontWeight: 900, textTransform: 'none',
                borderColor: '#DADFE3'
              }}
            >
              Abrir no Google Maps
            </Button>
          </Box>

          {/* QR para abrir no celular sem sair da aba */}
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 2,
            p: 1.5, border: '1px dashed #E5E7EB', borderRadius: 2
          }}>
            <Box
              component="img"
              alt="QR Code para avaliação no Google"
              sx={{ width: 112, height: 112, borderRadius: 1, flexShrink: 0 }}
              src={`https://api.qrserver.com/v1/create-qr-code/?size=224x224&data=${encodeURIComponent(REVIEW_URLS[1])}`}
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 800, mb: .25 }}>
                Abra no celular
              </Typography>
              <Typography sx={{ color: palette.textMuted, fontSize: 13 }}>
                Escaneie o QR para abrir diretamente a tela de avaliação do Google.
              </Typography>
            </Box>
          </Box>

          {/* Rodapé */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button onClick={() => setReviewSheetOpen(false)} sx={{ textTransform: 'none', borderRadius: 999 }}>
              Fechar
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Notificação central de avaliação */}
      <Modal open={!!notice} onClose={() => setNotice(null)} aria-labelledby="rate-title">
        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: '#fff',
            color: palette.textPrimary,
            p: 2.5,
            borderRadius: 3,
            boxShadow: '0 30px 80px rgba(0,0,0,.28)',
            width: { xs: '88%', sm: 440 },
            textAlign: 'center'
          }}
        >
          {notice && (
            <>
              {/* topo: número + estrelas grandes */}
              <Box sx={{ mb: 1.25, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                <Typography id="rate-title" sx={{ fontWeight: 900, fontSize: 18 }}>
                  Você avaliou {notice.stars} {notice.stars === 1 ? 'estrela' : 'estrelas'}
                </Typography>
                <Rating
                  readOnly
                  value={notice.stars}
                  size="large"
                  sx={{
                    '& .MuiRating-iconFilled': { color: '#FFC107' },
                    '& .MuiRating-iconEmpty': { color: '#E6E6E6' },
                  }}
                />
              </Box>

              <Typography sx={{ color: palette.textMuted, mb: 2 }}>
                Obrigado pelo feedback!
              </Typography>

              {notice.stars === 5 ? (
                <Button
                  variant="contained"
                  onClick={openReviewFlow}
                  sx={{ bgcolor: palette.headerGreen, '&:hover': { bgcolor: '#0c4027' }, borderRadius: 999, px: 2, fontWeight: 800 }}
                >
                  Recomendar no Google
                </Button>
              ) : null}

              <Box sx={{ mt: 1 }}>
                <Button
                  onClick={() => setNotice(null)}
                  sx={{
                    borderRadius: 999,
                    textTransform: 'none',
                    fontWeight: 700,
                    px: 1.5,
                    color: '#6F6F6F',
                  }}
                >
                  Fechar
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
}

/* ---- PAGE ---- */
export default function CardapioLayout() {
  const theme = useTheme();
  useMediaQuery(theme.breakpoints.up('sm'));
  const [gateOpen, setGateOpen] = useState(() => {
    const c = localStorage.getItem('cardapio/lgpdConsent') === '1';
    const u = localStorage.getItem('cardapio/unit');
    return Boolean(c && u);
  });
  if (!gateOpen) {
    return <UnitConsentScreen onAccepted={() => setGateOpen(true)} />;
  }
  return <CardapioInner />;
}
