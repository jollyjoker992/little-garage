# Little Garage — Game Design

A car-themed learning game for a 3–4 year old who loves car brands and construction vehicles.
It teaches **numbers, letters, colors, shapes, early logic, memory and listening**, plus **first English words** on English Street, and runs on an iPad (landscape, touch, offline).

## Who it's for
- **Level 1 ≈ age 3**: 2 choices, numbers 1–3, 4 colors, big obvious differences.
- **Level 2 ≈ age 3½**: 3 choices, numbers 1–5, more colors and shapes.
- **Level 3 ≈ age 4**: 4 choices, numbers to 10, two-attribute questions, gaps in sequences.

He can't read, so **every instruction is spoken** (English or Vietnamese; switch in Grown-ups settings).

## Design rules (keep these when adding games)
1. **Big targets.** Choices are ≥120 px and there are at most 4. One clear task per screen.
2. **No reading, no timers, no fail screens.** Text on screen is only a label for grown-ups.
3. **Gentle mistakes.** A wrong tap wobbles the card and the question is asked again. After 2 misses the right answer **glows**; after 3, it is revealed and said aloud, then the game moves on.
4. **Celebrate.** A right answer gets a ding, confetti, the answer said aloud and a random cheer. After every 5 rounds he earns a **sticker** for My Garage.
5. **Short sessions.** 5 rounds ≈ 2 minutes per game.
6. **Adaptive.** 4 of the last 5 right on the first try → level up ("Level up!"). 3 misses in a row → level down (silently). Grown-ups can pin a level per game.
7. **Always a way back.** Every screen has a ⬅ button that returns to the screen you came from (the installed iPad app has no browser back button). No identical question twice in a row.
8. **Grown-ups settings.** Tap ⚙️ on the home screen (no hold). Optional session limit ("the cars are going to sleep"); only that sleep screen still needs **holding ⚙️ for 3 seconds** to keep playing, so the limit can't be skipped by a quick tap.
9. **Private and offline.** No ads, no outside links, no accounts, no tracking. Progress lives in the browser on that device.
10. **iOS audio.** The first screen is one big ▶ button: iOS only allows sound after a tap.
11. **Full screen.** Tapping ▶ also goes full screen (browsers only allow it right after a tap); the ⛶ button on the home screen toggles it. iPhone Safari can't make pages full screen, so there the button explains *Add to Home Screen*; the button is hidden when the app is already opened from the home screen.
12. **His name.** When a name is set in Grown-ups settings, the voice uses it (hello and bye, about half the cheers, a gentle "Almost, King!", level up, stickers, the Build a Car customers), the title becomes "King's Garage" / "Gara của King", Build a Car starts with his name on the plate, the last License Plate (L2, L3) spells it, and round 2 of Letter Highway asks for its first letter ("K is for King!"). Without a name everything stays generic.

13. **Car brands are always said in English**, whatever the language setting, and always on their own: *"Toyota!"* (English voice), then *"Đúng cặp rồi!"* — never inside a Vietnamese sentence. Plate words (FORD, BUS, ZOOM…) follow the same rule; the child's own name on a plate stays in the chosen language. (`src/engine/brandSay.ts`)

## Map: 7 zones
| Zone | Teaches | Background |
|---|---|---|
| 🅿️ Parking Lot (`numbers`) | counting, numerals, more/fewer, adding | yellow |
| 🛣️ Highway (`letters`) | letters, brand initials, ABC order | blue |
| 🎨 Paint Shop (`colors`) | coloring and free drawing | pink |
| 🚧 Construction Site (`logic`) | size, odd-one-out, patterns, shadows | orange |
| 🔧 Garage (`garage`) | memory, sound recognition, vehicle jobs | gray |
| 🎪 Playground (`play`) | free play: build, paint, traffic light, sticker book | green |
| 🚛 English Street (`english`) | English words through vehicles, with Zip and the classmates (see [ENGLISH_ZONE.md](ENGLISH_ZONE.md)) | lavender |

## Game catalog
Status: ✅ playable now · 📝 designed, not built yet · ⏸ built but turned off (set `status: 'ready'` in the catalog to bring it back). The source of truth is `src/content/catalog.ts` (status, zone, icon) plus `src/content/levels.ts` (difficulty).

