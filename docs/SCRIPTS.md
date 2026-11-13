# Voice scripts

> Generated from `src/content/i18n/en.ts` and `vi.ts` by `npm run docs:scripts`. **Edit the .ts files, then regenerate.**

- Lines with several options (•) are picked at random each time.
- `{name}` slots are filled by the game (a color, a vehicle, a brand…).
- **The child's name:** a key ending in `.kid` is the personal version of the line above it. When a name is set in Grown-ups settings the game says the `.kid` line instead, with `{kid}` replaced by the name (some cheers keep a few lines without the name, so it isn't said every time). Without a name the plain line is used.
- **Recorded voice:** put `public/audio/<lang>/<key>.mp3` (e.g. `public/audio/vi/cheer.mp3`) and add `"<lang>/<key>"` to `public/audio/manifest.json`. Recordings replace the browser voice for lines **without** `{slots}`; lines with slots always use the browser voice. `{kid}` doesn't count as a slot: record `<key>.kid` saying the name yourself, or record just `<key>` and it plays even when a name is set.

## App

| Key | English | Tiếng Việt |
|---|---|---|
| `app.title` | Little Garage | Gara Nhỏ |
| `app.title.kid` | {kid}'s Garage | Gara của {kid} |
| `app.start` | Let's go! | Đi thôi! |
| `app.welcome` | • Welcome to Little Garage! Where shall we drive today?<br>• Beep beep! Pick a place to play! | • Chào mừng đến Gara Nhỏ! Hôm nay mình lái xe đi đâu nào?<br>• Bíp bíp! Chọn chỗ chơi nào! |
| `app.welcome.kid` | • Hi {kid}! Welcome to your garage! Where shall we drive today?<br>• Beep beep, {kid}! Pick a place to play! | • Chào {kid}! Chào mừng đến gara của con! Hôm nay mình lái xe đi đâu nào?<br>• Bíp bíp, {kid} ơi! Chọn chỗ chơi nào! |
| `garage.intro` | This is your garage! Look at all your stickers and cars! | Đây là gara của con! Xem các sticker và xe của con nè! |
| `garage.intro.kid` | This is {kid}'s garage! Look at all your stickers and cars! | Đây là gara của {kid}! Xem các sticker và xe của con nè! |
| `sleep` | The cars are tired and going to sleep. Bye bye! See you next time! | Các xe mệt rồi, đi ngủ thôi. Tạm biệt! Hẹn gặp lại nhé! |

## Feedback (all games)

| Key | English | Tiếng Việt |
|---|---|---|
| `cheer` | • Great job!<br>• Vroom vroom! You did it!<br>• Super driver!<br>• Awesome!<br>• Yes! Well done!<br>• Beep beep, hooray! | • Giỏi quá!<br>• Brừm brừm! Con làm được rồi!<br>• Tài xế siêu đẳng!<br>• Tuyệt vời!<br>• Đúng rồi! Giỏi lắm!<br>• Bíp bíp, hoan hô! |
| `cheer.kid` | • Great job, {kid}!<br>• Vroom vroom! You did it, {kid}!<br>• Super driver!<br>• Awesome!<br>• Yes! Well done, {kid}!<br>• Beep beep, hooray! | • {kid} giỏi quá!<br>• Brừm brừm! {kid} làm được rồi!<br>• Tài xế siêu đẳng!<br>• Tuyệt vời!<br>• Đúng rồi! {kid} giỏi lắm!<br>• Bíp bíp, hoan hô! |
| `tryAgain` | • Hmm, try again!<br>• Almost! Look again.<br>• Oops! Try another one. | • Ừm, thử lại nhé!<br>• Gần đúng rồi! Nhìn lại nào.<br>• Ối! Thử cái khác nhé. |
| `tryAgain.kid` | • Hmm, try again!<br>• Almost, {kid}! Look again.<br>• Oops! Try another one. | • Ừm, thử lại nhé!<br>• {kid} ơi, gần đúng rồi! Nhìn lại nào.<br>• Ối! Thử cái khác nhé. |
| `hint` | Look! It's the one that's glowing. | Nhìn này! Là cái đang sáng đó. |
| `reveal` | Here it is! | Đây rồi! |
| `levelUp` | Level up! You're getting so good! | Lên cấp rồi! Con giỏi quá! |
| `levelUp.kid` | Level up! {kid}, you're getting so good! | Lên cấp rồi! {kid} giỏi quá! |
| `reward` | You earned a sticker! A {color} {vehicle}! | Con được một sticker mới! {vehicle} màu {color}! |
| `reward.kid` | {kid}, you earned a sticker! A {color} {vehicle}! | {kid} được một sticker mới! {vehicle} màu {color}! |
| `reward.again` | Play again? | Chơi lại nhé? |

## Zones

| Key | English | Tiếng Việt |
|---|---|---|
| `zone.numbers` | Parking Lot | Bãi đỗ xe |
| `zone.numbers.intro` | The Parking Lot! Let's play with numbers. | Bãi đỗ xe! Mình chơi với các con số nào. |
| `zone.letters` | Highway | Đường cao tốc |
| `zone.letters.intro` | The Highway! Let's find letters. | Đường cao tốc! Mình tìm chữ cái nào. |
| `zone.colors` | Paint Shop | Xưởng sơn |
| `zone.colors.intro` | The Paint Shop! Let's paint cars and logos! | Xưởng sơn! Mình cùng tô màu xe và logo nào! |
| `zone.logic` | Construction Site | Công trường |
| `zone.logic.intro` | The Construction Site! Let's think like a builder. | Công trường! Mình suy nghĩ như chú kỹ sư nhé. |
| `zone.garage` | Garage | Gara |
| `zone.garage.intro` | The Garage! Let's listen and remember. | Gara! Mình nghe và nhớ nào. |
| `zone.play` | Playground | Sân chơi |
| `zone.play.intro` | The Playground! Let's make something! | Sân chơi! Mình cùng sáng tạo nào! |
| `zone.english` | English Street | Phố Tiếng Anh |
| `zone.english.intro` | English Street! Here we learn English words for cars and trucks, with Zip! | Phố Tiếng Anh! Ở đây mình học tiếng Anh về các loại xe cùng Zip! |

