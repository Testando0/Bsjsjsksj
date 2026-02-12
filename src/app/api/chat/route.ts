import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    // Validação básica
    if (!message) {
      return NextResponse.json({ error: 'Mensagem necessária' }, { status: 400 });
    }

    // Configuração da API Externa (Ajuste conforme a doc oficial se necessário)
    // Assume-se formato padrão OpenAI (messages: [{role, content}])
    const payload = {
      model: "cris-model-1.0", // Substitua pelo modelo indicado na doc
      messages: [
        ...history,
        { role: "user", content: message }
      ],
      temperature: 0.7
    };

    const response = await fetch(process.env.CRIS_API_URL || 'https://cris-api-ibornqs6.manus.space/api/chat', { // Endpoint fallback
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CRIS_API_KEY}`, // Autenticação via Env Var
        // Adicione headers extra se a doc pedir (ex: 'x-api-key')
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Erro na API Externa:", errorData);
      return NextResponse.json({ error: `Erro na API: ${response.statusText}` }, { status: response.status });
    }

    const data = await response.json();
    
    // Adaptação da resposta (Ajuste conforme o JSON de retorno da API)
    // Assume-se retorno: { choices: [{ message: { content: "..." } }] } ou { reply: "..." }
    const reply = data.choices?.[0]?.message?.content || data.reply || data.output || JSON.stringify(data);

    return NextResponse.json({ reply });

  } catch (error) {
    console.error("Erro interno:", error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}
