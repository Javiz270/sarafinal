import React, { useState } from 'react';
import { getReportPreview, exportReportExcel } from '../api/reports';
import type { ReportType, ReportPreviewResponse } from '../types';

export const ReportsPage: React.FC = () => {
  const [reportType, setReportType] = useState<ReportType>('loans');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [preview, setPreview] = useState<ReportPreviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePreview = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getReportPreview(
        reportType,
        startDate ? new Date(startDate).toISOString() : undefined,
        endDate ? new Date(endDate).toISOString() : undefined
      );
      setPreview(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al obtener la previsualización del reporte.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      setError(null);
      await exportReportExcel(
        reportType,
        startDate ? new Date(startDate).toISOString() : undefined,
        endDate ? new Date(endDate).toISOString() : undefined
      );
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al exportar el reporte a Excel.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 page-transition-enter">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Generador de Reportes</h1>
        <p className="text-gray-600 mt-1">Exporta datos operativos del Learning Commons en formato Excel.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Reporte
            </label>
            <select
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
              value={reportType}
              onChange={(e) => setReportType(e.target.value as ReportType)}
            >
              <option value="loans">Préstamos de Material</option>
              <option value="cubicles">Uso de Cubículos</option>
              <option value="visitors">Visitantes Externos</option>
              <option value="events">Asistencia a Eventos</option>
              <option value="activities">Bitácora de Actividades (Staff)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Inicio (Opcional)
            </label>
            <input
              type="date"
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Fin (Opcional)
            </label>
            <input
              type="date"
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={handlePreview}
            disabled={loading || exporting}
            className="btn btn-secondary"
          >
            {loading ? 'Cargando...' : 'Previsualizar'}
          </button>
          <button
            onClick={handleExport}
            disabled={loading || exporting}
            className="btn btn-primary"
          >
            {exporting ? 'Exportando...' : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Exportar a Excel
              </>
            )}
          </button>
        </div>
      </div>

      {preview && (
        <div className="table-container animate-scale-in">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-800">
              Vista Previa (Limitado a {preview.rows.length} registros)
            </h3>
          </div>
          <div className="overflow-x-auto">
            {preview.rows.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state__icon">📄</div>
                <p>No hay datos para mostrar con los filtros seleccionados.</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {preview.columns.map((col, idx) => (
                      <th
                        key={idx}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {preview.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="table-row">
                      {preview.columns.map((col, cIdx) => {
                        let val = row[col];
                        // format dates if they look like iso strings
                        if (typeof val === 'string' && val.includes('T') && val.endsWith('+00:00')) {
                           try { val = new Date(val).toLocaleString(); } catch(e){}
                        }
                        return (
                          <td key={cIdx} className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                            {val === null || val === undefined ? '' : String(val)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
