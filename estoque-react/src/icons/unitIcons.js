// src/icons/unitIcons.jsx
import React from 'react';
import {
  Inventory as InventoryIcon,
  LocalShipping as LocalShippingIcon,
  ShoppingBag as ShoppingBagIcon,
  OilBarrel as OilBarrelIcon,
  Opacity as OpacityIcon,
  Widgets as WidgetsIcon,
  Liquor as LiquorIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';

/**
 * Cada chave corresponde ao unit.name cadastrado no banco.
 * Exporta o componente de ícone, não um elemento JSX pronto.
 */
export const unitIcons = {
  caixa:   InventoryIcon,       // caixas, pacotes
  pacote:  InventoryIcon,       // sinônimo de “caixa”
  fardo:   LiquorIcon,          // fardo de 12 latas/garrafas
  saco:    ShoppingBagIcon,     // sacos
  barril:  OilBarrelIcon,       // barris
  galão:   OpacityIcon,         // galões
  unidade: WidgetsIcon,         // unidade genérica

  // sinônimos / plurais
  caixas:  InventoryIcon,
  fardos:  LiquorIcon,
  barris:  OilBarrelIcon,

  default: CategoryIcon,        // fallback
};
