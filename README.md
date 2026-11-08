# Biking Team Manager — Ammiraglia

Gestionale di una squadra di ciclismo giocabile nel browser, pensato per il telefono in orizzontale.

## Cosa c'è
- **Carriera:** parti Continental e sali a ProTeam e WorldTeam con risultati, reputazione e sponsor più grandi.
- **Sponsor dal territorio:** scegli la sede (es. Torino). Gli sponsor sono distribuiti per regione su una mappa dell'Italia e all'estero; più sono vicini, più sono propensi. Locali, regionali, nazionali e internazionali, con ruoli main, co-sponsor e partner, obiettivi stagionali, bonus, soddisfazione e rinnovi. Le licenze ProTeam e WorldTeam richiedono sponsor garantiti.
- **Calendario reale:** circa 130 corse d'Italia e d'Europa (Grandi Giri, Monumenti, WorldTour, ProSeries, classe 1 e 2, Under 23, campionati italiani, gare juniores).
- **Iscrizioni:** ogni corsa ha quota d'iscrizione e trasferta. L'accesso dipende dalla categoria (le Continental non corrono il WorldTour) e dagli inviti degli organizzatori.
- **Gara simulata:** fisica di watt, pendenza, scia, pavé e sterrato. Ordini radio: Auto, Ruota, Tira, Scatta, Scorta.
- **Ritiri in altura:** Teide, Sierra Nevada, Etna, Livigno e Passo San Pellegrino, con picco di forma dopo il rientro.
- **Scuola juniores:** 5 livelli, osservatori per area geografica, ragazzi di 16–18 anni da promuovere in squadra.
- **Mercato e contratti:** finestre di mercato, svincolati, indennizzi, rinnovi, pre-contratti, ingaggi minimi per categoria.
- **Corse a punti e tempo massimo:** criterium in circuito con traguardi a punti ogni due giri; fuori tempo massimo con la giuria che ripesca se i ritardatari sono troppi.
- **Allenamenti:** due sedute a settimana nelle settimane senza gare, con programmi individuali.
- **Tattica pre-gara:** per ogni corridore movimento, zona e momento d'attacco.
- **Trasferimenti:** offerte delle altre squadre, cessioni, controproposte, morale e ruolo promesso.
- **Nazionali:** Europei, Mondiali (strada e cronometro, Elite, Under 23, Juniores) e Tour de l'Avenir; le federazioni convocano i corridori in forma, puoi accettare o rifiutare.
- **Iscrizioni individuali e classifica a squadre:** nelle corse di un giorno minori si può schierare anche un solo corridore; le corse a tappe si corrono solo come squadra, con classifica individuale e a squadre.
- **Meteo:** pioggia, vento, caldo, freddo e neve cambiano la corsa: cadute di gruppo, discese più lente, ventagli, ritiri per maltempo e tappe accorciate dal protocollo.
- **Stagioni multiple:** invecchiamento, crescita dei giovani, ritiri, obiettivi dello sponsor e budget.

## Come si gioca
Apri `index.html` in un browser (oppure via GitHub Pages). Il salvataggio resta nel browser.

## Struttura
- `index.html` — pagina e stile
- `js/data.js` — calendario, squadre, categorie, ritiri
- `js/engine.js` — percorsi, fisica e simulazione di gara
- `js/game.js` — stagione, iscrizioni, mercato, strutture
- `js/sponsor.js` — sponsor, proposte, contratti e licenze
- `js/training.js` — allenamenti settimanali
- `js/tactics.js` — tattica pre-gara
- `js/transfers.js` — trattative, offerte ricevute, cessioni e morale
- `js/roster.js` — ruoli, gerarchie e prospetti della squadra
- `js/national.js` — nazionali, convocazioni, Europei e Mondiali
- `js/juniors.js` — gare juniores dal vivo per la scuola
- `js/weather.js` — meteo, cadute di gruppo e ritiri per maltempo
- `js/ui.js` — interfaccia

Squadre e corridori sono inventati. I nomi delle corse sono quelli reali e servono solo come riferimento in un progetto amatoriale.
