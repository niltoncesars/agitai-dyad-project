export interface Subcategory {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  subcategories: Subcategory[];
}

export const CATEGORIES: Category[] = [
  {
    id: "musica",
    name: "Música",
    emoji: "🎵",
    subcategories: [
      { id: "shows", name: "Shows" },
      { id: "festival", name: "Festival" },
      { id: "rave_eletronica", name: "Rave / Música eletrônica" },
      { id: "samba_pagode", name: "Samba / Pagode" },
      { id: "rock_pop", name: "Rock / Pop" }
    ]
  },
  {
    id: "festas_noite",
    name: "Festas & Vida Noturna",
    emoji: "🎉",
    subcategories: [
      { id: "balada", name: "Balada" },
      { id: "festa_tematica", name: "Festa temática" },
      { id: "open_bar", name: "Open bar" },
      { id: "festa_universitaria", name: "Festa universitária" },
      { id: "after_party", name: "After party" }
    ]
  },
  {
    id: "humor_entretenimento",
    name: "Humor & Entretenimento",
    emoji: "😂",
    subcategories: [
      { id: "stand_up", name: "Stand-up comedy" },
      { id: "improviso", name: "Improviso" },
      { id: "show_humor", name: "Show de humor" },
      { id: "podcast_ao_vivo", name: "Podcast ao vivo" },
      { id: "entretenimento_ao_vivo", name: "Entretenimento ao vivo" }
    ]
  },
  {
    id: "arte_cultura",
    name: "Arte & Cultura",
    emoji: "🎨",
    subcategories: [
      { id: "exposicoes", name: "Exposições" },
      { id: "teatro", name: "Teatro" },
      { id: "danca", name: "Dança" },
      { id: "literatura", name: "Literatura" },
      { id: "cinema_audiovisual", name: "Cinema / Audiovisual" }
    ]
  },
  {
    id: "gastronomia",
    name: "Gastronomia",
    emoji: "🍽️",
    subcategories: [
      { id: "festival_gastronomico", name: "Festival gastronômico" },
      { id: "degustacao", name: "Degustação" },
      { id: "vinhos_drinks", name: "Vinhos & Drinks" },
      { id: "cerveja_artesanal", name: "Cerveja artesanal" },
      { id: "experiencia_culinaria", name: "Experiência culinária" }
    ]
  },
  {
    id: "negocios_networking",
    name: "Negócios & Networking",
    emoji: "💼",
    subcategories: [
      { id: "networking", name: "Networking" },
      { id: "empreendedorismo", name: "Empreendedorismo" },
      { id: "marketing", name: "Marketing" },
      { id: "lideranca", name: "Liderança" },
      { id: "inovacao", name: "Inovação" }
    ]
  },
  {
    id: "tecnologia",
    name: "Tecnologia",
    emoji: "💻",
    subcategories: [
      { id: "ia", name: "Inteligência artificial" },
      { id: "programacao", name: "Programação" },
      { id: "startups", name: "Startups" },
      { id: "dev_software", name: "Desenvolvimento de software" },
      { id: "hackathon", name: "Hackathon" }
    ]
  },
  {
    id: "educacao",
    name: "Educação",
    emoji: "🎓",
    subcategories: [
      { id: "cursos", name: "Cursos" },
      { id: "workshops", name: "Workshops" },
      { id: "treinamentos", name: "Treinamentos" },
      { id: "seminarios", name: "Seminários" },
      { id: "palestras", name: "Palestras" },
      { id: "congressos", name: "Congressos" },
      { id: "simposios", name: "Simpósios" }
    ]
  },
  {
    id: "esportes",
    name: "Esportes",
    emoji: "🏃",
    subcategories: [
      { id: "corridas", name: "Corridas" },
      { id: "torneios", name: "Torneios" },
      { id: "artes_marciais", name: "Artes marciais" },
      { id: "fitness", name: "Fitness" },
      { id: "esports", name: "eSports" }
    ]
  },
  {
    id: "comunidade_social",
    name: "Comunidade & Social",
    emoji: "👥",
    subcategories: [
      { id: "meetups", name: "Meetups" },
      { id: "eventos_comunitarios", name: "Eventos comunitários" },
      { id: "eventos_religiosos", name: "Eventos religiosos" },
      { id: "eventos_beneficentes", name: "Eventos beneficentes" },
      { id: "grupos_interesse", name: "Grupos de interesse" }
    ]
  },
  {
    id: "familia_infantil",
    name: "Família & Infantil",
    emoji: "👨‍👩‍👧",
    subcategories: [
      { id: "eventos_infantis", name: "Eventos infantis" },
      { id: "parques_recreacao", name: "Parques / recreação" },
      { id: "espetaculos_infantis", name: "Espetáculos infantis" },
      { id: "oficinas_infantis", name: "Oficinas infantis" },
      { id: "atividades_familiares", name: "Atividades familiares" }
    ]
  },
  {
    id: "feiras_experiencias",
    name: "Feiras & Experiências",
    emoji: "🛍️",
    subcategories: [
      { id: "feiras", name: "Feiras" },
      { id: "convencoes", name: "Convenções" },
      { id: "exposicoes_comerciais", name: "Exposições comerciais" },
      { id: "lancamentos", name: "Lançamentos" },
      { id: "experiencias_imersivas", name: "Experiências imersivas" }
    ]
  }
];
