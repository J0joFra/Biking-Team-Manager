"use strict";
/* ============================================================
   DATI DI GIOCO: nomi, squadre, calendario, ritiri, categorie
   ============================================================ */
const NAMES={
 ITA:{f:['Luca','Matteo','Andrea','Davide','Simone','Lorenzo','Filippo','Tommaso','Riccardo','Alessio','Nicolò','Gabriele','Edoardo','Federico','Michele','Giacomo','Pietro','Elia','Samuele','Mattia','Christian','Manuel','Alberto','Stefano'],l:['Bertolini','Ferraro','Sartori','Mancini','Guidetti','Rinaldi','Vescovi','Pellegrini','Bassetti','Zanetti','Morandi','Caputo','Lazzaro','Fontanella','Baldan','Cattaneo','Righetto','Tomasoni','Valsecchi','Brambati','Dal Molin','Furlan','Peretti','Scarpa','Agostini','Zordan','Cavalieri','Meneghin','Bortolin','Gualdi','Ruggeri','Piazza','Marcon','Bettin']},
 ESP:{f:['Pablo','Javier','Iker','Sergio','Álvaro','Rubén','Unai','Marcos','Adrián','Hugo','Mikel','Raúl'],l:['Etxeberria','Moreno','Castillo','Arrieta','Gallardo','Navarro','Olabarria','Serrano','Vidal','Lizarraga','Ortuño','Bermejo','Arregui','Pascual']},
 FRA:{f:['Théo','Hugo','Louis','Maxime','Baptiste','Clément','Lucas','Romain','Quentin','Axel','Valentin','Mathis'],l:['Lefèvre','Garnier','Moulin','Bertrand','Chevalier','Roussel','Fabre','Delorme','Marchand','Perrin','Vasseur','Lacombe','Guérin','Barbier']},
 BEL:{f:['Jens','Arne','Senne','Lander','Milan','Robbe','Jasper','Seppe','Wannes','Thibau','Lars','Tibo'],l:['Vermeulen','De Smet','Peeters','Claes','Van Damme','Wouters','Goossens','Verhaegen','De Wilde','Van Acker','Lenaerts','Bracke','Mertens','De Cock']},
 NED:{f:['Daan','Bram','Sem','Thijs','Ruben','Stijn','Koen','Jelle','Gijs','Luuk'],l:['Bakker','Visser','Smit','Mulder','Bos','Kuipers','Hendriks','Van Leeuwen','Brouwer','Dekker','Van Beek','Postma']},
 COL:{f:['Santiago','Brayan','Esteban','Camilo','Andrés','Jhon','Sebastián','Kevin','Wilmar','Yeison'],l:['Rincón','Quintero','Cárdenas','Ospina','Restrepo','Galeano','Patiño','Murillo','Arango','Benavides','Montoya','Zapata']},
 DEN:{f:['Mikkel','Magnus','Rasmus','Frederik','Emil','Jonas','Anders','Tobias'],l:['Kristensen','Lund','Holm','Thomsen','Bach','Dalgaard','Nørgaard','Vinther','Skov','Juhl']},
 NOR:{f:['Sindre','Eirik','Håkon','Vegard','Kristian','Torstein','Even'],l:['Haugen','Bakken','Solberg','Myhre','Strand','Aasen','Lunde','Brekke']},
 SLO:{f:['Žiga','Jan','Matej','Luka','Nejc','Gal','Anže'],l:['Kovač','Zupan','Horvat','Kranjc','Potočnik','Mlakar','Vidmar','Kos']},
 GBR:{f:['Tom','Oliver','Harry','Finn','Joe','Ethan','Callum'],l:['Whitfield','Barnes','Holloway','Pryce','Ashworth','Kendall','Marsh','Tolland','Rowley']},
 GER:{f:['Lukas','Jonas','Felix','Moritz','Niklas','Paul','Jannik','Florian'],l:['Brandt','Weiß','Krüger','Lehmann','Schuster','Vogt','Hartmann','Böhm','Albrecht']},
 POL:{f:['Kacper','Szymon','Jakub','Michał','Filip','Bartosz'],l:['Nowak','Wiśniewski','Kowalczyk','Zieliński','Mazur','Krawczyk','Pawlak']},
 POR:{f:['João','Rui','Tiago','Diogo','Nuno','Afonso'],l:['Ferreira','Carvalho','Marques','Pinto','Sousa','Teixeira','Lopes']},
 SUI:{f:['Marc','Silvan','Yannis','Joel','Fabio','Nico'],l:['Brunner','Gerber','Frei','Keller','Zbinden','Huber','Ammann']},
 AUT:{f:['Lukas','Felix','Matthias','Stefan','Gregor','Valentin'],l:['Gruber','Pichler','Steiner','Moser','Hofer','Leitner','Wimmer']}
};
/* nomi femminili per nazionalità (i cognomi sono gli stessi) */
const NAMES_F={
 ITA:['Giulia','Martina','Chiara','Sara','Elisa','Francesca','Alessia','Silvia','Marta','Letizia','Arianna','Federica','Elena','Gaia','Sofia','Beatrice','Asia','Vittoria','Camilla','Irene','Greta','Noemi','Ilaria','Anna'],
 ESP:['Lucía','Ane','Sara','Laura','Paula','Ainhoa','Mireia','Irene','Naia','Carmen','Leire','Marta'],
 FRA:['Juliette','Camille','Léa','Manon','Pauline','Clara','Margot','Jade','Inès','Océane','Chloé','Maëlle'],
 BEL:['Lotte','Julie','Marthe','Sanne','Femke','Elke','Shari','Fien','Lien','Kaat','Jesse','Lore'],
 NED:['Femke','Demi','Lorena','Shirin','Maaike','Floortje','Puck','Mischa','Riejanne','Anouk','Lieke','Esmée'],
 COL:['Diana','Paula','Lina','Camila','Valentina','Daniela','Natalia','Juliana','Sofía','Mariana'],
 DEN:['Emma','Cecilie','Julie','Rebecca','Amalie','Ida','Freja','Mathilde','Signe','Astrid'],
 NOR:['Ingrid','Mie','Susanne','Kristine','Nora','Thea','Ane','Ingvild','Sigrid','Maren'],
 SLO:['Urška','Eugenija','Nika','Lea','Maja','Tjaša','Špela','Ana','Hana','Tina'],
 GBR:['Lizzie','Anna','Pfeiffer','Cat','Elinor','Josie','Millie','Grace','Lucy','Abi','Ella','Holly'],
 GER:['Liane','Franziska','Antonia','Ricarda','Lisa','Clara','Hannah','Lena','Mieke','Romy'],
 POL:['Katarzyna','Marta','Agnieszka','Aurela','Dominika','Karolina','Zofia','Natalia'],
 POR:['Daniela','Beatriz','Maria','Inês','Sofia','Ana','Mariana','Rita'],
 SUI:['Marlen','Elise','Noemi','Linda','Jasmin','Lea','Annika','Petra'],
 AUT:['Anna','Christina','Carina','Kathrin','Lisa','Sarah','Leila','Valentina']
};
const ARCH={
 scalatore:{m:[55,63],w:[5.5,6.0],s:[880,1120],tt:[0.245,0.27],e:[60,90],lab:'Scalatore'},
 puncheur:{m:[61,69],w:[5.3,5.75],s:[1150,1400],tt:[0.24,0.265],e:[55,85],lab:'Puncheur'},
 velocista:{m:[70,80],w:[4.65,5.05],s:[1420,1720],tt:[0.245,0.27],e:[45,75],lab:'Velocista'},
 passista:{m:[70,80],w:[4.9,5.3],s:[1100,1350],tt:[0.218,0.24],e:[60,90],lab:'Passista'},
 cronoman:{m:[68,78],w:[5.05,5.45],s:[1000,1250],tt:[0.205,0.225],e:[60,85],lab:'Cronoman'},
 gregario:{m:[63,74],w:[4.95,5.35],s:[1050,1300],tt:[0.23,0.255],e:[60,90],lab:'Gregario'}
};
const ARCH_MIX=['scalatore','scalatore','puncheur','puncheur','velocista','velocista','passista','passista','cronoman','gregario','gregario','gregario','gregario','gregario','puncheur','scalatore','passista','gregario','scalatore','velocista','gregario','puncheur','gregario','cronoman','passista','gregario','scalatore','gregario','gregario','gregario'];