## Game names & intros

| Key | English | Tiếng Việt |
|---|---|---|
| `game.count` | Count the Cars | Đếm xe |
| `game.count.intro` | Let's count the cars in the parking lot! | Mình cùng đếm xe trong bãi đỗ nào! |
| `game.numberRoad` | Number Road | Đường số |
| `game.numberRoad.intro` | Drive along the number road! | Lái xe trên đường số nào! |
| `game.loadingDock` | Loading Dock | Bến chở đá |
| `game.loadingDock.intro` | Let's look at the rocks in the dump trucks! | Xem đá trên các xe ben nào! |
| `game.garageNumbers` | Garage Numbers | Gara số |
| `game.garageNumbers.intro` | Park each car in its number garage! | Đỗ mỗi xe vào đúng gara có số của nó nhé! |
| `game.fuelUp` | Fuel Up | Đổ xăng |
| `game.fuelUp.intro` | Let's fill up the tank! | Mình đổ đầy bình xăng nào! |
| `game.letterHighway` | Letter Highway | Cao tốc chữ cái |
| `game.letterHighway.intro` | Let's find letters on the highway! | Mình tìm chữ cái trên đường cao tốc nào! |
| `game.brandLetters` | Brand Letters | Chữ cái hãng xe |
| `game.brandLetters.intro` | Every car name starts with a letter! | Tên mỗi hãng xe bắt đầu bằng một chữ cái! |
| `game.abcConvoy` | ABC Convoy | Đoàn xe ABC |
| `game.abcConvoy.intro` | The cars are lining up in A B C order! | Các xe xếp hàng theo thứ tự A B C! |
| `game.licensePlates` | License Plates | Biển số xe |
| `game.licensePlates.intro` | Let's make license plates! Tap the letters in the same order. | Mình làm biển số xe nào! Chạm vào các chữ theo đúng thứ tự nhé. |
| `game.carWash` | Car Wash Colors | Rửa xe tìm màu |
| `game.carWash.intro` | Welcome to the car wash! Let's find colors. | Chào mừng đến tiệm rửa xe! Mình tìm màu nào. |
| `game.paint` | Paint Shop | Xưởng sơn |
| `game.paint.intro` | Welcome to the paint shop! Pick a picture to paint. | Chào mừng đến xưởng sơn! Chọn một bức tranh để tô nào. |
| `game.drawing` | Drawing Board | Bảng vẽ |
| `game.drawing.intro` | Let's draw! Pick a blank page, or a car to color in. | Mình cùng vẽ nào! Chọn tờ giấy trắng, hoặc một chiếc xe để tô. |
| `game.shapeGarage` | Shape Garage | Gara hình khối |
| `game.shapeGarage.intro` | Let's find shapes! | Mình tìm hình nào! |
| `game.tireShop` | Tire Shop | Tiệm lốp xe |
| `game.tireShop.intro` | Which tire fits? | Lốp nào vừa nhỉ? |
| `game.bigSmall` | Big and Small | To và nhỏ |
| `game.bigSmall.intro` | Which one is big? Which one is small? | Cái nào to? Cái nào nhỏ? |
| `game.oddOneOut` | Odd One Out | Tìm cái khác |
| `game.oddOneOut.intro` | Find the one that's different! | Tìm cái khác biệt nào! |
| `game.patternRoad` | Pattern Road | Đường quy luật |
| `game.patternRoad.intro` | Look at the pattern on the road! | Nhìn quy luật trên đường nào! |
| `game.mechanic` | Shadow Garage | Bóng của ai? |
| `game.mechanic.intro` | Whose shadow is it? Let's guess! | Bóng của xe nào đây? Đoán thử nhé! |
| `game.storyOrder` | Story Order | Việc nào trước? |
| `game.storyOrder.intro` | What happens first? | Việc gì xảy ra trước nhỉ? |
| `game.roadPuzzle` | Picture Puzzle | Ghép hình |
| `game.roadPuzzle.intro` | Let's put the puzzle together! | Mình ghép hình nào! |
| `game.brandMemory` | Logo Match | Ghép logo |
| `game.brandMemory.intro` | Match each logo with its car! | Ghép mỗi logo với chiếc xe của nó nào! |
| `game.soundGarage` | Sound Garage | Gara âm thanh |
| `game.soundGarage.intro` | Listen carefully! | Nghe thật kỹ nhé! |
| `game.whoJob` | Who Does This Job? | Xe nào làm việc này? |
| `game.whoJob.intro` | Every vehicle has a job! | Mỗi chiếc xe đều có một công việc! |
| `game.whereIsCar` | Where Is the Car? | Xe ở đâu? |
| `game.whereIsCar.intro` | Where is the car hiding? | Chiếc xe trốn ở đâu nhỉ? |
| `game.buildCar` | Build a Car | Chế tạo xe |
| `game.buildCar.intro` | Welcome to the garage! Build your very own car. Tap the buttons to change it, then press GO! | Chào mừng đến gara! Con tự chế tạo chiếc xe của mình nhé. Chạm các nút để thay đổi, rồi bấm ĐI! |
| `game.traffic` | Traffic Light | Đèn giao thông |
| `game.traffic.intro` | Red means stop. Green means go! | Đèn đỏ là dừng lại. Đèn xanh là đi! |
| `game.stickers` | My Garage | Gara của con |
| `game.stickers.intro` | This is your garage! Look at all your stickers and cars! | Đây là gara của con! Xem các sticker và xe của con nè! |
| `game.readBrand` | Read the Brand | Đọc tên hãng xe |
| `game.readBrand.intro` | Let's read car names! Find the word that matches the logo. | Mình cùng đọc tên xe nào! Tìm chữ đúng với logo nhé. |
| `game.sorting` | Sorting Garage | Gara phân loại |
| `game.sorting.intro` | Every vehicle has its own garage. Park them in the right one! | Mỗi loại xe có gara riêng. Đỗ xe vào đúng gara nhé! |
| `game.parkingStory` | Parking Stories | Chuyện bãi đỗ xe |
| `game.parkingStory.intro` | Let's watch the parking lot! Cars come and go. | Mình cùng xem bãi đỗ xe nhé! Xe đến rồi xe đi. |
| `game.quickLook` | Quick Look | Nhìn nhanh |
| `game.quickLook.intro` | The rocks will hide fast! Look quickly and remember how many. | Đá sẽ trốn rất nhanh! Nhìn thật nhanh và nhớ có mấy viên nhé. |
| `game.whoLeft` | Who Drove Away? | Xe nào đi rồi? |
| `game.whoLeft.intro` | Look at the cars. Then the garage door closes… and one drives away! | Nhìn các xe nhé. Rồi cửa gara đóng lại… và một xe chạy đi! |
| `game.sizeOrder` | Size Parking | Đỗ xe theo cỡ |
| `game.sizeOrder.intro` | Park the vehicles in order of size! | Đỗ các xe theo thứ tự to nhỏ nhé! |
| `game.transporter` | Car Transporter | Xe chở ô tô |
| `game.transporter.intro` | The big truck carries cars! Load the right number, then press GO. | Xe tải to chở ô tô! Chất đúng số xe rồi bấm ĐI nhé. |
| `game.letterRoad` | Letter Road | Đường chữ cái |
| `game.letterRoad.intro` | Drive your car along the letter road! | Lái xe theo con đường hình chữ cái nào! |
| `game.engDrive` | Drive with Zip | Lái xe cùng Zip |
| `game.engDrive.intro` | Let's drive with Zip to three English stops! | Mình cùng lái xe với Zip qua ba trạm học tiếng Anh nhé! |
| `game.engMeet` | Ship Arrives | Tàu cập bến |
| `game.engMeet.intro` | The ship brings new English words! Listen, say it with Zip, then find the picture! | Tàu chở các từ tiếng Anh mới đến rồi! Con nghe, nói theo Zip, rồi tìm đúng hình nhé! |
| `game.engFind` | Zip's Garage | Gara của Zip |
| `game.engFind.intro` | Zip says an English word. Tap the right picture! | Zip nói một từ tiếng Anh. Con chạm vào đúng hình nhé! |
| `game.engDo` | Zip Says | Zip bảo |
| `game.engDo.intro` | Zip says an English word. Tap that button and Zip will do it! | Zip nói một từ tiếng Anh. Con bấm đúng nút đó để Zip làm theo nhé! |

