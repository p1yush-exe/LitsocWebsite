import Image from "next/image";
import Link from "next/link";

export const insta= "https://www.instagram.com/";

const subsocs = [
  { name: "PoetSoc",               href: `${insta}poetsoc.thapar`},
  { name: "Anubhooti",             href: `${insta}anubhooti.litsoc`},
  { name: "DebSoc",                href: `${insta}debsoc_tiet`},
  { name: "Punjabi Soc",           href: `${insta}punjabi_litsoc`},
  { name: "Muse",                  href: `${insta}muse.litsoc.thapar`},
  { name: "Thapar Quizzing Club",  href: `${insta}thaparquizzingclub`},
  { name: "Cineastes",             href: `${insta}_cineastes_`},
  { name: "Theatre Soc",           href: `${insta}thapar.theatre.club`},
];

export default function Footer() {
  return (
    <footer className="w-full border-t border-dark-brown bg-footer-bg py-12 text-footer">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center gap-8 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col items-center gap-3 md:items-start">
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="LitSoc Logo" width={36} height={36} className="rounded-full opacity-90" />
              <span className="text-sm font-semibold text-footer font-antonio">Literary Society, TIET</span>
            </div>
            <p className="max-w-xs text-center text-xs leading-relaxed md:text-left font-lato">
              Fostering literary culture at Thapar Institute of Engineering &amp; Technology, Patiala.
            </p>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-footer/60 font-lato">Sub-societies</p>
            <ul className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-xs font-lato">
              {subsocs.map((s) => (
                <li key={s.name}>
                  <Link href={s.href} target="_blank" rel="noopener noreferrer" className="hover:text-milk-yellow transition-colors">{s.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-footer/60 font-lato">Follow Us</p>
            <div className="flex gap-4">
              <Link href={`${insta}litsoc.thapar`} aria-label="Instagram" className="hover:text-milk-yellow transition-colors" target="_blank" rel="noopener noreferrer">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.17.054 1.97.24 2.43.403a4.92 4.92 0 0 1 1.772 1.153 4.92 4.92 0 0 1 1.153 1.772c.163.46.35 1.26.403 2.43.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.054 1.17-.24 1.97-.403 2.43a4.902 4.902 0 0 1-1.153 1.772 4.902 4.902 0 0 1-1.772 1.153c-.46.163-1.26.35-2.43.403-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.054-1.97-.24-2.43-.403a4.902 4.902 0 0 1-1.772-1.153A4.902 4.902 0 0 1 2.566 19.28c-.163-.46-.35-1.26-.403-2.43C2.105 15.584 2.093 15.204 2.093 12s.012-3.584.07-4.85c.054-1.17.24-1.97.403-2.43a4.902 4.902 0 0 1 1.153-1.772A4.902 4.902 0 0 1 5.49 2.793c.46-.163 1.26-.35 2.43-.403C9.186 2.175 9.566 2.163 12 2.163zm0-2.163C8.741 0 8.332.012 7.052.07 5.77.128 4.816.32 3.978.628A7.07 7.07 0 0 0 1.425 2.425 7.07 7.07 0 0 0 .628 4.978C.32 5.816.128 6.77.07 8.052.012 9.332 0 9.741 0 12c0 2.259.012 2.668.07 3.948.058 1.282.25 2.236.558 3.074a7.07 7.07 0 0 0 1.797 2.553 7.07 7.07 0 0 0 2.553 1.797c.838.308 1.792.5 3.074.558C9.332 23.988 9.741 24 12 24c2.259 0 2.668-.012 3.948-.07 1.282-.058 2.236-.25 3.074-.558a7.07 7.07 0 0 0 2.553-1.797 7.07 7.07 0 0 0 1.797-2.553c.308-.838.5-1.792.558-3.074C23.988 14.668 24 14.259 24 12c0-2.259-.012-2.668-.07-3.948-.058-1.282-.25-2.236-.558-3.074a7.07 7.07 0 0 0-1.797-2.553A7.07 7.07 0 0 0 19.022.628C18.184.32 17.23.128 15.948.07 14.668.012 14.259 0 12 0z" />
                  <path d="M12 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                </svg>
              </Link>
              <Link href="https://www.youtube.com/channel/UC9MU_komxIcGQBvWPlrs0GQ" aria-label="YouTube" className="hover:text-milk-yellow transition-colors" target="_blank" rel="noopener noreferrer">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.121 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </Link>
              <Link href="mailto:litsoc@thapar.edu" aria-label="Email" className="hover:text-milk-yellow transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 2-8 5-8-5h16zm0 12H4V8.236l8 5 8-5V18z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-footer/20 pt-6 text-center text-xs text-footer/60 font-lato">
          &copy; {new Date().getFullYear()} Literary Society, Thapar Institute of Engineering &amp; Technology. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
