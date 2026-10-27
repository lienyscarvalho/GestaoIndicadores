import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { TrendingDown, CheckCircle, BarChart3, LineChart as LineIcon } from 'lucide-react';

export interface WeeklyDataPoint {
  semana: string;
  semanaCurta: string;
  ifi: number;
  rework: number;
  altas: number;
  metaIfi: number;
  metaRework: number;
  evento?: string;
}

interface WeeklyTrendsChartProps {
  selectedCoordinator?: string;
  onCoordinatorChange?: (coord: string) => void;
}

// 12 Weeks base trend data representing the operational quality cycle
const BASE_WEEKLY_DATA: WeeklyDataPoint[] = [
  { semana: 'Semana 01', semanaCurta: 'Sem 01', ifi: 4.25, rework: 6.4, altas: 380, metaIfi: 4.0, metaRework: 5.0, evento: 'Início do Ciclo de Auditoria' },
  { semana: 'Semana 02', semanaCurta: 'Sem 02', ifi: 4.18, rework: 6.2, altas: 410, metaIfi: 4.0, metaRework: 5.0 },
  { semana: 'Semana 03', semanaCurta: 'Sem 03', ifi: 4.12, rework: 6.5, altas: 395, metaIfi: 4.0, metaRework: 5.0, evento: 'Alerta de LSC em Retrabalho' },
  { semana: 'Semana 04', semanaCurta: 'Sem 04', ifi: 4.05, rework: 6.3, altas: 430, metaIfi: 4.0, metaRework: 5.0 },
  { semana: 'Semana 05', semanaCurta: 'Sem 05', ifi: 3.94, rework: 6.0, altas: 440, metaIfi: 4.0, metaRework: 5.0, evento: 'IFI entra na Meta (<=4%)' },
  { semana: 'Semana 06', semanaCurta: 'Sem 06', ifi: 4.15, rework: 6.8, altas: 390, metaIfi: 4.0, metaRework: 5.0, evento: 'Pico: Chuvas & Vandalismo ZL' },
  { semana: 'Semana 07', semanaCurta: 'Sem 07', ifi: 3.88, rework: 5.9, altas: 450, metaIfi: 4.0, metaRework: 5.0, evento: 'Ações de Contenção FCA' },
  { semana: 'Semana 08', semanaCurta: 'Sem 08', ifi: 3.75, rework: 5.8, altas: 470, metaIfi: 4.0, metaRework: 5.0 },
  { semana: 'Semana 09', semanaCurta: 'Sem 09', ifi: 3.65, rework: 5.6, altas: 460, metaIfi: 4.0, metaRework: 5.0, evento: 'Checklist Digital no App' },
  { semana: 'Semana 10', semanaCurta: 'Sem 10', ifi: 3.48, rework: 5.4, altas: 485, metaIfi: 4.0, metaRework: 5.0 },
  { semana: 'Semana 11', semanaCurta: 'Sem 11', ifi: 3.38, rework: 5.3, altas: 510, metaIfi: 4.0, metaRework: 5.0 },
  { semana: 'Semana 12', semanaCurta: 'Sem 12', ifi: 3.25, rework: 5.1, altas: 530, metaIfi: 4.0, metaRework: 5.0, evento: 'Conclusão com Melhoria Contínua' }
];

