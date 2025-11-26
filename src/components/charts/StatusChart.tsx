import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface DataPoint {
    name: string;
    value: number;
}

interface StatusChartProps {
    data: DataPoint[];
}

const COLORS = ['#6366f1', '#10b981', '#94a3b8']; // Indigo, Emerald, Slate

export function StatusChart({ data }: StatusChartProps) {
    const renderCustomLabel = (entry: any) => {
        if (entry.value === 0) return '';
        return entry.value;
    };

    return (
        <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 25, right: 5, left: 5, bottom: 60 }}>
                    <Pie
                        data={data as any}
                        cx="50%"
                        cy="48%"
                        innerRadius={50}
                        outerRadius={65}
                        paddingAngle={5}
                        dataKey="value"
                        labelLine={false}
                        label={renderCustomLabel}
                    >
                        {data.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                        itemStyle={{ color: '#f8fafc' }}
                    />
                    <Legend
                        wrapperStyle={{
                            paddingTop: '8px',
                            fontSize: '12px',
                            lineHeight: '1.2'
                        }}
                        verticalAlign="bottom"
                        height={50}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
