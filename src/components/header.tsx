"use client";
import Link from "next/link"; import { useEffect, useState } from "react"; import { useCart } from "./cart-provider";
const links=[["Início","/"],["MM2","/mm2"],["FTF","/ftf"],["Adopt Me","/adopt-me"],["Encomendas","/encomendas"],["Avaliações","/avaliacoes"],["FAQ","/faq"]];
export function Header(){
  const {count}=useCart();
  const [unread,setUnread]=useState(false);
  useEffect(()=>{
    let cancelled=false;
    const check=()=>fetch("/api/chat/unread").then(r=>r.json()).then(d=>{if(!cancelled) setUnread(Boolean(d.unread));}).catch(()=>{});
    check();
    const id=setInterval(check,15000);
    return ()=>{cancelled=true;clearInterval(id);};
  },[]);
  const menu=<>{links.map(([n,h])=><Link key={h} href={h}>{n}</Link>)}<Link href="/chat">Suporte{unread && <span className="badge" style={{marginLeft:4}}>Nova</span>}</Link></>;
  return <header className="header"><Link className="brand" href="/" aria-label="Natty Store — página inicial">Natty <span>Store</span></Link><nav className="desktop-nav" aria-label="Navegação principal">{menu}</nav><details className="mobile-menu"><summary aria-label="Abrir menu de navegação">Menu</summary><nav aria-label="Navegação mobile">{menu}</nav></details><div className="actions"><Link href="/busca" aria-label="Buscar produtos">Buscar</Link><Link href="/conta">Minha conta</Link><Link className="pill" href="/carrinho" aria-label={`Carrinho com ${count} ${count===1?"item":"itens"}`}>Carrinho ({count})</Link></div></header>;
}
