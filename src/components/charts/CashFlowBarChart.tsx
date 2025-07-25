import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useApp } from '../../contexts/AppContext';

interface CashFlowData {
  month: string;
  receitas: number;
  despesas: number;
}

interface CashFlowBarChartProps {
  data: CashFlowData[];
}

export const CashFlowBarChart: React.FC<CashFlowBarChartProps> = ({ data }) => {
  const { formatCurrency } = useApp();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const receitas = payload.find((p: any) => p.dataKey === 'receitas')?.value || 0;
      const despesas = payload.find((p: any) => p.dataKey === 'despesas')?.value || 0;
      const saldo = receitas - despesas;

      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-green-600 flex justify-between">
              <span>Receitas:</span>
              <span className="font-semibold">{formatCurrency(receitas)}</span>
            </p>
            <p className="text-red-600 flex justify-between">
              <span>Despesas:</span>
              <span className="font-semibold">{formatCurrency(despesas)}</span>
            </p>
            <hr className="my-2" />
            <p className={`flex justify-between font-bold ${saldo >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              <span>Saldo:</span>
              <span>{saldo >= 0 ? '+' : ''}{formatCurrency(saldo)}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-2">📈</div>
          <p>Sem dados de fluxo de caixa</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
          barCategoryGap="20%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
            tickFormatter={(value) => formatCurrency(value).replace(/\s/g, '')}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="rect"
          />
          <Bar 
            dataKey="receitas" 
            fill="#10B981" 
            name="Receitas"
            radius={[4, 4, 0, 0]}
            animationDuration={800}
          />
          <Bar 
            dataKey="despesas" 
            fill="#EF4444" 
            name="Despesas"
            radius={[4, 4, 0, 0]}
            animationDuration={800}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};