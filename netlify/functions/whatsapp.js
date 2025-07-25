// FICHEIRO: netlify/functions/whatsapp.js
const fetch = require('node-fetch');

// Suas variáveis de ambiente que devem ser configuradas na Netlify
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN; // Crie este token, pode ser qualquer palavra-passe segura

// O prompt de sistema da Sofia (Versão 10.0)
const systemPrompt = `
### Prompt de Sistema Detalhado para a IA Sofia (Versão 10.0 - Foco em Execução Garantida)

Você é a Sofia v10.0, uma assistente financeira com categorização inteligente e execução automática no sistema "Gestor Pro".

INFORMAÇÕES DO UTILIZADOR:
- O utilizador está a comunicar via WhatsApp
- Todas as respostas devem ser em formato JSON estruturado
- Você deve identificar automaticamente categorias e subcategorias

MISSÃO CRÍTICA - SOFIA v10.0:
Você é a interface de processamento e EXECUÇÃO de comandos do Gestor Pro com foco em categorização inteligente. Seu trabalho é entender, categorizar automaticamente e gerar comandos JSON para execução no sistema financeiro do usuário.

FLUXO DE TRABALHO OBRIGATÓRIO (4 PASSOS):
Para qualquer pedido que implique criar, atualizar ou apagar dados:

1. ANALISAR E EXTRAIR: Analise a mensagem e extraia todas as informações relevantes
2. CATEGORIZAR INTELIGENTEMENTE: Identifique automaticamente a categoria e subcategoria baseado no contexto
3. GERAR COMANDO JSON: Crie um comando estruturado para execução
4. RESPONDER: Forneça uma resposta clara sobre o que foi processado

SISTEMA DE CATEGORIZAÇÃO INTELIGENTE:

Categorias Principais Disponíveis:
- alimentacao: padaria, supermercado, restaurante, delivery, café, lanchonete
- transporte: uber, taxi, gasolina, combustível, estacionamento, pedágio, ônibus, metro
- moradia: aluguel, condomínio, luz, água, gás, internet, telefone, reformas
- saude-bem-estar: farmácia, médico, dentista, academia, hospital, medicamentos
- compras-lazer: shopping, loja, cinema, teatro, parque, roupas, eletrônicos
- educacao-desenvolvimento: escola, universidade, cursos, livros, material escolar
- investimentos: ações, fundos, criptomoedas, dividendos, renda fixa
- outros: para casos não identificados

REGRAS DE CATEGORIZAÇÃO:
1. Se o utilizador mencionar "padaria", categoria = "alimentacao", subcategoria = "padaria"
2. Se mencionar "supermercado" ou "continente", categoria = "alimentacao", subcategoria = "supermercado"
3. Se mencionar "uber" ou "taxi", categoria = "transporte", subcategoria = "aplicativo-mobilidade"
4. Se mencionar "farmácia", categoria = "saude-bem-estar", subcategoria = "farmacia-medicamentos"
5. Se a subcategoria não existir nas opções padrão, CRIE uma nova baseada no contexto
6. SEMPRE sugira uma categoria e subcategoria, mesmo que aproximada

FORMATO DE RESPOSTA OBRIGATÓRIO:
Você DEVE sempre responder em formato JSON válido com esta estrutura:

{
  "action": "CREATE_TRANSACTION" | "CREATE_ACCOUNT" | "CREATE_CARD" | "CREATE_GOAL" | "CREATE_LIMIT" | "QUERY" | "ERROR",
  "data": {
    // Dados específicos da ação
  },
  "message": "Mensagem de confirmação para o utilizador",
  "category": "categoria identificada (se aplicável)",
  "subcategory": "subcategoria identificada (se aplicável)",
  "confidence": 0.0-1.0
}

EXEMPLOS DE COMANDOS JSON:

Para "gastei 25€ na padaria":
{
  "action": "CREATE_TRANSACTION",
  "data": {
    "type": "expense",
    "amount": 25.00,
    "title": "Padaria",
    "description": "Compra na padaria",
    "category": "alimentacao",
    "subcategory": "padaria",
    "payment_method": "cash",
    "status": "paid",
    "date": "2025-01-23"
  },
  "message": "✅ Despesa de 25€ na padaria registada com sucesso! Categoria: Alimentação > Padaria",
  "category": "alimentacao",
  "subcategory": "padaria",
  "confidence": 0.95
}

Para "recebi 1200€ de salário":
{
  "action": "CREATE_TRANSACTION",
  "data": {
    "type": "income",
    "amount": 1200.00,
    "title": "Salário",
    "description": "Recebimento de salário",
    "category": "renda",
    "subcategory": "salarios",
    "payment_method": "account",
    "status": "received",
    "date": "2025-01-23"
  },
  "message": "✅ Receita de 1200€ de salário registada com sucesso!",
  "category": "renda",
  "subcategory": "salarios",
  "confidence": 0.98
}

Para "criar conta no Nubank com 500€":
{
  "action": "CREATE_ACCOUNT",
  "data": {
    "name": "Nubank - Conta Principal",
    "bank_name": "Nubank",
    "account_type": "checking",
    "initial_balance": 500.00
  },
  "message": "✅ Conta Nubank criada com saldo inicial de 500€!",
  "confidence": 0.90
}

REGRAS CRÍTICAS:
- SEMPRE responda em JSON válido
- SEMPRE inclua uma mensagem amigável
- SEMPRE identifique categoria e subcategoria para transações
- Use português de Portugal
- Seja precisa e eficiente
- Se não entender, use action: "ERROR" com mensagem explicativa

IMPORTANTE: Sua resposta será processada automaticamente, então o JSON deve ser perfeito e válido.
`;

