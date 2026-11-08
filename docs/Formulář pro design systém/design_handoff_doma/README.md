# Handoff: Doma – chytrá domácnost (vytápění)

## Overview
„Doma“ (pracovní název) je osobní lokální aplikace pro chytrou domácnost. Hlavní zařízení je tablet na šířku, aplikace musí fungovat i na mobilu a desktopu. První oblastí je vytápění: místnosti, naměřená a požadovaná teplota, hlavice, okna, rozvrhy, historie a stav kotle. Později přibudou světla, zásuvky a energie a jako samostatná část také simulátor vytápění.

Tento balíček obsahuje dvě věci:
- **vizuální základ**: tokeny, typografii a komponenty;
- **dvě detailně navržené obrazovky**: Přehled domácnosti a Detail místnosti, obě ve variantě pro tablet i mobil.

Obrazovky Vytápění a Simulátor zatím nejsou navržené. Níže je jen jejich struktura jako výchozí wireframe.

## About the Design Files
Soubory v `reference/` jsou **designové reference vytvořené v HTML**. Ukazují zamýšlený vzhled a chování, nejsou to produkční kód. Prototyp běží na interním runtime postaveném na Reactu (`support.js`), který slouží pouze jako ukázka. **Nepřebírejte z něj kód ani React knihovny.** Úkolem je návrh znovu vytvořit v cílovém stacku:

- SvelteKit + Svelte (aktuální stabilní verze), TypeScript `strict`
- Tailwind CSS + CSS custom properties (`tokens.css`, `tailwind.preset.ts`)
- `lucide-svelte` pro ikony
- Manrope (400/500/600), lokálně hostované soubory (`/static/fonts`, `@font-face`, `font-display: swap`); Geist Mono volitelně pro technické údaje
- pnpm monorepo: `apps/web`, `packages/domain` (typy + pravidla, viz `domain.ts`), `packages/simulator` (čistý TS), `packages/demo-data`
- zpočátku statická aplikace (adapter-static) s demo daty; backend a databáze zatím nejsou vybrané. Datovou vrstvu proto skryjte za rozhraní (`HomeRepository`), aby šla později vyměnit za lokální Node.js.

Reference otevřete v prohlížeči: `reference/Prehled-a-mistnost.dc.html` (interaktivní prototyp), `reference/Vizualni-zaklad.dc.html` (tokeny a komponenty). `support.js` musí ležet ve stejné složce.

## Fidelity
- **Přehled, Detail místnosti, Vizuální základ: high-fidelity.** Barvy, typografie, rozměry, stavy i texty jsou finální. Implementujte je co nejpřesněji.
- **Vytápění, Simulátor: low-fidelity.** Je popsaná jen struktura, vizuální jazyk převezměte z hi-fi obrazovek.

## Obecná pravidla (platí všude)
- **Jazyk:** UI kompletně česky, správná diakritika.
- **Formáty:** `°C`, 24hodinový čas `08:24`, desetinná čárka `21,4`. Používejte `Intl.NumberFormat('cs-CZ', { minimumFractionDigits: 1, maximumFractionDigits: 1 })`. Mezi číslem a jednotkou je mezera, `22,0 °C`, `48 %`.
- **Naměřená vs. požadovaná:** Velká hodnota je vždy **naměřená** teplota. Požadovaná teplota má vždy slovní prefix „Cíl“, případně nadpis „Požadovaná teplota“. Nikdy je nezaměňujte jen barvou.
- **Rozsah ovládání:** Každý ovládací blok má štítek rozsahu: `Celá domácnost`, `Místnost · {název}`, nebo `Zařízení · {místnost}`.
- **Barva nikdy sama nenese význam:** Každý stav má ikonu (Lucide) a text.
- **Číslice:** `font-variant-numeric: tabular-nums` u všech měnících se a porovnávaných hodnot (teploty, časy, procenta).
- **Ovládání dotykem a klávesnicí:**
  - Dotykové cíle mají min. 44 × 44 px; stepper 60 × 60, segmenty režimu 48 px na výšku.
  - Vše funguje z klávesnice. Focus ring je 2 px `--color-accent` s offsetem 2 px, na akcentových tlačítkách 2 px `--color-text-primary`.
