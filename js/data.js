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
 ['Chrono des Nations','FRA',42,'1.1','crono:45']
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
 jun:{lab:'Juniores',win:0,fee:0,prd:0,size:0,lf:0.7,spf:0}
};
const CLS_TIER={'GT':'gt','MON':'mon','1.UWT':'uwt1','2.UWT':'uwt2','1.Pro':'pro','2.Pro':'pro','1.1':'c1','2.1':'c1','1.2':'c2','2.2':'c2','1.2U':'u23','2.2U':'u23','CN':'nc','MJ':'jun'};
const CLS_LAB={'GT':'2.UWT','MON':'1.UWT','CN':'CN','MJ':'MJ'};
const POINTS_D=[1,0.8,0.68,0.56,0.48,0.42,0.36,0.3,0.25,0.21,0.17,0.14,0.11,0.09,0.07];

/* Categorie della tua squadra */
const CAT={
 conti:{lab:'Continental',min:10,max:16,staff:340000,minSal:0,neoSal:0,rank:1},
 pro:{lab:'ProTeam',min:20,max:30,staff:1600000,minSal:40000,neoSal:32000,rank:2},
 wt:{lab:'WorldTeam',min:27,max:30,staff:5000000,minSal:45000,neoSal:36000,rank:3}
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
const TYPE_LAB={piatta:'Pianeggiante',mossa:'Mossa',collinare:'Collinare',montagna:'Montagna',crono:'Cronometro',prologo:'Prologo',pave:'Pavé e muri',roubaix:'Pavé',sterrato:'Sterrato'};
const TYPE_H={piatta:4,mossa:8,collinare:11,montagna:16,crono:9,prologo:5,pave:10,roubaix:7,sterrato:11};
const HARD={piatta:7,mossa:9,collinare:10,montagna:13,crono:5,prologo:2,pave:11,roubaix:12,sterrato:11};
const JERSEYS=[['#1D4ED1','#F2C14E'],['#C2362C','#F5F5F5'],['#0F7B5F','#F4E04D'],['#1F2937','#E5484D'],['#7C3AED','#F59E0B'],['#0E7490','#F97316'],['#DB2777','#111827'],['#F5F5F5','#1D4ED1']];
