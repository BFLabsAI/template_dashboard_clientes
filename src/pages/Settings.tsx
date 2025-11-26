import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Save, Bell, Smartphone, Key, Server, FileText, Clock, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function Settings() {
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        id: '',
        instance_name: '',
        uazapi_instance: '',
        uazapi_api_key: '',
        notification_number: ''
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    async function fetchSettings() {
        try {
            const { data, error } = await supabase
                .from('instancias_dra_aline_chaves')
                .select('*')
                .limit(1);

            if (error) throw error;

            if (data && data.length > 0) {
                const record = data[0];
                setSettings({
                    id: record.id,
                    instance_name: record.instance_name || '',
                    uazapi_instance: record.instance_name || '',
                    uazapi_api_key: record.api_key || '',
                    notification_number: record.notification_number || ''
                });
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                instance_name: settings.instance_name,
                api_key: settings.uazapi_api_key,
                notification_number: settings.notification_number,
                updated_at: new Date().toISOString()
            };

            let error;
            if (settings.id) {
                const { error: updateError } = await supabase
                    .from('instancias_dra_aline_chaves')
                    .update(payload)
                    .eq('id', settings.id);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('instancias_dra_aline_chaves')
                    .insert([payload]);
                error = insertError;
            }

            if (error) throw error;
            alert('Configurações salvas com sucesso!');
            fetchSettings(); // Refresh to get ID if new
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Erro ao salvar configurações.');
        } finally {
            setSaving(false);
        }
    }

    async function sendTestReport(type: 'Diário' | 'Semanal') {
        if (!settings.uazapi_instance || !settings.uazapi_api_key || !settings.notification_number) {
            alert('Por favor, configure a instância, chave API e número de notificação primeiro.');
            return;
        }

        try {
            const now = new Date();
            let startDate: Date;
            let endDate: Date;
            let dateRangeStr: string;

            if (type === 'Diário') {
                // Yesterday 00:00 to 23:59
                startDate = new Date(now);
                startDate.setDate(startDate.getDate() - 1);
                startDate.setHours(0, 0, 0, 0);

                endDate = new Date(startDate);
                endDate.setHours(23, 59, 59, 999);

                dateRangeStr = startDate.toLocaleDateString('pt-BR');
            } else {
                // Last Week (Monday to Sunday)
                // If today is Monday (1), we go back 7 days for start, and 1 day for end
                const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday

                // For testing purposes, let's assume "Last Week" means the last completed week (Mon-Sun)
                // Or if running mid-week, maybe "Last 7 days"? 
                // User said: "toda segunda feira pegar os dados da ultima semana ou seja de segunda passada a domingo"
                // So if we are testing, we should probably simulate this "Last Week" window.

                const lastSunday = new Date(now);
                lastSunday.setDate(now.getDate() - (dayOfWeek === 0 ? 7 : dayOfWeek));
                lastSunday.setHours(23, 59, 59, 999);

                const lastMonday = new Date(lastSunday);
                lastMonday.setDate(lastSunday.getDate() - 6);
                lastMonday.setHours(0, 0, 0, 0);

                startDate = lastMonday;
                endDate = lastSunday;
                dateRangeStr = `${startDate.toLocaleDateString('pt-BR')} a ${endDate.toLocaleDateString('pt-BR')}`;
            }

            // Helper to format ISO string for Supabase comparison
            const startISO = startDate.toISOString();
            const endISO = endDate.toISOString();

            // 1. Total New Leads
            const { count: newLeadsCount, error: newLeadsError } = await supabase
                .from('leads_dra_aline_chaves')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', startISO)
                .lte('created_at', endISO);

            if (newLeadsError) throw newLeadsError;

            // 2. Total Contacted Leads (Active in period)
            // Using data_ultima_interação. Note: It's a text field in ISO format based on previous check.
            // We need to be careful with string comparison, but ISO strings compare correctly lexicographically.
            const { count: contactedCount, error: contactedError } = await supabase
                .from('leads_dra_aline_chaves')
                .select('*', { count: 'exact', head: true })
                .gte('data_ultima_interação', startISO)
                .lte('data_ultima_interação', endISO);

            if (contactedError) throw contactedError;

            // 3. Total Repasse
            const { count: repasseCount, error: repasseError } = await supabase
                .from('leads_dra_aline_chaves')
                .select('*', { count: 'exact', head: true })
                .eq('status_lead', 'repassado')
                .gte('data_ultima_interação', startISO)
                .lte('data_ultima_interação', endISO);

            if (repasseError) throw repasseError;

            // 4. Cadence Breakdown
            // We can't easily do a "GROUP BY" with counts in a single Supabase call without a stored procedure or RPC.
            // We will fetch the 'dia_cadencia' for all contacted leads and aggregate in JS. 
            // If the volume is huge, this is bad, but for a dashboard report it's likely manageable.
            const { data: cadenceData, error: cadenceError } = await supabase
                .from('leads_dra_aline_chaves')
                .select('dia_cadencia')
                .gte('data_ultima_interação', startISO)
                .lte('data_ultima_interação', endISO);

            if (cadenceError) throw cadenceError;

            const cadenceCounts: Record<string, number> = {};
            cadenceData?.forEach(lead => {
                const day = lead.dia_cadencia || 'Desconhecido';
                cadenceCounts[day] = (cadenceCounts[day] || 0) + 1;
            });

            // Format Cadence String
            let cadenceString = '';
            Object.entries(cadenceCounts)
                .sort((a, b) => a[0].localeCompare(b[0])) // Sort alphabetically or by day
                .forEach(([day, count]) => {
                    cadenceString += `- ${day}: ${count}\n`;
                });

            // Construct Message
            const message = `📊 *Relatório ${type}*\n` +
                `📅 Período: ${dateRangeStr}\n\n` +
                `🆕 *Novos Leads:* ${newLeadsCount}\n` +
                `💬 *Total Contactados:* ${contactedCount}\n` +
                `🔄 *Total Repasse:* ${repasseCount}\n\n` +
                `📉 *Por Dia da Cadência:*\n${cadenceString || 'Nenhum dado'}`;

            // Send API Request
            let baseUrl = settings.instance_name.trim();
            baseUrl = baseUrl.replace(/\/+$/, '');
            if (!baseUrl.startsWith('http')) {
                baseUrl = `https://${baseUrl}.uazapi.com`;
            }
            const url = `${baseUrl}/send/text`;

            console.log('Sending report to:', url);
            console.log('Report Content:', message);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'token': settings.uazapi_api_key
                },
                body: JSON.stringify({
                    number: settings.notification_number,
                    text: message
                })
            });

            const responseText = await response.text();
            console.log('API Response Status:', response.status);
            console.log('API Response Body:', responseText);

            if (!response.ok) {
                throw new Error(`API Error ${response.status}: ${responseText}`);
            }

            const data = JSON.parse(responseText);
            if (data.error) throw new Error(data.error);

            alert(`Relatório ${type} enviado com sucesso!`);
        } catch (error) {
            console.error('Error sending report:', error);
            alert(`Erro ao enviar relatório: ${(error as Error).message}`);
        }
    }

    return (
        <Layout>
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Configurações</h1>
                    <p className="mt-2 text-slate-400">Gerencie as preferências do sistema e notificações.</p>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    {/* Notifications Section */}
                    <div className="bg-navy-800 rounded-3xl border border-navy-700 shadow-xl overflow-hidden">
                        <div className="p-6 border-b border-navy-700 bg-navy-800/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-navy-700 rounded-lg text-neon-blue">
                                    <Bell size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Notificações Automáticas</h3>
                                    <p className="text-sm text-slate-400">Configure o número para recebimento dos relatórios.</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                                    <Smartphone size={16} className="text-neon-blue" />
                                    Número WhatsApp (com DDI)
                                </label>
                                <input
                                    type="text"
                                    value={settings.notification_number}
                                    onChange={(e) => setSettings({ ...settings, notification_number: e.target.value })}
                                    placeholder="Ex: 5511999999999"
                                    className="w-full px-4 py-3 bg-navy-900 border border-navy-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Uazapi Integration Section */}
                    <div className="bg-navy-800 rounded-3xl border border-navy-700 shadow-xl overflow-hidden">
                        <div className="p-6 border-b border-navy-700 bg-navy-800/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-navy-700 rounded-lg text-purple-400">
                                    <Server size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Integração Uazapi</h3>
                                    <p className="text-sm text-slate-400">Credenciais para envio de mensagens via WhatsApp.</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Instance Name */}
                                <div>
                                    <label className="block text-sm font-bold text-white mb-2">
                                        Nome da Instância
                                    </label>
                                    <div className="relative">
                                        <Server className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                        <input
                                            type="text"
                                            value={settings.instance_name || ''}
                                            onChange={(e) => setSettings({ ...settings, instance_name: e.target.value })}
                                            placeholder="ex: dra-aline-instance"
                                            className="w-full pl-12 pr-4 py-3 bg-navy-900 border border-navy-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-neon-blue transition-colors"
                                        />
                                    </div>
                                </div>

                                {/* Uazapi API Key */}
                                <div>
                                    <label className="block text-sm font-bold text-white mb-2">
                                        Chave API Uazapi
                                    </label>
                                    <div className="relative">
                                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                        <input
                                            type="password"
                                            value={settings.uazapi_api_key || ''}
                                            onChange={(e) => setSettings({ ...settings, uazapi_api_key: e.target.value })}
                                            placeholder="Sua chave API"
                                            className="w-full pl-12 pr-4 py-3 bg-navy-900 border border-navy-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-neon-blue transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 px-8 py-3 bg-neon-blue text-navy-900 rounded-xl font-bold hover:bg-white hover:shadow-neon transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save size={20} />
                            {saving ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Test Reports Section */}
            <div className="bg-navy-800 rounded-3xl p-8 border border-navy-700 shadow-xl mt-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-navy-700 rounded-xl">
                        <FileText className="text-neon-purple" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Teste de Relatórios</h2>
                        <p className="text-slate-400 text-sm">Dispare manualmente os relatórios para testar o envio via WhatsApp.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button
                        onClick={() => sendTestReport('Diário')}
                        className="flex items-center justify-center gap-3 p-4 bg-navy-700 hover:bg-navy-600 border border-navy-600 rounded-xl transition-all group"
                    >
                        <div className="p-2 bg-navy-800 rounded-lg group-hover:bg-navy-700 transition-colors">
                            <Clock className="text-neon-blue" size={20} />
                        </div>
                        <span className="font-medium text-slate-200 group-hover:text-white">Testar Relatório Diário</span>
                    </button>

                    <button
                        onClick={() => sendTestReport('Semanal')}
                        className="flex items-center justify-center gap-3 p-4 bg-navy-700 hover:bg-navy-600 border border-navy-600 rounded-xl transition-all group"
                    >
                        <div className="p-2 bg-navy-800 rounded-lg group-hover:bg-navy-700 transition-colors">
                            <Calendar className="text-neon-purple" size={20} />
                        </div>
                        <span className="font-medium text-slate-200 group-hover:text-white">Testar Relatório Semanal</span>
                    </button>
                </div>
            </div>
        </Layout>
    );
}
