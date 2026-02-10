import React, { useState } from 'react';
import { CustomCalendar } from '../Calendar';
import './MetricsSection.sass';

export interface Metric {
  icon: React.ReactNode;
  label: string;
  value: number;
  period?: string;
  onDownload?: () => Promise<void> | void;
  loading?: boolean;
}

type MetricsSectionProps = {
  onChangePeriodDate: (range: [Date, Date], preset?: string) => void;
  lastUpdated: string;
  metrics: Metric[];
  loading?: boolean;
  hidePeriodSelector?: boolean;
  inline?: boolean;
  compact?: boolean;
  title?: string;
  subtitleLabel?: string;
};

const presetOptions = [
  { label: 'Hoje', value: 'today' },
  { label: 'Ontem', value: 'yesterday' },
  { label: 'Esta semana', value: 'this_week' },
  { label: 'Últimos 7 dias', value: 'last_7_days' },
  { label: 'Últimos 30 dias', value: 'last_30_days' },
];

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('pt-BR');
};

const MetricCard = ({
  icon,
  label,
  value,
  period,
  onDownload,
  loading = false,
  compact,
}: Metric & { compact?: boolean }) => {
  const [downloading, setDownloading] = useState(false);
  const [hoverDownload, setHoverDownload] = useState(false);

  const handleDownloadClick = async () => {
    if (!onDownload) return;
    try {
      setDownloading(true);
      const result = onDownload();
      if (result instanceof Promise) {
        await result;
      }
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className={`metric-card ${hoverDownload ? 'disable-hover' : ''} ${compact ? 'compact' : ''}`}>
      <div className="metric-default">
        <div className="metric-header">
          <span className="metric-icon">{icon}</span>
          <span className="metric-label">{label}</span>
        </div>

        {loading && value === 0 ? (
          <div className="metric-skeleton-text">---</div>
        ) : (
          <div className="metric-value">
            {value.toLocaleString('pt-BR')}
          </div>
        )}
      </div>

      <div className="metric-hover">
        <div className="metric-hover-box">
          <span className="metric-period-label">Período</span>
          <span className="metric-date">{period}</span>

          <div className="metric-summary">
            <span className="metric-label">{label}</span>
            <span className="metric-value-alt">
              {value.toLocaleString('pt-BR')}
            </span>
          </div>
        </div>
      </div>

      {onDownload && value > 0 && (
        <div
          className="metric-download"
          onClick={handleDownloadClick}
          onMouseEnter={() => setHoverDownload(true)}
          onMouseLeave={() => setHoverDownload(false)}
          style={{ cursor: downloading ? 'wait' : 'pointer' }}
        >
          {downloading ? (
            <span>Baixando...</span>
          ) : (
            <>
              <span className="metric-download-button">Download</span>
              <svg className="metric-download-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </>
          )}
        </div>
      )}
    </div>
  );
};

const MetricsSection = ({
  onChangePeriodDate,
  title,
  subtitleLabel,
  metrics,
  loading,
  hidePeriodSelector,
  inline,
  compact,
  lastUpdated
}: MetricsSectionProps) => {
  const [, setCustomInput] = useState<string>(() => {
    const today = new Date();
    return `${formatDate(today)} - ${formatDate(today)}`;
  });

  const [filterPreset, setFilterPreset] = useState<string>('today');
  const [showCalendarInputs, setShowCalendarInputs] = useState(false);
  const [rangeStart, setRangeStart] = useState<Date | null>(new Date());
  const [rangeEnd, setRangeEnd] = useState<Date | null>(new Date());
  const [selectingStart, setSelectingStart] = useState(true);

  const applyPresetFilter = (preset: string) => {
    const now = new Date();
    let start = new Date(now);
    let end = new Date(now);

    switch (preset) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;

      case 'yesterday':
        start.setDate(start.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        end.setDate(end.getDate() - 1);
        end.setHours(23, 59, 59, 999);
        break;

      case 'this_week':
        const dayOfWeek = start.getDay();
        const diff = start.getDate() - dayOfWeek;
        start = new Date(start.setDate(diff));
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;

      case 'last_7_days':
        start.setDate(start.getDate() - 6);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;

      case 'last_30_days':
        start.setDate(start.getDate() - 29);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;

      default:
        return;
    }

    setCustomInput(`${formatDate(start)} - ${formatDate(end)}`);
    onChangePeriodDate([start, end], preset);
  };

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;

    if (value === 'custom') {
      setFilterPreset(value);
      setShowCalendarInputs(true);
      setRangeStart(new Date());
      setRangeEnd(new Date());
      setSelectingStart(true);
    } else {
      setFilterPreset(value);
      setShowCalendarInputs(false);
      applyPresetFilter(value);
    }
  };

  return (
    <div className="metrics-container">
      <div className="metrics-header">
        <div className="metrics-title">
          <h1>{title || 'Resumo'}</h1>
          <span className="metrics-date">
            {`${subtitleLabel || 'Última atualização em'} ${lastUpdated}`}
          </span>
        </div>
        {!hidePeriodSelector && (
          <div className="metrics-period-picker">
            {!showCalendarInputs ? (
              <select
                className="metrics-period-select"
                value={filterPreset}
                onChange={handlePresetChange}
              >
                {presetOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
                <option value="custom">Personalizado</option>
              </select>
            ) : (
              <div className="calendar-inline-inputs">
                <div className="calendar-inputs">
                  <input
                    type="text"
                    placeholder="Início"
                    value={rangeStart ? formatDate(rangeStart) : ''}
                    readOnly
                    className="calendar-input"
                    onClick={() => setShowCalendarInputs(true)}
                  />
                  <input
                    type="text"
                    placeholder="Término"
                    value={rangeEnd ? formatDate(rangeEnd) : ''}
                    readOnly
                    className="calendar-input"
                    onClick={() => setShowCalendarInputs(true)}
                  />
                </div>
                {showCalendarInputs && (
                  <div className="calendar-popup">
                    <CustomCalendar
                      startDate={rangeStart}
                      endDate={rangeEnd}
                      onSelectDate={(date) => {
                        if (selectingStart) {
                          if (rangeStart && date.getTime() === rangeStart.getTime()) {
                            setRangeStart(null);
                            setRangeEnd(null);
                            setSelectingStart(true);
                          } else {
                            setRangeStart(date);
                            setRangeEnd(null);
                            setSelectingStart(false);
                          }
                        } else {
                          if (rangeStart) {
                            if (date < rangeStart) {
                              return;
                            }
                            setRangeEnd(date);
                            setSelectingStart(true);
                          }
                        }
                      }}
                      onCancel={() => {
                        setShowCalendarInputs(false);
                        setSelectingStart(true);
                      }}
                      onApply={() => {
                        if (rangeStart && rangeEnd) {
                          onChangePeriodDate([rangeStart, rangeEnd], 'custom');
                          setShowCalendarInputs(false);
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <div
        className={`metrics-cards ${inline ? 'single-line' : ''} ${compact ? 'compact' : ''}`}
      >
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="metrics-skeleton" />
          ))
        ) : (
          metrics.map((metric, index) => (
            <MetricCard
              key={index}
              {...metric}
              compact={compact}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default MetricsSection;

