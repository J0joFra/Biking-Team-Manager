# Biking Team Manager — Ammiraglia

Gestionale di una squadra di ciclismo giocabile nel browser, pensato per il telefono in orizzontale.

## Cosa c'è
- **Carriera:** parti Continental e sali a ProTeam e WorldTeam con risultati, reputazione e uno sponsor più grande.
- **Calendario reale:** circa 130 corse d'Italia e d'Europa (Grandi Giri, Monumenti, WorldTour, ProSeries, classe 1 e 2, Under 23, campionati italiani, gare juniores).
- **Iscrizioni:** ogni corsa ha quota d'iscrizione e trasferta. L'accesso dipende dalla categoria (le Continental non corrono il WorldTour) e dagli inviti degli organizzatori.
- **Gara simulata:** fisica di watt, pendenza, scia, pavé e sterrato. Ordini radio: Auto, Ruota, Tira, Scatta, Scorta.
- **Ritiri in altura:** Teide, Sierra Nevada, Etna, Livigno e Passo San Pellegrino, con picco di forma dopo il rientro.
- **Scuola juniores:** 5 livelli, osservatori per area geografica, ragazzi di 16–18 anni da promuovere in squadra.
- **Mercato e contratti:** finestre di mercato, svincolati, indennizzi, rinnovi, pre-contratti, ingaggi minimi per categoria.
- **Stagioni multiple:** invecchiamento, crescita dei giovani, ritiri, obiettivi dello sponsor e budget.

## Come si gioca
Apri `index.html` in un browser (oppure via GitHub Pages). Il salvataggio resta nel browser.

## Struttura
- `index.html` — pagina e stile
- `js/data.js` — calendario, squadre, categorie, ritiri
- `js/engine.js` — percorsi, fisica e simulazione di gara
- `js/game.js` — stagione, iscrizioni, mercato, strutture
- `js/ui.js` — interfaccia

Squadre e corridori sono inventati. I nomi delle corse sono quelli reali e servono solo come riferimento in un progetto amatoriale.
