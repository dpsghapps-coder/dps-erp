import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface DonutChartProps {
  data: { name: string; value: number; color: string }[];
  title?: string;
  centerText?: string;
  size?: number;
}

export function DonutChart({ data, title, centerText, size = 200 }: DonutChartProps) {
  return (
    <div className="w-full">
      {title && <h3 className="text-sm font-medium text-slate-400 mb-4">{title}</h3>}
      <div className="flex items-center justify-center">
        <ResponsiveContainer width={size} height={size}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={size * 0.35}
              outerRadius={size * 0.45}
              paddingAngle={4}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255,255,255,0.95)',
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            {centerText && (
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-slate-700 text-lg font-semibold"
                style={{ fill: '#334155', fontSize: '18px', fontWeight: 600 }}
              >
                {centerText}
              </text>
            )}
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => (
                <span className="text-xs text-slate-600">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}