/* Squadre di fantasia: [nome, sigla, livello, nazionalità] */
const AI_TEAMS=[
 ['Aurora Grid Pro Cycling','AUR','wt',['NED','BEL','DEN']],['Nordwind Racing','NWR','wt',['NOR','DEN','GBR']],
 ['Equipo Cordillera','CRD','wt',['ESP','COL']],['Lumen Pro Team','LUM','wt',['FRA','BEL']],
 ['Vortex Cycling','VTX','wt',['GER','AUT','SUI']],['Team Halcyon','HAL','wt',['GBR','NED']],
 ['Meridian Velo','MER','wt',['ITA','SLO','ESP']],['Kestrel Pro Cycling','KES','wt',['BEL','NED','FRA']],
 ['Polaris WorldTeam','PLR','wt',['DEN','NOR','POL']],['Gallia Cyclisme','GAL','wt',['FRA']],
 ['Flandria Forte','FLF','wt',['BEL']],['Orizzonte Team','ORZ','wt',['ITA']],
 ['Basalt Racing','BAS','wt',['SUI','GER','AUT']],['Tramontana Cycling','TRA','wt',['ESP','POR','COL']],
 ['Hanse Pro Cycling','HAN','wt',['GER','NED']],['Fjell Racing','FJE','wt',['NOR','DEN']],
 ['Atlantis Velo','ATV','wt',['POR','ESP','FRA']],['Cobalt Cycling','COB','wt',['SLO','ITA','AUT']],
 ['Team Appennino Pro','APP','pro',['ITA']],['Ardennes Wallonie Pro','AWP','pro',['BEL','FRA']],
 ['Iberia Ciclismo','IBE','pro',['ESP','POR']],['Polder Pro Cycling','PPC','pro',['NED','BEL']],
 ['Alpenrose Racing','ALR','pro',['AUT','SUI','GER']],['Bretagne Vélo Pro','BVP','pro',['FRA']],
 ['Karst Pro Team','KPT','pro',['SLO','ITA']],['Danubio Cycling','DAN','pro',['AUT','POL']],
 ['Thames Pro Racing','THA','pro',['GBR']],['Laguna Pro Cycling','LPC','pro',['ITA']],
 ['Sierra Pro Team','SPT','pro',['ESP','COL']],['Eifel Pro Cycling','EIF','pro',['GER','NED']],
 ['Ciclistica Valdarno','VAL','conti',['ITA']],['Team Laguna Veneta','LAG','conti',['ITA','SLO']],
 ['Biciclette Marchigiane','BMA','conti',['ITA']],['Vélo Club Ardennes','VCA','conti',['BEL','FRA']],
 ['Zuid-Holland Cycling','ZHC','conti',['NED']],['Equipo Meseta','MES','conti',['ESP','COL']],
 ['Karst Cycling Team','KRS','conti',['SLO','ITA']],['Fjord Development','FJD','conti',['NOR','DEN']],
 ['Team Pianura Padana','TPP','conti',['ITA']],['Sierra Nevada Ciclismo','SNC','conti',['ESP']],
 ['Brabant Continental','BRA','conti',['BEL','NED']],['GS Dolomiti','DOL','conti',['ITA','GER']],
 ['Highlands Racing','HIG','conti',['GBR']],['Bergamasca Bike Team','BBT','conti',['ITA']],
 ['Loire Valley Cycling','LOI','conti',['FRA']],['Andes Desarrollo','AND','conti',['COL']],
 ['Mazovia Cycling','MAZ','conti',['POL']],['Minho Ciclismo','MIN','conti',['POR']],
 ['Tirol Continental','TIR','conti',['AUT','GER']],['Romandie Cycling','ROM','conti',['SUI','FRA']],
 ['Accademia Toscana U23','ACT','dev',['ITA']],['Flanders Talent Team','FLT','dev',['BEL']],
 ['Giovani Romagna','GRO','dev',['ITA']],['Cantabria Desarrollo','CAN','dev',['ESP']],['Jura Espoirs','JUR','dev',['FRA']]
];