- **Demo data:** Viditelně je označte (štítek `DEMO DATA`, mono 11 px, `--color-warning`, 1px dashed rámeček). Nevymýšlejte úspory ani předpovědi času vytopení.
- **Hlášení vs. doporučení:** Stavová hlášení nejsou AI doporučení. Budoucí AI návrhy dostanou vlastní, odlišný komponent. Na úvodní obrazovku nepřidávejte chat.
- **Sklo:** Průhlednost jen nad fotografií (`--glass-bg` + `backdrop-filter: blur(12–14px)`). Důležité hodnoty leží na podkladu s neprůhledností ≥ 80 %.
- **Pohyb:**
  - Jen změny stavu, 120–150 ms, ease-out: přepínač, segmenty, hover karet.
  - Skeleton pulzuje 1,4 s.
  - Při `prefers-reduced-motion` žádné animace ani pulzování.

## Design Tokens
Kompletně v `tokens.css` a v `tailwind.preset.ts`. Souhrn:

**Plochy:**
- `background #17191C`
- `surface-sunken #1D2024`
- `surface #24272C`
- `surface-hover #2A2E34`
- `surface-raised #30353C`
- `surface-raised-hover #3A4048`

**Linky:** `border #454C56`, `border-subtle #30353C` (oddělovače řádků), `border-strong #66707C` (obrys ovládacích prvků).

**Text:** `primary #F4F6F8`, `secondary #ADB6C2`, `tertiary #8E97A3`, `disabled #66707C`.

**Akcent:**
- `accent #8CC8FF`, hover `#A6D4FF`
- `on-accent #101820`
- `accent-muted #1F3447`, `accent-muted-border #2E4C66`

**Stavy** (popředí / pozadí / text na pozadí):
- success `#86D5A6 / #1E3328 / #C9EBD5`
- warning `#F0C674 / #3A3120 / #F6DFAE`
- danger `#FF9A94 / #3D2324 / #FFD0CD`

**Zaoblení:**
- 6 px: mini štítky
- 10 px: čipy, segmenty rozvrhu, volby platnosti
- 12 px: tlačítka, ikonové boxy, stat boxy
- 14 px: hlášení, segmented, řádky místností
- 16 px: karty, dlaždice, stepper
- 20 px: dialog / sheet
- rám tabletu 24 px, rám mobilu 36 px (jen náhled)

**Rozestupy:**
- mřížka 4 px
- karta: padding 18–20 px, mezi kartami 12–16 px
- mezi sekcemi 24 px, mezi sloupci 20 px

**Stíny:** Jen toast `0 8px 24px rgba(0,0,0,.35)`. Hierarchii jinak tvoří odstín plochy, ne stín.

**Typografie (Manrope):**

| Token | px / line-height | Váha | Použití |
|---|---|---|---|
| value-xl | 80 / 1, −0,03em (mobil 64) | 500 | naměřená teplota v detailu |
| value-l | 46 / 1, −0,02em (mobil 36) | 500 | dlaždice místnosti |
| stepper | 56 / 1 (mobil 48) | 500 | požadovaná teplota |
| value-m | 36 / 1 | 500 | kotel |
| value-s | 22 / 1,1 | 500 | řádky ostatních místností |
| title | 30 / 1,15, −0,015em (mobil 26) | 600 | H1 obrazovky |
| heading | 16 / 1,3 | 600 | nadpisy karet, název místnosti v dlaždici |
| body | 15 / 1,55 | 400 | odstavce |
| label | 14 / 1,3 | 500 | tlačítka, ovládání, názvy zařízení |
| caption | 13 / 1,4 | 400 | metadata, popisky („Cíl …“, „Naměřeno před 2 min“) |
| micro | 12 / 1,35 | 500 | štítky rozsahu, osy, stavové čipy v řádcích |
| mono | Geist Mono 11–13 | 400 | ID zařízení, časové značky v logu, parametry simulátoru |

