# Dashboard Escritório Dantas e Filizola ⚖️

Dashboard exclusivo desenvolvido para o **Escritório Dantas e Filizola**, focado na gestão eficiente de leads jurídicos e análise de atendimentos.

## 🚀 Visão Geral

Este sistema foi customizado para atender às necessidades específicas do escritório, permitindo o acompanhamento de:
- **Leads por Tipo de Caso**: Monitoramento de BPC LOAS, Auxílio Maternidade, Previdenciário, etc.
- **Eficiência do Atendimento**: Métricas de leads repassados e tempo de resposta.
- **Performance de Marketing**: Análise de campanhas (Ads vs Orgânico) e criativos.

## 🛠️ Tecnologias Principais

- **Frontend**: React 19, TypeScript, Vite
- **Estilização**: Tailwind CSS (Navy Theme customizado)
- **Gráficos**: Recharts
- **Ícones**: Lucide React
- **Backend / Dados**: Supabase (Tabelas `leads_filizola`)

## 📊 Funcionalidades Chave

### 1. Dashboard de Gestão
- **KPIs Estratégicos**: Total de leads, leads repassados, taxa de engajamento e média diária.
- **Filtros Avançados**: Seleção por período, permitindo análises históricas precisas.
- **Gráficos de Turno e Cadência**: Entenda os melhores horários e dias de contato.

### 2. Tabela de Leads Recentes
- **Paginação**: Navegação fluida entre centenas de leads.
- **Detalhes do Caso**: Visualização rápida do "Produto de Interesse" e "Tipo de Caso".
- **Status Coloridos**: Identificação visual rápida (Novo, Repassado, etc.).
- **Atendimento Humano**: Filtro e visualização dedicada para leads em tratamento manual.

### 3. Integrações
- **Botão de Chat**: Integração direta para iniciar atendimentos via WhatsApp.
- **Exportação CSV**: Download completo da base de leads para relatórios externos.

## 🚦 Como Rodar Localmente

```bash
# Clone o repositório
git clone https://github.com/BFLabsAI/dashboard_filizola.git

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

## 🔒 Variáveis de Ambiente

O projeto requer configuração das chaves do Supabase no arquivo `.env`:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## 📱 Suporte

Desenvolvido e mantido por **BFLabs AI**.
Em caso de dúvidas ou problemas, entre em contato com o suporte técnico.

---
© 2025 Escritório Dantas e Filizola. Todos os direitos reservados.
