import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    const response = await fetch(process.env.CRIS_API_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CRIS_API_KEY}`,
      },
      body: JSON.stringify({
        model: "crisalida", // Modelo padrão recomendado pela sua doc
        messages: [
          ...history,
          { role: "user", content: message }
        ],
        stream: false,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `Erro na API: ${response.status}` }, { status: response.status });
    }

    const data = await response.json();
    
    // O caminho exato segundo sua doc: choices[0].message.content
    const reply = data.choices[0].message.content;

    return NextResponse.json({ reply });

  } catch (error) {
    console.error("Erro no servidor:", error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
