import type { Museum } from "@/lib/types";

const now = new Date().toISOString();

export const seedMuseums: Museum[] = [
  {
    id: "seed-muac",
    name: "Museo Universitario Arte Contemporáneo",
    address: "Insurgentes Sur 3000, Centro Cultural Universitario, Coyoacán",
    borough: "Coyoacán",
    website_url: "https://muac.unam.mx/",
    latitude: 19.314602,
    longitude: -99.184624,
    created_at: now,
    updated_at: now
  },
  {
    id: "seed-tamayo",
    name: "Museo Tamayo",
    address: "Paseo de la Reforma 51, Bosque de Chapultepec, Miguel Hidalgo",
    borough: "Miguel Hidalgo",
    website_url: "https://www.museotamayo.org/",
    latitude: 19.425756,
    longitude: -99.181076,
    created_at: now,
    updated_at: now
  },
  {
    id: "seed-jumex",
    name: "Museo Jumex",
    address: "Miguel de Cervantes Saavedra 303, Granada, Miguel Hidalgo",
    borough: "Miguel Hidalgo",
    website_url: "https://www.fundacionjumex.org/",
    latitude: 19.440768,
    longitude: -99.204918,
    created_at: now,
    updated_at: now
  },
  {
    id: "seed-munal",
    name: "Museo Nacional de Arte",
    address: "Tacuba 8, Centro Histórico, Cuauhtémoc",
    borough: "Cuauhtémoc",
    website_url: "https://www.munal.mx/",
    latitude: 19.436121,
    longitude: -99.139011,
    created_at: now,
    updated_at: now
  },
  {
    id: "seed-mam",
    name: "Museo de Arte Moderno",
    address: "Paseo de la Reforma s/n, Bosque de Chapultepec, Miguel Hidalgo",
    borough: "Miguel Hidalgo",
    website_url: "https://mam.inba.gob.mx/",
    latitude: 19.423522,
    longitude: -99.181841,
    created_at: now,
    updated_at: now
  },
  {
    id: "seed-franz-mayer",
    name: "Museo Franz Mayer",
    address: "Av. Hidalgo 45, Centro Histórico, Cuauhtémoc",
    borough: "Cuauhtémoc",
    website_url: "https://franzmayer.org.mx/",
    latitude: 19.437203,
    longitude: -99.143064,
    created_at: now,
    updated_at: now
  },
  {
    id: "seed-san-ildefonso",
    name: "Antiguo Colegio de San Ildefonso",
    address: "Justo Sierra 16, Centro Histórico, Cuauhtémoc",
    borough: "Cuauhtémoc",
    website_url: "https://www.sanildefonso.org.mx/",
    latitude: 19.43687,
    longitude: -99.130932,
    created_at: now,
    updated_at: now
  },
  {
    id: "seed-bellas-artes",
    name: "Museo del Palacio de Bellas Artes",
    address: "Av. Juárez s/n, Centro Histórico, Cuauhtémoc",
    borough: "Cuauhtémoc",
    website_url: "https://museopalaciodebellasartes.inba.gob.mx/",
    latitude: 19.435242,
    longitude: -99.141349,
    created_at: now,
    updated_at: now
  },
  {
    id: "seed-tlatelolco",
    name: "Centro Cultural Universitario Tlatelolco",
    address: "Ricardo Flores Magón 1, Nonoalco-Tlatelolco, Cuauhtémoc",
    borough: "Cuauhtémoc",
    website_url: "https://tlatelolco.unam.mx/",
    latitude: 19.451527,
    longitude: -99.138274,
    created_at: now,
    updated_at: now
  },
  {
    id: "seed-ciudad-mexico",
    name: "Museo de la Ciudad de México",
    address: "José María Pino Suárez 30, Centro Histórico, Cuauhtémoc",
    borough: "Cuauhtémoc",
    website_url: "https://www.cultura.cdmx.gob.mx/recintos/museo-de-la-ciudad-de-mexico",
    latitude: 19.428785,
    longitude: -99.132477,
    created_at: now,
    updated_at: now
  }
];
