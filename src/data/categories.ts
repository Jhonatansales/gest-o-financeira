import { Coffee, ShoppingCart, Utensils, Truck, Smartphone, Newspaper, Globe, Home, Zap, Droplets, Wifi, Wrench, Hammer, DollarSign, PiggyBank, TrendingUp, Coins, Building, Car, Heart, Dumbbell, Stethoscope, Pill, Shield, CreditCard, CaseSensitive as University, Tv, Send, ArrowRightLeft, Users, Plane, MapPin, Bed, Camera, Gamepad2, Music, Palette, Book, GraduationCap, School, AlertTriangle, Banknote, FileText, Target, Gift, Shirt, TreePine, Scissors, Briefcase, Calculator, Plus, Calendar } from 'lucide-react';

export interface SubCategory {
  id: string;
  name: string;
  icon: any;
}

export interface Category {
  id: string;
  name: string;
  icon: any;
  type: 'income' | 'expense' | 'both';
  subcategories: SubCategory[];
}

export const defaultCategories: Category[] = [
  {
    id: 'alimentacao',
    name: 'Alimentação',
    icon: Utensils,
    type: 'expense',
    subcategories: [
      { id: 'cafeterias', name: 'Cafeterias', icon: Coffee },
      { id: 'restaurante-delivery', name: 'Restaurante ou Delivery', icon: Utensils },
      { id: 'supermercado', name: 'Supermercado', icon: ShoppingCart }
    ]
  },
  {
    id: 'assinaturas',
    name: 'Assinaturas',
    icon: Newspaper,
    type: 'expense',
    subcategories: [
      { id: 'aplicativos', name: 'Aplicativos', icon: Smartphone },
      { id: 'revistas-jornais', name: 'Revistas e Jornais', icon: Newspaper },
      { id: 'servicos-digitais', name: 'Serviços Digitais', icon: Globe }
    ]
  },
  {
    id: 'compras-lazer',
    name: 'Compras e Lazer',
    icon: ShoppingCart,
    type: 'expense',
    subcategories: [
      { id: 'arte-musica', name: 'Arte e Música', icon: Music },
      { id: 'coisas-casa', name: 'Coisas para Casa', icon: Home },
      { id: 'eletronicos', name: 'Eletrônicos', icon: Smartphone },
      { id: 'esportes-equipamentos', name: 'Esportes e Equipamentos', icon: Dumbbell },
      { id: 'eventos-atividades', name: 'Eventos e Atividades', icon: Calendar },
      { id: 'festa-encontros', name: 'Festa e Encontros', icon: Users },
      { id: 'fotografia', name: 'Fotografia', icon: Camera },
      { id: 'jogos-entretenimento', name: 'Jogos e Entretenimento', icon: Gamepad2 },
      { id: 'pets', name: 'Pets', icon: Heart },
      { id: 'suprimentos', name: 'Suprimentos', icon: ShoppingCart },
      { id: 'presentes', name: 'Presentes', icon: Gift },
      { id: 'roupas-acessorios', name: 'Roupas e Acessórios', icon: Shirt }
    ]
  },
  {
    id: 'educacao-desenvolvimento',
    name: 'Educação e Desenvolvimento',
    icon: GraduationCap,
    type: 'expense',
    subcategories: [
      { id: 'cursos-treinamentos', name: 'Cursos e Treinamentos', icon: Book },
      { id: 'livros-materiais', name: 'Livros e Materiais', icon: Book },
      { id: 'mensalidade-escolar', name: 'Mensalidade Escolar', icon: School }
    ]
  },
  {
    id: 'emergencia',
    name: 'Emergência',
    icon: AlertTriangle,
    type: 'expense',
    subcategories: [
      { id: 'despesas-emergenciais', name: 'Despesas Emergenciais', icon: AlertTriangle }
    ]
  },
  {
    id: 'emprestimos',
    name: 'Empréstimos',
    icon: CreditCard,
    type: 'expense',
    subcategories: [
      { id: 'cartao-credito', name: 'Cartão de Crédito', icon: CreditCard },
      { id: 'emprestimos-pessoais', name: 'Empréstimos Pessoais', icon: Banknote },
      { id: 'financiamento-veiculo', name: 'Financiamento de Veículo', icon: Car }
    ]
  },
  {
    id: 'entretenimento-digital',
    name: 'Entretenimento Digital',
    icon: Tv,
    type: 'expense',
    subcategories: [
      { id: 'aplicativos-ent', name: 'Aplicativos', icon: Smartphone },
      { id: 'jogos-ent', name: 'Jogos', icon: Gamepad2 }
    ]
  },
  {
    id: 'hobbies-atividades',
    name: 'Hobbies e Atividades de Lazer',
    icon: Palette,
    type: 'expense',
    subcategories: [
      { id: 'arte-musica-hobby', name: 'Arte e Música', icon: Music },
      { id: 'esportes-equipamentos-hobby', name: 'Esportes e Equipamentos', icon: Dumbbell },
      { id: 'fotografia-hobby', name: 'Fotografia', icon: Camera }
    ]
  },
  {
    id: 'impostos-taxas',
    name: 'Impostos e Taxas',
    icon: FileText,
    type: 'expense',
    subcategories: [
      { id: 'iptu', name: 'IPTU', icon: Building },
      { id: 'ipva', name: 'IPVA', icon: Car },
      { id: 'imposto-renda', name: 'Imposto de Renda', icon: Calculator }
    ]
  },
  {
    id: 'investimentos',
    name: 'Investimentos',
    icon: TrendingUp,
    type: 'both',
    subcategories: [
      { id: 'acoes', name: 'Ações', icon: TrendingUp },
      { id: 'fundos-imobiliarios', name: 'Fundos Imobiliários', icon: Building },
      { id: 'criptomoedas', name: 'Criptomoedas', icon: Coins },
      { id: 'dividendos', name: 'Dividendos', icon: DollarSign },
      { id: 'renda-fixa', name: 'Renda Fixa', icon: Target }
    ]
  },
  {
    id: 'manutencao-reparos',
    name: 'Manutenção e Reparos',
    icon: Wrench,
    type: 'expense',
    subcategories: [
      { id: 'reparos-eletrodomesticos', name: 'Reparos de Eletrodomésticos', icon: Zap },
      { id: 'reparos-domesticos', name: 'Reparos Domésticos', icon: Hammer }
    ]
  },
  {
    id: 'moradia',
    name: 'Moradia',
    icon: Home,
    type: 'expense',
    subcategories: [
      { id: 'agua', name: 'Água', icon: Droplets },
      { id: 'aluguel', name: 'Aluguel', icon: Home },
      { id: 'condominio', name: 'Condomínio', icon: Building },
      { id: 'financiamento-imovel', name: 'Financiamento de Imóvel', icon: Home },
      { id: 'gas', name: 'Gás', icon: Zap },
      { id: 'internet-telefone', name: 'Internet e Telefone', icon: Wifi },
      { id: 'luz', name: 'Luz', icon: Zap },
      { id: 'reformas-melhorias', name: 'Reformas e Melhorias', icon: Hammer }
    ]
  },
  {
    id: 'outros',
    name: 'Outros',
    icon: DollarSign,
    type: 'both',
    subcategories: [
      { id: 'outros-geral', name: 'Outros', icon: DollarSign }
    ]
  },
  {
    id: 'poupanca',
    name: 'Poupança',
    icon: PiggyBank,
    type: 'expense',
    subcategories: [
      { id: 'fundo-emergencia', name: 'Fundo de Emergência', icon: Shield },
      { id: 'reserva-curto-prazo', name: 'Reserva de Curto Prazo', icon: Target },
      { id: 'reserva-longo-prazo', name: 'Reserva de Longo Prazo', icon: TrendingUp }
    ]
  },
  {
    id: 'renda',
    name: 'Renda',
    icon: DollarSign,
    type: 'income',
    subcategories: [
      { id: 'renda-extra', name: 'Renda Extra', icon: Plus },
      { id: 'rendimentos-investimentos', name: 'Rendimentos de Investimentos', icon: TrendingUp },
      { id: 'salarios', name: 'Salários', icon: Briefcase },
      { id: 'trabalho-conta', name: 'Trabalho por Conta', icon: Users }
    ]
  },
  {
    id: 'saude-bem-estar',
    name: 'Saúde e Bem-estar',
    icon: Heart,
    type: 'expense',
    subcategories: [
      { id: 'academia', name: 'Academia', icon: Dumbbell },
      { id: 'bem-estar-spa', name: 'Bem-estar (Spa, Terapia)', icon: Heart },
      { id: 'consultas-tratamentos', name: 'Consultas e Tratamentos', icon: Stethoscope },
      { id: 'farmacia-medicamentos', name: 'Farmácia e Medicamentos', icon: Pill },
      { id: 'planos-saude', name: 'Planos de Saúde', icon: Shield }
    ]
  },
  {
    id: 'seguros',
    name: 'Seguros',
    icon: Shield,
    type: 'expense',
    subcategories: [
      { id: 'seguro-automovel', name: 'Seguro de Automóvel', icon: Car },
      { id: 'seguro-vida', name: 'Seguro de Vida', icon: Heart },
      { id: 'seguro-residencial', name: 'Seguro Residencial', icon: Home }
    ]
  },
  {
    id: 'servicos-financeiros',
    name: 'Serviços Financeiros e Bancários',
    icon: University,
    type: 'expense',
    subcategories: [
      { id: 'assinaturas-financeiras', name: 'Assinaturas Financeiras', icon: CreditCard },
      { id: 'taxas-contas-bancarias', name: 'Taxas de Contas Bancárias', icon: University }
    ]
  },
  {
    id: 'streaming',
    name: 'Streaming',
    icon: Tv,
    type: 'expense',
    subcategories: [
      { id: 'netflix', name: 'Netflix', icon: Tv },
      { id: 'amazon-prime', name: 'Amazon Prime', icon: Tv },
      { id: 'hbo', name: 'HBO', icon: Tv },
      { id: 'disney', name: 'Disney+', icon: Tv }
    ]
  },
  {
    id: 'transferencias-pagamentos',
    name: 'Transferências e Pagamentos',
    icon: Send,
    type: 'both',
    subcategories: [
      { id: 'boleto', name: 'Boleto', icon: FileText },
      { id: 'cartao-credito-pag', name: 'Cartão de Crédito', icon: CreditCard },
      { id: 'pagamentos-regulares', name: 'Pagamentos Regulares', icon: Calendar },
      { id: 'pix-ted-doc', name: 'PIX, TED ou DOC', icon: Send },
      { id: 'transferencias-contas', name: 'Transferências entre Contas', icon: ArrowRightLeft },
      { id: 'transferencias-pessoas', name: 'Transferências para Outras Pessoas', icon: Users }
    ]
  },
  {
    id: 'transporte',
    name: 'Transporte',
    icon: Car,
    type: 'expense',
    subcategories: [
      { id: 'aplicativo-mobilidade', name: 'Aplicativo de Mobilidade', icon: Smartphone },
      { id: 'estacionamento-pedagio', name: 'Estacionamento e Pedágio', icon: Car },
      { id: 'manutencao-carro', name: 'Manutenção de Carro', icon: Wrench },
      { id: 'transporte-publico', name: 'Transporte Público', icon: Truck }
    ]
  },
  {
    id: 'viagem',
    name: 'Viagem',
    icon: Plane,
    type: 'expense',
    subcategories: [
      { id: 'alimentacao-viagem', name: 'Alimentação em Viagem', icon: Utensils },
      { id: 'hospedagem', name: 'Hospedagem', icon: Bed },
      { id: 'passagens-transporte', name: 'Passagens e Transporte', icon: Plane },
      { id: 'passeios-lazer', name: 'Passeios e Lazer', icon: MapPin }
    ]
  }
];