/* Calendario: [nome, paese, settimana, classe, percorso]
   percorso: "tipo:km" per le corse di un giorno, "tappe:profilo" per quelle a tappe
   profili: F pianeggiante, M misto, H collinare, A alpino, G grande giro */
const RACES=[
 ['Challenge Mallorca – Serra de Tramuntana','ESP',5,'1.1','montagna:165'],
 ['Grand Prix La Marseillaise','FRA',5,'1.1','mossa:170'],
 ['Clàssica Comunitat Valenciana','ESP',5,'1.2','piatta:165'],
 ['Étoile de Bessèges','FRA',6,'2.1','5:M'],
 ['Volta a la Comunitat Valenciana','ESP',6,'2.Pro','5:M'],
 ['Tour de la Provence','FRA',7,'2.1','3:H'],
 ['Vuelta a Murcia','ESP',7,'1.1','collinare:180'],
 ['Clásica Jaén Paraíso Interior','ESP',7,'1.1','sterrato:170'],
 ['Volta ao Algarve','POR',8,'2.Pro','5:M'],
 ['Vuelta a Andalucía','ESP',8,'2.Pro','5:H'],
 ['Tour des Alpes-Maritimes','FRA',8,'2.1','3:H'],
 ['Trofeo Laigueglia','ITA',9,'1.Pro','collinare:195'],
 ['Omloop Nieuwsblad','BEL',9,'1.UWT','pave:197'],
 ['Kuurne-Brussel-Kuurne','BEL',9,'1.Pro','pave:195'],
 ['Faun-Ardèche Classic','FRA',9,'1.Pro','collinare:170'],
 ['O Gran Camiño','ESP',9,'2.1','4:H'],
 ['Istrian Spring Trophy','CRO',10,'2.2','4:M'],
 ['Le Samyn','BEL',10,'1.1','pave:200'],
 ['Strade Bianche','ITA',10,'1.UWT','sterrato:213'],
 ['Paris-Nice','FRA',10,'2.UWT','8:M'],
 ['Gran Premio Industria e Artigianato','ITA',10,'1.Pro','collinare:200'],
 ['Tirreno-Adriatico','ITA',11,'2.UWT','7:M'],
 ['Milano-Torino','ITA',11,'1.Pro','collinare:175'],
 ['Ronde van Drenthe','NED',11,'1.1','pave:190'],
 ['Milano-Sanremo','ITA',12,'MON','mossa:289'],
 ['Nokere Koerse','BEL',12,'1.Pro','pave:190'],
 ['Classic Brugge-De Panne','BEL',12,'1.UWT','piatta:200'],
 ['Per Sempre Alfredo','ITA',12,'1.1','collinare:180'],
 ['Visegrad 4 – GP Polski','POL',12,'1.2','piatta:170'],
 ['Volta a Catalunya','ESP',13,'2.UWT','7:H'],
 ['E3 Saxo Classic','BEL',13,'1.UWT','pave:209'],
 ['Gent-Wevelgem','BEL',13,'1.UWT','pave:250'],
 ['Settimana Coppi e Bartali','ITA',13,'2.1','5:H'],
 ['Gent-Wevelgem U23','BEL',13,'1.2U','pave:165'],
 ['Dwars door Vlaanderen','BEL',14,'1.UWT','pave:185'],
 ['Ronde van Vlaanderen','BEL',14,'MON','pave:270'],
 ['Ronde van Vlaanderen Beloften','BEL',14,'1.2U','pave:170'],
 ['Trofeo Piva','ITA',14,'1.2U','collinare:170'],
 ['Giro del Belvedere','ITA',14,'1.2U','mossa:165'],
 ['Trofeo Emilio Paganessi','ITA',14,'MJ','collinare:110'],
 ['GP Palio del Recioto','ITA',15,'1.2U','collinare:160'],
 ['Itzulia Basque Country','ESP',15,'2.UWT','6:H'],
 ['Scheldeprijs','BEL',15,'1.Pro','piatta:200'],
 ['Paris-Roubaix','FRA',15,'MON','roubaix:259'],
 ['Giro di Sicilia','ITA',15,'2.1','4:H'],
 ['Circuit des Ardennes','FRA',15,'2.2','4:M'],
 ['Paris-Roubaix Juniors','FRA',15,'MJ','roubaix:120'],
 ['Brabantse Pijl','BEL',16,'1.Pro','collinare:200'],
 ['Amstel Gold Race','NED',16,'1.UWT','mossa:255'],
 ['La Flèche Wallonne','BEL',16,'1.UWT','collinare:205'],
 ['Giro d\'Abruzzo','ITA',16,'2.1','4:H'],
 ['Liège-Bastogne-Liège U23','BEL',16,'1.2U','mossa:175'],
 ['Trofeo Città di San Vendemiano','ITA',16,'1.2U','collinare:165'],
 ['Liège-Bastogne-Liège','BEL',17,'MON','mossa:252'],
 ['Tour of the Alps','ITA',17,'2.Pro','5:A'],
 ['Gran Premio della Liberazione','ITA',17,'1.2','piatta:150'],
 ['Giro dell\'Appennino','ITA',17,'1.1','collinare:200'],
 ['Tour de Bretagne','FRA',17,'2.2','7:M'],
 ['Eschborn-Frankfurt','GER',18,'1.UWT','mossa:200'],
 ['Tour de Romandie','SUI',18,'2.UWT','6:H'],
 ['Vuelta a Asturias','ESP',18,'2.1','3:A'],
 ['GP Industrie del Marmo','ITA',18,'1.2U','collinare:170'],
 ['Giro d\'Italia','ITA',19,'GT','21:G'],
 ['Tour de Hongrie','HUN',19,'2.Pro','5:M'],
 ['Olympia\'s Tour','NED',19,'2.2','5:F'],
 ['Quatre Jours de Dunkerque','FRA',20,'2.Pro','6:F'],
 ['Flèche Ardennaise','BEL',20,'1.2','collinare:170'],
 ['Ronde de l\'Isard','FRA',21,'2.2U','4:A'],
 ['Paris-Roubaix Espoirs','FRA',22,'1.2U','roubaix:170'],
 ['Boucles de la Mayenne','FRA',22,'2.Pro','4:F'],
 ['Tour of Norway','NOR',22,'2.Pro','4:H'],
 ['Mercan\'Tour Classic','FRA',22,'1.1','montagna:160'],
 ['Trofeo Alcide Degasperi','ITA',22,'1.2','collinare:160'],
 ['Trofeo Karlsberg','GER',22,'MJ','collinare:115'],
 ['Critérium du Dauphiné','FRA',23,'2.UWT','8:A'],
 ['Adriatica Ionica Race','ITA',23,'2.1','4:H'],
 ['Giro del Friuli Venezia Giulia','ITA',23,'2.2','4:H'],
 ['Rund um Köln','GER',23,'1.1','mossa:190'],
 ['Tour de Suisse','SUI',24,'2.UWT','8:A'],
 ['Tour of Slovenia','SLO',24,'2.Pro','5:H'],
 ['Baloise Belgium Tour','BEL',24,'2.Pro','5:F'],
 ['Giro Next Gen','ITA',24,'2.2U','8:A'],
 ['Route d\'Occitanie','FRA',24,'2.1','4:A'],
 ['Copenhagen Sprint','DEN',25,'1.UWT','piatta:225'],
 ['Campionato Italiano a cronometro','ITA',26,'CN','crono:40'],
 ['Campionato Italiano Under 23','ITA',26,'CN','collinare:170','u23'],
 ['Campionato Italiano Elite','ITA',26,'CN','collinare:225','elite'],
 ['Tour de France','FRA',27,'GT','21:G'],
 ['Sibiu Cycling Tour','ROU',28,'2.1','4:A'],
 ['Tour of Austria','AUT',28,'2.1','5:A'],
 ['Giro della Valle d\'Aosta','ITA',29,'2.2U','5:A'],
 ['Tour de Wallonie','BEL',30,'2.Pro','5:M'],
 ['Vuelta a Burgos','ESP',31,'2.Pro','5:A'],
 ['Clásica San Sebastián','ESP',31,'1.UWT','mossa:230'],
 ['Tour de Pologne','POL',31,'2.UWT','7:M'],
 ['Gran Premio Capodarco','ITA',33,'1.2','collinare:170'],
 ['Arctic Race of Norway','NOR',33,'2.Pro','4:H'],
 ['Hamburg Cyclassics','GER',34,'1.UWT','piatta:205'],
 ['Renewi Tour','BEL',34,'2.UWT','5:F'],
 ['Vuelta a España','ESP',34,'GT','21:G'],
 ['Deutschland Tour','GER',34,'2.Pro','5:M'],
 ['Bretagne Classic','FRA',35,'1.UWT','mossa:250'],
 ['Coppa Città di San Daniele','ITA',35,'1.2','collinare:165'],
 ['Giro della Lunigiana','ITA',36,'MJ','collinare:110'],
 ['Tour of Britain','GBR',36,'2.Pro','6:M'],
 ['Tour de Luxembourg','LUX',37,'2.Pro','5:H'],
 ['Grand Prix de Wallonie','BEL',37,'1.Pro','collinare:200'],
 ['Giro della Toscana','ITA',38,'1.1','collinare:195'],
 ['Coppa Sabatini','ITA',38,'1.Pro','collinare:200'],
 ['Memorial Marco Pantani','ITA',38,'1.1','collinare:190'],
 ['Trofeo Matteotti','ITA',38,'1.1','collinare:200'],
 ['Gran Premio Sportivi di Poggiana','ITA',38,'1.2U','collinare:160'],
 ['Ruota d\'Oro','ITA',39,'1.2U','collinare:160'],
 ['Coppa Agostoni','ITA',40,'1.1','collinare:200'],
 ['Coppa Bernocchi','ITA',40,'1.Pro','mossa:185'],
 ['Tre Valli Varesine','ITA',40,'1.Pro','collinare:195'],
 ['Giro dell\'Emilia','ITA',40,'1.Pro','collinare:200'],
 ['Gran Piemonte','ITA',41,'1.Pro','collinare:180'],
 ['Il Lombardia','ITA',41,'MON','montagna:252'],
 ['Piccolo Giro di Lombardia','ITA',41,'1.2U','collinare:170'],
 ['Paris-Tours','FRA',41,'1.Pro','sterrato:215'],
 ['Veneto Classic','ITA',42,'1.Pro','collinare:200'],
 ['Giro del Veneto','ITA',42,'1.1','mossa:180'],
 ['Chrono des Nations','FRA',42,'1.1','crono:45'],
 ['Criterium a punti di Bergamo','ITA',30,'CRIT','circuito:96'],
 ['Criterium a punti di Torino','ITA',32,'CRIT','circuito:100'],
 ['Criterium a punti di Treviso','ITA',33,'CRIT','circuito:96'],
 ['Criterium a punti di Lugano','SUI',35,'CRIT','circuito:90'],
 ['Criterium a punti di Firenze','ITA',36,'CRIT','circuito:100'],
 ['Criterium a punti di Rimini','ITA',37,'CRIT','circuito:96']
];
const WEEK_END=42;

