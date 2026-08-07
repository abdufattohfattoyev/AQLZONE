# Haqiqiy suratlar

Bu papkaga tashlangan fayl kichkintoy kartasida **chizma o'rniga**
ko'rsatiladi. Kodga tegish shart emas — fayl qo'yildi, ilova o'zi oladi
(`src/lib/chizma/surat.ts`).

## Hozir nima bor

**Mashinalar (12)** va **Hayvonlar (14)** — hammasi surat. Ikkalasi
ham bitta-bitta AI varag'idan kesilgan (`toplam rasm.png` va
`hayvonlar toplami.png`, loyiha ildizida). Fayllar:

- 512×512, foni shaffof `.webp`;
- **hammasi CHAPGA qaragan** — mashinalardan beshtasi va
  hayvonlarning HAMMASI shu maqsadda ag'darilgan;
- har biri 14–41 KB, jami ~715 KB.

**Ranglar** va **Raqamlar** ga surat kerak emas: rang doirasi va
raqam belgisi ilovaning o'zida chiziladi.

### Ikki varaq ikki xil kesilgan

Mashinalar varag'i toza 4×3 to'r edi — u kataklarga bo'lindi.
Hayvonlar varag'ida esa oxirgi qatorda ikkitagina narsa bor va ular
katakka tushmagan (fil ikki ustun orasida turibdi). Shuning uchun u
to'rga emas, NARSALARGA bo'lindi: oq fon kesilib, qolgan bo'laklar
topildi va joylashuvi bo'yicha tartiblandi. Ikkinchi usul
ishonchliroq — varaq qanday terilganidan qat'i nazar ishlaydi.

## Nom

Fayl nomi kartaning `id` si bilan **aynan** bir xil bo'lishi kerak
(`src/lib/kichkintoy.ts`):

| bo'lim    | id lar                                                                                                     |
| --------- | ---------------------------------------------------------------------------------------------------------- |
| Mashinalar | `mashina` `avtobus` `taksi` `yuk` `otochir` `tezyordam` `politsiya` `traktor` `velosiped` `poyezd` `samolyot` `kema` |
| Hayvonlar  | `it` `mushuk` `sigir` `qoy` `ot` `tovuq` `xoroz` `ordak` `quyon` `baqa` `ayiq` `arslon` `fil` `asalari`        |

Masalan: `samolyot.png`, `poyezd.webp`.

Bir nechtasini qo'yish mumkin — qolgan kartalar chizmada ishlab
turaveradi. Ya'ni bo'limni birdaniga emas, bittalab ko'chirish mumkin.

## Fayl qanday bo'lsin

- **foni SHAFFOF** `.png` yoki `.webp` — karta oq, fonli surat uning
  ustida "yamoq" bo'lib turadi;
- kvadratga yaqin, ~512×512;
- narsa markazda, chetdan biroz bo'shliq bilan;
- 150 KB dan og'ir bo'lmasin: bo'limda o'n ikkita karta bor va ular
  sekin internetda ochiladi.

## Litsenziya — eng muhimi

Faqat **o'zingiznikini** yoki **tijoratda ishlatishga ochiq**
litsenziyali suratni qo'ying.

Google rasm qidiruvidan chiqqan surat "bepul" ko'rinadi, lekin deyarli
har doim egasi bor (ko'pchiligida pastida `Photo © …` yozuvi ham
turadi). Bunday surat ilovaga kirsa, u vaqt bombasi bo'lib qoladi —
xuddi `src/lib/tovush.ts` da tayyor mp3 haqida yozilganidek.

Ochiq manbalar:

- **Wikimedia Commons** — `Public domain` yoki `CC0` filtri bilan
- **Pexels**, **Unsplash** — tijoratga ruxsat beradi (fonini o'zingiz
  kesib olishingiz kerak bo'ladi)
- **openclipart.org**, **svgrepo.com** — CC0 vektor rasmlar