## Prompts

| Key | English | Tiếng Việt |
|---|---|---|
| `p.puzzle.go` | Move each piece to its place! | Đưa từng mảnh vào đúng chỗ nhé! |
| `p.puzzle.again` | Not there. Try another spot! | Chưa đúng chỗ. Thử chỗ khác nhé! |
| `p.puzzle.done` | It's {name}! | Là {name}! |
| `p.read.find` | Find the word {name}! | Tìm chữ {name} nào! |
| `p.sort.color` | Park it in the garage with the same color! | Đỗ xe vào gara cùng màu nhé! |
| `p.sort.group` | Which garage does it go in? | Xe này vào gara nào? |
| `say.sorted` | The {vehicle} goes in the {group} garage! | {vehicle} vào gara {group}! |
| `say.sortedColor` | {color} car, {color} garage! | Xe màu {color}, gara màu {color}! |
| `p.quick.look` | Look quickly! | Nhìn nhanh nào! |
| `p.quick.ask` | How many rocks did you see? | Con thấy có mấy viên đá? |
| `p.who.look` | Remember all the vehicles! | Nhớ hết các xe nhé! |
| `p.who.close` | Closing the garage door… | Đóng cửa gara nào… |
| `p.who.ask` | Who drove away? | Xe nào đã chạy đi? |
| `p.story.parked` | {n} cars are parked. | Có {n} xe đang đỗ. |
| `p.story.leave1` | One car drives away! | Một xe chạy đi! |
| `p.story.leaveN` | {k} cars drive away! | {k} xe chạy đi! |
| `p.story.arrive1` | One more car arrives! | Thêm một xe nữa đến! |
| `p.story.arriveN` | {k} more cars arrive! | Thêm {k} xe nữa đến! |
| `p.story.ask` | How many cars are there now? | Bây giờ có bao nhiêu xe? |
| `p.plate.make` | Let's make the plate {word}! | Mình làm biển số {word} nào! |
| `p.plate.find` | Find the letter {letter}! | Tìm chữ {letter} nào! |
| `p.plate.done` | {word}! You made the plate! | {word}! Con làm xong biển số rồi! |
| `p.plate.name.kid` | Let's make a plate with your name, {kid}! | Mình làm biển số tên của con nào, {kid}! |
| `p.plate.nameDone.kid` | {kid}! That's your name! You made the plate! | {kid}! Tên của con đó! Con làm xong biển số rồi! |
| `p.size.order` | Park them from the smallest to the biggest! | Đỗ xe từ nhỏ nhất đến to nhất nhé! |
| `p.size.orderRev` | Park them from the biggest to the smallest! | Đỗ xe từ to nhất đến nhỏ nhất nhé! |
| `p.size.nextSmall` | Find the smallest one left! | Tìm xe nhỏ nhất còn lại nào! |
| `p.size.nextBig` | Find the biggest one left! | Tìm xe to nhất còn lại nào! |
| `p.size.done` | All parked, from small to big! | Đỗ xong rồi, từ nhỏ đến to! |
| `p.size.doneRev` | All parked, from big to small! | Đỗ xong rồi, từ to đến nhỏ! |
| `p.carrier.load` | Load {n} cars onto the truck! | Chất {n} xe lên xe tải nào! |
| `p.carrier.load1` | Load one car onto the truck! | Chất một xe lên xe tải nào! |
| `p.carrier.make` | The truck has {k} cars. Make it {n}! | Xe tải có {k} xe rồi. Làm cho đủ {n} xe nhé! |
| `p.carrier.more` | You have {have}. We need {need}. Add more cars! | Con có {have} xe. Cần {need} xe. Thêm xe nữa nào! |
| `p.carrier.less` | You have {have}. That's too many! We need {need}. | Con có {have} xe. Nhiều quá rồi! Cần {need} xe thôi. |
| `p.carrier.go` | {n} cars! Off we go! | {n} xe! Xuất phát! |
| `p.carrier.go1` | One car! Off we go! | Một xe! Xuất phát! |
| `p.road.letter` | Let's drive the letter {letter}! Start at the green flag. | Mình lái xe theo chữ {letter} nào! Bắt đầu ở cờ xanh nhé. |
| `p.road.next` | Now this road! | Giờ đến đường này! |
| `p.road.start` | Start at the green flag! | Bắt đầu ở cờ xanh nhé! |
| `p.road.done` | You drove the letter {letter}! | Con lái xong chữ {letter} rồi! |
| `p.count` | How many cars? Tap each car to count! | Có bao nhiêu xe? Chạm vào từng xe để đếm nhé! |
| `p.numberRoad.next` | What number comes next? | Số nào tiếp theo? |
| `p.numberRoad.missing` | Which number is missing? | Số nào bị thiếu? |
| `p.dock.more` | • Which truck has more rocks?<br>• Find the truck with more rocks!<br>• Which dump truck is carrying more? | • Xe ben nào chở nhiều đá hơn?<br>• Tìm xe ben có nhiều đá hơn nào!<br>• Xe nào chở nhiều đá hơn nhỉ? |
| `p.dock.fewer` | • Which truck has fewer rocks?<br>• Find the truck with fewer rocks!<br>• Which dump truck is carrying less? | • Xe ben nào chở ít đá hơn?<br>• Tìm xe ben có ít đá hơn nào!<br>• Xe nào chở ít đá hơn nhỉ? |
| `p.dock.add` | • How many rocks are there altogether?<br>• Count all the rocks! How many? | • Tất cả có bao nhiêu viên đá?<br>• Đếm hết đá nào! Có bao nhiêu viên? |
| `p.letter.find` | Find the car with the letter {letter}! | Tìm xe có chữ {letter} nào! |
| `p.brandLetter.toLetter` | {name} starts with... which letter? | {name} bắt đầu bằng... chữ gì nhỉ? |
| `p.brandLetter.toBrand` | Which one starts with {letter}? | Cái nào bắt đầu bằng chữ {letter}? |
| `p.brandLetter.says` | {name} starts with {letter}! | {name} bắt đầu bằng chữ {letter}! |
| `p.abc.next` | Which letter comes next? | Chữ nào tiếp theo? |
| `p.abc.missing` | Which letter is missing? | Chữ nào bị thiếu? |
| `p.wash.find` | Tap the {color} car! | Chạm vào xe màu {color}! |
| `p.wash.two` | Tap the {size} {color} {vehicle}! | Chạm vào chiếc {vehicle} {size} màu {color}! |
| `p.shape.find` | Tap the {shape}! | Chạm vào {shape}! |
| `p.shape.object` | What shape is the {object}? | {object} có hình gì? |
| `p.size.big` | Tap the big one! | Chạm vào cái to! |
| `p.size.small` | Tap the small one! | Chạm vào cái nhỏ! |
| `p.size.biggest` | Tap the biggest one! | Chạm vào cái to nhất! |
| `p.size.smallest` | Tap the smallest one! | Chạm vào cái nhỏ nhất! |
| `p.odd` | Which one is different? | Cái nào khác các cái còn lại? |
| `p.pattern` | What comes next? | Tiếp theo là gì? |
| `p.shadow` | Whose shadow is this? | Đây là bóng của xe nào? |
| `p.sound` | Who makes this sound? | Xe nào kêu như thế này? |
| `say.vehicle` | It's the {vehicle}! | Là {vehicle}! |
| `say.value` | {value}! | {value}! |
| `say.initial.kid` | {letter}! {letter} is for {kid}! | {letter}! Chữ {letter} trong tên {kid}! |

