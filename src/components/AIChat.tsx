import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Sparkles, Bot, User, Loader, AlertTriangle } from 'lucide-react';
import { openai } from '../lib/openai';
import { Transaction, Account, Card, Goal, Limit } from '../types/financial';
import { Category, defaultCategories } from '../data/categories';

interface AIChatProps {
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  onAddCustomSubcategory: (categoryId: string, subcategory: Omit<import('../data/categories').SubCategory, 'id'>) => void;
  onAddAccount: (account: Omit<Account, 'id'>) => void;
  onAddCard: (card: Omit<Card, 'id'>) => void;
  onAddGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void;
  onAddLimit: (limit: Omit<Limit, 'id' | 'createdAt' | 'resetDate'>) => void;
  onResetAllData: () => void;
  customCategories: Category[];
  accounts: Account[];
  cards: Card[];
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isProcessing?: boolean;
}

export const AIChat: React.FC<AIChatProps> = ({
  onAddTransaction,
  onAddCustomSubcategory,
  onAddAccount,
  onAddCard,
  onAddGoal,
  onAddLimit,
  onResetAllData,
  customCategories,
  accounts,
  cards
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '👋 Olá! Sou a Sofia, sua assistente financeira inteligente. Posso ajudá-lo a:\n\n• Registar transações (ex: "gastei 50€ no supermercado")\n• Criar contas bancárias (ex: "criar conta Nubank corrente saldo 1000")\n• Adicionar cartões (ex: "adicionar cartão Nubank limite 2000 vence dia 5 fecha dia 1")\n• Definir metas financeiras\n• Configurar limites de gastos\n\nComo posso ajudá-lo hoje?',
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const processAICommand = async (command: any) => {
    try {
      switch (command.action) {
        case 'CREATE_TRANSACTION':
          const transactionData = {
            title: command.data.title,
            description: command.data.description || '',
            amount: command.data.amount,
            type: command.data.type as 'income' | 'expense' | 'transfer',
            category: command.data.category,
            subcategory: command.data.subcategory,
            paymentMethod: command.data.payment_method as 'account' | 'card' | 'cash' | 'pix',
            paymentSource: command.data.payment_source,
            status: command.data.status as 'paid' | 'received' | 'pending',
            date: command.data.date || new Date().toISOString().split('T')[0]
          };
          onAddTransaction(transactionData);
          return `✅ **Transação registada com sucesso!**\n\n${command.data.type === 'income' ? 'Receita' : 'Despesa'} de ${command.data.amount.toFixed(2)}€ - ${command.data.title}\nCategoria: ${command.category} ${command.subcategory ? `> ${command.subcategory}` : ''}`;

        case 'CREATE_ACCOUNT':
          const accountData = {
            name: command.data.name,
            balance: command.data.initial_balance || 0,
            type: command.data.account_type as 'checking' | 'savings' | 'investment',
            bank: command.data.bank_name
          };
          onAddAccount(accountData);
          return `✅ **Conta criada com sucesso!**\n\n${accountData.name}\nSaldo inicial: ${accountData.balance.toFixed(2)}€\nTipo: ${accountData.type === 'checking' ? 'Conta Corrente' : accountData.type === 'savings' ? 'Conta Poupança' : 'Conta Investimento'}`;

        case 'CREATE_CARD':
          const cardData = {
            name: command.data.name,
            limit: command.data.credit_limit || command.data.limit || 0,
            used: command.data.used_amount || 0,
            type: command.data.card_type as 'credit' | 'debit',
            bank: command.data.bank_name,
            dueDate: command.data.due_day?.toString(),
            closingDate: command.data.closing_day?.toString()
          };
          onAddCard(cardData);
          return `✅ **Cartão adicionado com sucesso!**\n\n${cardData.name}\nLimite: ${cardData.limit.toFixed(2)}€\nTipo: ${cardData.type === 'credit' ? 'Cartão de Crédito' : 'Cartão de Débito'}${cardData.dueDate ? `\nVencimento: dia ${cardData.dueDate}` : ''}${cardData.closingDate ? `\nFechamento: dia ${cardData.closingDate}` : ''}`;

        case 'CREATE_GOAL':
          const goalData = {
            title: command.data.title,
            description: command.data.description,
            targetAmount: command.data.target_amount,
            currentAmount: command.data.current_amount || 0,
            monthlyContribution: command.data.monthly_contribution || 0,
            targetDate: command.data.target_date,
            category: command.data.category,
            priority: command.data.priority as 'low' | 'medium' | 'high',
            status: 'active' as const
          };
          onAddGoal(goalData);
          return `✅ **Meta criada com sucesso!**\n\n${goalData.title}\nObjetivo: ${goalData.targetAmount.toFixed(2)}€\nContribuição mensal: ${goalData.monthlyContribution.toFixed(2)}€`;

        case 'CREATE_LIMIT':
          const limitData = {
            title: command.data.title,
            category: command.data.category,
            subcategory: command.data.subcategory,
            limitAmount: command.data.limit_amount,
            currentAmount: 0,
            period: command.data.period as 'monthly' | 'biweekly' | 'bimonthly' | 'quarterly' | 'semiannual' | 'annual',
            alertThreshold: command.data.alert_threshold || 80,
            isActive: true,
            startDate: command.data.start_date || new Date().toISOString().split('T')[0],
            startType: command.data.start_type as 'today' | 'first_day' | 'last_day'
          };
          onAddLimit(limitData);
          return `✅ **Limite criado com sucesso!**\n\n${limitData.title}\nValor: ${limitData.limitAmount.toFixed(2)}€\nPeríodo: ${limitData.period}`;

        case 'RESET_DATA':
          onResetAllData();
          return `✅ **Dados resetados com sucesso!**\n\nTodos os seus dados financeiros foram limpos.`;

        case 'ERROR':
          return `❌ **Erro:** ${command.message}`;

        default:
          return command.message || 'Comando processado.';
      }
    } catch (error) {
      console.error('Erro ao processar comando da IA:', error);
      return `❌ **Erro:** Não foi possível processar o comando. Tente novamente.`;
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Adicionar mensagem de processamento
    const processingMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: 'Processando seu pedido...',
      sender: 'ai',
      timestamp: new Date(),
      isProcessing: true
    };

    setMessages(prev => [...prev, processingMessage]);

    try {
      if (!import.meta.env.VITE_OPENAI_API_KEY) {
        throw new Error('Chave da API OpenAI não configurada');
      }

      const systemPrompt = `
Você é a Sofia, uma assistente financeira inteligente que processa comandos em português e retorna SEMPRE em formato JSON válido.

REGRAS CRÍTICAS:
1. SEMPRE responda em JSON válido
2. Identifique automaticamente categorias baseadas no contexto
3. Para contas: use "CREATE_ACCOUNT" 
4. Para cartões: use "CREATE_CARD"
5. Para transações: use "CREATE_TRANSACTION"

CATEGORIAS DISPONÍVEIS: ${defaultCategories.map(cat => `${cat.id}: ${cat.name}`).join(', ')}

EXEMPLOS DE COMANDOS:

Para "criar conta nubank corrente saldo 1000":
{
  "action": "CREATE_ACCOUNT",
  "data": {
    "name": "Nubank - Conta Corrente",
    "bank_name": "nubank",
    "account_type": "checking",
    "initial_balance": 1000.00
  },
  "message": "✅ Conta Nubank criada com saldo de 1000€!",
  "confidence": 0.95
}

Para "adicionar cartão nubank limite 2000 vence dia 5 fecha dia 1":
{
  "action": "CREATE_CARD",
  "data": {
    "name": "Nubank - Cartão de Crédito",
    "bank_name": "nubank",
    "card_type": "credit",
    "limit": 2000.00,
    "used_amount": 0,
    "due_day": 5,
    "closing_day": 1
  },
  "message": "✅ Cartão Nubank adicionado com limite de 2000€!",
  "confidence": 0.95
}

Para "gastei 50 no supermercado":
{
  "action": "CREATE_TRANSACTION",
  "data": {
    "type": "expense",
    "amount": 50.00,
    "title": "Supermercado",
    "description": "Compra no supermercado",
    "category": "alimentacao",
    "subcategory": "supermercado",
    "payment_method": "cash",
    "status": "paid",
    "date": "${new Date().toISOString().split('T')[0]}"
  },
  "message": "✅ Despesa de 50€ no supermercado registada!",
  "category": "alimentacao",
  "subcategory": "supermercado",
  "confidence": 0.95
}

IMPORTANTE: Sempre retorne JSON válido e identifique corretamente se é conta, cartão ou transação.
`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: inputText }
        ],
        temperature: 0.3,
        max_tokens: 500
      });

      const aiResponse = response.choices[0]?.message?.content;
      
      if (!aiResponse) {
        throw new Error('Resposta vazia da IA');
      }

      // Tentar parsear como JSON
      let command;
      try {
        command = JSON.parse(aiResponse);
      } catch (parseError) {
        // Se não for JSON válido, tratar como texto simples
        command = {
          action: 'ERROR',
          message: aiResponse
        };
      }

      // Processar o comando
      const resultMessage = await processAICommand(command);

      // Remover mensagem de processamento e adicionar resposta final
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isProcessing);
        return [...filtered, {
          id: Date.now().toString(),
          text: resultMessage,
          sender: 'ai',
          timestamp: new Date()
        }];
      });

    } catch (error: any) {
      console.error('Erro na IA:', error);
      
      // Remover mensagem de processamento e adicionar erro
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isProcessing);
        return [...filtered, {
          id: Date.now().toString(),
          text: `❌ **Erro:** ${error.message || 'Não foi possível processar sua solicitação. Verifique se a chave da API OpenAI está configurada corretamente.'}`,
          sender: 'ai',
          timestamp: new Date()
        }];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-52 right-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 z-40 animate-pulse"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end lg:items-center justify-center lg:justify-end z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md h-[600px] flex flex-col animate-slideIn">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white bg-opacity-20 p-2 rounded-full">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Sofia IA</h3>
                  <p className="text-white text-opacity-80 text-sm">Assistente Financeira</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-all duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start gap-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`p-2 rounded-full ${
                      message.sender === 'user' 
                        ? 'bg-blue-600' 
                        : message.isProcessing 
                        ? 'bg-yellow-500' 
                        : 'bg-purple-600'
                    }`}>
                      {message.sender === 'user' ? (
                        <User className="h-4 w-4 text-white" />
                      ) : message.isProcessing ? (
                        <Loader className="h-4 w-4 text-white animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div className={`p-3 rounded-2xl ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : message.isProcessing
                        ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString('pt-PT', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !inputText.trim()}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-2 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};