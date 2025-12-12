# Client Dashboard Template

Um dashboard moderno e interativo para gestão de leads e atendimentos, desenvolvido com React, TypeScript e Vite. Este template serve como base para implementação de dashboards personalizados para clientes.

## 🚀 Características

- **Dashboard Analytics**: Visualização de métricas e KPIs em tempo real
- **Gestão de Leads**: Acompanhamento completo do status e origem dos leads
- **Chat Interface**: Sistema de atendimento com IA integrada
- **Análise de Criativos**: Performance tracking de campanhas publicitárias
- **Relatórios Visuais**: Gráficos interativos com Recharts
- **Design Responsivo**: Interface adaptável para desktop e mobile

## 🛠️ Tecnologias

- **React 19** - Framework frontend
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework CSS utilitário
- **Recharts** - Biblioteca de gráficos
- **Lucide React** - Ícones modernos
- **Supabase** - Backend e database
- **React Router** - Roteamento SPA

## 📊 Funcionalidades

### Dashboard Principal
- KPIs em tempo real (Total de Leads, Leads Repassados, Taxa de Engajamento, Média de Leads/Dia)
- Gráficos de Status dos Leads
- Análise de Procedimentos/Produtos
- Preferências de Horário/Turno
- Volume por Dia da Cadência

### Análise de Leads
- **Origem dos Leads**: Diferenciação entre tráfego pago e orgânico
- **Top Criativos**: Performance de campanhas com cores neon diferenciadas
- **Status Tracking**: Acompanhamento de "novo lead" vs "repassado"

### Interface de Chat
- Sistema de mensagens em tempo real
- Resumo automático com IA
- Análise de sentimento e qualidade do atendimento
- Histórico de conversas

## 🎨 Design System

- **Tema**: Navy/Dark theme com cores neon
- **Cores Principais**:
  - Cyan: Tráfego Pago
  - Green: Tráfego Orgânico
  - Pink: Criativos/Ads
- **Tipografia**: Outfit (Google Fonts)
- **Componentes**: Design system consistente

## 🚦 Como Executar

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

## 📱 Funcionalidades Mobile

- Sidebar responsiva
- Navegação otimizada
- Gráficos adaptáveis
- Interface touch-friendly

## 🔧 Configuração

O projeto utiliza variáveis de ambiente através do arquivo `.env`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

## 📈 Estrutura do Projeto

```
src/
├── components/         # Componentes reutilizáveis
│   ├── charts/        # Gráficos especializados
│   ├── KPICard.tsx    # Cards de métricas
│   └── Layout.tsx     # Layout principal
├── pages/             # Páginas da aplicação
│   ├── Dashboard.tsx  # Dashboard principal
│   ├── Chat.tsx       # Interface de chat
│   └── Settings.tsx   # Configurações
├── lib/               # Utilitários
│   └── supabase.ts    # Cliente Supabase
├── types.ts           # Definições TypeScript
└── assets/            # Assets estáticos
```

## 🤖 IA Integration

- **Resumo Automático**: Geração de resumos de conversas usando IA
- **Análise de Atendimento**: Avaliação automática da qualidade
- **Classificação de Leads**: Identificação automática de tipos de leads

## 📄 Licença

Este projeto é um template proprietário da BFLabs.
