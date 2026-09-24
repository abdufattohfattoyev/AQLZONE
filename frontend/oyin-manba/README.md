# Karvon yo'li — manba

`frontend/public/oyin/karvon.html` QO'LDA tahrirlanmaydi. U shu papkadan
yasaladi:

    python frontend/oyin-manba/ilovaga.py

Ikki fayl:

- `karvon-yoli.html` — o'yinning O'ZI (namuna versiyasi: brauzerda
  yakka holda ochilaveradi, server kerak emas).
- `ilovaga.py` — o'sha namunani ILOVA versiyasiga aylantiradi:
  serverga ulaydi (to'siq va javob tekshiruvi `backend/core/karvon.py`
  da), qurilma xotirasini tozalaydi, ulashishni Telegram qobig'iga
  bog'laydi.

Nega ikki fayl. O'yinni serversiz ochib ko'rish — uni ishlab chiqishning
eng tez yo'li: hech narsa ko'tarmasdan, bitta faylni brauzerga tashlab
tekshirish mumkin. Ilova versiyasi esa o'sha fayldan AVTOMATIK yasaladi,
ya'ni ikkalasi hech qachon bir-biridan uzoqlashmaydi.

Qiyinlik jadvali (`SINF`) va bekatdagi to'siq soni (`tosiqlar`) IKKI
JOYDA bor — bu yerda va serverda. Ular bir xil bo'lishi shart:
serverdagisi haqiqat, bu yerdagisi esa namuna rejimi uchun.
