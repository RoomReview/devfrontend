export interface Borough {
  id: string;
  name: string;
  zones: string;
  rating: number;
  reviewCount: number;
  avgRent: string;
  trend: string;
  imageSrc: string;
  description: string;
}

export const MOCK_BOROUGHS: Borough[] = [
  {
    id: "1",
    name: "Barking and Dagenham",
    zones: "Zones 4–5",
    rating: 4.9,
    reviewCount: 12,
    avgRent: "£1,450",
    trend: "2.1%",
    imageSrc:
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=400&auto=format&fit=crop",
    description:
      "Barking and Dagenham sits in east London, spanning zones 4–5, and offers some of the more affordable rents in the capital.",
  },
  {
    id: "2",
    name: "Barnet",
    zones: "Zones 3–5",
    rating: 4.9,
    reviewCount: 12,
    avgRent: "£1,850",
    trend: "1.5%",
    imageSrc:
      "https://images.unsplash.com/photo-1449034446853-66c86144b0ad?q=80&w=400&auto=format&fit=crop",
    description:
      "Barnet is one of London's largest boroughs by area, covering zones 3–5 in the north of the city.",
  },
  {
    id: "3",
    name: "Bexley",
    zones: "Zones 5–6",
    rating: 4.9,
    reviewCount: 12,
    avgRent: "£1,350",
    trend: "0.8%",
    imageSrc:
      "https://images.unsplash.com/photo-1549144511-f099e773c147?q=80&w=400&auto=format&fit=crop",
    description:
      "Bexley lies in outer southeast London, spanning zones 5–6, with a quieter, more suburban feel than inner boroughs.",
  },
  {
    id: "4",
    name: "Brent",
    zones: "Zones 2–4",
    rating: 4.9,
    reviewCount: 12,
    avgRent: "£1,750",
    trend: "3.2%",
    imageSrc:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=400&auto=format&fit=crop",
    description:
      "Brent covers zones 2–4 in northwest London and is well connected via multiple Underground lines.",
  },
  {
    id: "5",
    name: "Bromley",
    zones: "Zones 3–6",
    rating: 4.9,
    reviewCount: 12,
    avgRent: "£1,650",
    trend: "1.1%",
    imageSrc:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=400&auto=format&fit=crop",
    description:
      "Bromley is London's largest borough by area, located in the southeast of the city, blending suburban living with green space.",
  },
  {
    id: "6",
    name: "Camden",
    zones: "Zones 1–2",
    rating: 4.9,
    reviewCount: 12,
    avgRent: "£2,450",
    trend: "4.5%",
    imageSrc:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=400&auto=format&fit=crop",
    description:
      "Camden sits in inner north London across zones 1–2, known for its markets, nightlife, and central location.",
  },
  {
    id: "7",
    name: "Croydon",
    zones: "Zones 4–6",
    rating: 4.9,
    reviewCount: 12,
    avgRent: "£1,550",
    trend: "1.9%",
    imageSrc:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=400&auto=format&fit=crop",
    description:
      "Croydon spans zones 4–6 in south London and has become a growing hub for regeneration and transport links.",
  },
  {
    id: "8",
    name: "Ealing",
    zones: "Zones 3–4",
    rating: 4.9,
    reviewCount: 12,
    avgRent: "£1,950",
    trend: "2.8%",
    imageSrc:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=400&auto=format&fit=crop",
    description:
      "Ealing covers zones 3–4 in west London, offering leafy residential streets alongside strong transport connections.",
  },
  {
    id: "9",
    name: "Hammersmith and Fulham",
    zones: "Zones 1–2",
    rating: 4.9,
    reviewCount: 12,
    avgRent: "£2,350",
    trend: "3.1%",
    imageSrc:
      "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=400&auto=format&fit=crop",
    description:
      "Hammersmith and Fulham sits in inner west London across zones 1–2, along the River Thames.",
  },
  {
    id: "10",
    name: "Haringey",
    zones: "Zones 2–3",
    rating: 4.9,
    reviewCount: 12,
    avgRent: "£1,850",
    trend: "2.4%",
    imageSrc:
      "https://images.unsplash.com/photo-1520986606214-8b456906c813?q=80&w=400&auto=format&fit=crop",
    description:
      "Haringey covers zones 2–3 in north London, with a diverse mix of neighbourhoods and green spaces.",
  },
  {
    id: "11",
    name: "Harrow",
    zones: "Zones 4–5",
    rating: 4.9,
    reviewCount: 12,
    avgRent: "£1,650",
    trend: "1.2%",
    imageSrc:
      "https://images.unsplash.com/photo-1433086966358-54859d0ed716?q=80&w=400&auto=format&fit=crop",
    description:
      "Harrow spans zones 4–5 in northwest London and is known for its residential streets and schools.",
  },
  {
    id: "12",
    name: "Havering",
    zones: "Zones 6–7",
    rating: 4.9,
    reviewCount: 12,
    avgRent: "£1,450",
    trend: "0.9%",
    imageSrc:
      "https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=400&auto=format&fit=crop",
    description:
      "Havering sits at London's eastern edge across zones 6–7, offering more space at a lower cost than inner London.",
  },
];
