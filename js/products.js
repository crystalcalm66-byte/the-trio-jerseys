var PRODUCTS = [
  {
    id: 'rm',
    name: 'Real Madrid 2024-25',
    club: 'Real Madrid',
    country: 'Spain',
    category: 'Clubs',
    price: 3999,
    bestSeller: true,
    sizes: ['S', 'M', 'L', 'XL'],
    outOfStockSizes: ['S', 'XL'],
    description: 'The iconic white stripes meet modern performance fabric. This player-version jersey features HEAT.RDY technology to keep you cool during the most intense matches. Worn by legends at the Santiago Bernab\u00e9u, it represents the pinnacle of football excellence.',
    images: [
      'https://picsum.photos/seed/football-rm-1/600/800',
      'https://picsum.photos/seed/football-rm-2/600/800',
      'https://picsum.photos/seed/football-rm-3/600/800',
      'https://picsum.photos/seed/football-rm-4/600/800'
    ]
  },
  {
    id: 'mc',
    name: 'Manchester City 2024-25',
    club: 'Manchester City',
    country: 'England',
    category: 'Clubs',
    price: 3799,
    bestSeller: true,
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Channel the treble-winners\' spirit in this sky-blue masterpiece. Precision-engineered with moisture-wicking fabric and a tailored fit, this jersey mirrors what the champions wear on the pitch.',
    images: [
      'https://picsum.photos/seed/football-mc-1/600/800',
      'https://picsum.photos/seed/football-mc-2/600/800',
      'https://picsum.photos/seed/football-mc-3/600/800',
      'https://picsum.photos/seed/football-mc-4/600/800'
    ]
  },
  {
    id: 'liv',
    name: 'Liverpool 2024-25',
    club: 'Liverpool',
    country: 'England',
    category: 'Clubs',
    price: 3499,
    bestSeller: false,
    sizes: ['S', 'M', 'L'],
    description: 'You\'ll never walk alone in this classic red jersey. Built with lightweight stretch fabric for unrestricted movement, it celebrates the relentless spirit of Anfield.',
    images: [
      'https://picsum.photos/seed/football-liv-1/600/800',
      'https://picsum.photos/seed/football-liv-2/600/800',
      'https://picsum.photos/seed/football-liv-3/600/800',
      'https://picsum.photos/seed/football-liv-4/600/800'
    ]
  },
  {
    id: 'bay',
    name: 'Bayern Munich 2024-25',
    club: 'Bayern Munich',
    country: 'Germany',
    category: 'Clubs',
    price: 3699,
    bestSeller: true,
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Mia san Mia \u2014 the red and white of Germany\'s most decorated club. This jersey combines breathable mesh panels with a streamlined fit, engineered for the Allianz Arena.',
    images: [
      'https://picsum.photos/seed/football-bay-1/600/800',
      'https://picsum.photos/seed/football-bay-2/600/800',
      'https://picsum.photos/seed/football-bay-3/600/800',
      'https://picsum.photos/seed/football-bay-4/600/800'
    ]
  },
  {
    id: 'psg',
    name: 'PSG 2024-25',
    club: 'Paris Saint-Germain',
    country: 'France',
    category: 'Clubs',
    price: 4299,
    bestSeller: false,
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Parisian elegance meets elite performance. The dark navy jersey with subtle tonal detailing offers a premium look that transitions seamlessly from the Parc des Princes to the streets.',
    images: [
      'https://picsum.photos/seed/football-psg-1/600/800',
      'https://picsum.photos/seed/football-psg-2/600/800',
      'https://picsum.photos/seed/football-psg-3/600/800',
      'https://picsum.photos/seed/football-psg-4/600/800'
    ]
  },
  {
    id: 'bar',
    name: 'Barcelona 2024-25',
    club: 'Barcelona',
    country: 'Spain',
    category: 'Clubs',
    price: 3899,
    bestSeller: true,
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'M\u00e9s que un club \u2014 more than a club. The famous blaugrana stripes return on a lightweight, breathable frame. Worn by the next generation of Camp Nou heroes.',
    images: [
      'https://picsum.photos/seed/football-bar-1/600/800',
      'https://picsum.photos/seed/football-bar-2/600/800',
      'https://picsum.photos/seed/football-bar-3/600/800',
      'https://picsum.photos/seed/football-bar-4/600/800'
    ]
  },
  {
    id: 'bra',
    name: 'Brazil 2024-25',
    club: null,
    country: 'Brazil',
    category: 'National Teams',
    price: 4499,
    bestSeller: true,
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'The iconic amarelinha that has defined beautiful football for generations. Worn by Pele, Ronaldo, Neymar \u2014 now it\'s your turn. Vibrant yellow with green trim, built for the samba style.',
    images: [
      'https://picsum.photos/seed/football-bra-1/600/800',
      'https://picsum.photos/seed/football-bra-2/600/800',
      'https://picsum.photos/seed/football-bra-3/600/800',
      'https://picsum.photos/seed/football-bra-4/600/800'
    ]
  },
  {
    id: 'arg',
    name: 'Argentina 2024-25',
    club: null,
    country: 'Argentina',
    category: 'National Teams',
    price: 4999,
    bestSeller: true,
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'The World Cup champions\' jersey. Sky blue and white stripes with three gold stars above the crest. Inspired by Messi\'s legendary journey, this is the jersey of champions.',
    images: [
      'https://picsum.photos/seed/football-arg-1/600/800',
      'https://picsum.photos/seed/football-arg-2/600/800',
      'https://picsum.photos/seed/football-arg-3/600/800',
      'https://picsum.photos/seed/football-arg-4/600/800'
    ]
  },
  {
    id: 'fra',
    name: 'France 2024-25',
    club: null,
    country: 'France',
    category: 'National Teams',
    price: 4299,
    bestSeller: false,
    sizes: ['S', 'M', 'L'],
    description: 'Bleu, blanc, rouge \u2014 the tricolour comes alive on this premium jersey. Featuring subtle gold detailing and a modern collar, it represents the elegance and power of French football.',
    images: [
      'https://picsum.photos/seed/football-fra-1/600/800',
      'https://picsum.photos/seed/football-fra-2/600/800',
      'https://picsum.photos/seed/football-fra-3/600/800',
      'https://picsum.photos/seed/football-fra-4/600/800'
    ]
  },
  {
    id: 'pak',
    name: 'Pakistan 2024-25',
    club: null,
    country: 'Pakistan',
    category: 'National Teams',
    price: 2499,
    bestSeller: true,
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Represent the green nation. This jersey features the iconic star and crescent on a rich green base with crisp white accents. Lightweight and breathable, made for the passionate Pakistani fan.',
    images: [
      'https://picsum.photos/seed/football-pak-1/600/800',
      'https://picsum.photos/seed/football-pak-2/600/800',
      'https://picsum.photos/seed/football-pak-3/600/800',
      'https://picsum.photos/seed/football-pak-4/600/800'
    ]
  },
  {
    id: 'ger',
    name: 'Germany 2024-25',
    club: null,
    country: 'Germany',
    category: 'National Teams',
    price: 3999,
    bestSeller: false,
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Die Mannschaft \u2014 the team. Clean white with bold black and gold accents, this jersey embodies German efficiency and footballing pedigree. Four stars above the crest tell the story.',
    images: [
      'https://picsum.photos/seed/football-ger-1/600/800',
      'https://picsum.photos/seed/football-ger-2/600/800',
      'https://picsum.photos/seed/football-ger-3/600/800',
      'https://picsum.photos/seed/football-ger-4/600/800'
    ]
  },
  {
    id: 'por',
    name: 'Portugal 2024-25',
    club: null,
    country: 'Portugal',
    category: 'National Teams',
    price: 4499,
    bestSeller: false,
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Vibrant red with green detailing, representing the passion of Portuguese football. From Eus\u00e9bio to Ronaldo, this jersey carries the weight of a proud footballing nation.',
    images: [
      'https://picsum.photos/seed/football-por-1/600/800',
      'https://picsum.photos/seed/football-por-2/600/800',
      'https://picsum.photos/seed/football-por-3/600/800',
      'https://picsum.photos/seed/football-por-4/600/800'
    ]
  }
];