// Coordinator multipliers to adjust weekly numbers when filtered
const COORDINATOR_FACTORS: Record<string, { ifiMult: number; reworkMult: number; label: string }> = {
  'Todos': { ifiMult: 1.0, reworkMult: 1.0, label: 'Média Operacional (Todas as Equipes)' },
  'ACASSIO': { ifiMult: 0.82, reworkMult: 0.80, label: 'Equipe ACASSIO (Destaque em Qualidade)' },
  'MARCIO': { ifiMult: 1.13, reworkMult: 1.15, label: 'Equipe MARCIO (Sob Plano de Ação)' },
  'ADRIANO': { ifiMult: 0.97, reworkMult: 0.98, label: 'Equipe ADRIANO (Evolução Estável)' },
  'ROBSON': { ifiMult: 1.05, reworkMult: 1.07, label: 'Equipe ROBSON (Reciclagem em Andamento)' },
  'CLEBER': { ifiMult: 0.88, reworkMult: 0.85, label: 'Equipe CLEBER (Excelente Aderência)' }
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    dataKey: string;
  }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  // Find corresponding weekly point
  const weekItem = BASE_WEEKLY_DATA.find((item) => item.semana === label || item.semanaCurta === label);

  return (
    <div className="bg-white/95 backdrop-blur-xs border border-purple-200 rounded-xl p-3.5 shadow-xl text-xs space-y-2 min-w-[220px]">
      <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
        <span className="font-extrabold text-[#660099]">{label}</span>
        {weekItem?.evento && (
          <span className="bg-purple-100 text-[#660099] px-2 py-0.5 rounded-full text-[10px] font-bold">
            {weekItem.evento}
          </span>
        )}
      </div>

      <div className="space-y-1.5 pt-0.5">
        {payload.map((entry) => {
          const isIfi = entry.dataKey === 'ifi';
          const metaVal = isIfi ? 4.0 : 5.0;
          const isConforme = entry.value <= metaVal;
          const gap = (entry.value - metaVal).toFixed(2);

          return (
            <div key={entry.dataKey} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-gray-600 font-medium">{entry.name}:</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-gray-900 font-mono">{entry.value.toFixed(2)}%</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                    isConforme ? 'bg-green-100 text-[#00875A]' : 'bg-orange-100 text-[#F05000]'
                  }`}
                >
                  {isConforme ? 'Meta OK' : `+${gap}%`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {weekItem?.altas && (
        <div className="text-[10px] text-gray-500 border-t border-gray-100 pt-1.5 flex justify-between">
          <span>Volume de Altas auditadas:</span>
          <strong className="text-gray-700">{weekItem.altas} OS</strong>
        </div>
      )}
    </div>
  );
};

export const WeeklyTrendsChart: React.FC<WeeklyTrendsChartProps> = ({
  selectedCoordinator = 'Todos',
  onCoordinatorChange
}) => {
  const [metricFilter, setMetricFilter] = useState<'both' | 'ifi' | 'rework'>('both');
  const [chartType, setChartType] = useState<'line' | 'area'>('line');

  // Compute coordinator-adjusted weekly dataset
  const chartData = useMemo(() => {
    const factor = COORDINATOR_FACTORS[selectedCoordinator] || COORDINATOR_FACTORS['Todos'];
    return BASE_WEEKLY_DATA.map((item) => {
      const adjustedIfi = Number((item.ifi * factor.ifiMult).toFixed(2));
      const adjustedRework = Number((item.rework * factor.reworkMult).toFixed(2));
      return {
        ...item,
        ifi: adjustedIfi,
        rework: adjustedRework,
      };
    });
  }, [selectedCoordinator]);

  // Summary statistics for badges
  const stats = useMemo(() => {
    if (!chartData.length) {
      return {
        ifiAvg: 0,
        reworkAvg: 0,
        ifiDelta: 0,
        reworkDelta: 0,
        ifiConformeCount: 0,
        reworkConformeCount: 0,
        totalWeeks: 0,
        latestIfi: 0,
        latestRework: 0
      };
    }
    const first = chartData[0];
    const last = chartData[chartData.length - 1];

    const ifiSum = chartData.reduce((acc, curr) => acc + curr.ifi, 0);
    const reworkSum = chartData.reduce((acc, curr) => acc + curr.rework, 0);

    const ifiAvg = Number((ifiSum / chartData.length).toFixed(2));
    const reworkAvg = Number((reworkSum / chartData.length).toFixed(2));

    const ifiDelta = Number((((last.ifi - first.ifi) / first.ifi) * 100).toFixed(1));
    const reworkDelta = Number((((last.rework - first.rework) / first.rework) * 100).toFixed(1));

    const ifiConformeCount = chartData.filter(d => d.ifi <= 4.0).length;
    const reworkConformeCount = chartData.filter(d => d.rework <= 5.0).length;

    return {
      ifiAvg,
      reworkAvg,
      ifiDelta,
      reworkDelta,
      ifiConformeCount,
      reworkConformeCount,
      totalWeeks: chartData.length,
      latestIfi: last.ifi,
      latestRework: last.rework
    };
  }, [chartData]);

  return (
    <div className="border border-purple-100 bg-white rounded-2xl p-5 shadow-xs space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-gray-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-100 text-[#660099]">
              <BarChart3 className="w-4 h-4" />
            </span>
            <h3 className="font-extrabold text-[#660099] text-sm uppercase tracking-wider">
              Tendência Temporal Semanal — IFI Online &amp; Retrabalho
            </h3>
          </div>
          <p className="text-[11px] text-[#555555] mt-0.5">
            Evolução histórica semana a semana (Ciclo de 12 Semanas) com linha de corte corporativa Vivo Telefônica.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Coordinator Switcher */}
          {onCoordinatorChange && (
            <select
              value={selectedCoordinator}
              onChange={(e) => onCoordinatorChange(e.target.value)}
              className="bg-purple-50 text-[#660099] font-bold text-xs border border-purple-200 rounded-lg px-2.5 py-1.5 outline-none hover:bg-purple-100 transition-colors cursor-pointer"
            >
              {Object.keys(COORDINATOR_FACTORS).map((coord) => (
                <option key={coord} value={coord}>
                  {coord === 'Todos' ? 'Visão: Todos' : `Coord.: ${coord}`}
                </option>
              ))}
            </select>
          )}

          {/* Metric Selector Button Group */}
          <div className="inline-flex rounded-lg border border-gray-200 p-0.5 bg-gray-50 text-xs">
            <button
              onClick={() => setMetricFilter('both')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                metricFilter === 'both' ? 'bg-[#660099] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Ambos
            </button>
            <button
              onClick={() => setMetricFilter('ifi')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                metricFilter === 'ifi' ? 'bg-[#660099] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              IFI Online
            </button>
            <button
              onClick={() => setMetricFilter('rework')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                metricFilter === 'rework' ? 'bg-[#F05000] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Retrabalho
            </button>
          </div>

          {/* Chart Type Toggle */}
          <div className="inline-flex rounded-lg border border-gray-200 p-0.5 bg-gray-50 text-xs">
            <button
              onClick={() => setChartType('line')}
              title="Gráfico de Linha"
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                chartType === 'line' ? 'bg-white text-[#660099] shadow-xs' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <LineIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setChartType('area')}
              title="Gráfico de Área"
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                chartType === 'area' ? 'bg-white text-[#660099] shadow-xs' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Card 1: IFI Atual */}
        <div className="bg-purple-50/60 border border-purple-100 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-purple-900">IFI Atual (Sem. 12)</span>
            <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${stats.latestIfi <= 4.0 ? 'bg-green-100 text-[#00875A]' : 'bg-red-100 text-red-700'}`}>
              {stats.latestIfi <= 4.0 ? 'Meta Conforme' : 'Desvio'}
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-black text-[#660099]">{stats.latestIfi}%</span>
            <span className="text-[10px] text-gray-500 font-medium">Meta &lt;= 4,00%</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-[#00875A] font-bold mt-1">
            <TrendingDown className="w-3 h-3" />
            <span>{stats.ifiDelta}% no período</span>
          </div>
        </div>

        {/* Card 2: Retrabalho Atual */}
        <div className="bg-orange-50/60 border border-orange-100 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-orange-950">Retrabalho (Sem. 12)</span>
            <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${stats.latestRework <= 5.0 ? 'bg-green-100 text-[#00875A]' : 'bg-orange-100 text-[#F05000]'}`}>
              {stats.latestRework <= 5.0 ? 'Meta Conforme' : 'Alerta'}
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-black text-[#F05000]">{stats.latestRework}%</span>
            <span className="text-[10px] text-gray-500 font-medium">Meta &lt;= 5,00%</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-[#00875A] font-bold mt-1">
            <TrendingDown className="w-3 h-3" />
            <span>{stats.reworkDelta}% no período</span>
          </div>
        </div>

        {/* Card 3: Média IFI 12 Semanas */}
        <div className="bg-white border border-gray-200 rounded-xl p-3 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-gray-600">Média IFI (12 Semanas)</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black text-gray-800">{stats.ifiAvg}%</span>
            <span className="text-[10px] text-gray-400">acumulado</span>
          </div>
          <div className="text-[10px] text-purple-700 font-medium mt-1">
            {stats.ifiConformeCount} de {stats.totalWeeks} semanas dentro da meta
          </div>
        </div>

        {/* Card 4: Média Retrabalho 12 Semanas */}
        <div className="bg-white border border-gray-200 rounded-xl p-3 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-gray-600">Média Retrabalho (12 Sem.)</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black text-gray-800">{stats.reworkAvg}%</span>
            <span className="text-[10px] text-gray-400">acumulado</span>
          </div>
          <div className="text-[10px] text-[#F05000] font-medium mt-1">
            {stats.reworkConformeCount} de {stats.totalWeeks} semanas dentro da meta
          </div>
        </div>
      </div>

      {/* Main Recharts Area */}
      <div className="w-full h-[320px] pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart
              data={chartData}
              margin={{ top: 15, right: 25, left: -10, bottom: 5 }}
            >
              <defs>
                <linearGradient id="ifiGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#660099" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#660099" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="semanaCurta"
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                domain={[2.5, 7.5]}
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                unit="%"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '11px', fontWeight: 600 }}
              />

              {/* Corporate Reference Lines */}
              {(metricFilter === 'both' || metricFilter === 'ifi') && (
                <ReferenceLine
                  y={4.0}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: 'Meta IFI (4.0%)',
                    position: 'insideTopLeft',
                    fill: '#059669',
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                />
              )}

              {(metricFilter === 'both' || metricFilter === 'rework') && (
                <ReferenceLine
                  y={5.0}
                  stroke="#f97316"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: 'Meta Retrabalho (5.0%)',
                    position: 'insideBottomLeft',
                    fill: '#ea580c',
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                />
              )}

              {/* IFI Line */}
              {(metricFilter === 'both' || metricFilter === 'ifi') && (
                <Line
                  type="monotone"
                  dataKey="ifi"
                  name="IFI Online (%)"
                  stroke="#660099"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#660099', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 6, fill: '#660099', stroke: '#EADBFC', strokeWidth: 3 }}
                />
              )}

              {/* Retrabalho Line */}
              {(metricFilter === 'both' || metricFilter === 'rework') && (
                <Line
                  type="monotone"
                  dataKey="rework"
                  name="Retrabalho IRR (%)"
                  stroke="#F05000"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#F05000', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 6, fill: '#F05000', stroke: '#ffedd5', strokeWidth: 3 }}
                />
              )}
            </LineChart>
          ) : (
            <AreaChart
              data={chartData}
              margin={{ top: 15, right: 25, left: -10, bottom: 5 }}
            >
              <defs>
                <linearGradient id="colorIfi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#660099" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#660099" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorRework" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F05000" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#F05000" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="semanaCurta"
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                domain={[2.5, 7.5]}
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                unit="%"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '11px', fontWeight: 600 }}
              />

              {/* Reference Lines */}
              {(metricFilter === 'both' || metricFilter === 'ifi') && (
                <ReferenceLine
                  y={4.0}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: 'Meta IFI (4.0%)',
                    position: 'insideTopLeft',
                    fill: '#059669',
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                />
              )}

              {(metricFilter === 'both' || metricFilter === 'rework') && (
                <ReferenceLine
                  y={5.0}
                  stroke="#f97316"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: 'Meta Retrabalho (5.0%)',
                    position: 'insideBottomLeft',
                    fill: '#ea580c',
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                />
              )}

              {(metricFilter === 'both' || metricFilter === 'ifi') && (
                <Area
                  type="monotone"
                  dataKey="ifi"
                  name="IFI Online (%)"
                  stroke="#660099"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorIfi)"
                />
              )}

              {(metricFilter === 'both' || metricFilter === 'rework') && (
                <Area
                  type="monotone"
                  dataKey="rework"
                  name="Retrabalho IRR (%)"
                  stroke="#F05000"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRework)"
                />
              )}
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Footer Notes and Legend description */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-[#555555]">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1 font-semibold text-gray-700">
            <span className="w-2.5 h-2.5 rounded-full bg-[#660099]" /> IFI Online (Meta: &lt;= 4,00%)
          </span>
          <span className="text-gray-300">•</span>
          <span className="flex items-center gap-1 font-semibold text-gray-700">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F05000]" /> Retrabalho IRR (Meta: &lt;= 5,00%)
          </span>
          <span className="text-gray-300">•</span>
          <span className="flex items-center gap-1 text-emerald-700 font-medium">
            <CheckCircle className="w-3.5 h-3.5" /> Tendência Positiva em 8 das últimas 9 semanas
          </span>
        </div>

        <div className="text-[10px] text-gray-500 font-medium flex items-center gap-1 self-end sm:self-auto">
          <span>Fonte: PSR Telecom | Auditoria Qualidade Vivo SP</span>
        </div>
      </div>
    </div>
  );
};
