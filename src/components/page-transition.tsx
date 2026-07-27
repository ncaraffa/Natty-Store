"use client";

import { usePathname } from "next/navigation";

/**
 * Transição de página real: cada troca de rota remonta este wrapper
 * (via `key={pathname}`), o que reinicia a animação CSS `page-enter`
 * (ver src/app/styles/motion.css). Navegações que só mudam querystring
 * (ex.: /checkout?order=...) mantêm o mesmo pathname e não remontam —
 * o formulário de checkout já trata retomada via seus próprios efeitos.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="page-transition">
      {children}
    </div>
  );
}