export const availableIcons = [
  { name: 'DollarSign', icon: DollarSign },
  { name: 'Coffee', icon: Coffee },
  { name: 'ShoppingCart', icon: ShoppingCart },
  { name: 'Utensils', icon: Utensils },
  { name: 'Home', icon: Home },
  { name: 'Car', icon: Car },
  { name: 'Heart', icon: Heart },
  { name: 'Smartphone', icon: Smartphone },
  { name: 'Book', icon: Book },
  { name: 'Music', icon: Music },
  { name: 'Camera', icon: Camera },
  { name: 'Gamepad2', icon: Gamepad2 },
  { name: 'TrendingUp', icon: TrendingUp },
  { name: 'PiggyBank', icon: PiggyBank },
  { name: 'CreditCard', icon: CreditCard },
  { name: 'Shield', icon: Shield },
  { name: 'Plane', icon: Plane },
  { name: 'Dumbbell', icon: Dumbbell },
  { name: 'Stethoscope', icon: Stethoscope },
  { name: 'Tv', icon: Tv },
  { name: 'Briefcase', icon: Briefcase },
  { name: 'Gift', icon: Gift },
  { name: 'Palette', icon: Palette },
  { name: 'Wrench', icon: Wrench },
  { name: 'AlertTriangle', icon: AlertTriangle },
  { name: 'Send', icon: Send },
  { name: 'Users', icon: Users },
  { name: 'Building', icon: Building },
  { name: 'Zap', icon: Zap },
  { name: 'Droplets', icon: Droplets },
  { name: 'Wifi', icon: Wifi },
  { name: 'Plus', icon: Plus }
];