## Jobs (Who Does This Job?)

| Key | English | Tiếng Việt |
|---|---|---|
| `job.fireTruck` | Oh no, there's a fire! Who can help? | Ôi, có đám cháy! Ai giúp được nhỉ? |
| `job.ambulance` | Someone is hurt. Who takes them to the hospital? | Có người bị đau. Xe nào chở đến bệnh viện? |
| `job.policeCar` | Who keeps the road safe? | Xe nào giữ an toàn trên đường? |
| `job.excavator` | We need to dig a big hole. Who can dig? | Mình cần đào một cái hố to. Xe nào đào được? |
| `job.bulldozer` | Who can push the big pile of dirt? | Xe nào đẩy được đống đất to? |
| `job.dumpTruck` | Who can carry the rocks away? | Xe nào chở đá đi được? |
| `job.crane` | Who can lift the heavy beam up high? | Xe nào nâng được thanh sắt nặng lên cao? |
| `job.mixer` | We need concrete. Who mixes it? | Mình cần bê tông. Xe nào trộn bê tông? |
| `job.roller` | Who makes the road flat and smooth? | Xe nào làm đường phẳng và mịn? |
| `job.bus` | Who takes the children to school? | Xe nào chở các bạn nhỏ đến trường? |

## Vehicles

| Key | English | Tiếng Việt |
|---|---|---|
| `v.car` | car | xe hơi |
| `v.policeCar` | police car | xe cảnh sát |
| `v.bus` | bus | xe buýt |
| `v.fireTruck` | fire truck | xe cứu hỏa |
| `v.ambulance` | ambulance | xe cứu thương |
| `v.excavator` | excavator | máy xúc |
| `v.bulldozer` | bulldozer | máy ủi |
| `v.dumpTruck` | dump truck | xe ben |
| `v.crane` | crane | xe cẩu |
| `v.mixer` | cement mixer | xe trộn bê tông |
| `v.roller` | road roller | xe lu |
| `v.motorbike` | motorbike | xe máy |
| `v.bicycle` | bicycle | xe đạp |
| `v.taxi` | taxi | xe taxi |
| `v.truck` | truck | xe tải |
| `v.garbageTruck` | garbage truck | xe rác |
| `v.towTruck` | tow truck | xe cứu hộ |
| `v.train` | train | tàu hỏa |
| `v.plane` | plane | máy bay |
| `v.boat` | boat | thuyền |
| `v.helicopter` | helicopter | trực thăng |
| `v.rocket` | rocket | tên lửa |

