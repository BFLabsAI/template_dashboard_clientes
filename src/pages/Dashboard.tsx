
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Layout } from '../components/Layout';
import { KPICard } from '../components/KPICard';
import { StatusChart } from '../components/charts/StatusChart';
import { ProcedureChart } from '../components/charts/ProcedureChart';
import { ShiftPreferenceChart } from '../components/charts/ShiftPreferenceChart';
import { CadenceVolumeChart } from '../components/charts/CadenceVolumeChart';
import { Users, UserCheck, MessageCircle, AlertTriangle, Calendar, Download, DollarSign, Target, Leaf, BarChart2, Image } from 'lucide-react';
import type { Lead } from '../types';
import { format, subDays, isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';

export function Dashboard() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
        end: format(new Date(), 'yyyy-MM-dd')
    });

    useEffect(() => {
        fetchLeads();
    }, []);

    async function fetchLeads() {
        try {
            const { data, error } = await supabase
                .from('leads_dra_aline_chaves')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setLeads(data || []);
        } catch (error) {
            console.error('Error fetching leads:', error);
        } finally {
            setLoading(false);
        }
    }

    // Filter leads by date
    const filteredLeads = leads.filter(lead => {
        if (!lead.created_at) return false;
        const leadDate = parseISO(lead.created_at);
        const start = startOfDay(parseISO(dateRange.start));
        const end = endOfDay(parseISO(dateRange.end));
        return isWithinInterval(leadDate, { start, end });
    });

    // Calculate KPIs based on filtered leads
    const totalLeads = filteredLeads.length;
    const repassedLeads = filteredLeads.filter(l => l.status_lead === 'repassado').length;
    const newLeads = filteredLeads.filter(l => l.status_lead === 'novo').length;
    const engagementRate = totalLeads > 0 ? Math.round((repassedLeads / totalLeads) * 100) : 0;

    // Calculate average leads per day based on actual data in table
    const allLeadsWithDates = leads.filter(lead => lead.created_at);
    const uniqueDays = new Set(allLeadsWithDates.map(lead => {
        const date = new Date(lead.created_at);
        return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    })).size;
    const avgLeadsPerDay = uniqueDays > 0 ? Math.round(allLeadsWithDates.length / uniqueDays) : 0;

    // Prepare Chart Data
    const statusData = Object.entries(filteredLeads.reduce((acc, lead) => {
        const status = lead.status_lead || 'Indefinido';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>)).map(([name, value]) => ({ name, value }));

    const procedureData = Object.entries(filteredLeads.reduce((acc, lead) => {
        const proc = lead.tipo_procedimento || 'Não Informado';
        acc[proc] = (acc[proc] || 0) + 1;
        return acc;
    }, {} as Record<string, number>)).map(([name, value]) => ({ name, value }));

    const shiftData = Object.entries(filteredLeads.reduce((acc, lead) => {
        const shift = lead.turno_preferencia || 'Não Informado';
        acc[shift] = (acc[shift] || 0) + 1;
        return acc;
    }, {} as Record<string, number>)).map(([name, value]) => ({ name, value }));

    const cadenceData = Object.entries(filteredLeads.reduce((acc, lead) => {
        const day = lead.dia_cadencia || 'N/A';
        acc[day] = (acc[day] || 0) + 1;
        return acc;
    }, {} as Record<string, number>)).map(([name, value]) => ({ name, value }));

    // Metadata Analytics
    const creativeStats = filteredLeads.reduce((acc, lead) => {
        const meta = lead.metadata as any;
        if (meta?.mediaUrl) {
            const url = meta.mediaUrl;
            if (!acc[url]) acc[url] = { count: 0, repassed: 0, url };
            acc[url].count++;
            if (lead.status_lead === 'repassado') acc[url].repassed++;
        } else {
            // Handle organic leads (no mediaUrl)
            const key = 'organic';
            if (!acc[key]) acc[key] = { count: 0, repassed: 0, url: '' };
            acc[key].count++;
            if (lead.status_lead === 'repassado') acc[key].repassed++;
        }
        return acc;
    }, {} as Record<string, { count: number, repassed: number, url: string }>);

    const sourceStats = filteredLeads.reduce((acc, lead) => {
        const meta = lead.metadata as any;
        const type = meta?.sourceType === 'ad' ? 'Pago (Ads)' : 'Orgânico';
        const app = meta?.sourceApp || 'Desconhecido';
        const key = `${type} - ${app}`;

        if (!acc[key]) acc[key] = 0;
        acc[key]++;
        return acc;
    }, {} as Record<string, number>);

    // Convert to arrays for rendering
    const topCreatives = Object.values(creativeStats)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map(c => ({
            name: c.url.split('/').pop() || 'Criativo',
            mediaUrl: c.url,
            count: c.count
        }));

    const leadsBySource = Object.entries(sourceStats).map(([name, value]) => ({ name, value }));

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-blue"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-8">
                {/* Header & Date Selector */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-navy-800 p-6 rounded-3xl border border-navy-700 shadow-xl">
                    <div>
                        <h2 className="text-xl font-bold text-white">Visão Geral</h2>
                        <p className="text-slate-400 text-sm">Acompanhe o desempenho em tempo real</p>
                    </div>
                    <div className="flex items-center gap-3 bg-navy-900 p-2 rounded-xl border border-navy-700">
                        <Calendar size={18} className="text-neon-blue ml-2" />
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                            className="bg-transparent text-white text-sm focus:outline-none [&::-webkit-calendar-picker-indicator]:invert"
                        />
                        <span className="text-slate-500">-</span>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                            className="bg-transparent text-white text-sm focus:outline-none [&::-webkit-calendar-picker-indicator]:invert"
                        />
                    </div>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <KPICard title="Total de Leads" value={totalLeads} icon={Users} color="indigo" trend="+12%" trendUp={true} />
                    <KPICard title="Leads Repassados" value={repassedLeads} icon={UserCheck} color="green" trend="+5%" trendUp={true} />
                    <KPICard title="Taxa de Engajamento" value={`${engagementRate}% `} icon={MessageCircle} color="violet" trend="-2%" trendUp={false} />
                    <KPICard title="Média de Leads/Dia" value={avgLeadsPerDay} icon={BarChart2} color="orange" />
                </div>

                {/* Metadata Analytics Row - Equal Size Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Creatives */}
                    <div className="bg-navy-800 p-6 rounded-3xl border border-navy-700 shadow-xl">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <MessageCircle className="text-pink-400" size={20} />
                            Top Criativos (Ads)
                        </h3>
                        <div className="space-y-4">
                            {topCreatives.map((creative, index) => {
                                const isOrganic = !creative.mediaUrl;
                                const bgColor = isOrganic ? 'bg-emerald-500' : 'bg-pink-500';
                                const borderColor = isOrganic ? 'hover:border-emerald-400/30' : 'hover:border-pink-400/30';
                                const progressColor = isOrganic ? 'bg-emerald-500' : 'bg-pink-500';

                                return (
                                    <div key={index} className={`flex items-center gap-4 p-3 rounded-xl bg-navy-900/50 border border-navy-700 ${borderColor} transition-all group`}>
                                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-navy-800 relative flex-shrink-0">
                                            {creative.mediaUrl ? (
                                                creative.mediaUrl.match(/\.(mp4|webm|mov)$/i) ? (
                                                    <video
                                                        src={creative.mediaUrl}
                                                        className="w-full h-full object-cover"
                                                        muted
                                                        loop
                                                        playsInline
                                                        onMouseOver={e => e.currentTarget.play().catch(() => { })}
                                                        onMouseOut={e => e.currentTarget.pause()}
                                                    />
                                                ) : (
                                                    <img
                                                        src={creative.mediaUrl}
                                                        alt="Creative"
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                            const parent = e.currentTarget.parentElement;
                                                            if (parent) {
                                                                parent.classList.add('flex', 'items-center', 'justify-center', 'bg-navy-700');
                                                                parent.innerHTML = `
                                                                    <div class="flex flex-col items-center justify-center">
                                                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-pink-400">
                                                                            <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                                                                            <circle cx="9" cy="9" r="2"/>
                                                                            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                                                                        </svg>
                                                                        <span class="text-[10px] font-bold mt-1 text-pink-400">Criativo Ads</span>
                                                                    </div>
                                                                `;
                                                            }
                                                        }}
                                                    />
                                                )
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-navy-700">
                                                    <span className="text-xs font-bold text-emerald-400">Orgânico</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white truncate" title={creative.name}>
                                                {isOrganic ? 'Sem Criativo' : (creative.name || 'Anúncio sem nome')}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-slate-400">
                                                    {creative.count} leads
                                                </span>
                                                <div className="h-1 flex-1 bg-navy-700 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${progressColor}`}
                                                        style={{ width: `${(creative.count / (topCreatives[0]?.count || 1)) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {topCreatives.length === 0 && (
                                <div className="col-span-full text-center py-10 text-slate-500">
                                    Nenhum dado de criativo encontrado para o período.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Leads by Source - Visual List */}
                    <div className="bg-navy-800 p-6 rounded-3xl border border-navy-700 shadow-xl">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <Users className="text-cyan-400" size={20} />
                            Origem dos Leads
                        </h3>
                        <div className="space-y-4">
                            {leadsBySource
                                .sort((a, b) => b.value - a.value)
                                .slice(0, 5)
                                .map((source, index) => {
                                    const isPaid = source.name.toLowerCase().includes('pago');
                                    const IconComponent = isPaid ? Target : Leaf;
                                    const bgColor = isPaid ? 'bg-cyan-500' : 'bg-emerald-500';

                                    return (
                                        <div key={index} className="flex items-center gap-4 p-3 rounded-xl bg-navy-900/50 border border-navy-700 hover:border-cyan-400/30 transition-all group">
                                            <div className={`w-12 h-12 rounded-lg ${bgColor} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                                                <IconComponent size={20} className="text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-white truncate" title={source.name}>
                                                    {source.name}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs text-slate-400">
                                                        {source.value} leads
                                                    </span>
                                                    <div className="h-1 flex-1 bg-navy-700 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full ${bgColor}`}
                                                            style={{ width: `${(source.value / (leadsBySource[0]?.value || 1)) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            {leadsBySource.length === 0 && (
                                <div className="col-span-full text-center py-10 text-slate-500">
                                    Nenhum dado de origem encontrado.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-navy-800 p-6 rounded-3xl border border-navy-700 shadow-xl">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <UserCheck className="text-neon-blue" size={20} />
                            Status dos Leads
                        </h3>
                        <div className="h-64">
                            <StatusChart data={statusData} />
                        </div>
                    </div>
                    <div className="bg-navy-800 p-6 rounded-3xl border border-navy-700 shadow-xl">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <AlertTriangle className="text-neon-purple" size={20} />
                            Procedimentos
                        </h3>
                        <div className="h-64">
                            <ProcedureChart data={procedureData} />
                        </div>
                    </div>
                    <div className="bg-navy-800 p-6 rounded-3xl border border-navy-700 shadow-xl">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <Calendar className="text-neon-pink" size={20} />
                            Preferência de Turno
                        </h3>
                        <div className="h-64">
                            <ShiftPreferenceChart data={shiftData} />
                        </div>
                    </div>
                </div>
                <div className="bg-navy-800 p-6 rounded-3xl border border-navy-700 shadow-xl">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                        <span className="w-1 h-6 bg-emerald-500 rounded-full mr-3"></span>
                        Volume por Dia da Cadência
                    </h3>
                    <CadenceVolumeChart data={cadenceData} />
                </div>

                {/* Recent Leads Table */}
                <div className="bg-navy-800 rounded-3xl border border-navy-700 shadow-xl overflow-hidden">
                    <div className="px-8 py-6 border-b border-navy-700 flex justify-between items-center bg-navy-800/50">
                        <h3 className="text-lg font-bold text-white">Leads Recentes</h3>
                        <button className="text-sm font-medium text-neon-blue hover:text-white transition-colors flex items-center gap-2">
                            <Download size={16} /> Exportar CSV
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-navy-700">
                            <thead className="bg-navy-900">
                                <tr>
                                    <th className="px-8 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Nome</th>
                                    <th className="px-8 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Procedimento</th>
                                    <th className="px-8 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="px-8 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Última Interação</th>
                                    <th className="px-8 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="bg-navy-800 divide-y divide-navy-700">
                                {filteredLeads.slice(0, 10).map((lead) => (
                                    <tr key={lead.id} className="hover:bg-navy-700/50 transition-colors duration-150">
                                        <td className="px-8 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-xl bg-navy-700 flex items-center justify-center text-neon-blue font-bold text-sm mr-4 border border-navy-600">
                                                    {lead.lead_name ? lead.lead_name.charAt(0).toUpperCase() : 'L'}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-white">{lead.lead_name || 'Sem Nome'}</div>
                                                    <div className="text-sm text-slate-500">{lead.telefone}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4 whitespace-nowrap text-sm text-slate-400 font-medium">
                                            {lead.tipo_procedimento || '-'}
                                        </td>
                                        <td className="px-8 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-md border ${lead.status_lead === 'repassado'
                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                : lead.status_lead === 'novo'
                                                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                    : 'bg-slate-700/50 text-slate-400 border-slate-600'
                                                }`}>
                                                {lead.status_lead}
                                            </span>
                                        </td>
                                        <td className="px-8 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {lead.data_ultima_interação ? format(new Date(lead.data_ultima_interação), 'dd/MM/yyyy HH:mm') : '-'}
                                        </td>
                                        <td className="px-8 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <a href={`/chat?lead=${lead.id}`} className="text-neon-blue hover:text-white font-semibold transition-colors">Abrir Chat</a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