/* Livelli di corsa: punti al vincitore, quota d'iscrizione e logistica */
const TIERS={
 gt:{lab:'Grande Giro',win:1300,st:210,fee:90000,prd:650,size:8,lf:1.08,spf:3},
 mon:{lab:'Monumento',win:800,fee:20000,prd:600,size:7,lf:1,spf:2.6},
 uwt1:{lab:'WorldTour',win:400,fee:15000,prd:600,size:7,lf:1,spf:2.2},
 uwt2:{lab:'WorldTour',win:500,st:60,fee:30000,prd:600,size:7,lf:1.04,spf:2.2},
 pro:{lab:'ProSeries',win:200,st:20,fee:6000,prd:450,size:7,lf:1,spf:1.8},
 c1:{lab:'Classe 1',win:125,st:14,fee:3000,prd:380,size:7,lf:0.98,spf:1.4},
 c2:{lab:'Classe 2',win:40,st:7,fee:1500,prd:300,size:6,lf:0.93,spf:1},
 u23:{lab:'Under 23',win:40,st:7,fee:1200,prd:280,size:6,lf:0.9,spf:1},
 nc:{lab:'Campionato nazionale',win:100,fee:800,prd:200,size:8,lf:1,spf:1.5},
 jun:{lab:'Juniores',win:0,fee:0,prd:0,size:0,lf:0.7,spf:0},
 crit:{lab:'Corsa a punti',win:0,fee:1000,prd:220,size:6,lf:1,spf:1.2,prize:[6000,4000,3000,2000,1500,1000,800,600,500,400]}
};
const CLS_TIER={'GT':'gt','MON':'mon','1.UWT':'uwt1','2.UWT':'uwt2','1.Pro':'pro','2.Pro':'pro','1.1':'c1','2.1':'c1','1.2':'c2','2.2':'c2','1.2U':'u23','2.2U':'u23','CN':'nc','MJ':'jun','CRIT':'crit'};
const CLS_LAB={'GT':'2.UWT','MON':'1.UWT','CN':'CN','MJ':'MJ','CRIT':'Punti'};
const POINTS_D=[1,0.8,0.68,0.56,0.48,0.42,0.36,0.3,0.25,0.21,0.17,0.14,0.11,0.09,0.07];