### 🅿️ Parking Lot — numbers & first math
| Game | Status | Mechanic | L1 | L2 | L3 |
|---|---|---|---|---|---|
| Count the Cars `count` | ✅ | Tap each parked car (number badge + spoken), then pick how many | 1–5 | 3–8 | 5–10 |
| Number Road `numberRoad` | ✅ | Numbered cones in a row: what comes next? | up to 5 | up to 10 | up to 10, 4 choices |
| Loading Dock `loadingDock` | ✅ | Dump trucks with rocks (varied colors / wording) | which has **more** (1–6) | more **or fewer** (1–7) | **add** two loads |
| Car Transporter `transporter` | ✅ | "Load 4 cars onto the truck!": tap cars on (counted aloud), tap to take off, **GO** checks ("You have 3, we need 4 — add more!") | 1–5 | 3–8 | truck starts with some cars: "has 3, make it 7" (adding to 10) |
| Parking Stories `parkingStory` | ✅ | "4 cars are parked… 1 drives away!" (cars animate) — how many now? | take away within 5 | add or take within 7 | add or take within 10, up to 4 at once |
| Quick Look `quickLook` | ✅ | Rocks in dice patterns flash, then the garage door covers them: how many? | 1–3, 2 s | 1–5, 1.5 s | 3–8 (a group of 5 + more), 1.3 s |
| Garage Numbers `garageNumbers` | 📝 | Drag car "3" into garage "3" | — | — | — |
| Fuel Up `fuelUp` | 📝 | Tap the pump N times | — | — | — |

### 🛣️ Highway — letters & first reading
| Game | Status | Mechanic | L1 | L2 | L3 |
|---|---|---|---|---|---|
| Read the Brand `readBrand` | ✅ | A logo + written names: tap the word that says the brand | 2 words, different first letters | 3 words | 3 words, one with the **same first letter** (Mazda / Mercedes) |
| Letter Highway `letterHighway` | ✅ | A letter sign; tap the car wearing that letter | A–F | A–M | A–Z, lowercase on cars · round 2 is the first letter of his name when it's in the level's letters |
| Brand Letters `brandLetters` | ✅ | "Toyota starts with… T!" — names shown with the first letter in red | logo → letter | letter → logo | both + construction vehicles (English) |
| Letter Road `letterRoad` | ✅ | Drive a car with the finger along a capital letter drawn as a road, stroke by stroke in writing order (first writing) | straight letters L T I H E F V X Z | curves O C U J D P N A M W K Y | all 26 |
| License Plates `licensePlates` | ✅ | Copy the plate by tapping its letters in order | MG, KIA, BMW, BUS… | FORD, JEEP, VOLVO… | TOYOTA, NISSAN… · L2 and L3: **the last plate is his own name** (set in Grown-ups) |
| ABC Convoy `abcConvoy` | ⏸ | *(off: the alphabet order means little yet)* | | | |

### 🎨 Paint Shop — colors & shapes
| Game | Status | Mechanic | L1 | L2 | L3 |
|---|---|---|---|---|---|
| Car Wash Colors `carWash` | ⏸ | *(off: he already knows his colors)* | "Tap the red car!" | 4 basic colors, 2 choices | 10 colors, 3 | "Tap the **big blue dump truck**" (size + color + type) |
| Paint Shop `paint` ⭐ | ✅ | Coloring book. Pick a pot, tap a part of any car, vehicle or logo. The color name is said each time; opening a logo says the brand name. **Logo pages always show the small finished logo** (with every pot available) as a guide. Undo, save to My Garage, reopen later | 8 pots, free painting | all 12 pots + a small **"real one" reference**; cheers when it matches | + **color mixing** chips ("yellow and blue make green!") |
| Drawing Board `drawing` ✏️ | ✅ | Free finger drawing on blank paper or **over a vehicle/logo outline** (outlines stay on top like a coloring book). Tools: pencil, crayon (waxy), big brush, rainbow pen, star pen, car/logo stickers, eraser; 12 colors; 3 sizes; scribble sound; every tool and color is spoken. Undo, ⭐ save, 📄 new page. **Auto-saves** when leaving or starting a new page; drawings appear in My Garage → ✏️ and can be reopened and drawn on | — | — | — |
| Shape Garage `shapeGarage` | ⏸ | *(off: too hard at 3)* | "Tap the triangle!" | circle/square/triangle | + rectangle, star, oval | "What shape is the **wheel**?" (wheel, window, warning sign, door, mirror) |
| Tire Shop `tireShop` | 📝 | Match tire size and count to vehicles | — | — | — |

