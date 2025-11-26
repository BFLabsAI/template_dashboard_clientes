import type { LucideIcon } from 'lucide-react';
import clsx from 'clsx';

interface KPICardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    trendUp?: boolean;
    color?: 'blue' | 'green' | 'orange' | 'red' | 'indigo' | 'violet';
}

export function KPICard({ title, value, icon: Icon, trend, trendUp, color = 'indigo' }: KPICardProps) {
    const iconColorStyles = {
        blue: "text-blue-600 bg-blue-100 border border-blue-200",
        green: "text-emerald-600 bg-emerald-100 border border-emerald-200",
        orange: "text-orange-600 bg-orange-100 border border-orange-200",
        red: "text-rose-600 bg-rose-100 border border-rose-200",
        indigo: "text-indigo-600 bg-indigo-100 border border-indigo-200",
        violet: "text-violet-600 bg-violet-100 border border-violet-200",
    };

    return (
        <div className="group relative bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500 tracking-wide uppercase">{title}</p>
                    <p className="mt-3 text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
                </div>
                <div className={clsx(
                    "p-3 rounded-xl transition-colors duration-300",
                    iconColorStyles[color]
                )}>
                    <Icon size={24} />
                </div>
            </div>



            {trend && (
                <div className="mt-4 flex items-center text-sm">
                    <span className={clsx(
                        "font-semibold px-2 py-0.5 rounded-full text-xs",
                        trendUp ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                    )}>
                        {trend}
                    </span>
                    <span className="ml-2 text-slate-400">vs mês anterior</span>
                </div>
            )}
        </div>
    );
}