## Numbers

| Key | English | Tiếng Việt |
|---|---|---|
| `num.1` | one | một |
| `num.2` | two | hai |
| `num.3` | three | ba |
| `num.4` | four | bốn |
| `num.5` | five | năm |
| `num.6` | six | sáu |
| `num.7` | seven | bảy |
| `num.8` | eight | tám |
| `num.9` | nine | chín |
| `num.10` | ten | mười |

## Colors

| Key | English | Tiếng Việt |
|---|---|---|
| `color.red` | red | đỏ |
| `color.orange` | orange | cam |
| `color.yellow` | yellow | vàng |
| `color.green` | green | xanh lá |
| `color.blue` | blue | xanh dương |
| `color.sky` | light blue | xanh da trời |
| `color.purple` | purple | tím |
| `color.pink` | pink | hồng |
| `color.brown` | brown | nâu |
| `color.black` | black | đen |
| `color.gray` | gray | xám |
| `color.white` | white | trắng |

## Shapes, sizes, objects, car bodies

| Key | English | Tiếng Việt |
|---|---|---|
| `shape.circle` | circle | hình tròn |
| `shape.square` | square | hình vuông |
| `shape.triangle` | triangle | hình tam giác |
| `shape.rectangle` | rectangle | hình chữ nhật |
| `shape.star` | star | ngôi sao |
| `shape.oval` | oval | hình bầu dục |
| `size.big` | big | to |
| `size.small` | small | nhỏ |
| `obj.wheel` | wheel | bánh xe |
| `obj.window` | window | cửa sổ |
| `obj.sign` | warning sign | biển báo nguy hiểm |
| `obj.door` | door | cánh cửa |
| `obj.star` | star sticker | sticker ngôi sao |
| `obj.mirror` | mirror | gương chiếu hậu |
| `body.sedan` | family car | xe gia đình |
| `body.sports` | sports car | xe thể thao |
| `body.suv` | big S U V | xe S U V to |
| `body.pickup` | pickup truck | xe bán tải |
| `size.medium` | medium | vừa |
| `body.mini` | mini car | xe mini |
| `body.van` | van | xe van |
| `body.jeep` | off-road jeep | xe địa hình |
| `body.convertible` | convertible | xe mui trần |
| `body.race` | race car | xe đua |
| `body.monster` | monster truck | xe tải quái vật |

## Paint Shop

| Key | English | Tiếng Việt |
|---|---|---|
| `paint.pick` | Pick a picture to paint! | Chọn một bức tranh để tô nào! |
| `paint.match` | Can you make it look like the real one? | Con tô giống xe thật được không? |
| `paint.matched` | Wow! It looks just like the real one! | Oa! Giống y như thật luôn! |
| `paint.saved` | Beautiful! I put it in your garage. | Đẹp quá! Mình cất vào gara của con nhé. |
| `paint.mix` | {a} and {b} make {c}! | {a} trộn với {b} thành {c}! |

## Build a Car

| Key | English | Tiếng Việt |
|---|---|---|
| `build.surprise` | Surprise! A brand new car! | Bất ngờ! Một chiếc xe mới toanh! |
| `build.drive` | Test drive! Tap to honk! | Lái thử nào! Chạm để bóp còi! |
| `build.parked` | Parked in your garage! | Xe đã vào gara của con! |
| `build.parked.kid` | Parked in {kid}'s garage! | Xe đã vào gara của {kid}! |
| `build.go` | Vroom! Your new {name} car is in your garage! | Brừm! Chiếc xe {name} mới đã vào gara của con! |

## Traffic Light

| Key | English | Tiếng Việt |
|---|---|---|
| `traffic.red` | Red! Stop! | Đèn đỏ! Dừng lại! |
| `traffic.yellow` | Yellow! Slow down! | Đèn vàng! Đi chậm lại! |
| `traffic.green` | Green! Go! | Đèn xanh! Đi thôi! |
| `traffic.ask.red` | Can you make the car stop? | Con làm cho xe dừng lại được không? |
| `traffic.ask.green` | Make the car go! | Cho xe chạy nào! |
| `traffic.ask.yellow` | Make the car go slowly! | Cho xe đi chậm lại nào! |