Jednotka u velkých hodnot (`°C`, `%`) má velikost 0,42–0,45em, váhu 400, barvu `text-secondary`, odsazení 3–4 px a `letter-spacing: 0`.

## Komponenty (doporučené Svelte komponenty)
Všechny přijímají data přes props, stav drží v nadřazeném store. Názvy jsou návrh.

- **`AppShell`**:
  - tablet/desktop: levý rail 96 px. Obsahuje logo 40 × 40 (accent, radius 12, ikona `house`) a nav položky 76 × 64 (radius 14, ikona 22 + label 12/500). Aktivní položka: bg `accent-muted`, text `accent`, `aria-current="page"`. Dole hodiny 18/500 tabular a stav spojení (tečka 7 px + text, barva podle stavu).
  - mobil: spodní lišta, 4 sloupce, položky min. 56 px, padding `8px 10px 18px`, horní border `surface`.
  - nav položky: Přehled (`house`), Místnosti (`layout-grid`), Vytápění (`flame`), Simulátor (`chart-line`).
- **`ScopeChip`**: 12/500, `text-secondary`, border 1px `border`, radius 8, padding `3px 8px`, `white-space: nowrap; flex: none`.
- **`ModeControl`** (rozsah Celá domácnost):
  - label „Režim“ + ScopeChip; segmented `role="radiogroup"`, 3 sloupce, track `surface-sunken`, padding 4, radius 14.
  - segment: min-height 48, radius 11, ikona 18 + text 15/500. Aktivní: bg `accent`, text `on-accent`.
  - ikony: Doma `house`, Pryč `log-out`, Noc `moon`.
  - pod segmenty popis účinku (13, secondary):
    - Doma: „Místnosti topí podle svých rozvrhů.“
    - Pryč: „Všechny místnosti drží 17,0 °C, dokud režim nezměníte.“
    - Noc: „Místnosti drží noční teploty z rozvrhu, dokud režim nezměníte.“
    - Pokud existuje ruční změna, přidejte „Ruční změny v místnostech mají přednost.“
  - během odesílání má segment label „Noc…“ a popis „Přepínám režim pro celou domácnost…“.
- **`AlertRow`**:
  - celé je to tlačítko (otevře místnost), min-height 56, radius 14, padding `12px 14px`, bg podle závažnosti.
  - obsah: ikona 20 v barvě stavu, titulek 14/600 primary, popis 13 v `*-text`, vpravo `chevron-right` 18.
  - řazení: danger → warning okno → warning zastaralé.
  - ikony: `app-window` okno, `wifi-off` odpojeno, `clock` zastaralé.
- **`RoomTile`** (oblíbené):
  - celé je to `<button>` s `aria-label` („Obývák, naměřeno 20,6 °C, cíl 22,0 °C, Topí“). bg `surface`, hover `surface-hover`, radius 16.
  - rozměry: padding 18 (mobil 14), min-height 178 (mobil 156), gap 12.
  - řádek 1: název 16/600 a StatusChip, s flex-wrap, aby se status na mobilu zalomil pod název.
  - řádek 2: naměřená hodnota value-l.
  - volitelně poznámka (13/500 primary na `warning-bg`/`danger-bg`, radius 10, padding `7px 10px`).
  - spodní řádek: „Cíl **22,0 °C**“ (+ „ · ručně“) a vpravo vlhkost „48 %“.
  - u stavů stale/offline je hodnota v `text-tertiary`. Offline zobrazuje „—“ bez jednotky.
- **`RoomRow`** (ostatní místnosti): tlačítko min-height 60, radius 14, grid `1fr auto`. Vlevo název 15/600 + StatusChip 12/500, vpravo hodnota 22/500 + „Cíl 20,0 °C“ 12.
- **`StatusChip`**: ikona 13–15 + text, barva podle stavu.

  | Stav | Text | Ikona | Barva |
  |---|---|---|---|
  | heating | Topí | `flame` | `accent` |
  | ok | V cíli | `circle-check` | `text-secondary` |
  | above | Nad cílem | `circle-minus` | `text-secondary` |
  | paused | Pozastaveno | `circle-pause` | `warning` |
  | stale | Zastaralé | `clock` | `warning` |
  | offline | Odpojeno | `wifi-off` | `danger` |