/* Categorie della tua squadra */
const CAT={
 conti:{lab:'Continental',min:10,max:16,staff:340000,minSal:0,neoSal:0,rank:1},
 pro:{lab:'ProTeam',min:16,max:30,staff:1600000,minSal:40000,neoSal:32000,rank:2},
 wt:{lab:'WorldTeam',min:23,max:30,staff:5000000,minSal:45000,neoSal:36000,rank:3}
};
const TIER_RANK={dev:0,conti:1,pro:2,wt:3};

/* Ritiri in altura */
const CAMPS=[
 {id:'teide',name:'Teide',place:'Tenerife, Spagna',alt:2150,cost:2900,from:1,to:52},
 {id:'sierra',name:'Sierra Nevada',place:'Granada, Spagna',alt:2320,cost:2500,from:12,to:44},
 {id:'etna',name:'Etna',place:'Rifugio Sapienza, Sicilia',alt:1910,cost:1900,from:14,to:42},
 {id:'livigno',name:'Livigno',place:'Valtellina, Lombardia',alt:1820,cost:2300,from:21,to:38},
 {id:'pellegrino',name:'Passo San Pellegrino',place:'Dolomiti, Trentino',alt:1920,cost:2100,from:24,to:36}
];

/* Scuola juniores */
const ACAD_UP=[0,60000,120000,220000,380000,600000];
const ACAD_FOCUS={ITA:['ITA'],NORD:['BEL','NED','DEN','NOR'],IBE:['ESP','COL','POR'],EST:['SLO','POL','AUT']};
const ACAD_FOCUS_LAB={ITA:'Italia',NORD:'Belgio, Olanda e Scandinavia',IBE:'Spagna, Portogallo e Colombia',EST:'Slovenia, Polonia e Austria'};