## Logo Match

| Key | English | Tiếng Việt |
|---|---|---|
| `memory.match` | {name}! A match! | {name}! Đúng cặp rồi! |

## English Street: taught words (the only lines always said in English)

| Key | English | Tiếng Việt |
|---|---|---|
| `eng.phrase2` | {c} {w}! | {c} {w}! |
| `echo.colorVehicle` | {color} {vehicle}! | {color} {vehicle}! |

## English Street: Zip and the helper (app language)

| Key | English | Tiếng Việt |
|---|---|---|
| `zip.hello` | • Hello! I'm Zip! Beep beep!<br>• Hi! I'm Zip! Let's go! | • Xin chào! Tớ là Zip! Bíp bíp!<br>• Chào cậu! Tớ là Zip! Đi thôi! |
| `zip.hello.kid` | • Hello, {kid}! I'm Zip! Beep beep!<br>• Hi, {kid}! Let's go! | • Chào {kid}! Tớ là Zip! Bíp bíp!<br>• Chào {kid}! Tớ là Zip! Đi thôi! |
| `zip.bye` | • Bye bye! See you tomorrow!<br>• Bye bye! Thank you! | • Tạm biệt! Mai gặp lại nhé!<br>• Tạm biệt! Cảm ơn cậu nhé! |
| `zip.bye.kid` | • Bye bye, {kid}! See you tomorrow!<br>• Bye bye, {kid}! Thank you! | • Tạm biệt {kid}! Mai gặp lại nhé!<br>• Tạm biệt {kid}! Cảm ơn cậu nhé! |
| `zip.cheer` | • Yes!<br>• Good job!<br>• You got it!<br>• Awesome!<br>• High five!<br>• Beep beep, hooray! | • Đúng rồi!<br>• Giỏi quá!<br>• Chuẩn luôn!<br>• Tuyệt vời!<br>• Đập tay nào!<br>• Bíp bíp, hoan hô! |
| `zip.cheer.kid` | • Yes!<br>• Good job, {kid}!<br>• You got it!<br>• Awesome!<br>• Yes, {kid}! High five!<br>• Beep beep, hooray! | • Đúng rồi!<br>• {kid} giỏi quá!<br>• Chuẩn luôn!<br>• Tuyệt vời!<br>• {kid} ơi, đập tay nào!<br>• Bíp bíp, hoan hô! |
| `zip.tryAgain` | • Uh-oh! Try again!<br>• Oops! Look again! | • Ối! Thử lại nhé!<br>• Ồ! Nhìn lại nào! |
| `zip.whatName` | Hello, new friend! What's your name? | Chào bạn mới! Bạn tên là gì nhỉ? |
| `zip.whatCar` | {mate}, what's your car? | {mate} ơi, xe của cậu là xe gì? |
| `zip.whatColor` | What color? | Màu gì nhỉ? |
| `unit.rescue` | Rescue cars | Xe cứu hộ |
| `unit.build` | Construction | Công trường |
| `unit.street` | On the street | Đường phố |
| `unit.colors` | Colors | Màu sắc |
| `unit.actions` | Go and stop | Chạy và dừng |
| `unit.travel` | Far away | Đi xa |
| `act.go` | go | chạy |
| `act.stop` | stop | dừng lại |
| `act.slow` | slow | chạy chậm |
| `act.fast` | fast | chạy nhanh |
| `act.honk` | honk | bấm còi |
| `act.lights` | lights on | bật đèn |
| `eng.a.find` | Where is the {w}? | Đâu là {w}? |
| `eng.a.findColor` | Where is the {w} car? | Xe màu {w} đâu nhỉ? |
| `eng.a.findAction` | Which button is {w}? | Nút nào là {w}? |
| `eng.inEnglish` | Say it with me: | Tiếng Anh là: |
| `eng.where` | Where is the: | Đâu là xe: |
| `eng.whereThing` | Where is the: | Đâu là: |
| `eng.whereColor` | Which car is: | Đâu là xe màu: |
| `eng.whereAction` | Which button is: | Nút nào là: |
| `eng.road.town` | This is {unit} town! | Đây là khu {unit}! |
| `eng.road.replay` | You have this badge! Tap a stop to play it again! | Con có huy hiệu ở đây rồi! Chạm vào một trạm để chơi lại nhé! |
| `eng.road.allDone` | You have every badge! Let's drive and practice all the words! | Con có đủ huy hiệu rồi! Mình lái xe ôn lại các từ nhé! |
| `eng.road.locked` | Not yet! Play the glowing stop first! | Chưa đến trạm này! Con chơi trạm đang sáng trước nhé! |
| `eng.badge.locked` | Not open yet! Earn the badge before it first! | Chưa mở đâu! Con lấy huy hiệu trước đó đã nhé! |
| `eng.stopDone` | One stop done! Let's drive on! | Xong một trạm rồi! Mình đi tiếp nào! |
| `eng.stopAgain` | Nice practice! | Con ôn lại giỏi lắm! |
| `eng.stopRetry` | Almost! Let's play this stop one more time! | Gần được rồi! Mình chơi lại trạm này một lần nữa nhé! |
| `eng.level2` | Level up: two stars! From now on, Zip only says the English name! | Lên cấp hai sao! Từ giờ Zip chỉ nói tên tiếng Anh thôi nhé! |
| `eng.level3` | Level up: three stars! Now Zip says just the English word. Listen carefully! | Lên cấp ba sao! Giờ Zip chỉ nói đúng một từ tiếng Anh. Con nghe kỹ nhé! |
| `eng.badge` | You finished {unit} town! You earned a badge! | Con học xong khu {unit} rồi! Con được một huy hiệu! |
| `eng.zipSays` | Zip says: | Zip nói: |
| `eng.means` | That means {w}! | Nghĩa là {w}! |
| `eng.meet.vehicle` | Who's this? It's the {w}! | Ai đây nhỉ? Là {w}! |
| `eng.meet.color` | Look! A {w} car! | Nhìn kìa! Xe màu {w}! |
| `eng.meet.action` | Look at Zip! {w}! | Nhìn Zip kìa! Zip đang {w}! |
| `eng.sayWithZip` | Your turn! Say it with Zip! | Con nói theo Zip nào! |
| `eng.friend.arrive` | Look! A new friend is coming off the ship! | Nhìn kìa! Có bạn mới xuống tàu! |
| `eng.friend.pickName` | Pick a name for your new friend! | Con đặt tên cho bạn mới đi! |
| `eng.friend.how` | How shall we name your new friend? Say it, tap letters, or pick a name! | Con đặt tên bạn mới thế nào nhỉ? Nói vào micro, bấm chữ cái, hay chọn tên có sẵn? |
| `eng.friend.howNoMic` | Tap letters to make a name, or pick one! | Con bấm chữ cái để đặt tên, hoặc chọn một tên có sẵn nhé! |
| `eng.friend.sayName` | Tap the microphone and say a name, nice and loud! | Con bấm micro rồi nói tên bạn ấy thật to nhé! |
| `eng.friend.notHeard` | Hmm, I didn't hear it. Tap and say it again, louder! | Ơ, chưa nghe thấy gì cả! Con bấm micro rồi nói lại to hơn nhé! |
| `eng.friend.noMic` | The microphone isn't on. Let's tap letters! | Micro chưa bật rồi. Mình bấm chữ cái nhé! |
| `eng.friend.typeName` | Tap letters to make a name! | Con bấm các chữ cái để viết tên bạn ấy nhé! |
| `eng.friend.pickReady` | Pick a name! | Con chọn một cái tên nhé! |
| `eng.friend.done` | Now {mate} will play with you every day! | Từ giờ {mate} sẽ chơi cùng con mỗi ngày! |

