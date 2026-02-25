#  SkoleOS Video Player

> En universel, lynhurtig og distraktionsfri videoafspiller bygget til undervisning og fokuseret streaming. 

SkoleOS Video Player går ind i maskinrummet på danske streamingtjenester (som DR, TV2 og MitCFU) og udskifter deres standardafspillere med en samlet, lynhurtig og moderne "glassmorphism" brugerflade i neon-blå. 

Målet er at fjerne teknisk friktion, forstyrrelser og klodsede menuer, så lærere og elever kan fokusere 100 % på indholdet.

##  Nøglefunktioner

* **Lærer-Redderen (Auto-Save):** Udvidelsen husker automatisk, hvor du slap i en film ned til det præcise sekund (gemmes lokalt). Næste gang du åbner videoen, tilbyder en elegant pop-up at genoptage afspilningen.
* **Ét Universelt Design:** Giver dig præcis de samme knapper og den samme oplevelse, uanset om du ser nyheder, dokumentarer eller spillefilm.
* **Fokus-tilstand:** Mus og menuer fader elegant ud efter 2 sekunder.
* **Distraktions-dræber:** Egen bygget tidslinje, der tillader lynhurtig spoling forbi uønskede afbrydelser og forstyrrende elementer (virker på tværs af platforme).
* **Skudsikker Tastaturstyring:** Tvinger `Mellemrum` (Play/Pause) og `F` (Fuldskærm) til altid at virke uden at hjemmesiden scroller ved en fejl.

## Installation (Manuel / Developer Mode)

Indtil udvidelsen er godkendt på Chrome Web Store, kan den installeres manuelt:

1. Download eller klon dette repository til din computer.
2. Åbn Google Chrome og gå til `chrome://extensions/`
3. Slå **"Udviklertilstand"** (Developer mode) til oppe i højre hjørne.
4. Klik på **"Indlæs udpakket udvidelse"** (Load unpacked) og vælg mappen med filerne.
5. Færdig! Afspilleren er nu aktiv.

## Teknologier bag maskinrummet

Dette projekt er bygget rent og letvægts uden tunge frameworks:
* **Vanilla JavaScript** (Til DOM-manipulation, Auto-Save logik og event listeners)
* **CSS3** (Til det mørke glassmorphism-design og neon-turkise detaljer)
* **HTML5** (Manifest V3 struktur)

##  Privatliv & Sikkerhed

SkoleOS respekterer dit privatliv. Programmet fungerer 100 % lokalt på din egen maskine. Videohistorik gemmes kun i din browsers `localStorage`. Ingen data sendes nogensinde til eksterne servere. 
Læs den fulde [Privatlivspolitik her](PRIVACY.md).