- **`Switch`**:
  - `role="switch"`, `aria-checked`, `aria-label` „Stropní světlo, Koupelna“. Hit area 60 × 44, vizuál 48 × 28, radius 14, knob 20.
  - zapnuto: track `accent`, knob `on-accent`. Vypnuto: track `surface-sunken`, border `border-strong`, knob `text-secondary`.
  - přechod 150 ms; disabled má opacity .5 a `cursor: not-allowed`.
- **`DeviceRow`**: min-height 60, ikonový box 40 × 40 radius 12 `surface-raised`, název 14/500, detail 12 secondary (u offline `danger-text`), vpravo ID v Geist Mono 11 tertiary. Oddělovač `border-subtle`.
- **`BoilerCard`** (Celá domácnost):
  - nadpis „Kotel“ + stav „Provoz“ (`flame`, accent).
  - hodnota 36 „69,5 °C“ + „voda · nastaveno 70 °C“.
  - lišta 8 px: výplň accent na poměr k max. 85 °C, bílá značka 2 × 16 na nastavené hodnotě.
  - řádek „Ořech 2 · palivo doplněno v 07:10“.
  - aktuální výkon ani zásobu paliva **neuvádět**, dokud nebudou skutečná data (IRYD 620 – zatím nevíme, zda jde číst). Doplnění paliva se zapisuje ručně.
- **`EventList`**: grid `46px 26px 1fr` (v dialogu 64 px kvůli „včera 22:00“). Čas 13/500 tabular secondary, ikonový box 26 radius 8 `surface-raised` s ikonou 14 v barvě typu, titulek 14/500, detail 12.
- **`RoomHero`**:
  - **s fotografií:** výška 300 (mobil 260), radius 16.
    - nahoře vlevo skleněné čipy: „Vlhkost 48 %“, „Okno zavřené“.
    - dole vlevo skleněný panel (min-width 240, radius 14, padding `16px 18px`) s obsahem: „Naměřená teplota“ + StatusChip, value-xl, „Cíl 22,0 °C · Naměřeno před 2 min“.
  - **bez fotografie** (rovnocenný stav, ne fallback): karta `surface`, radius 16, padding 20.
    - nahoře label + StatusChip, pak value-xl a stáří měření.
    - dole 3 stat boxy (`surface-sunken`, radius 12, padding 12): Cíl / Vlhkost / Okno.
  - zda ukázat foto, řídí `room.photoUrl`.
- **`TargetControl`** (rozsah Místnost):
  - **Řádek „Nyní platí“** (`surface-sunken`, radius 12, min-height 48): „Nyní platí **rozvrh 22,0 °C** · do 22:00“. Při ruční změně „**ruční změna 23,0 °C** · do 10:24“ a vpravo textové tlačítko „Zrušit změnu“ (accent).
  - **Stepper:**
    - tlačítka − / + mají 60 × 60, radius 16, `surface-raised`, `aria-label` „Snížit o 0,5 °C“ / „Zvýšit o 0,5 °C“. Krok 0,5 °C, rozsah 5–30 °C; na mezích jsou tlačítka disabled.
    - hodnota uprostřed má `aria-live="polite"`. Když se liší od platné, je v barvě accent a pod ní text „Nový cíl · nyní 22,0 °C“. Jinak „Naměřeno 20,6 °C · rozsah 5–30 °C“.
  - **Platnost ruční změny** (radiogroup čipů, min-height 44, radius 10):
    - volby: `1 hodina`, `2 hodiny` (výchozí), `Do změny rozvrhu`, `Trvale`.
    - vybraný čip má `accent-muted` a text accent, ostatní border `border`.
    - pod čipy vysvětlení, např. „Platí do 10:24, pak podle rozvrhu.“ nebo „…pak podle režimu.“. U „Trvale“: „Rozvrh se v místnosti neuplatní, dokud změnu nezrušíte.“
  - **Primární tlačítko** (min-height 48, radius 12):
    - „Nastavit 22,5 °C“, při odesílání „Odesílám…“.
    - když cíl není změněný, je disabled s textem „Beze změny“ (bg `surface-raised`, text tertiary).
  - **CommandStatus** (`role="status"`):
    - pending: `surface-sunken`, „Odesílám do hlavic“.
    - confirmed: `success-bg`, „Cíl 22,5 °C nastaven“ / „Hlavice potvrdily změnu do 10:24.“
    - failed: `danger-bg`, „Příkaz se nepodařilo provést“ / „Jedna z hlavic nepotvrdila změnu. Původní cíl zůstává.“ + tlačítko „Zkusit znovu“.
  - **Optimistický update nedělat:** cíl se změní až po potvrzení.