## Classmates (app language, each with their own voice)

| Key | English | Tiếng Việt |
|---|---|---|
| `mate.hello` | I'm {mate}! Hi! | Tớ là {mate}! Chào cậu! |
| `mate.hello.kid` | I'm {mate}! Hi, {kid}! | Tớ là {mate}! Chào {kid}! |
| `mate.start` | • Let's go! Vroom!<br>• Ready, set, go!<br>• I'm ready! | • Đi thôi! Brừm brừm!<br>• Một, hai, ba, đi nào!<br>• Tớ sẵn sàng rồi! |
| `mate.start.kid` | • Let's go, {kid}! Vroom!<br>• Ready, set, go!<br>• I'm ready, {kid}! | • Đi thôi {kid} ơi! Brừm brừm!<br>• Một, hai, ba, đi nào!<br>• Tớ sẵn sàng rồi, {kid}! |
| `mate.right` | • Wow!<br>• Yes! Yes!<br>• High five!<br>• You did it!<br>• Beep beep, hooray! | • Oa!<br>• Đúng rồi! Đúng rồi!<br>• Đập tay nào!<br>• Cậu giỏi quá!<br>• Bíp bíp, hoan hô! |
| `mate.right.kid` | • Wow!<br>• Yes! Yes!<br>• High five!<br>• You did it, {kid}!<br>• Beep beep, hooray! | • Oa!<br>• Đúng rồi! Đúng rồi!<br>• Đập tay nào!<br>• {kid} giỏi quá!<br>• Bíp bíp, hoan hô! |
| `mate.miss` | • Hmm… try again!<br>• Ooh, almost!<br>• You can do it! | • Ừm… thử lại nhé!<br>• Ồ, gần đúng rồi!<br>• Cậu làm được mà! |
| `mate.hint` | • Psst! Look over there!<br>• Psst! The shiny one! | • Suỵt! Nhìn bên kia kìa!<br>• Suỵt! Cái đang sáng đó! |
| `mate.streak` | Beep beep beep! Three in a row! | Bíp bíp bíp! Đúng ba lần liền! |
| `mate.levelUp` | Level up! Woohoo! | Lên cấp rồi! Hoan hô! |
| `mate.end` | • Yay! That was fun!<br>• Bye bye! See you! | • Yeah! Vui quá đi!<br>• Tạm biệt! Hẹn gặp lại! |
| `mate.end.kid` | • Yay! That was fun, {kid}!<br>• Bye bye, {kid}! See you! | • Yeah! Vui quá {kid} ơi!<br>• Tạm biệt {kid}! Hẹn gặp lại! |
| `mate.wow` | • Wow!<br>• Ooh!<br>• Cool! | • Oa!<br>• Ồ!<br>• Hay quá! |
| `mate.tap.silly` | • Ah-choo! Beep!<br>• Honk honk! Hee hee!<br>• I'm a bit sleepy…<br>• My {car} is the best! | • Hắt xì! Bíp!<br>• Bim bim! Hì hì!<br>• Tớ hơi buồn ngủ…<br>• {car} của tớ là nhất! |
| `mate.tap.curious` | • What's that? Ooh!<br>• I like {color}!<br>• Where are we going? | • Cái gì thế? Ồ!<br>• Tớ thích màu {color}!<br>• Mình đi đâu thế? |
| `mate.tap.speedy` | • Vroom vroom! Wheee!<br>• My {car} is fast!<br>• High five! | • Brừm brừm! Yeah!<br>• {car} của tớ chạy nhanh lắm!<br>• Đập tay nào! |
| `mate.tap.shy` | • Hi…<br>• I like playing with you!<br>• My {car} is {color}. | • Chào cậu…<br>• Tớ thích chơi với cậu lắm!<br>• {car} của tớ màu {color}. |
| `mate.wake` | Huh? Beep! I'm awake! Let's play! | Hả? Bíp! Tớ dậy rồi! Chơi tiếp nào! |
| `mate.wake.kid` | Huh? Beep! I'm awake! Let's play, {kid}! | Hả? Bíp! Tớ dậy rồi! {kid} ơi, chơi tiếp nào! |
| `mate.tooMany` | Hee hee! Let's play the game! | Hì hì! Mình chơi tiếp nào! |
| `mate.tooMany.kid` | Hee hee! Let's play the game, {kid}! | Hì hì! {kid} ơi, mình chơi tiếp nào! |

