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
const GOOGLE_REVIEW_URL =
  import.meta.env?.VITE_GOOGLE_REVIEW_URL
  || 'https://g.page/r/CZYCNTN3SKwdEAE/review';

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
    const consent = localStorage.getItem('cardapio/lgpdConsent') === '1';
    if (!consent) return;
    if (!window.dataLayer) window.dataLayer = [];
    if (!window.gtag) { window.gtag = function () { window.dataLayer.push(arguments); }; }
    await loadScript(`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`, 'ga4-script');
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);
    if (!window.fbq) {
      const n = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      n.queue = []; n.loaded = true; n.version = '2.0'; window.fbq = n;
      await loadScript('https://connect.facebook.net/en_US/fbevents.js', 'fb-pixel-script');
    }
    window.fbq('init', FB_PIXEL_ID);
    try { window.fbq('consent', 'grant'); } catch { }
    inited = true;
  };
  const initIfNeeded = () => init();
  const consentGranted = () => {
    try {
      window.gtag?.('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
      });
    } catch { }
    try { window.fbq?.('consent', 'grant'); } catch { }
  };
  const page = ({ name }) => {
    try {
      window.gtag?.('event', 'page_view', {
        page_title: name,
        page_location: window.location.href,
        page_path: window.location.pathname,
      });
    } catch { }
    try { window.fbq?.('track', 'PageView'); } catch { }
  };
  const viewItem = (item) => {
    const price = parseFloat(item.price) || 0;
    try {
      window.gtag?.('event', 'view_item', {
        currency: 'BRL',
        value: price,
        items: [{ item_id: item.id, item_name: item.title, item_category: item.subtitle || '', price }],
      });
    } catch { }
    try {
      window.fbq?.('track', 'ViewContent', {
        content_ids: [item.id], content_name: item.title, content_type: 'product', value: price, currency: 'BRL',
      });
    } catch { }
  };
  const like = (item, liked) => {
    const price = parseFloat(item.price) || 0;
    try {
      window.gtag?.('event', liked ? 'add_to_wishlist' : 'remove_from_wishlist', {
        currency: 'BRL',
        value: price,
        items: [{ item_id: item.id, item_name: item.title, item_category: item.subtitle || '', price }],
      });
    } catch { }
    try {
      if (liked) {
        window.fbq?.('track', 'AddToWishlist', { content_ids: [item.id], content_name: item.title, content_type: 'product', value: price, currency: 'BRL' });
      } else {
        window.fbq?.('trackCustom', 'RemoveFromWishlist', { content_ids: [item.id], content_name: item.title });
      }
    } catch { }
  };
  const selectUnit = (unit) => {
    try { window.gtag?.('event', 'select_location', { location_id: unit }); } catch { }
    try { window.fbq?.('trackCustom', 'SelectLocation', { location: unit }); } catch { }
  };
  const rate = (item, stars) => {
    try {
      window.gtag?.('event', 'rate_item', {
        value: stars,
        items: [{ item_id: item.id, item_name: item.title }],
      });
    } catch { }
    try {
      window.fbq?.('trackCustom', 'RateItem', {
        content_ids: [item.id], content_name: item.title, value: stars
      });
    } catch { }
  };
  return { initIfNeeded, consentGranted, page, viewItem, like, selectUnit, init, rate };
})();

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

/* ---- LOGO GOOGLE (para a modal de avaliação) ---- */
function GoogleGlyph() {
  return (
    <Box
      aria-hidden
      sx={{
        width: 22,
        height: 22,
        borderRadius: '50%',
        background:
          'conic-gradient(#4285F4 0deg 90deg, #34A853 90deg 180deg, #FBBC05 180deg 270deg, #EA4335 270deg 360deg)',
        display: 'grid',
        placeItems: 'center',
        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.06)',
      }}
    >
      <Typography
        sx={{
          fontSize: 12,
          fontWeight: 900,
          lineHeight: 1,
          color: '#fff',
          fontFamily:
            'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
          mt: '-1px',
        }}
      >
        G
      </Typography>
    </Box>
  );
}