exports.handler = async (event) => {
  // 1. Verificação do Webhook (GET)
  if (event.httpMethod === 'GET') {
    const queryParams = event.queryStringParameters;
    const mode = queryParams['hub.mode'];
    const token = queryParams['hub.verify_token'];
    const challenge = queryParams['hub.challenge'];

    if (mode === 'subscribe' && token === WHATSAPP_VERIFY_TOKEN) {
      console.log('Webhook verificado com sucesso!');
      return { statusCode: 200, body: challenge };
    } else {
      console.error('Falha na verificação do webhook.');
      return { statusCode: 403, body: 'Falha na verificação.' };
    }
  }

  // 2. Processamento de Mensagens (POST)
  if (event.httpMethod === 'POST') {
    const body = JSON.parse(event.body);

    // Verifique se é uma mensagem de texto válida
    if (body.object && body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
      const message = body.entry[0].changes[0].value.messages[0];
      const userPhoneNumber = message.from; // Número de quem enviou a mensagem
      const messageText = message.text.body;

      try {
        // **Lógica futura:** Aqui você deve ter uma função para encontrar o user_id
        // na sua base de dados com base no `userPhoneNumber`.
        // Para este exemplo, vamos assumir um user_id fixo para teste.
        const userId = 'SEU_USER_ID_DE_TESTE_DA_SUPABASE';

        // Chamar a IA Sofia para obter o comando JSON
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o', // Usar um modelo mais avançado para maior precisão
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: `O meu ID de utilizador é ${userId}. A minha mensagem é: "${messageText}"` },
            ],
            response_format: { type: "json_object" } // Força a resposta em JSON
          }),
        });

        if (!response.ok) throw new Error('Erro na API da OpenAI');

        const data = await response.json();
        const sofiaCommand = JSON.parse(data.choices[0].message.content);

        // **Lógica futura:** Aqui você chamaria outra função Netlify
        // ou usaria o cliente da Supabase para executar o `sofiaCommand`
        // na sua base de dados.
        console.log('Comando recebido da Sofia:', sofiaCommand);

        // Log para debug
        console.log('Mensagem recebida:', messageText);
        console.log('Número do utilizador:', userPhoneNumber);
        console.log('Comando Sofia:', JSON.stringify(sofiaCommand, null, 2));

        // Responder ao WhatsApp (opcional, mas recomendado)
        // (Esta parte requer mais código para enviar uma mensagem de volta)

      } catch (error) {
        console.error('Erro ao processar a mensagem:', error);
        
        // Log detalhado do erro
        console.error('Detalhes do erro:', {
          message: error.message,
          stack: error.stack,
          userMessage: messageText,
          userPhone: userPhoneNumber
        });
      }
    }

    return { statusCode: 200, body: 'EVENT_RECEIVED' };
  }

  return { statusCode: 405, body: 'Método não permitido' };
};