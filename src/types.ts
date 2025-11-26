export interface Lead {
    id: string;
    lead_name: string | null;
    telefone: string | null;
    status_lead: string | null;
    tipo_procedimento: string | null;
    urgencia_caso: string | null;
    turno_preferencia: string | null;
    observacoes_clinicas: string | null;
    data_ultima_interação: string | null;
    created_at: string;
    dia_cadencia?: string | null;
    metadata?: any;
}

export interface ChatMessage {
    type: 'human' | 'ai';
    content: string;
}

export interface ChatHistory {
    id: number;
    session_id: string;
    message: ChatMessage;
    created_at: string;
}