### 🚧 Construction Site — thinking
| Game | Status | Mechanic | L1 | L2 | L3 |
|---|---|---|---|---|---|
| Sorting Garage `sorting` | ✅ | Send each vehicle to the right garage (8 per session) | by colour (red / blue) | builders vs rescue | + everyday cars (3 garages) |
| Odd One Out `oddOneOut` | ✅ | 3 alike + 1 different — only the "which group" version now | category | category | category |
| Pattern Road `patternRoad` | ✅ | What comes next? | A B A ? | A A B ? | A B C ? with vehicles |
| Shadow Garage `mechanic` | ✅ | Whose shadow? — always similar-looking vehicles now | 2 | 3 | 4 |
| Size Parking `sizeOrder` | ✅ | Park the vehicles in order of size, spots numbered 1, 2, 3… | 3, small → big | 4, small → big | 4, **big → small** |
| Who Drove Away? `whoLeft` | ✅ | Remember the parked vehicles; the door closes; one leaves — which? | 3 | 4 | 5 look-alike construction vehicles |
| Picture Puzzle `roadPuzzle` | ✅ | A logo or vehicle in pieces; drag a piece to its spot (or tap piece, then spot) | 2 pieces | 4 | 6 |
| Big and Small `bigSmall` | ⏸ | *(off: replaced by Size Parking)* | | | |
| Story Order `storyOrder` | 📝 | dig → load → dump | — | — | — |

### 🔧 Garage — memory & listening
| Game | Status | Mechanic | L1 | L2 | L3 |
|---|---|---|---|---|---|
| Logo Match `brandMemory` | ✅ | Match each logo with its car (the car wears the badge in brand color) | 2 pairs face up | 3 pairs face down | 5 pairs face down |
| Sound Garage `soundGarage` | ✅ | Hear honk / bus horn / siren / nee-naw / police whoop / digger rumble / reversing beep; tap who makes it | 2 choices | 3 | 4 |
| Who Does This Job? `whoJob` | ✅ | "There's a fire! Who can help?" | fire truck, excavator, ambulance | + crane, mixer, dump truck, roller | all 10 jobs, 4 choices |
| Where Is the Car? `whereIsCar` | 📝 | on / under / in front / behind | — | — | — |

### 🎪 Playground — free play
| Game | Status | Mechanic |
|---|---|---|
| Build a Car `buildCar` | ✅ | A garage: big car on a lift, 10 category buttons, one big option row. **10 car types** (family, sports, SUV, pickup, mini, van, off-road jeep, convertible, race car, monster truck), paint, wheels (small / normal / monster + 4 rims), **wheel colour** (silver, gold or any paint; the tyre stays black), pattern + second colour (stripes, flames, stars, dots, two-tone), door number 1–9, licence plate (his name, ZOOM, BEEP…), **car name** on the side (TURBO, ROCKET, SUPER, or a grown-up taps ✏️ and types one, e.g. "Raptor"; typed names stay in the row), extras (spoiler, roof rack, siren, taxi sign, flag), driver (boy, dog, cat, bear), logo, horn + engine sound, 🎲 surprise. **GO = test drive** (tap to honk), then it parks in My Garage. **L1** free building · **L2** customer orders "a red sports car" · **L3** orders with a third thing (number / monster wheels / pattern), ✓ per item, 3 orders → sticker |
| Traffic Light `traffic` | ✅ | L1: free play: red stops the car, green makes it go. L2: follow spoken requests ("make the car stop!"). L3: + yellow = slow |
| Paint Shop `paint` | ✅ | (same as above) |
| Drawing Board `drawing` | ✅ | (same as above) |
| My Garage `stickers` | ✅ | Stickers earned, saved paintings (tap to keep painting), drawings (tap to keep drawing), built cars (tap to honk) |

### 🚛 English Street — English through vehicles
Full design: [ENGLISH_ZONE.md](ENGLISH_ZONE.md). Everyone (Zip the tow truck, the classmates, the helper) speaks the app language; English is only the word being taught, said on its own.

**English Street is a road, not a list of games.** The zone screen shows the badges on top (one town per topic) and the 4 stops of the town he is in; Zip waits at the next stop and ▶ plays it. The stars under a stop are its **level**, which decides how much help he gets:

