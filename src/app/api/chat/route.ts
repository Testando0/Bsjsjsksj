import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    // URL específica do seu Manus IA
    const endpoint = "https://cris-api-ibornqs6.manus.space/v1/chat/completions";
    const apiKey = process.env.CRIS_API_KEY;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "crisalida", 
        messages: [
          ...history,
          { role: "user", content: message }
        ],
        stream: false // Para evitar complexidade de streaming por enquanto
      })
    });

    const responseText = await response.text();

    // Se o Manus devolver HTML (página de erro), capturamos aqui
    if (responseText.includes("<!doctype") || responseText.includes("<html")) {
      console.error("Recebido HTML em vez de JSON. Verifique se a rota /v1/chat/completions existe no seu Manus.");
      return NextResponse.json({ error: "A API do Manus retornou uma página web (HTML) em vez de dados." }, { status: 500 });
    }

    const data = JSON.parse(responseText);
    
    // Mapeamento exato da resposta da sua doc
    const reply = data.choices?.[0]?.message?.content || "A IA não retornou conteúdo.";

    return NextResponse.json({ reply });

  } catch (error) {
    console.error("Erro Crítico:", error);
    return NextResponse.json({ error: 'Falha na comunicação com o servidor Manus.' }, { status: 500 });
  }
}