- **`ScheduleDay`**:
  - lišta výšky 40, radius 10, segmenty s mezerou 2 px a šířkou úměrnou délce.
  - nejteplejší segmenty mají `accent-muted` a text accent, ostatní `surface-sunken`.
  - teplota v segmentu jen pokud je segment širší než 9 %. Svislá bílá značka 2 px na aktuálním čase. Osa 00/06/12/18/24 (11, tertiary).
  - pod lištou seznam segmentů „06:00–22:00 · 22,0 °C“, aktuální řádek primary + štítek „Nyní“ (accent bg).
  - v hlavičce „Další změna 22:00 → 19,0 °C“.
- **`TemperatureChart`**:
  - SVG, naměřená = plná čára accent 2,25 px; požadovaná = **přerušovaná** schodovitá čára `text-secondary` 1,5 px, dash 4 4. Rozlišení tedy není jen barvou.
  - 3 vodorovné mřížky `border-subtle`, osa Y vlevo (3 hodnoty), osa X dole. Legenda nad grafem.
  - výška: mini 120, dialog 240 (mobil 180).
  - mezera v datech (offline) se nekreslí. Pod grafem upozornění „Od 05:12 chybí měření, hlavice neodpovídá.“
  - doporučení: vlastní SVG nebo LayerCake. Nepoužívat React knihovny.
- **`HistoryDialog`**:
  - tablet: modál uprostřed, max-width 820, radius 20, scrim `--scrim`. Mobil: bottom sheet, radius `20 20 0 0`, odsazený 40 px shora.
  - obsah: titulek „Historie · Obývák“ + „Demo data, simulovaný průběh“, zavírací tlačítko 44 × 44.
  - přepínač období `24 hodin` / `7 dní`, legenda, velký graf, 3 stat boxy (Nejnižší / Nejvyšší / Průměr naměřené), „Události v místnosti“.
  - přístupnost: `role="dialog" aria-modal`, focus na zavírací tlačítko při otevření a návrat focusu při zavření, Esc zavírá, klik na scrim zavírá, focus trap.
- **`Toast`**: dole uprostřed (mobil 96 px nad spodní lištou), `surface-raised` + border, radius 14, ikona `circle-check` success, `role="status"`, zmizí po 3,2 s. Např. „Režim Noc platí pro celou domácnost“, „Obývák: cíl 22,5 °C nastaven“.
- **`ConnectionBanner`** (`role="alert"`, `danger-bg`): „Bez spojení s domácím serverem“ / „Zobrazuji poslední známá data z 08:12. Ovládání je do obnovení spojení nedostupné.“
- **`Skeleton`**: bloky `surface-raised` na `surface`, `aria-busy="true"`, pulzování opacity .5→1 po dobu 1,4 s.

## Screens / Views

### 1. Přehled domácnosti
**Účel:** Rychle zjistit stav domu, vyřešit upozornění, přepnout režim a otevřít místnost.

**Tablet (≥ 1024 px, referenční 1194 × 834):**
- Rail 96 px a vedle něj `main`, který scrolluje, s paddingem `28px 32px 40px`.
- **Header** (flex row, `align-items: flex-end`, space-between):
  - vlevo H1 „Přehled“ (title) a pod ním „Neděle 8. listopadu · 08:24“ (14, secondary);
  - vpravo ModeControl o šířce 400 px.