| Level | What he hears (Vietnamese app) | Cards / buttons |
|---|---|---|
| ★ | full help: *"Đâu là xe cứu hỏa? Tiếng Anh là: fire truck!"* | 2 |
| ★★ | no name in his language: *"Đâu là xe:"* + *"fire truck!"* | 3 |
| ★★★ | just the word: *"fire truck!"* | 4 |

After two misses at ★★ / ★★★ the meaning is given as help (*"Nghĩa là xe cứu hỏa!"*) and the right card glows.

Each town has **one stop per level**, then its badge:

| Town (badge) | Words | ★ | ★★ | ★★★ |
|---|---|---|---|---|
| 🚒 Rescue cars | car, bus, fire truck, police car, ambulance | 🚢 ship brings every word | Zip's Garage (3 cards) | Zip's Garage (4 cards) |
| 🚧 Construction | excavator, bulldozer, dump truck, crane, cement mixer, road roller | 🚢 | Zip's Garage | Zip's Garage |
| 🛵 On the street | motorbike, bicycle, taxi, truck, garbage truck, tow truck | 🚢 | Zip's Garage | Zip's Garage |
| 🎨 Colors | red, blue, yellow, green, orange, pink, black, white | 🚢 | Zip's Garage | Zip's Garage, **two words** (*"red bus!"*) |
| 🟢 Go and stop | go, stop, slow, fast, honk, lights on | Zip Says (meaning + glowing button) | *"Zip nói: go!"* | *"go!"* |
| ✈️ Far away | train, plane, boat, helicopter, rocket | 🚢 | Zip's Garage (*"Đâu là: plane!"*) | Zip's Garage |

- **Passing a stop:** 60% of its rounds right on the first try (ship stops always pass; the 3rd try passes anyway). Otherwise: *"Gần được rồi! Mình chơi lại trạm này một lần nữa nhé!"*
- **After a stop:** the level stars are shown. When the next stop is a new level, a star pops in and the helper says what changes (*"Lên cấp hai sao! Từ giờ Zip chỉ nói tên tiếng Anh thôi nhé!"*). After the ★★★ stop he gets the town's **badge**, and the next town opens.
- **After every badge** the road turns into mixed ★★★ practice stops that never run out (a sticker each time). Earned towns can be replayed by tapping their badge.
- **Classmates:** friends he names when they come off the ship (the first on his first visit, then one more per visit after a finished stop). They ride along at the bottom of every English screen, react in the app language, and joke when tapped.
- **My Garage → 📚:** his badges, and a card for every word he has met with its stars (the highest level he got it right at).
- Grown-ups: each town can be Auto / On / Off; English echo for the other zones.

**English echo** (Grown-ups): when the language is Tiếng Việt, the other zones add the English word after right answers, paint colors and (optionally) counting: *"Xe cứu hỏa — fire truck!"*

## Content
- **24 brands** (simplified badges drawn from the real logos, recognizable rather than exact): Toyota, Honda, BMW, Mercedes, Audi, VinFast, Ford, Tesla, Porsche, Ferrari, Lamborghini, Volkswagen, Kia, Hyundai, Mazda, Jeep, Mitsubishi, Nissan, Chevrolet, MG, Lexus, Land Rover, Volvo, Suzuki.
- **22 vehicles**: car (10 body styles), police car, bus, fire truck, ambulance, excavator, bulldozer, dump truck, crane, cement mixer, road roller, motorbike, bicycle, taxi, truck, garbage truck, tow truck, train, plane, boat, helicopter, rocket. Each is a Paint Shop page and can appear in the vehicle games and stickers.
- **12 colors**, **6 shapes**, numbers 1–10, A–Z.

## Ideas backlog
- Build the 📝 games above (drag-and-drop helper first: Garage Numbers, Tire Shop, Road Puzzle, Story Order).
- Record Dad's voice for the common lines (cheer, tryAgain, intros); see SCRIPTS.md.
- More sticker scenes (city, race track) where stickers can be placed.
- "Car of the day": a brand and its letter on the home screen.
- ~~Counting in Vietnamese and English back-to-back (bilingual mode).~~ Done: English echo → "Words + counting".
- English Street phases 2–3 (units 4, 6–10, Fix-it Zip, Paint it!, Order Up, friend turns, field trips…): see ENGLISH_ZONE.md §12.