const COUNTRY={ITA:'Italia',FRA:'Francia',BEL:'Belgio',ESP:'Spagna',NED:'Paesi Bassi',GER:'Germania',SUI:'Svizzera',POL:'Polonia',POR:'Portogallo',GBR:'Gran Bretagna',NOR:'Norvegia',DEN:'Danimarca',SLO:'Slovenia',AUT:'Austria',HUN:'Ungheria',CRO:'Croazia',ROU:'Romania',LUX:'Lussemburgo',COL:'Colombia'};
const TYPE_LAB={circuito:'Circuito a punti',piatta:'Pianeggiante',mossa:'Mossa',collinare:'Collinare',montagna:'Montagna',crono:'Cronometro',prologo:'Prologo',pave:'Pavé e muri',roubaix:'Pavé',sterrato:'Sterrato'};
const TYPE_H={circuito:5,piatta:4,mossa:8,collinare:11,montagna:16,crono:9,prologo:5,pave:10,roubaix:7,sterrato:11};
const HARD={circuito:6,piatta:7,mossa:9,collinare:10,montagna:13,crono:5,prologo:2,pave:11,roubaix:12,sterrato:11};
const JERSEYS=[['#1D4ED1','#F2C14E'],['#C2362C','#F5F5F5'],['#0F7B5F','#F4E04D'],['#1F2937','#E5484D'],['#7C3AED','#F59E0B'],['#0E7490','#F97316'],['#DB2777','#111827'],['#F5F5F5','#1D4ED1']];

/* ============================================================
   SPONSOR: regioni, città, paesi esteri, settori
   x,y = posizione della tessera nella mappa stilizzata
   w = peso economico (quanti sponsor e quanto grandi)
   ============================================================ */