- **Grid** `minmax(0,1fr) 340px`, gap 20:
  - levý sloupec (gap 24): Upozornění („Upozornění · 3“), Oblíbené místnosti (grid 2 × 2, gap 12), Ostatní místnosti (grid 2 sloupce, gap 8);
  - pravý sloupec (gap 16): Rychlé ovládání (světla), Kotel, Poslední události (max. 6).

**Mobil (< 640 px, referenční 390 × 844):**
- padding `20px 16px 28px`, header ve sloupci, ModeControl na plnou šířku;
- jeden sloupec v pořadí Upozornění → Oblíbené (2 sloupce) → Ostatní (1 sloupec) → Rychlé ovládání → Kotel → Události (max. 5);
- spodní navigace.

**Střední šířky (640–1023):** Jako mobil, ale oblíbené ve 2 sloupcích a ostatní místnosti ve 2 sloupcích. Rail se zobrazí od 768 px.

**Desktop (≥ 1440):** Obsah max-width 1360 px. Oblíbené mohou přejít na 4 sloupce, pravý sloupec 380 px.

### 2. Detail místnosti
**Účel:** Zjistit, co se v místnosti děje a proč, změnit cíl s jasnou platností, prohlédnout rozvrh, historii a zařízení.

**Tablet:**
- **Header:**
  - tlačítko „‹ Přehled“ (44 px, `surface`, radius 12);
  - H1 s názvem místnosti;
  - vpravo textové tlačítko „Historie“ s ikonou `history`, které otevře HistoryDialog.
- **Výběr místnosti:** Pod headerem je horizontálně scrollovatelný `tablist` všech místností. Čip má min-height 44, radius 12 a obsahuje název a naměřenou hodnotu. Místnost s problémem má diamant 8 px v barvě stavu s `aria-label` stavu. Vybraná místnost: `accent-muted` + border `accent-muted-border`.
- **Grid** `minmax(0,1.1fr) minmax(0,1fr)`, gap 20:
  - vlevo RoomHero → kontextové hlášení (okno / odpojeno / zastaralé) → TargetControl;
  - vpravo ScheduleDay → „Posledních 24 h“ (mini graf + „Otevřít historii ›“) → Zařízení (DeviceRow, u místností se světlem i Switch).

**Mobil:**
- jeden sloupec v pořadí hero → hlášení → cíl → rozvrh → historie → zařízení;
- zpět je jen ikona;
- popisek fotografie je skrytý, aby nekolidoval s čipy.

**Kontextová hlášení místnosti:**
- **Otevřené okno:** „Okno je otevřené 12 min“ / „Topení je pozastavené. Nový cíl se uplatní po zavření okna.“ Změnu cíle lze odeslat.
- **Odpojená hlavice:**
  - „Hlavice neodpovídá od 05:12“ / „Teplotu nelze měřit ani měnit. Zkontrolujte baterii nebo vzdálenost od brány.“
  - stepper i tlačítko jsou disabled a text pod platností zní „Hlavice je odpojená, změnu nelze odeslat.“
- **Zastaralé měření:** „Měření je staré 47 min“ / „Zobrazená teplota nemusí odpovídat skutečnosti. Hlavice dál reguluje podle posledního měření.“

### 3. Vytápění (lo-fi, k návrhu)
- **Tabulka / seznam všech místností:**
  - sloupce: název, naměřená, cíl, zdroj cíle (rozvrh / režim / ruční + do kdy), stav, ventil %;
  - řazení podle stavu.
- **Hromadná ruční změna:** výběr místností (checkbox) → stepper + platnost → „Nastavit pro 3 místnosti“. Rozsah je uvedený v tlačítku.
- **Panel kotle:** teplota vody, nastavená hodnota, ruční zápis doplnění paliva, historie teploty vody.
- **Vysvětlení stavu místnosti** jako číslovaný řetězec faktů, např.:
  1. naměřeno < cíl
  2. cíl z rozvrhu do 22:00
  3. hlavice otevírají 60 % / 55 %
  4. kotel dodává 69,5 °C

  Musí být označené jako stavové vysvětlení, ne doporučení.
