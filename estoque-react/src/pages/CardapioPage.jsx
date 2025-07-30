// src/pages/CardapioPage.jsx
import React, { useEffect, useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Button from '@mui/material/Button';
import useMediaQuery from '@mui/material/useMediaQuery';
import Chip from '@mui/material/Chip';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import CakeIcon from '@mui/icons-material/Cake';
import LocalBarIcon from '@mui/icons-material/LocalBar';
import EmojiFoodBeverageIcon from '@mui/icons-material/EmojiFoodBeverage';
import { useTheme } from '@mui/material/styles';
import PixelLoader from '../components/PixelLoader';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import InstagramIcon from '@mui/icons-material/Instagram';
import { useRef } from 'react';
import html2canvas from 'html2canvas';
import Swal from 'sweetalert2';
import { Helmet } from 'react-helmet';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import LocalDrinkIcon from '@mui/icons-material/LocalDrink';
import IcecreamIcon from '@mui/icons-material/Icecream'; // ícone de sorvete para "Doces"
import CloseIcon from '@mui/icons-material/Close';


// Ícones para categorias específicas
const sectionIcons = {
  Burgers: <FastfoodIcon />,
  Torresmos: <LocalDiningIcon />,
  Doces: <IcecreamIcon />,
  Gin: <LocalBarIcon />,
  '0 Alcool': <LocalDrinkIcon />,
};

// Títulos de navegação
const navTitles = ['Burgers', 'Torresmos', 'Doces', 'Gin', '0 Alcool'];

// URL do logo
const logoUrl = 'https://porks.nyc3.cdn.digitaloceanspaces.com/porks-logo.png';

// Dados do cardápio completos
const menuSections = [
  {
    title: 'Burgers',
    items: [
      {
        name: 'OldWest Burger',
        description: 'Suculenta costelinha de porco grelhada, coberta por queijo canastra derretido e geleia picante.',
        price: '25',
        image: 'https://porks.nyc3.cdn.digitaloceanspaces.com/cardapio/oldwest.jpg',
      },
      {
        name: 'Porks Bacon Burger',
        description: 'Blend especial de porco com cheddar cremoso e fatias crocantes de bacon.',
        price: '22',
        image: 'https://porks.nyc3.cdn.digitaloceanspaces.com/cardapio/burger-porksbacon.jpg',
      },
      {
        name: 'Blues Burger',
        description: 'Gorgonzola intenso, bacon caramelizado e carne suculenta formam essa combinação irresistível.',
        price: '28',
        image: 'https://porks.nyc3.cdn.digitaloceanspaces.com/cardapio/bluesburger.jpg',
      },
    ],
  },
  {
    title: 'Sanduíches',
    items: [
      {
        name: 'Pork Burrito',
        description: 'Tortilla quentinha abraça pernil desfiado, cheddar derretido e sour cream—puro conforto em suas mãos.',
        price: '25',
        image: 'https://porks.nyc3.cdn.digitaloceanspaces.com/cardapio/porks-burrito.jpg',
      },
      {
        name: 'Pernil Municipal',
        description: 'Pernil macio marinado por horas, queijo mussarela e maionese artesanal—simples, mas inesquecível.',
        price: '22',
        image: 'https://porks.nyc3.cdn.digitaloceanspaces.com/cardapio/pernilmunicipal.jpg',
      },
      {
        name: 'Pork Fish',
        description: 'Tiras crocantes de peixe empanado, servidas com queijo e molho tártaro fresco.',
        price: '25',
        image: 'https://porks.nyc3.cdn.digitaloceanspaces.com/cardapio/porksfish.jpg',
      },
      {
        name: 'Americano',
        description: 'Alcatra macia, alface crocante e queijo derretido para um clássico que nunca falha.',
        price: '26',
        image: 'https://porks.nyc3.cdn.digitaloceanspaces.com/cardapio/americano.jpg',
      },
      {
        name: 'Choripan',
        description: 'Linguiça suculenta e temperada, servida com chimichurri fresco.',
        price: '20',
        image: 'https://porks.nyc3.cdn.digitaloceanspaces.com/cardapio/choripan.jpg',
      },
      {
        name: 'Pão c/ Bife Clássico',
        description: 'Bife suculento, queijo derretido e cebolas caramelizadas—cada mordida é pura nostalgia.',
        price: '25',
        image: 'https://porks.nyc3.cdn.digitaloceanspaces.com/cardapio/paocombife.jpg',
      },
    ],
  },
  {
    title: 'Torresmos',
    items: [
      {
        name: 'Porkspóca',
        description: 'Pururuca de primeira, crocante e sequinha, temperada com lemon pepper.',
        price: '10',
        image: 'https://porks.nyc3.cdn.digitaloceanspaces.com/cardapio/porkspoca.jpg',
      },
      {
        name: 'Torresmo Mineiro',
        description: 'Fatias finas e crocantes, com sal leve e aquela textura que vicia.',
        price: '22',
        image: 'https://porks.nyc3.cdn.digitaloceanspaces.com/cardapio/torresmineiro.jpg',
      },
      {
        name: 'Mix de Torresmos',
        description: 'Seleção premium de três texturas: crocante, pururuca e de tira.',
        price: '25',
        image: 'https://porks.nyc3.cdn.digitaloceanspaces.com/cardapio/mixdetorresmo.jpg',
      },
    ],
  },
  {
    title: 'Petiscos Individuais',
    items: [
      {
        name: 'Costelinha BBQ',
        description: 'Costelinha ao molho BBQ com cerveja defumada.',
        price: '28',
        image: 'https://porks.nyc3.cdn.digitaloceanspaces.com/cardapio/costelinhabbq.jpg',
      },
      {
        name: 'Linguiçinha Artesanal',
        description: 'Linguiça de pernil e especiarias, servida com limão.',
        price: '25',
        image: 'https://porks.nyc3.cdn.digitaloceanspaces.com/cardapio/drinks/linguicinha2.jpg',
      },
      {
        name: 'Bei c/ Melado',
        description: 'Tiras de bacon cobertas c/ melado de cana.',
        price: '20',
        image:
          'https://porks.nyc3.cdn.digitaloceanspaces.com/cardapio/beiconmelado.jpg',
      },
      {
        name: 'Queijinho Empanadinho',
        description: 'Gouda empanado c/ melado.',
        price: '25',
        image: 'https://porks.nyc3.cdn.digitaloceanspaces.com/cardapio/queijinho2.jpg',
      },
      {
        name: 'Bolinho de Macaxeira',
        description: 'Recheado com carne seca.',
        price: '25',
        image: 'https://porks.nyc3.cdn.digitaloceanspaces.com/cardapio/macaxeira.jpg',
      },
      {
        name: 'Porks Fritas',
        description: 'Batata c/ páprica picante e maionese temperada.',
        price: '20',
        image:
          'https://porks.nyc3.cdn.digitaloceanspaces.com/cardapio/porksfritas.jpg',
      },
      {
        name: 'Fish and Chips',
        description: 'Tilápia à milanesa c/ fritas e maionese de limão.',
        price: '28',
        image: 'https://porks.nyc3.cdn.digitaloceanspaces.com/cardapio/fishchips.jpg',
      },
      {
        name: 'Pastelinhos',
        description: 'Gyoza frito recheado c/ carne suína.',
        price: '28',
        image:
          'https://porks.nyc3.cdn.digitaloceanspaces.com/cardapio/pastelinos.jpg',
      },
    ],
  },
  {
    title: 'Para Compartilhar',
    items: [
      {
        name: 'Filé c/ Gorgonzola',
        description: 'Alcatra c/ molho de gorgonzola e fritas.',
        price: '48',
        image:
          'https://porks.nyc3.cdn.digitaloceanspaces.com/cardapio/filecomfritas.jpg',
      },
      {
        name: 'Filé c/ Fritas',
        description: 'Alcatra c/ cerveja preta, bacon e fritas.',
        price: '45',
        image:
          'https://porks.nyc3.cdn.digitaloceanspaces.com/cardapio/filecomfritas2.jpg',
      },
      {
        name: 'Costelinha BBQ c/ Rústica',
        description: 'Costelinha c/ batata rústica.',
        price: '48',
        image: 'https://porks.nyc3.cdn.digitaloceanspaces.com/cardapio/costelinharustica.jpg',
      },
      {
        name: 'Batata Tropeira',
        description: 'Batata c/ pernil desfiado e BBQ.',
        price: '40',
        image:
          'https://porks.nyc3.cdn.digitaloceanspaces.com/cardapio/batatatropeira.jpg',
      },
      {
        name: 'Hot Wings',
        description: 'Asinhas c/ tempero picante.',
        price: '30',
        image:
          'https://porks.nyc3.cdn.digitaloceanspaces.com/cardapio/hotwings.jpg',
      },
      {
        name: 'Fucking Fritas',
        description: 'Fritas c/ cheddar e bacon.',
        price: '35',
        image:
          'https://porks.nyc3.cdn.digitaloceanspaces.com/cardapio/fknfritas.jpg',
      },
    ],
  },
  {
    title: 'Doces',
    items: [
      {
        name: 'Mini Churros',
        description: 'Mini churros c/ doce de leite.',
        price: '25',
        image:
          'https://porks.nyc3.cdn.digitaloceanspaces.com/cardapio/minichurros.jpg',
      },
      {
        name: 'Brownie de Chocolate',
        description: 'Brownie c/ morangos.',
        price: '20',
        image:
          'https://porks.nyc3.cdn.digitaloceanspaces.com/cardapio/brownie.jpg',
      },
    ],
  },
  {
    title: 'Gin',
    items: [
      {
        name: 'Tropical Gin',
        description: 'Gin c/ Monster Tropical e laranja.',
        price: '28',
        image: 'https://porks.nyc3.cdn.digitaloceanspaces.com/cardapio/drinks/tropical.jpg',
      },
      {
        name: 'Lady Pig',
        description: 'Gin, tônica, xarope de morango e limão.',
        price: '25',
        image: 'https://porks.nyc3.cdn.digitaloceanspaces.com/cardapio/ladypig.jpg',
      },
      {
        name: 'Valerie Gin',
        description: 'Gin, tônica, xarope de frutas vermelhas.',
        price: '28',
        image:
          'https://porks.nyc3.cdn.digitaloceanspaces.com/cardapio/valeriegin.jpg',
      },
      {
        name: 'Hellboy',
        description: 'Gin, Campari, limão e tônica.',
        price: '25',
        image:
          'https://porks.nyc3.cdn.digitaloceanspaces.com/cardapio/drinks/hellboy.jpg',
      },
      {
        name: 'Gin Loco',
        description: 'Gin, Monster Mango Loco e laranja.',
        price: '28',
        image:
          'https://porks.nyc3.cdn.digitaloceanspaces.com/cardapio/drinks/ginloco.jpg',
      },
    ],
  },
  {
    title: 'Caipis',
    items: [
      {
        name: 'Caipi Caju',
        description: 'Limão, vodka, licor de Caju.',
        price: '25',
        image:
          'https://porks.nyc3.cdn.digitaloceanspaces.com/cardapio/drinks/caipi-caju.jpg',
      },
      {
        name: 'Caipi Bananinha',
        description: 'Limão, vodka, licor de banana.',
        price: '25',
        image: 'https://porks.nyc3.cdn.digitaloceanspaces.com/cardapio/drinks/caipi-banana.jpg',
      },
      {
        name: 'Caipi Jambu',
        description: 'Limão c/ licor de jambu.',
        price: '25',
        image:
          'https://porks.nyc3.cdn.digitaloceanspaces.com/cardapio/jambu.jpg',
      },
      {
        name: 'Caipi Limão',
        description: 'Limão, açúcar e vodka.',
        price: '25',
        image: 'https://porks.nyc3.cdn.digitaloceanspaces.com/cardapio/drinks/caipi-limao.jpg',
      },
      {
        name: 'Caipi Maracujá c/ Canela',
        description: 'Maracujá, canela e vodka.',
        price: '25',
        image: 'https://porks.nyc3.cdn.digitaloceanspaces.com/cardapio/drinks/caipi-maracuja.jpg',
      },
      {
        name: 'Caipi Morango',
        description: 'Morango, açúcar e vodka.',
        price: '25',
        image: 'https://porks.nyc3.cdn.digitaloceanspaces.com/cardapio/drinks/caipi-morango.jpg',
      },
      {
        name: 'Caipi Frutas Vermelhas',
        description: 'Mix de frutas vermelhas e açúcar.',
        price: '25',
        image: 'https://porks.nyc3.cdn.digitaloceanspaces.com/cardapio/caipi-frutasv.jpg',
      },
      {
        name: 'Caipi Estação',
        description: 'Fruta da estação e açúcar.',
        price: '25',
        image: 'https://porks.nyc3.cdn.digitaloceanspaces.com/cardapio/caipi-estacao.jpg',
      },
    ],
  },
  {
    title: 'Vodka',
    items: [
      {
        name: 'Moscow Mule',
        description: 'Vodka, gengibre e limão c/ espuma.',
        price: '28',
        image: 'https://porks.nyc3.cdn.digitaloceanspaces.com/cardapio/drinks/moscowmule.jpg',
      },
      {
        name: 'Pink Mule',
        description: 'Vodda de frutas vermelhas e gengibre.',
        price: '25',
        image: 'https://porks.nyc3.cdn.digitaloceanspaces.com/cardapio/drinks/pinkmule.jpg',
      },
      {
        name: 'Porkmate',
        description: 'Vodka, mate torrado e limão.',
        price: '15',
        image:
          'https://porks.nyc3.cdn.digitaloceanspaces.com/cardapio/drinks/porksmate.jpg',
      },
      {
        name: 'Melancia Atômica',
        description: 'Vodka, Monster Watermelon e limão.',
        price: '28',
        image:
          'https://porks.nyc3.cdn.digitaloceanspaces.com/cardapio/drinks/melancia-atomica.jpg',
      },
    ],
  },
  {
    title: 'Experimente',
    items: [
      {
        name: 'Bananinha',
        description: 'Shot de licor de banana c/ espuma.',
        price: '15',
        image: 'https://porks.nyc3.cdn.digitaloceanspaces.com/cardapio/drinks/bananinha.jpg',
      },
      {
        name: 'Shot Tequila',
        description: 'Shot de tequila.',
        price: '20',
        image: '',
      },
      {
        name: 'Shot Jambu',
        description: 'Shot de jambu.',
        price: '15',
        image: '',
      },
      {
        name: 'Campari',
        description: 'Shot de Campari.',
        price: '15',
        image:
          'https://porks.nyc3.cdn.digitaloceanspaces.com/cardapio/drinks/shotcampari.jpg',
      },
      {
        name: 'Jack & Coke',
        description: 'Bourbon e Coca-Cola.',
        price: '25',
        image: 'https://porks.nyc3.cdn.digitaloceanspaces.com/cardapio/drinks/jackcoke.jpg',
      },
      {
        name: 'Maracujack',
        description: 'Jack Fire e maracujá.',
        price: '30',
        image: 'https://porks.nyc3.cdn.digitaloceanspaces.com/cardapio/drinks/maracujack.jpg',
      },
    ],
  },
  {
    title: '0 Alcool',
    items: [
      {
        name: 'Capri',
        description: 'Maçã verde, morango ou limão siciliano.',
        price: '15',
        image:
          'https://porks.nyc3.cdn.digitaloceanspaces.com/cardapio/drinks/capri.jpg',
      },
      {
        name: 'Soda Italiana',
        description: 'Maçã verde, morango ou limão siciliano.',
        price: '15',
        image: 'https://porks.nyc3.cdn.digitaloceanspaces.com/cardapio/drinks/sodaitaliana.jpg',
      },
      {
        name: 'Punch',
        description: 'Spritz cítrico e morangos.',
        price: '20',
        image:
          'https://porks.nyc3.cdn.digitaloceanspaces.com/cardapio/drinks/punch-semalcool.jpg',
      },
      {
        name: 'Energético Monster',
        description: 'Todos os sabores, consulte no balcão.',
        price: '16',
        image:
          'https://porks.nyc3.cdn.digitaloceanspaces.com/cardapio/drinks/monster.jpg',
      },
    ],
  },
];

export default function CardapioPage() {


  // **Modal de flyer no load**
  const [flyerOpen, setFlyerOpen] = useState(true);

  // **Modal state**
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [mexModalOpen, setMexModalOpen] = useState(false);

  const openModal = (item) => {
    // Meta Pixel
    if (window.fbq) {
      window.fbq('trackCustom', 'Viu ' + item.name);
    }

    // dispara evento no GA4
    if (typeof gtag === 'function') {
      gtag('event', 'view_item', {
        event_category: 'Cardápio',
        event_label: item.name,
        item_name: item.name
      });
    }

    setSelectedItem(item);
    setIsOpen(true);
  };
  const closeModal = () => {
    setIsOpen(false);
    setSelectedItem(null);
  };
  // --- INÍCIO: Geofence de 1km para 2 locais ---
  const ALLOWED_COORDS = [
    { lat: -15.7697, lon: -47.8750 },    // Porks Sobradinho
    { lat: -15.8229101, lon: -48.0444172 } // Sua casa (QNA 13)
  ];
  const RADIUS_METERS = 10000;

  const toRad = (deg) => deg * Math.PI / 180;
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; // em metros
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    // abre automaticamente ao montar
    setFlyerOpen(true);
  }, []);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { latitude, longitude } = coords;
        const dentro = ALLOWED_COORDS.some(({ lat, lon }) =>
          calculateDistance(latitude, longitude, lat, lon) <= RADIUS_METERS
        );
        if (!dentro) {
          Swal.fire({
            icon: 'warning',
            title: 'Fora de área',
            text: 'Desculpe, você está fora da área de atendimento Porks.',
          }).then(() => {
            setTimeout(() => {
              window.location.href = 'https://sobradinhoporks.com.br';
            }, 5000);
          });
        }
      },
      () => {
        Swal.fire({
          icon: 'error',
          title: 'Não foi possível determinar sua localização',
          text: 'Ative o GPS para acessar o cardápio.',
        }).then(() => {
          setTimeout(() => {
            window.location.href = 'https://sobradinhoporks.com.br';
          }, 5000);
        });
      }
    );
  }, []);
  // --- FIM: Geofence ---

  const itemRefs = useRef({});
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [currentNav, setCurrentNav] = useState(navTitles[0]);

  const shareWhatsApp = async (key) => {
    const el = itemRefs.current[key];
    if (!el) return;

    try {
      // tenta canvas + Web Share API
      const canvas = await html2canvas(el, { backgroundColor: null, useCORS: true });
      const blob = await new Promise(res => canvas.toBlob(res));
      const file = new File([blob], `${key}.png`, { type: 'image/png' });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: el.querySelector('h6')?.innerText,
          text: 'Olha que delícia!'
        });
        return;
      }
    } catch (_) { /* sem Web Share API ou erro de CORS */ }

    // fallback desktop ou erro: abre WhatsApp Web com link para imagem
    const text = encodeURIComponent(el.querySelector('h6')?.innerText + '\nOlha que delícia!');
    const imageUrl = encodeURIComponent(
      menuSections
        .flatMap(section => section.items.map(item => ({
          key: section.title + item.name,
          image: item.image
        })))
        .find(i => i.key === key)?.image || ''
    );
    window.open(`https://web.whatsapp.com/send?text=${text}%0A${imageUrl}`, '_blank');
  };

  // Compartilha via Instagram (só mobile)
  const shareInstagram = async (key) => {
    const el = itemRefs.current[key];
    if (!el) return;

    try {
      const canvas = await html2canvas(el, { backgroundColor: null, useCORS: true });
      const blob = await new Promise(res => canvas.toBlob(res));
      const file = new File([blob], `${key}.png`, { type: 'image/png' });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Olha esse prato!',
          text: 'Compartilhado do Porks'
        });
      } else {
        throw new Error('No WebShare');
      }
    } catch {
      Swal.fire({
        icon: 'info',
        title: 'Compartilhar indisponível',
        text: 'O compartilhamento de imagens via Instagram só funciona em dispositivos móveis.',
        confirmButtonText: 'OK'
      });
    }
  };

  // no topo do seu componente, junto com os outros useEffect:
  useEffect(() => {
    (function (h, o, t, j, a, r) {
      h.hj = h.hj || function () { (h.hj.q = h.hj.q || []).push(arguments) };
      h._hjSettings = { hjid: 6452613, hjsv: 6 };
      a = o.getElementsByTagName('head')[0];
      r = o.createElement('script'); r.async = 1;
      r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
      a.appendChild(r);
    })(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=');

    // não há <script> extra no JSX — só esse self-invoking
    return () => {
      // opcional: remover qualquer <script> do Hotjar que tenha sido adicionado
      const scripts = Array.from(document.querySelectorAll('script')).filter(s =>
        s.src.includes('static.hotjar.com/c/hotjar-6452613')
      );
      scripts.forEach(s => s.parentNode.removeChild(s));
    };
  }, []);

  // Pixel & GA
  useEffect(() => {
    if (window.fbq) window.fbq('trackCustom', 'Abriu Cardapio');
    if (typeof gtag === 'function') {
      gtag('event', 'abriu_cardapio', {
        event_category: 'Cardápio',
        event_label: 'Página Aberta',
      });
    }
  }, []);

  // Destaca seção ativa ao rolar
  useEffect(() => {
    const handleScroll = () => {
      const midpoint = window.innerHeight * 0.4;
      for (let title of navTitles) {
        const id = title.replace(/\s+/g, '');
        const el = document.getElementById(id);
        if (el) {
          const { top, bottom } = el.getBoundingClientRect();
          if (top <= midpoint && bottom > midpoint) {
            setCurrentNav(title);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll suave ao clicar
  const handleNavClick = (title) => {
    const id = title.replace(/\s+/g, '');
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setCurrentNav(title);
  };

  return (
    <>

      <PixelLoader />
      <AppBar position="sticky" sx={{ bgcolor: '#F59E0B', color: '#fff' }}>
        <Toolbar sx={{ flexDirection: 'column', gap: 1, py: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <IconButton edge="start" color="inherit" onClick={() => window.history.back()}>
              <ArrowBackIcon />
            </IconButton>
            <Box component="img" src={logoUrl} alt="Logo Porks" sx={{ height: 40 }} />
            <Box sx={{ width: 48 }} />
          </Box>


        </Toolbar>
      </AppBar>


      <Box
        component="main"
        sx={{
          paddingTop: '18px',
          justifyContent: 'center',
          paddingBottom: 10,
          backgroundColor: '#f5f5f5',
        }}
      >

        {/* Botão Festival Mexicano */}
        <Button
          onClick={() => setMexModalOpen(true)}
          sx={{
            display: 'block',
            margin: '0 auto',
            fontWeight: '400',
            fontFamily: 'Alfa Slab One',
            background: 'linear-gradient(90deg, #008000, #ffffff, #ff0000)',
            color: '#000',
            border: '2px solid #fff',
            borderRadius: '12px',
            textAlign: 'center',
            px: 3,
            py: 1,
            boxShadow: 3,
            '&:hover': {
              background: 'linear-gradient(90deg, #006400, #e0e0e0, #cc0000)',
            },
          }}
        >
          Festival Mexicano
        </Button>
        <br />
        {menuSections.map((section) => (
          <Box
            id={section.title.replace(/\s+/g, '')}
            key={section.title}
            sx={{ mb: 4, textAlign: 'center' }}
          >
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'Alfa Slab One',
                fontWeight: 400,
                mb: 2,
                fontSize: isMobile ? '1.4rem' : '2.4rem',
                color: '#000',
              }}
            >
              {section.title}
            </Typography>

            <Grid container spacing={2} justifyContent="center">
              {section.items.map((item) => {
                const key = section.title + item.name;
                return (
                  <Grid item xs={12} sm={6} md={4} key={key}>
                    <Box
                      ref={el => (itemRefs.current[key] = el)}
                      sx={{
                        width: { xs: '45vw', sm: '60vw', md: '320px' },
                        mx: 'auto',
                        borderRadius: 2,
                        overflow: 'hidden',
                        boxShadow: 3,
                        bgcolor: '#fff',
                        cursor: 'pointer',
                      }}
                      onClick={() => openModal(item)}
                    >
                      {/* imagem */}
                      <Box
                        sx={{
                          width: '100%',
                          pt: { xs: '75%', sm: '100%' },
                          position: 'relative',
                          overflow: 'hidden',
                          bgcolor: '#eee',
                        }}
                      >
                        {item.image && (
                          <Box
                            component="img"
                            src={item.image}
                            alt={item.name}
                            crossOrigin="anonymous"
                            sx={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              transition: 'transform 0.5s',
                              '&:hover': { transform: 'scale(1.1) translate(-50%, -50%)' },
                            }}
                          />
                        )}
                      </Box>

                      {/* conteúdo */}
                      <Box sx={{ p: 2 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontFamily: 'Alfa Slab One',
                            fontWeight: 400,
                            mb: 1,
                            fontSize: isMobile ? '1rem' : '1.4rem',
                            color: '#000',
                            textAlign: 'center',
                          }}
                        >
                          {item.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: isMobile ? '0.8rem' : '1rem',
                            mb: 2,
                            color: '#000',
                            textAlign: 'center',
                          }}
                        >
                          {item.description}
                        </Typography>

                        {/* preço */}
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                          <Chip
                            label={`R$ ${item.price}`}
                            sx={{
                              fontFamily: 'Alfa Slab One',
                              fontWeight: 400,
                              backgroundColor: '#F59E0B',
                              color: '#fff',
                              px: 3,
                              py: 1,
                              borderRadius: '24px',
                              fontSize: isMobile ? '0.9rem' : '1.2rem',
                            }}
                          />
                        </Box>

                        {/* botões de compartilhamento */}

                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1 }}>
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              shareWhatsApp(key);
                            }}
                            aria-label="Compartilhar no WhatsApp"
                            sx={{ color: '#25D366' }}
                          >
                            <WhatsAppIcon />
                          </IconButton>
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              shareInstagram(key);
                            }}
                            aria-label="Compartilhar no Instagram"
                            sx={{ color: '#e20d58' }}
                          >
                            <InstagramIcon />
                          </IconButton>
                        </Box>

                      </Box>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        ))}
      </Box>

      {/* Desktop navigation with text & icon */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 16,
          left: 16,
          right: 16,
          display: { xs: 'none', md: 'flex' },
          justifyContent: 'space-around',
          bgcolor: '#F59E0B',
          borderRadius: 2,
          boxShadow: 3,
          py: 1,
        }}
      >
        {navTitles.map((title) => (
          <Button
            key={title}
            startIcon={sectionIcons[title]}
            onClick={() => handleNavClick(title)}
            sx={{
              color: currentNav === title ? '#fff' : 'rgba(255,255,255,0.7)',
              fontWeight: 400,
            }}
          >
            {title}
          </Button>
        ))}
      </Box>

      {/* Mobile navigation with icons only */}
      <BottomNavigation
        value={currentNav}
        onChange={(_, newVal) => {
          setCurrentNav(newVal);
          handleNavClick(newVal);
        }}
        showLabels={false}
        sx={{
          position: 'fixed',
          bottom: 16,
          left: 16,
          right: 16,
          borderRadius: 2,
          boxShadow: 3,
          bgcolor: '#F59E0B',
          display: { xs: 'flex', md: 'none' },
          overflowX: 'auto',
        }}
      >
        {navTitles.map((title) => (
          <BottomNavigationAction
            key={title}
            value={title}
            icon={sectionIcons[title]}
            sx={{
              flex: 1,
              p: 1.5,
              // transição de fundo mais suave
              transition: 'background-color 0.3s ease-in-out',
              '&.Mui-selected': {
                bgcolor: '#fff',
                borderRadius: '10%',
                transition: 'background-color 0.3s ease-in-out',
                '& .MuiSvgIcon-root': {
                  color: '#F59E0B !important',
                  // diminui o scale e adiciona easing
                  transform: 'scale(1.1)',
                },
              },
              '& .MuiSvgIcon-root': {
                color: '#fff',
                // easing mais suave
                transition: 'color 0.3s ease-in-out, transform 0.3s ease-in-out',
              },
            }}
          />
        ))}
      </BottomNavigation>
      {/* ===== Modal de detalhes ===== */}
      <Dialog open={isOpen} onClose={closeModal} maxWidth="sm" fullWidth>
        {/* Título */}
        <DialogTitle sx={{
          fontFamily: 'Alfa Slab One',
          fontWeight: 400,
          fontSize: '1.4rem',
          textAlign: 'center',
          bgcolor: '#F59E0B',
          color: '#fff',
          py: 1
        }}>
          {selectedItem?.name}
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          {/* imagem quadrada */}
          <Box sx={{ position: 'relative', width: '100%', pt: '100%' }}>
            <Box
              component="img"
              src={selectedItem?.image}
              alt={selectedItem?.name}
              crossOrigin="anonymous"
              sx={{
                position: 'absolute',
                top: 0, left: 0,
                width: '100%', height: '100%',
                objectFit: 'cover',
                objectPosition: 'center'
              }}
            />
          </Box>

          {/* descrição e preço */}
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 400,
                mb: 2
              }}
            >
              {selectedItem?.description}
            </Typography>

            <Typography
              variant="h4"
              sx={{
                fontFamily: 'Alfa Slab One',
                fontWeight: 400,
                fontSize: '1.4rem',
                color: '#F59E0B'
              }}
            >
              R$ {selectedItem?.price}
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button
            onClick={closeModal}
            sx={{
              fontFamily: 'Alfa Slab One',
              fontWeight: 400,
              bgcolor: '#F59E0B',
              color: '#fff',
              px: 3,
              py: 1,
              borderRadius: '24px',
              '&:hover': { bgcolor: '#d17f07' }
            }}
          >
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={mexModalOpen} onClose={() => setMexModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle
          sx={{
            fontFamily: 'Alfa Slab One',
            fontWeight: 400,
            fontSize: '1.5rem',
            textAlign: 'center',
            bgcolor: '#008000',
            color: '#fff',
          }}
        >
          Festival Mexicano 🇲🇽
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box
            component="img"
            src="https://porks.nyc3.cdn.digitaloceanspaces.com/cardapio/mexico-menu.jpg" // certifique-se que a imagem esteja na pasta public/
            alt="Cardápio Mexicano"
            sx={{
              width: '100%',
              height: 'auto',
              objectFit: 'cover',
            }}
          />
        </DialogContent>
      </Dialog>

    </>
  );
}
