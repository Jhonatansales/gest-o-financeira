import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useApp } from '../../contexts/AppContext';

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface CategoryDonutChartProps {
  data: CategoryData[];
  totalAmount: number;
}

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
];

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({ data, totalAmount }) => {
  const { formatCurrency } = useApp();

  const dataWithColors = data.map((item, index) => ({
    ...item,
    color: COLORS[index % COLORS.length]
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / totalAmount) * 100).toFixed(1);
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{data.payload.name}</p>
          <p className="text-blue-600">{formatCurrency(data.value)}</p>
          <p className="text-gray-600 text-sm">{percentage}% do total</p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy }: any) => {
    return (
      <text x={cx} y={cy} fill="#374151" textAnchor="middle" dominantBaseline="central" className="text-lg font-bold">
        <tspan x={cx} dy="-0.5em" className="text-sm text-gray-500">Total</tspan>
        <tspan x={cx} dy="1.2em" className="text-lg font-bold">{formatCurrency(totalAmount)}</tspan>
      </text>
    );
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <p>Sem despesas para analisar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={dataWithColors}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={totalAmount > 0 ? CustomLabel : undefined}
            outerRadius={100}
            innerRadius={60}
            fill="#8884d8"
            dataKey="value"
            animationBegin={0}
            animationDuration={800}
          >
            {dataWithColors.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value, entry: any) => (
              <span style={{ color: entry.color }} className="text-sm">
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};