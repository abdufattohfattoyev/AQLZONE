/**
 * Ilk ochilishda til so'raladi — bir marta.
 *
 * Nega bu ekran KERAK. Brauzer tili taxmin beradi (`lib/til.ts`), lekin
 * taxmin ko'p yerda yolg'on chiqadi: telefon ruscha sozlangan-u, bola
 * o'zbek maktabida o'qiydi; yoki teskarisi. Noto'g'ri tilda ochilgan
 * ilovada esa ota-ona "til qayerda almashadi?" degan tugmani IZLASHI
 * kerak bo'ladi — va u tugma sozlamalar ichida, ya'ni o'sha o'zi o'qiy
 * olmaydigan tildagi ekran ortida.
 *
 * Ekran ataylab DEVOR EMAS ma'nosida qisqa: bitta savol, ikkita tugma,
 * hisob ham, internet ham talab qilinmaydi. Bir marta bosilgach boshqa
 * chiqmaydi va sozlamalardan istalgan payt almashtiriladi.
 *
 * Sarlavha IKKI TILDA yozilgan — aynan shu ekranda foydalanuvchi qaysi
 * tilni o'qiy olishini bilmaymiz, shuning uchun ikkalasini ham beramiz.
 */
import { Logo } from "./Logo";
import { TILLAR, til, tilniQoy } from "../lib/til";

export function TilTanlash({ onTanlandi }: { onTanlandi: () => void }) {
  const tanla = (kod: (typeof TILLAR)[number]["kod"]) => () => {
    // Taxmin bilan bir xil bo'lsa qayta yuklash KERAK EMAS — ilova
    // allaqachon shu tilda yasalgan. Boshqa bo'lsa `tilniQoy` o'zi
    // sahifani yangilaydi: kurslar va savollar modul yuklanganda bir
    // marta yasaladi va ularni joyida almashtirib bo'lmaydi.
    tilniQoy(kod);
    if (kod === til()) onTanlandi();
  };

  return (
    <div className="mx-auto grid min-h-ekran w-full max-w-[430px] place-items-center px-4 py-8">
      <div className="az-kirish w-full rounded-clay bg-karta p-6 text-center shadow-clay">
        <Logo size={64} className="mx-auto" />
        <h1 className="mt-3 text-[21px] leading-tight">
          Tilni tanlang
          <span className="block text-[15px] text-ink-soft">Выберите язык</span>
        </h1>
        <p className="mt-2 text-[12.5px] leading-snug text-ink-dim">
          Ilova, darslar va savollar shu tilda bo'ladi
          <span className="block">Приложение, уроки и вопросы будут на этом языке</span>
        </p>

        <div className="mt-6 space-y-2.5">
          {TILLAR.map((x) => (
            <button key={x.kod} type="button" onClick={tanla(x.kod)}
              className="clay-press flex h-[56px] w-full items-center justify-center gap-3
                         rounded-3xl bg-brand-green font-display text-[17px] text-white">
              <span className="grid size-7 place-items-center rounded-full bg-white/25
                               text-[12px] leading-none">
                {x.belgi}
              </span>
              {x.nom}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