- **Editor rozvrhů** (týdenní mřížka, šablony): zatím mimo rozsah.

### 4. Simulátor (lo-fi, k návrhu)
Samostatný pracovní prostor s vyšší hustotou: typografie o stupeň menší, karty padding 14–16, Geist Mono pro parametry.
- **Levý panel 320 px – parametry místnosti:** objem, tepelná ztráta, výkon otopného tělesa, počáteční teplota.
- **Regulátor:** výběr (on/off s hysterezí, P, PI), parametry Kp/Ki.
- **Scénář:** venkovní teplota, otevření okna v čase, rozvrh.
- **Hlavní plocha:** graf (teplota místnosti, cíl, ventil %, venkovní teplota) s časovou osou.
- **Pod grafem výsledky:** čas do dosažení cíle **v simulaci**, překmit, oscilace. Výsledky jasně označte jako výsledek modelu, ne předpověď pro skutečný dům.
- **Logika:** čistě v `packages/simulator` (deterministická, testovatelná, bez DOM).

## Interactions & Behavior
- **Navigace:**
  - rail / spodní lišta: Přehled, Místnosti (otevře detail naposledy vybrané místnosti), Vytápění, Simulátor;
  - dlaždice, řádek místnosti i upozornění otevírají detail;
  - v detailu se místnost přepíná čipy bez návratu.
  - doporučené routy: `/`, `/mistnosti/[id]`, `/vytapeni`, `/simulator`. Historie jako `?historie=24h|7d`, aby šla sdílet a fungovalo tlačítko zpět.
- **Režim:**
  - klik → stav pending (cca 600 ms v demu) → potvrzeno → toast a událost „Celá domácnost · režim Noc“;
  - je to příkaz pro celou domácnost, bez potvrzovacího dialogu;
  - bez spojení je disabled.
- **Změna cíle:**
  - stepper mění jen koncept (draft) pro danou místnost; „Nastavit“ odešle příkaz;
  - pending zablokuje tlačítko;
  - selhání ukáže CommandStatus s „Zkusit znovu“ a původní cíl zůstane;
  - úspěch uloží override s platností, ukáže toast, zapíše událost a resetuje draft;
  - „Zrušit změnu“ odstraní override a vrátí rozvrh nebo režim.
- **Priorita cíle:** ruční změna > režim (Pryč = 17,0 °C, Noc = noční hodnota rozvrhu) > rozvrh.
- **Odvození stavu místnosti:**
  - offline → stale (> 30 min bez měření) → otevřené okno (paused);
  - jinak měření < cíl − 0,2 → heating, > cíl + 0,5 → above, jinak ok.
- **Světlo:** Přepínač se okamžitě změní, zobrazí toast a zapíše událost. Pro reálná zařízení doporučuji stejný pending → confirmed/failed model jako u cíle.
- **Historie:** Otevírá se tlačítkem v headeru nebo v kartě grafu. Přepínač 24 h / 7 dní; Esc, scrim i tlačítko zavírají.
- **Hover:** karty `surface` → `surface-hover`, sekundární tlačítka `surface-raised` → `surface-raised-hover`, textová tlačítka bg `accent-muted`.
- **Disabled:** text `text-disabled` nebo `text-tertiary`, `cursor: not-allowed`, nikdy jen snížená opacity bez změny textu.

## Stavy aplikace (všechny musí existovat)
- **Načítání:** skeleton dlaždic místností, upozornění skrytá, ve railu „Načítám“.
- **Prázdná data:** „Zatím žádná historie“ / „Graf se zobrazí po prvních hodinách měření.“ (dashed border, `surface-sunken`).
- **Zastaralé měření:** šedá hodnota, warning chip, poznámka s časem.
- **Odpojení zařízení:** „—“, danger chip, ovládání místnosti disabled, mezera v grafu.
- **Odpojení serveru:** ConnectionBanner nahoře, veškeré ovládání disabled, data jsou poslední známá s časem.
- **Neúspěšný příkaz:** CommandStatus failed s „Zkusit znovu“.

