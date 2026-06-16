insert into public.museums (name, address, borough, website_url, latitude, longitude)
values
  ('Museo Universitario Arte Contemporáneo', 'Insurgentes Sur 3000, Centro Cultural Universitario, Coyoacán', 'Coyoacán', 'https://muac.unam.mx/', 19.3146020, -99.1846240),
  ('Museo Tamayo', 'Paseo de la Reforma 51, Bosque de Chapultepec, Miguel Hidalgo', 'Miguel Hidalgo', 'https://www.museotamayo.org/', 19.4257560, -99.1810760),
  ('Museo Jumex', 'Miguel de Cervantes Saavedra 303, Granada, Miguel Hidalgo', 'Miguel Hidalgo', 'https://www.fundacionjumex.org/', 19.4407680, -99.2049180),
  ('Museo Nacional de Arte', 'Tacuba 8, Centro Histórico, Cuauhtémoc', 'Cuauhtémoc', 'https://www.munal.mx/', 19.4361210, -99.1390110),
  ('Museo de Arte Moderno', 'Paseo de la Reforma s/n, Bosque de Chapultepec, Miguel Hidalgo', 'Miguel Hidalgo', 'https://mam.inba.gob.mx/', 19.4235220, -99.1818410),
  ('Museo Franz Mayer', 'Av. Hidalgo 45, Centro Histórico, Cuauhtémoc', 'Cuauhtémoc', 'https://franzmayer.org.mx/', 19.4372030, -99.1430640),
  ('Antiguo Colegio de San Ildefonso', 'Justo Sierra 16, Centro Histórico, Cuauhtémoc', 'Cuauhtémoc', 'https://www.sanildefonso.org.mx/', 19.4368700, -99.1309320),
  ('Museo del Palacio de Bellas Artes', 'Av. Juárez s/n, Centro Histórico, Cuauhtémoc', 'Cuauhtémoc', 'https://museopalaciodebellasartes.inba.gob.mx/', 19.4352420, -99.1413490),
  ('Centro Cultural Universitario Tlatelolco', 'Ricardo Flores Magón 1, Nonoalco-Tlatelolco, Cuauhtémoc', 'Cuauhtémoc', 'https://tlatelolco.unam.mx/', 19.4515270, -99.1382740),
  ('Museo de la Ciudad de México', 'José María Pino Suárez 30, Centro Histórico, Cuauhtémoc', 'Cuauhtémoc', 'https://www.cultura.cdmx.gob.mx/recintos/museo-de-la-ciudad-de-mexico', 19.4287850, -99.1324770)
on conflict (name) do update set
  address = excluded.address,
  borough = excluded.borough,
  website_url = excluded.website_url,
  latitude = excluded.latitude,
  longitude = excluded.longitude;

insert into public.sources (name, url, source_type, priority, update_frequency, active, config)
values
  ('MUAC sitio oficial', 'https://muac.unam.mx/', 'official_site', 10, '12h', true, '{"museum_name": "Museo Universitario Arte Contemporáneo"}'),
  ('Museo Tamayo sitio oficial', 'https://www.museotamayo.org/', 'official_site', 10, '12h', true, '{"museum_name": "Museo Tamayo"}'),
  ('Museo Jumex sitio oficial', 'https://www.fundacionjumex.org/', 'official_site', 10, '12h', true, '{"museum_name": "Museo Jumex"}'),
  ('MUNAL sitio oficial', 'https://www.munal.mx/', 'official_site', 10, '12h', true, '{"museum_name": "Museo Nacional de Arte"}'),
  ('Museo de Arte Moderno sitio oficial', 'https://mam.inba.gob.mx/', 'official_site', 10, '12h', true, '{"museum_name": "Museo de Arte Moderno"}'),
  ('Museo Franz Mayer sitio oficial', 'https://franzmayer.org.mx/', 'official_site', 10, '12h', true, '{"museum_name": "Museo Franz Mayer"}'),
  ('San Ildefonso sitio oficial', 'https://www.sanildefonso.org.mx/', 'official_site', 10, '12h', true, '{"museum_name": "Antiguo Colegio de San Ildefonso"}'),
  ('Museo del Palacio de Bellas Artes sitio oficial', 'https://museopalaciodebellasartes.inba.gob.mx/', 'official_site', 10, '12h', true, '{"museum_name": "Museo del Palacio de Bellas Artes"}'),
  ('Centro Cultural Universitario Tlatelolco sitio oficial', 'https://tlatelolco.unam.mx/', 'official_site', 10, '12h', true, '{"museum_name": "Centro Cultural Universitario Tlatelolco"}'),
  ('Museo de la Ciudad de México sitio oficial', 'https://www.cultura.cdmx.gob.mx/recintos/museo-de-la-ciudad-de-mexico', 'official_site', 10, '12h', true, '{"museum_name": "Museo de la Ciudad de México"}')
on conflict do nothing;
