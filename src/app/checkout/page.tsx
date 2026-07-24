import { Suspense } from "react";
import Link from "next/link";
import { serverSupabase } from "@/lib/supabase/server";
import CheckoutForm from "./checkout-form";

export default async function CheckoutPage() {
  const supabase = await serverSupabase();
  const { data: authData } = supabase
    ? await supabase.auth.getUser()
    : { data: { user: null } };

  if (!supabase || !authData.user) {
    return (
      <section className="narrow">
        <span className="eyebrow">Checkout</span>
        <h1>Entre para finalizar sua compra</h1>
        <p>
          Para gerar o Pix e acompanhar seu pedido depois em{" "}
          <Link href="/minhas-compras">Minhas compras</Link>, você precisa
          estar conectada à sua conta.
        </p>
        <Link className="button" href="/conta">
          Entrar na minha conta
        </Link>
      </section>
    );
  }

  return (
    <Suspense
      fallback={
        <section className="narrow">
          <span className="eyebrow">Checkout</span>
          <h1>Finalizar com Pix</h1>
        </section>
      }
    >
      <CheckoutForm />
    </Suspense>
  );
}
