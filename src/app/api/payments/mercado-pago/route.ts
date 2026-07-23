import { NextResponse } from "next/server";
export async function POST(){return NextResponse.json({message:"Integração Mercado Pago desativada. Configure credenciais somente no servidor e implemente idempotência antes de ativar."},{status:501})}
