/**
 * Xato ushlagich.
 *
 * Buningsiz bitta komponentdagi xato butun ilovani oq ekranga aylantiradi:
 * React yiqilgan daraxtni butunlay olib tashlaydi va bola nima bo'lganini
 * tushunmaydi — u faqat "ilova buzildi" deb o'ylaydi va boshqa ochmaydi.
 *
 * Bu yerda ikki daraja bor:
 *   - `qayta()` — faqat yiqilgan qismni qayta chizadi. Xato vaqtinchalik
 *     bo'lsa (masalan bitta savol generatoridagi kutilmagan qiymat), bola
 *     hech narsa yo'qotmaydi.
 *   - "Boshiga qaytish" — ilovani butunlay qayta yuklaydi.
 *
 * Progress `localStorage` da turadi, shuning uchun ikkala yo'lda ham
 * yulduzlar joyida qoladi. Buni bolaga aytib qo'yamiz — u eng ko'p shundan
 * qo'rqadi.
 */
import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Ilovaning qaysi qismi — xabarda ko'rsatiladi. */
  qayer?: string;
}

interface State {
  xato: Error | null;
}

export class XatoUshlagich extends Component<Props, State> {
  state: State = { xato: null };

  static getDerivedStateFromError(xato: Error): State {
    return { xato };
  }

  componentDidCatch(xato: Error, info: ErrorInfo) {
    // Konsolga yozamiz — ishlab chiquvchi uchun yagona iz shu.
    console.error("Aql Zone — kutilmagan xato:", xato, info.componentStack);
  }

  qayta = () => this.setState({ xato: null });

  render() {
    if (!this.state.xato) return this.props.children;

    return (
      <div className="grid min-h-dvh place-items-center px-6">
        <div className="w-full max-w-[360px] rounded-clay bg-karta p-7 text-center shadow-clay">
          <div className="text-[56px] leading-none">🛠️</div>

          <h1 className="mt-3 text-[21px]">Nimadir noto'g'ri ketdi</h1>

          <p className="mt-2 text-[13.5px] leading-snug text-ink-soft">
            Xavotir olma — <b>yulduzlaring va tangalaring joyida</b>.
            Quyidagi tugmani bosib davom etsang bo'ladi.
          </p>

          <button
            type="button"
            onClick={this.qayta}
            className="clay-press mt-6 w-full rounded-3xl bg-brand-green py-3.5 font-display text-lg
                       text-white shadow-[0_6px_0_var(--color-brand-green-d)]"
          >
            Qayta urinish
          </button>

          <button
            type="button"
            onClick={() => { window.location.href = "/"; }}
            className="clay-press mt-2.5 w-full rounded-3xl bg-track py-3 font-display text-[15px] text-ink-soft"
          >
            Boshiga qaytish
          </button>

          {/* Texnik tafsilot — bolaga kerak emas, lekin ota-ona yoki
              ishlab chiquvchi muammoni aytib bera olsin. */}
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-[11.5px] text-ink-dim">
              Texnik ma'lumot
            </summary>
            <pre className="mt-1.5 max-h-32 overflow-auto rounded-xl bg-track p-2 text-[10.5px]
                            whitespace-pre-wrap text-ink-dim">
              {this.props.qayer ? `[${this.props.qayer}] ` : ""}
              {this.state.xato.message}
            </pre>
          </details>
        </div>
      </div>
    );
  }
}