const REGIONS={
 VDA:{n:"Valle d'Aosta",x:0,y:0,w:0.4,c:[['Aosta',45.74,7.32]]},
 TAA:{n:'Trentino-Alto Adige',x:2,y:0,w:0.9,c:[['Trento',46.07,11.12],['Bolzano',46.50,11.35]]},
 FVG:{n:'Friuli Venezia Giulia',x:3,y:0,w:0.8,c:[['Udine',46.06,13.24],['Trieste',45.65,13.78],['Pordenone',45.96,12.66]]},
 PIE:{n:'Piemonte',x:0,y:1,w:1.2,c:[['Torino',45.07,7.69],['Cuneo',44.39,7.55],['Novara',45.45,8.62],['Alessandria',44.91,8.61]]},
 LOM:{n:'Lombardia',x:1,y:1,w:1.8,c:[['Milano',45.46,9.19],['Bergamo',45.70,9.67],['Brescia',45.54,10.21],['Varese',45.82,8.83],['Mantova',45.16,10.79]]},
 VEN:{n:'Veneto',x:2,y:1,w:1.4,c:[['Verona',45.44,10.99],['Padova',45.41,11.88],['Treviso',45.67,12.24],['Vicenza',45.55,11.55],['Venezia',45.44,12.33]]},
 LIG:{n:'Liguria',x:0,y:2,w:0.7,c:[['Genova',44.41,8.93],['Savona',44.31,8.48],['La Spezia',44.10,9.82]]},
 EMR:{n:'Emilia-Romagna',x:1,y:2,w:1.3,c:[['Bologna',44.49,11.34],['Modena',44.65,10.93],['Parma',44.80,10.33],['Forlì',44.22,12.04],['Rimini',44.06,12.57]]},
 TOS:{n:'Toscana',x:1,y:3,w:1.1,c:[['Firenze',43.77,11.25],['Lucca',43.84,10.50],['Siena',43.32,11.33],['Arezzo',43.46,11.88],['Pisa',43.72,10.40]]},
 UMB:{n:'Umbria',x:2,y:3,w:0.5,c:[['Perugia',43.11,12.39],['Terni',42.56,12.65]]},
 MAR:{n:'Marche',x:3,y:3,w:0.7,c:[['Ancona',43.62,13.52],['Pesaro',43.91,12.91],['Macerata',43.30,13.45]]},
 SAR:{n:'Sardegna',x:0,y:4,w:0.5,c:[['Cagliari',39.22,9.12],['Sassari',40.73,8.56]]},
 LAZ:{n:'Lazio',x:2,y:4,w:1.2,c:[['Roma',41.90,12.50],['Latina',41.47,12.90],['Viterbo',42.42,12.11]]},
 ABR:{n:'Abruzzo',x:3,y:4,w:0.6,c:[['Pescara',42.46,14.21],["L'Aquila",42.35,13.40]]},
 MOL:{n:'Molise',x:4,y:4,w:0.3,c:[['Campobasso',41.56,14.66]]},
 CAM:{n:'Campania',x:3,y:5,w:0.9,c:[['Napoli',40.85,14.27],['Salerno',40.68,14.77],['Avellino',40.91,14.79]]},
 PUG:{n:'Puglia',x:4,y:5,w:0.8,c:[['Bari',41.12,16.87],['Lecce',40.35,18.17],['Foggia',41.46,15.55]]},
 BAS:{n:'Basilicata',x:4,y:6,w:0.3,c:[['Potenza',40.64,15.80],['Matera',40.67,16.60]]},
 CAL:{n:'Calabria',x:4,y:7,w:0.4,c:[['Cosenza',39.30,16.25],['Reggio Calabria',38.11,15.65]]},
 SIC:{n:'Sicilia',x:3,y:8,w:0.7,c:[['Palermo',38.12,13.36],['Catania',37.50,15.09],['Ragusa',36.93,14.73]]}
};
const FOREIGN={
 SUI:{n:'Svizzera',c:['Lugano',46.00,8.95],w:1},AUT:{n:'Austria',c:['Innsbruck',47.26,11.40],w:0.7},SLO:{n:'Slovenia',c:['Lubiana',46.05,14.51],w:0.5},
 FRA:{n:'Francia',c:['Lione',45.76,4.84],w:1.2},GER:{n:'Germania',c:['Monaco di Baviera',48.14,11.58],w:1.4},ESP:{n:'Spagna',c:['Barcellona',41.39,2.17],w:1},
 BEL:{n:'Belgio',c:['Bruxelles',50.85,4.35],w:1},NED:{n:'Paesi Bassi',c:['Amsterdam',52.37,4.90],w:1},DEN:{n:'Danimarca',c:['Copenaghen',55.68,12.57],w:0.7},
 GBR:{n:'Regno Unito',c:['Londra',51.51,-0.13],w:1},UAE:{n:'Emirati Arabi',c:['Abu Dhabi',24.45,54.37],w:1.2},USA:{n:'Stati Uniti',c:['New York',40.71,-74.01],w:1.2}
};
const SECTORS={
 alimentare:{lab:'Alimentare',t:['Pastificio {S}','Caseificio {S}','Salumificio {S}','Dolciaria {S}','Forno {S}'],col:'#C9772B'},
 vino:{lab:'Vini',t:['Cantine {S}','Tenuta {S}','Vini {S}'],col:'#8E2C48'},
 edilizia:{lab:'Edilizia',t:['Edil {S}','{S} Costruzioni','Cementi {S}'],col:'#7A7F86'},
 meccanica:{lab:'Meccanica',t:['Meccanica {S}','Officine {S}','{S} Utensili'],col:'#3E6A8A'},
 energia:{lab:'Energia',t:['{S} Energia','Solare {S}','{S} Gas'],col:'#D9A400'},
 trasporti:{lab:'Trasporti',t:['Autotrasporti {S}','{S} Logistica','{S} Spedizioni'],col:'#2E7D6B'},
 credito:{lab:'Banca',t:['Cassa Rurale di {P}','Banca di {P}','Credito {P}'],col:'#2A4D9B'},
 bici:{lab:'Ciclismo',t:['Telai {S}','{S} Bike','Ruote {S}','Selle {S}'],col:'#C23B3B'},
 moda:{lab:'Moda',t:['Maglificio {S}','{S} Tessuti','Calzaturificio {S}'],col:'#9B4FB0'},
 tech:{lab:'Tecnologia',t:['{S} Digital','{S} Software','{S} Sistemi'],col:'#1F8FB8'},
 arredo:{lab:'Arredamento',t:['Mobilificio {S}','{S} Cucine','{S} Arredi'],col:'#8A6A43'},
 caffe:{lab:'Caffè',t:['Caffè {S}','Torrefazione {S}'],col:'#6B4430'},
 acqua:{lab:'Bevande',t:['Fonti di {P}','Acqua {S}','Birrificio {S}'],col:'#2FA3A0'}
};
const FOREIGN_T={SUI:['{S} Uhren','Banque {S}','{S} Pharma'],AUT:['{S} Holz','{S} Seilbahnen','{S} Bau'],SLO:['{S} Energija','{S} Pohištvo'],FRA:['Groupe {S}','{S} Assurances','Crédit {S}'],GER:['{S} Werke','{S} Automobil','{S} Versicherung'],ESP:['Grupo {S}','{S} Energía','Banco {S}'],BEL:['{S} Bouw','{S} Brouwerij','{S} Verzekeringen'],NED:['{S} Logistiek','{S} Bank','{S} Energie'],DEN:['{S} Energi','{S} Shipping'],GBR:['{S} Holdings','{S} Telecom','{S} Capital'],UAE:['{S} Airways','{S} Investments','Emirates {S}'],USA:['{S} Technologies','{S} Capital','{S} Motors']};
const BRAND=['Valtanaro','Brentella','Orsago','Monteluce','Carpenedo','Sorbara','Aurelio','Castelvetro','Pietrarossa','Fontebona','Rivalta','Selvanera','Valmorea','Bassanello','Corvara','Altamura','Belforte','Marzola','Ronchi','Santerno','Ferretti','Gualtieri','Moretti','Brivio','Zanardi','Colombo','Lattanzi','Bonfanti','Pozzi','Rigamonti','Carrara','Vescovi','Nardini','Ghirardi','Tosetti','Morassi'];
const FOREIGN_BRAND=['Altmann','Bergström','Delacroix','Vandeberg','Kessler','Ortega','Lindqvist','Harrow','Novak','Rahimi','Kingsley','Brookfield','Meier','Arnaud','Van Dijck','Aldana','Holm','Whitmore','Al Nuaimi','Sterling'];
const SPONSOR_SIZE={
 locale:{lab:'Locale',pot:[60000,300000],req:0,range:120},
 regionale:{lab:'Regionale',pot:[300000,900000],req:15,range:320},
 nazionale:{lab:'Nazionale',pot:[1000000,4000000],req:40,range:1100},
 internazionale:{lab:'Internazionale',pot:[4000000,15000000],req:70,range:0}
};
const SLOTS={main:{lab:'Main sponsor',share:1,cap:1},co:{lab:'Co-sponsor',share:0.45,cap:2},partner:{lab:'Partner',share:0.2,cap:8}};
const LICENCE={pro:{income:3500000,rep:45,rank:6},wt:{income:12000000,rep:75,rank:3}};
/* Regione delle corse italiane (per gli obiettivi degli sponsor locali) */
const RACE_REG={'Trofeo Laigueglia':'LIG','Strade Bianche':'TOS','Gran Premio Industria e Artigianato':'TOS','Tirreno-Adriatico':'MAR','Milano-Torino':'PIE','Milano-Sanremo':'LIG','Per Sempre Alfredo':'TOS','Settimana Coppi e Bartali':'EMR','Trofeo Piva':'VEN','Giro del Belvedere':'VEN','Trofeo Emilio Paganessi':'LOM','GP Palio del Recioto':'VEN','Giro di Sicilia':'SIC',"Giro d'Abruzzo":'ABR','Trofeo Città di San Vendemiano':'VEN','Tour of the Alps':'TAA','Gran Premio della Liberazione':'LAZ',"Giro dell'Appennino":'LIG','GP Industrie del Marmo':'TOS','Trofeo Alcide Degasperi':'TAA','Adriatica Ionica Race':'PUG','Giro del Friuli Venezia Giulia':'FVG','Giro Next Gen':'LOM','Campionato Italiano a cronometro':'EMR','Campionato Italiano Under 23':'EMR','Campionato Italiano Elite':'EMR',"Giro della Valle d'Aosta":'VDA','Gran Premio Capodarco':'MAR','Coppa Città di San Daniele':'FVG','Giro della Lunigiana':'TOS','Giro della Toscana':'TOS','Coppa Sabatini':'TOS','Memorial Marco Pantani':'EMR','Trofeo Matteotti':'ABR','Gran Premio Sportivi di Poggiana':'VEN',"Ruota d'Oro":'TOS','Coppa Agostoni':'LOM','Coppa Bernocchi':'LOM','Tre Valli Varesine':'LOM',"Giro dell'Emilia":'EMR','Gran Piemonte':'PIE','Il Lombardia':'LOM','Piccolo Giro di Lombardia':'LOM','Veneto Classic':'VEN','Giro del Veneto':'VEN','Criterium a punti di Bergamo':'LOM','Criterium a punti di Torino':'PIE','Criterium a punti di Treviso':'VEN','Criterium a punti di Firenze':'TOS','Criterium a punti di Rimini':'EMR'};