/* ---- GATE ---- */
function UnitConsentScreen({ onAccepted }) {
  const [show] = useState(true);
  const acceptAndContinue = async () => {
    const unit = SINGLE_UNIT;
    localStorage.setItem('cardapio/lgpdConsent', '1');
    localStorage.setItem('cardapio/unit', unit);
    try { document.cookie = `lgpd_consent=true; Max-Age=${60 * 60 * 24 * 180}; Path=/; SameSite=Lax`; } catch { }
    try { window.dataLayer?.push({ event: 'lgpd_consent_granted', unit }); } catch { }
    Analytics.consentGranted();
    await Analytics.init();
    Analytics.selectUnit(unit);
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

  useEffect(() => { Analytics.initIfNeeded(); Analytics.page({ name: 'inicio' }); }, []);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 1500); return () => clearTimeout(t); }, []);
  useEffect(() => { const id = setInterval(() => setSlide(s => (s + 1) % slides.length), 5000); return () => clearInterval(id); }, []);
  useEffect(() => { const id = requestAnimationFrame(() => { if (firstHeartRef.current) setTipOpen(true); }); return () => cancelAnimationFrame(id); }, [items.length]);
  useEffect(() => {
    const likedIds = [...items, ...promos].filter(x => x.liked).map(x => x.id);
    try { localStorage.setItem('cardapio/favs', JSON.stringify(likedIds)); } catch { }
    try { document.cookie = `cardapio/favs=${encodeURIComponent(likedIds.join(','))}; Max-Age=${60 * 60 * 24 * 180}; Path=/; SameSite=Lax`; } catch { }
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
          else return -1; // não casa todos os termos
        }
        if (it.liked) score += 0.25; // bônus por favorito
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

    const t = setTimeout(run, 180); // debounce suave
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

    // alterna favorito
    toggleLikeById(item.id);

    const nowLiked = !wasLiked;

    // se acabou de virar favorito: mostra flash + ZERA as estrelas
    if (!wasLiked) {
      setLikedFlash(m => ({ ...m, [item.id]: true }));
      setTimeout(() => setLikedFlash(m => { const cp = { ...m }; delete cp[item.id]; return cp; }), 900);

      // >>>>>>> AQUI: zera a avaliação para aparecer vazio <<<<<<<
      setRatings(prev => {
        const next = { ...prev, [item.id]: 0 };
        try { localStorage.setItem('cardapio/ratings', JSON.stringify(next)); } catch { }
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
      try { localStorage.setItem('cardapio/ratings', JSON.stringify(next)); } catch { }
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

      {/* Overlay de Favoritos (respeita a BottomNavigation) */}
      {nav === 'fav' && (
        <Box sx={{ position: 'fixed', left: 0, right: 0, top: 0, bottom: NAV_H, bgcolor: palette.page, zIndex: (t) => t.zIndex.appBar - 1, display: 'flex', flexDirection: 'column', animation: `${fadeIn} 120ms ease-out` }}>
          <Box sx={{ position: 'sticky', top: 0, zIndex: (t) => t.zIndex.appBar, px: 1.5, pt: 'calc(env(safe-area-inset-top) + 10px)', pb: 1, bgcolor: '#fff', backdropFilter: 'saturate(180%) blur(8px)', borderBottom: '1px solid #EEE6D7' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Button
                onClick={() => setNav('inicio')}
                startIcon={<ArrowBackRoundedIcon />}
                variant="contained"
                sx={{
                  bgcolor: palette.headerGreen,
                  '&:hover': { bgcolor: '#0c4027' },
                  color: '#fff',
                  borderRadius: 999,
                  px: 1.25,
                  py: 0.65,
                  minHeight: 36,
                  textTransform: 'none',
                  fontWeight: 800,
                  boxShadow: '0 6px 18px rgba(15,81,50,.24)',
                }}
              >
                Voltar
              </Button>
              <Typography sx={{ fontFamily: "'Alfa Slab One', Georgia, serif", mt: '50px' ,fontSize: 20, color: palette.textPrimary }}>Favoritos</Typography>
              <Box sx={{ visibility: 'hidden' }}>
                <Button startIcon={<ArrowBackRoundedIcon />} variant="contained" sx={{ borderRadius: 999, px: 1.25, py: 0.65, minHeight: 36 }}>Voltar</Button>
              </Box>
            </Box>
          </Box>
          <Box sx={{ flex: 1, overflow: 'auto', px: 2, pt: '63px', pb: 2 }}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, backgroundColor: palette.cream, border: 'none' }}>
              <Typography sx={{ mb: 1.5, color: palette.headerGreen, fontSize: 22, fontFamily: "'Alfa Slab One', Georgia, serif", fontWeight: 400 }}>
                Seus favoritos
              </Typography>
              {favorites.length === 0 ? (
                <Typography sx={{ color: '#9AA0A6', textAlign: 'center', py: 4 }}>
                  Você ainda não favoritou nenhum prato.
                </Typography>
              ) : (
                <Grid container direction="column">
                  {favorites.map((item, idx) => {
                    const burstKey = (burstMap[item.id] || 0) + 1000;
                    const ratedValue = Number(ratings[item.id] || 0);
                    return (
                      <Box key={`fav-${item.id}`}>
                        <Box
                          onClick={() => openDetail(item)}
                          sx={{
                            py: 1,
                            display: 'grid',
                            gridTemplateColumns: `${SIZES.thumb}px minmax(0,1fr) ${SIZES.actionsCol}px`,
                            columnGap: 1.5,
                            alignItems: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          <Box sx={{ width: SIZES.thumb, height: SIZES.thumb, borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
                            <Box component="img" src={item.image} alt={item.title} sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                          </Box>

                          <Box sx={{ minWidth: 0, mr: 1 }}>
                            <Typography sx={{ fontFamily: '"Bitter", serif', fontWeight: 700, color: palette.textPrimary, fontSize: SIZES.title, lineHeight: 1.15 }}>
                              {item.title}
                            </Typography>
                            {item.subtitle && <Typography sx={{ mt: .25, fontSize: '0.9em', color: palette.textMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.subtitle}</Typography>}
                            {item.subtitle2 && <Typography sx={{ fontSize: '0.9em', color: palette.textMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.subtitle2}</Typography>}
                            {/* Apenas o preço aqui, sem estrelas */}
                            <Typography sx={{ mt: .6, fontFamily: '"Bitter", serif', fontWeight: 700, color: palette.textPrimary, fontSize: SIZES.price }}>
                              R$ {item.price}
                            </Typography>
                          </Box>

                          {/* Ações: coração em cima, estrelas logo abaixo alinhadas à direita */}
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'flex-end',
                              justifySelf: 'end',
                              position: 'relative',      // ← permite posicionar as estrelas no fundo
                              minHeight: SIZES.thumb,    // ← garante a altura (igual à foto)
                              pr: .5,                    // opcional: dá um respiro à direita
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* Topo: disponibilidade + coração */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${palette.ring}`, backgroundColor: palette.cream, flexShrink: 0 }} />
                              <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                <HeartBurst liked={true} onClick={(e) => handleFavoriteClick(item, e)} burstKey={burstKey} />
                                <Fade in={!!likedFlash[item.id]} timeout={{ enter: 120, exit: 250 }}>
                                  <Typography sx={{ position: 'absolute', top: 'calc(100% + 2px)', left: '50%', transform: 'translateX(-50%)', fontSize: 11, fontWeight: 800, color: palette.heart, whiteSpace: 'nowrap', pointerEvents: 'none' }}>
                                    Gostei
                                  </Typography>
                                </Fade>
                              </Box>
                            </Box>
                            {/* Baixo: estrelas (maiores e com área de clique melhor) */}
                            <Box
                              onClick={(e) => e.stopPropagation()}
                              onMouseDown={(e) => e.stopPropagation()}
                              onTouchStart={(e) => e.stopPropagation()}
                              onKeyDown={(e) => e.stopPropagation()}
                              sx={{
                                position: 'absolute',
                                right: 0,
                                bottom: -6,      // ↓ ajuste fino: 0–8px conforme preferir
                                pr: 0.25,
                              }}
                            >
                              <Rating
                                name={`rate-${item.id}`}
                                value={ratedValue}
                                onChange={(e, newVal) => { e?.stopPropagation?.(); handleRate(item, newVal, e); }}
                                sx={{
                                  lineHeight: 1,
                                  cursor: 'pointer',
                                  '& .MuiRating-icon': { fontSize: 20 },   // tamanho confortável de clique
                                  '& .MuiRating-iconEmpty': { color: '#DADADA', opacity: 1 },
                                }}
                              />
                            </Box>
                          </Box>
                        </Box>
                        {idx < favorites.length - 1 && <Divider sx={{ my: .5, borderColor: palette.divider }} />}
                      </Box>
                    );
                  })}
                </Grid>
              )}
            </Paper>
          </Box>
        </Box>
      )}

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
          <Box onClick={closeSearch} sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,.18)', backdropFilter: 'blur(2px)' }} />
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
              onKeyDown={(e) => { if (e.key === 'Escape') closeSearch(); }}
            >
              <Box sx={{ ml: .5, width: 36, height: 36, borderRadius: '50%', background: '#F5F7F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SearchIcon sx={{ fontSize: 22, color: palette.ring }} />
              </Box>
              <InputBase
                type="text"
                inputProps={{ inputMode: 'search', 'aria-label': 'Buscar' }}
                autoFocus
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Buscar pratos, restaurantes…"
                sx={{
                  flex: 1, fontSize: 16, fontWeight: 700, color: palette.textPrimary, px: 1, '::placeholder': { color: '#9AA0A6' },
                  '& .MuiInputBase-input': { border: 0, outline: 'none !important', boxShadow: 'none !important', backgroundColor: 'transparent', appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none', WebkitTapHighlightColor: 'transparent' },
                  '& .MuiInputBase-input:focus, & .MuiInputBase-input:focus-visible': { outline: 'none !important', boxShadow: 'none !important' },
                  '& input::-webkit-search-decoration, & input::-webkit-search-cancel-button, & input::-webkit-search-results-button, & input::-webkit-search-results-decoration': { display: 'none' },
                }}
              />
              {searchText && (
                <IconButton aria-label="limpar" onClick={() => setSearchText('')} sx={{ mr: .5 }}>
                  <CloseIcon />
                </IconButton>
              )}
            </Paper>
          </Fade>

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
                      onClick={() => handleOpenFromSearch(item)}
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
                      <IconButton aria-label="abrir" onClick={(e) => { e.stopPropagation(); handleOpenFromSearch(item); }}>
                        <ChevronRightRoundedIcon />
                      </IconButton>
                    </Box>
                    {idx < searchResults.length - 1 && <Divider sx={{ my: .5, borderColor: palette.divider }} />}
                  </Box>
                ))}
              </Box>
            )}
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
                <IconButton onClick={() => {
                  const payload = { title: detail.title, text: `Olha este prato: ${detail.title}`, url: typeof window !== 'undefined' ? window.location.href : '' };
                  if (navigator.share) navigator.share(payload).catch(() => { });
                  else { try { navigator.clipboard?.writeText(`${payload.text} ${payload.url}`); } catch { } }
                }} sx={{ bgcolor: 'rgba(0,0,0,.55)', '&:hover': { bgcolor: 'rgba(0,0,0,.65)' }, boxShadow: '0 2px 12px rgba(0,0,0,.35)' }}>
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
                  component="a"
                  href={GOOGLE_REVIEW_URL}
                  target="_blank"
                  rel="noopener"
                  startIcon={<GoogleGlyph />}
                  variant="contained"
                  sx={{
                    bgcolor: palette.headerGreen,
                    color: '#fff',
                    '&:hover': { bgcolor: '#0c4027' },
                    borderRadius: 999,
                    px: 2.25,
                    py: 1.25,
                    fontWeight: 800,
                    textTransform: 'none',
                    boxShadow: '0 12px 28px rgba(15,81,50,.25)',
                    mb: 0.5,
                  }}
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