## Other

| Key | English | Tiếng Việt |
|---|---|---|
| `sleep.kid` | The cars are tired and going to sleep. Bye bye, {kid}! See you next time! | Các xe mệt rồi, đi ngủ thôi. Tạm biệt {kid}! Hẹn gặp lại nhé! |
| `group.construction` | builder | công trình |
| `group.emergency` | rescue | cứu hộ |
| `group.road` | everyday | xe thường |
| `draw.pick` | Pick a page to draw on! | Chọn một tờ để vẽ nào! |
| `draw.go` | Pick a pen and a color, then draw with your finger! | Chọn bút và màu, rồi vẽ bằng ngón tay nhé! |
| `tool.pencil` | Pencil | Bút chì |
| `tool.crayon` | Crayon | Bút sáp màu |
| `tool.brush` | Big brush | Cọ to |
| `tool.rainbow` | Rainbow pen | Bút cầu vồng |
| `tool.stars` | Star pen | Bút ngôi sao |
| `tool.stamp` | Stickers! Tap to stick a car. | Nhãn dán! Chạm để dán xe nhé. |
| `tool.eraser` | Eraser | Cục tẩy |
| `cat.type` | Car type | Kiểu xe |
| `cat.paint` | Paint | Màu sơn |
| `cat.wheels` | Wheels | Bánh xe |
| `cat.pattern` | Patterns | Hoa văn |
| `cat.number` | Number | Số xe |
| `cat.plate` | License plate | Biển số |
| `cat.extras` | Extras | Phụ kiện |
| `cat.driver` | Driver | Tài xế |
| `cat.logo` | Logo | Logo |
| `cat.sound` | Sounds | Âm thanh |
| `wheels.small` | small wheels | bánh xe nhỏ |
| `wheels.normal` | normal wheels | bánh xe vừa |
| `wheels.monster` | monster wheels | bánh xe khổng lồ |
| `pattern.none` | no pattern | không hoa văn |
| `pattern.stripes` | racing stripes | sọc đua |
| `pattern.flames` | flames | ngọn lửa |
| `pattern.stars` | stars | ngôi sao |
| `pattern.dots` | dots | chấm bi |
| `pattern.twoTone` | two colors | hai màu |
| `extra.spoiler` | a spoiler | cánh gió |
| `extra.rack` | a roof rack | giá nóc |
| `extra.siren` | siren lights | đèn còi |
| `extra.taxi` | a taxi sign | biển taxi |
| `extra.flag` | a flag | lá cờ |
| `driver.none` | no driver | không có tài xế |
| `driver.boy` | a boy driver | bạn nhỏ lái xe |
| `driver.dog` | a dog driver | chú chó lái xe |
| `driver.cat` | a cat driver | chú mèo lái xe |
| `driver.bear` | a bear driver | chú gấu lái xe |
| `driver.bunny` | a bunny driver | bạn thỏ lái xe |
| `engine.hum` | quiet engine | động cơ êm |
| `engine.vroom` | vroom engine | động cơ brừm |
| `engine.race` | race engine | động cơ xe đua |
| `cat.rim` | Wheel color | Màu bánh xe |
| `cat.model` | Car name | Tên xe |
| `rim.silver` | silver wheels | bánh xe màu bạc |
| `rim.gold` | gold wheels | bánh xe màu vàng kim |
| `rim.color` | {color} wheels | bánh xe màu {color} |
| `model.none` | no name | không có tên |
| `model.type` | Ask a grown-up to type a name! | Nhờ người lớn gõ tên xe nhé! |
| `model.says` | Your car is called {word}! | Xe của con tên là {word}! |
| `number.none` | no number | không có số |
| `plate.none` | no plate | không biển số |
| `plate.says` | Your plate says {word}! | Biển số là {word}! |
| `logo.none` | no logo | không logo |
| `order.make` | Please build me a {color} {body}! | Làm giúp mình một chiếc {body} màu {color} nhé! |
| `order.make.kid` | • Please build me a {color} {body}!<br>• Hi {kid}! Please build me a {color} {body}! | • Làm giúp mình một chiếc {body} màu {color} nhé!<br>• Chào {kid}! Làm giúp mình một chiếc {body} màu {color} nhé! |
| `order.number` | With the number {n} on the door! | Có số {n} trên cửa nhé! |
| `order.wheels` | With monster wheels! | Có bánh xe khổng lồ nhé! |
| `order.pattern` | With {pattern}! | Có {pattern} nhé! |
| `order.done` | That's exactly what I ordered! Press GO! | Đúng y như mình đặt! Bấm ĐI nào! |
| `order.notYet` | Hmm, not quite what I ordered. Look at the order! | Ừm, chưa giống đơn đặt lắm. Nhìn đơn đặt nhé! |
| `drive.stop` | Stop {n}: {place}! Tap the green button! | Trạm số {n}: {place}! Con bấm nút xanh nhé! |