/* Tempo massimo: margine sul tempo del vincitore per tipo di tappa */
const TIME_CUT={circuito:0.12,piatta:0.12,mossa:0.14,collinare:0.17,montagna:0.25,pave:0.18,roubaix:0.18,sterrato:0.17,crono:0.25,prologo:0.3};
/* Punti nelle corse a punti: traguardi intermedi e arrivo (doppio) */
const PR_PTS=[5,3,2,1],PR_FIN=[10,6,4,2];
/* Allenamenti: due sessioni a settimana nelle settimane senza gare */
const TRAIN={
 fondo:{lab:'Fondo lungo',desc:'5 ore a ritmo medio: resistenza (RES) e un po\' di soglia',fat:6,eff:{endu:0.35,wkg:0.0015}},
 soglia:{lab:'Lavori di soglia',desc:'Intervalli al limite: alza la soglia (SAL e PIA)',fat:8,eff:{wkg:0.0045}},
 salita:{lab:'Ripetute in salita',desc:'Salite al massimo: W/kg in salita (SAL)',fat:9,eff:{wkg:0.004,mass:-0.06}},
 volata:{lab:'Volate',desc:'Sprint e partenze da fermo: potenza massima (VOL)',fat:5,eff:{spr:4}},
 crono:{lab:'Bici da crono',desc:'Posizione aerodinamica e ritmo (CRO)',fat:6,eff:{tt:-0.0007,wkg:0.0012}},
 recupero:{lab:'Recupero attivo',desc:'Uscita facile: smaltisce la fatica',fat:-10,eff:{}},
 riposo:{lab:'Riposo',desc:'Giornata libera',fat:-6,eff:{}}
};
/* Tattica pre-gara */
const MOVES={auto:'Decide l\'ammiraglia',gruppo:'Resta nel gruppo',vicino:'Resta entro 1\' dalla testa',maglia:'Resta con la maglia di leader',fuga:'Vai in fuga',scorta:'Proteggi il capitano',tira:'Tira per il capitano nel finale',copri:'Marca gli attacchi'};
const WHENS={start:'All\'inizio',mid:'A metà',end:'Nel finale'};
