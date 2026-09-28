// Countries and cities offered in the Studio's "Based in" pickers. Each city
// carries approximate centre coordinates, saved to artists.lat/lng so the
// location pill on an artist's page opens the right place in Google Maps.
// Anything not listed can still be typed in via "Other…".

export type City = { name: string; lat: number; lng: number };
export type Country = { name: string; cities: City[] };

const c = (name: string, lat: number, lng: number): City => ({ name, lat, lng });

export const COUNTRIES: Country[] = [
  {
    name: "Thailand",
    cities: [
      c("Bangkok", 13.7563, 100.5018),
      c("Chiang Mai", 18.7883, 98.9853),
      c("Chiang Rai", 19.9105, 99.8406),
      c("Phuket", 7.8804, 98.3923),
      c("Krabi", 8.0863, 98.9063),
      c("Khon Kaen", 16.4322, 102.8236),
      c("Nan", 18.7756, 100.773),
      c("Chonburi", 13.3611, 100.9847),
      c("Pattaya", 12.9236, 100.8825),
      c("Hua Hin", 12.5684, 99.9577),
      c("Ayutthaya", 14.3532, 100.5689),
      c("Udon Thani", 17.4138, 102.787),
      c("Nakhon Ratchasima", 14.9799, 102.0978),
      c("Hat Yai", 7.0086, 100.4747),
      c("Songkhla", 7.1898, 100.5954),
      c("Surat Thani", 9.1382, 99.3217),
      c("Ubon Ratchathani", 15.2287, 104.8564),
      c("Phitsanulok", 16.8211, 100.2659),
      c("Lampang", 18.2888, 99.4909),
      c("Mae Hong Son", 19.3003, 97.9685),
      c("Kanchanaburi", 14.0228, 99.5328),
      c("Nakhon Pathom", 13.8199, 100.0621),
      c("Nonthaburi", 13.8621, 100.5144),
      c("Pathum Thani", 14.0208, 100.525),
      c("Samut Prakan", 13.5991, 100.5998),
      c("Rayong", 12.6814, 101.2816),
      c("Chanthaburi", 12.6112, 102.1039),
      c("Trang", 7.5563, 99.6114),
      c("Sukhothai", 17.0068, 99.8265),
      c("Loei", 17.4861, 101.7223),
      c("Nakhon Si Thammarat", 8.4304, 99.9631),
      c("Phetchaburi", 13.1119, 99.9447),
    ],
  },
  { name: "Australia", cities: [c("Sydney", -33.8688, 151.2093), c("Melbourne", -37.8136, 144.9631), c("Brisbane", -27.4698, 153.0251)] },
  { name: "Brazil", cities: [c("São Paulo", -23.5505, -46.6333), c("Rio de Janeiro", -22.9068, -43.1729)] },
  { name: "Cambodia", cities: [c("Phnom Penh", 11.5564, 104.9282), c("Siem Reap", 13.3671, 103.8448)] },
  { name: "China", cities: [c("Beijing", 39.9042, 116.4074), c("Shanghai", 31.2304, 121.4737), c("Guangzhou", 23.1291, 113.2644), c("Chengdu", 30.5728, 104.0668)] },
  { name: "France", cities: [c("Paris", 48.8566, 2.3522), c("Lyon", 45.764, 4.8357), c("Marseille", 43.2965, 5.3698)] },
  { name: "Germany", cities: [c("Berlin", 52.52, 13.405), c("Munich", 48.1351, 11.582), c("Hamburg", 53.5511, 9.9937), c("Cologne", 50.9375, 6.9603)] },
  { name: "Hong Kong", cities: [c("Hong Kong", 22.3193, 114.1694)] },
  { name: "India", cities: [c("Mumbai", 19.076, 72.8777), c("New Delhi", 28.6139, 77.209), c("Bengaluru", 12.9716, 77.5946), c("Kolkata", 22.5726, 88.3639)] },
  { name: "Indonesia", cities: [c("Jakarta", -6.2088, 106.8456), c("Yogyakarta", -7.7956, 110.3695), c("Bandung", -6.9175, 107.6191), c("Denpasar (Bali)", -8.6705, 115.2126)] },
  { name: "Iran", cities: [c("Tehran", 35.6892, 51.389), c("Isfahan", 32.6546, 51.668)] },
  { name: "Italy", cities: [c("Rome", 41.9028, 12.4964), c("Milan", 45.4642, 9.19), c("Venice", 45.4408, 12.3155), c("Florence", 43.7696, 11.2558)] },
  { name: "Japan", cities: [c("Tokyo", 35.6762, 139.6503), c("Kyoto", 35.0116, 135.7681), c("Osaka", 34.6937, 135.5023), c("Fukuoka", 33.5902, 130.4017), c("Sapporo", 43.0618, 141.3545)] },
  { name: "Laos", cities: [c("Vientiane", 17.9757, 102.6331), c("Luang Prabang", 19.8856, 102.1347)] },
  { name: "Malaysia", cities: [c("Kuala Lumpur", 3.139, 101.6869), c("George Town (Penang)", 5.4141, 100.3288), c("Ipoh", 4.5975, 101.0901), c("Johor Bahru", 1.4927, 103.7414)] },
  { name: "Mexico", cities: [c("Mexico City", 19.4326, -99.1332), c("Oaxaca", 17.0732, -96.7266), c("Guadalajara", 20.6597, -103.3496)] },
  { name: "Myanmar", cities: [c("Yangon", 16.8409, 96.1735), c("Mandalay", 21.9588, 96.0891)] },
  { name: "Netherlands", cities: [c("Amsterdam", 52.3676, 4.9041), c("Rotterdam", 51.9244, 4.4777)] },
  { name: "Philippines", cities: [c("Manila", 14.5995, 120.9842), c("Cebu City", 10.3157, 123.8854)] },
  { name: "Portugal", cities: [c("Lisbon", 38.7223, -9.1393), c("Porto", 41.1579, -8.6291)] },
  { name: "Singapore", cities: [c("Singapore", 1.3521, 103.8198)] },
  { name: "South Korea", cities: [c("Seoul", 37.5665, 126.978), c("Busan", 35.1796, 129.0756)] },
  { name: "Spain", cities: [c("Madrid", 40.4168, -3.7038), c("Barcelona", 41.3874, 2.1686)] },
  { name: "Taiwan", cities: [c("Taipei", 25.033, 121.5654), c("Tainan", 22.9999, 120.227), c("Kaohsiung", 22.6273, 120.3014)] },
  { name: "United Kingdom", cities: [c("London", 51.5072, -0.1276), c("Manchester", 53.4808, -2.2426), c("Glasgow", 55.8642, -4.2518), c("Edinburgh", 55.9533, -3.1883)] },
  { name: "United States", cities: [c("New York", 40.7128, -74.006), c("Los Angeles", 34.0522, -118.2437), c("Chicago", 41.8781, -87.6298), c("San Francisco", 37.7749, -122.4194)] },
  { name: "Vietnam", cities: [c("Hanoi", 21.0278, 105.8342), c("Ho Chi Minh City", 10.8231, 106.6297), c("Da Nang", 16.0544, 108.2022), c("Hue", 16.4637, 107.5909)] },
];

export function findCountry(name: string | null | undefined) {
  return COUNTRIES.find((co) => co.name.toLowerCase() === (name ?? "").trim().toLowerCase()) ?? null;
}

export function findCity(country: Country | null, name: string | null | undefined) {
  return country?.cities.find((ci) => ci.name.toLowerCase() === (name ?? "").trim().toLowerCase()) ?? null;
}