## State Management
Svelte 5 runes nebo stores v `apps/web/src/lib/state`. Doménová pravidla (`effectiveTarget`, `roomStatus`, `nextScheduleChange`, formátování) patří do `packages/domain` a mají unit testy (Vitest).

- `connection: ConnectionState`
- `mode: HomeMode`, `modeCommand: CommandState`
- `rooms: Room[]` (z `HomeRepository`)
- `drafts: Record<roomId, Celsius>`, který se nikdy neposílá automaticky
- `overrideDuration: '1h' | '2h' | 'next' | 'permanent'` (výchozí 2h)
- `commands: Record<roomId, CommandState>`
- `events: HomeEvent[]` (nejnovější první)
- `ui: { selectedRoomId, historyRange: '24h' | '7d', toast }`

Typy najdete v `domain.ts`. Demo data (8 místností z prototypu) přesuňte do `packages/demo-data`.

## Demo data (z prototypu, „teď“ = neděle 8. 11. 08:24)
| Místnost | Naměřeno | Vlhkost | Rozvrh (noc/den) | Zvláštní stav | Oblíbená |
|---|---|---|---|---|---|
| Obývák | 20,6 | 48 % | 19 / 22 (06–22) | 2 hlavice, okenní kontakt, foto | ano |
| Můj pokoj | 21,2 | 44 % | 18 / 21 | stolní lampa | ano |
| Ložnice | 19,1 | 52 % | 18 / 20 (06–08) / 19 (08–21) | foto | ano |
| Koupelna | 21,9 | 61 % | 19 / 23 (05:30–09, 18–22) / 20 | okno otevřené od 06:58, stropní světlo | ano |
| Kuchyně | 20,2 | 50 % | 18 / 20,5 | – | ne |
| Pokoj | 19,8 | 47 % | 18 / 20 | – | ne |
| Toaleta | — | — | 18 / 20 | hlavice odpojená od 05:12 | ne |
| Chodba | 18,4 | 49 % | 17 / 18 | měření staré 47 min | ne |

Kotel: Moceko Pro 25 (7,5–25 kW, 95 l, max. 85 °C, třída 5), regulátor IRYD 620, voda 69,5 °C, nastaveno 70 °C, palivo ořech 2. Zdroj tepla je zatím obecně „kombinace“ a upřesní se později.

## Assets
- **Ikony:** Lucide (`lucide-svelte`): house, layout-grid, flame, chart-line, log-out, moon, circle-check, circle-minus, circle-pause, circle-x, clock, wifi-off, app-window, thermometer, activity, lightbulb, history, chevron-left, chevron-right, minus, plus, x, triangle-alert. Stroke 2 (v navigaci 1,9).
- **Fonty:** Manrope 400/500/600 a Geist Mono 400/500, lokálně hostované jako woff2. Prototyp je načítá z Google Fonts jen pro náhled.
- **Fotografie místností:** V prototypu jsou to jen pruhované zástupné plochy, skutečné fotografie nejsou dodány. Doporučený poměr 16 : 9 nebo širší, ořez `object-fit: cover`, tmavé ztlumení není potřeba, protože hodnoty leží na skle s neprůhledností ≥ 80 %.
- **Logo:** dočasný znak (ikona `house` na accent čtverci 40 px radius 12) a název „Doma“ (pracovní název).

## Files
- `README.md`: tento dokument
- `tokens.css`: CSS custom properties včetně reduced-motion
- `tailwind.preset.ts`: Tailwind preset nad tokeny
- `domain.ts`: návrh doménových typů pro `packages/domain`
- `reference/Prehled-a-mistnost.dc.html`: interaktivní hi-fi prototyp; přepínač Tablet / Mobil nahoře, stavy (spojení, fotografie, simulace chyby) v Tweaks / `data-props`
- `reference/Vizualni-zaklad.dc.html`: paleta, typografie, komponenty a stavy
- `reference/support.js`: runtime pro otevření referencí v prohlížeči (není součást implementace)
