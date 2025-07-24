import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './AlertManager.css';

function AlertManager() {
  const [alerts, setAlerts] = useState([]);
  const [assetSymbol, setAssetSymbol] = useState('');
  const [alertType, setAlertType] = useState('ABOVE'); 
  const [triggerPrice, setTriggerPrice] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [reportFrequency, setReportFrequency] = useState('daily');
  const [editingAlertId, setEditingAlertId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const response = await fetch('/api/alerts', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      console.log('ALERTS FETCHED:', data);

      if (response.ok) {
        setAlerts(data.alerts);
      } else {
        throw new Error(data.message || 'Erro ao carregar alertas.');
      }
    } catch (err) {
      console.error('Erro ao buscar alertas:', err);
      setError(err.message || 'Falha ao carregar alertas.');
      if (err.message.includes('autenticado')) {// Redireciona se token invalido
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    //Validações básicas
    if (!assetSymbol) {
        setError('Símbolo do ativo é obrigatório.');
        return;
    }
    
    if (alertType !== 'DAILY_REPORT' && !triggerPrice) {
        setError('Preço de disparo é obrigatório para alertas de preço (Acima/Abaixo).');
        return;
    }
    if (!whatsappNumber) {
        setError('Número de WhatsApp é obrigatório.');
        return;
    }

    const token = localStorage.getItem('token');
    const method = editingAlertId ? 'PUT' : 'POST';
    const url = editingAlertId ? `/api/alerts/${editingAlertId}` : '/api/alerts';

    const payload = {
      assetSymbol: assetSymbol.toUpperCase(),
      alertType,
      whatsappNumber,
      triggerPrice: alertType !== 'DAILY_REPORT' ? parseFloat(triggerPrice) : null,
      reportFrequency: alertType === 'DAILY_REPORT' ? reportFrequency : null,
    };

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Alerta ${editingAlertId ? 'atualizado' : 'criado'} com sucesso!`);
        // Limpar formulário
        setAssetSymbol('');
        setAlertType('ABOVE');
        setTriggerPrice('');
        setWhatsappNumber('');
        setReportFrequency('daily'); //Resetar para o padrão
        setEditingAlertId(null);
        fetchAlerts(); //Atualiza a lista
      } else {
        throw new Error(data.message || 'Erro ao salvar alerta.');
      }
    } catch (err) {
      console.error('Erro ao salvar alerta:', err);
      setError(err.message || 'Falha ao salvar alerta.');
    }
  };

  const handleEdit = (alert) => {
    setEditingAlertId(alert.id);
    setAssetSymbol(alert.assetSymbol);
    setAlertType(alert.alertType);
    setTriggerPrice(alert.triggerPrice || ''); 
    setWhatsappNumber(alert.whatsappNumber);
    setReportFrequency(alert.reportFrequency || 'daily'); 
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este alerta?')) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/alerts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMessage('Alerta excluído com sucesso!');
        fetchAlerts();
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Erro ao excluir alerta.');
      }
    } catch (err) {
      console.error('Erro ao excluir alerta:', err);
      setError(err.message || 'Falha ao excluir alerta.');
    }
  };

  const handleToggleActive = async (alert) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/alerts/${alert.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !alert.isActive, messageSent: false }), 
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(`Alerta ${alert.isActive ? 'desativado' : 'ativado'} com sucesso!`);
        fetchAlerts();
      } else {
        throw new Error(data.message || 'Erro ao alterar status do alerta.');
      }
    } catch (err) {
      console.error('Erro ao alternar status do alerta:', err);
      setError(err.message || 'Falha ao alterar status do alerta.');
    }
  };

  return (
    <div className="alert-manager-container">
      <h2>{editingAlertId ? 'Editar Alerta' : 'Criar Novo Alerta'}</h2>
      <form onSubmit={handleSubmit} className="alert-form">
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}

        <div className="form-group">
          <label htmlFor="assetSymbol">Símbolo do Ativo (Ex: BTCUSDT, ETHBRL):</label>
          <input
            type="text"
            id="assetSymbol"
            value={assetSymbol}
            onChange={(e) => setAssetSymbol(e.target.value.toUpperCase())} //Salva em maiúsculas
            required
            placeholder="Ex: BTCUSDT"
          />
        </div>

        <div className="form-group">
          <label htmlFor="alertType">Tipo de Alerta:</label>
          <select
            id="alertType"
            value={alertType}
            onChange={(e) => setAlertType(e.target.value)}
          >
            <option value="ABOVE">Preço Acima de</option>
            <option value="BELOW">Preço Abaixo de</option>
            <option value="DAILY_REPORT">Relatório Diário</option> 
          </select>
        </div>

        {alertType !== 'DAILY_REPORT' && (//Mostra triggerPrice apenas para ABOVE/BELOW
          <div className="form-group">
            <label htmlFor="triggerPrice">Preço de Disparo:</label>
            <input
              type="number"
              id="triggerPrice"
              value={triggerPrice}
              onChange={(e) => setTriggerPrice(e.target.value)}
              step="0.01"
              required
              placeholder="Ex: 50000.00"
            />
          </div>
        )}

        {alertType === 'DAILY_REPORT' && (//Mostra reportFrequency apenas pro DAILY_REPORT
          <div className="form-group">
            <label htmlFor="reportFrequency">Frequência do Relatório:</label>
            <select
              id="reportFrequency"
              value={reportFrequency}
              onChange={(e) => setReportFrequency(e.target.value)}
            >
              <option value="daily">Diário</option>
              <option value="weekly">Semanal</option>
              
            </select>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="whatsappNumber">Número de WhatsApp (Ex: 5511999999999):</label>
          <input
            type="text"
            id="whatsappNumber"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            required
            placeholder="Ex: 5511999999999"
          />
        </div>

        <button type="submit">{editingAlertId ? 'Atualizar Alerta' : 'Criar Alerta'}</button>
      </form>

      <h3 style={{ marginTop: '40px' }}>Seus Alertas</h3>
      {alerts.length === 0 ? (
        <p>Você não possui alertas cadastrados.</p>
      ) : (
        <ul className="alert-list">
          {alerts.map((alert) => (
            <li key={alert.id} className="alert-item">
              <div className="alert-details">
                <strong>Símbolo:</strong> {alert.assetSymbol} <br />
                <strong>Tipo:</strong> {alert.alertType}
                {alert.alertType !== 'DAILY_REPORT' && (
                  <> <br /> <strong>Preço de Disparo:</strong> R$ {alert.triggerPrice ? parseFloat(alert.triggerPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 8 }) : 'N/A'}</>
                )}
                {alert.alertType === 'DAILY_REPORT' && (
                  <> <br /> <strong>Frequência:</strong> {alert.reportFrequency === 'daily' ? 'Diário' : 'Semanal'}</>
                )}
                <br />
                <strong>WhatsApp:</strong> {alert.whatsappNumber} <br />
                <strong>Status:</strong> {alert.isActive ? 'Ativo' : 'Inativo'} {' '}
                {alert.alertType !== 'DAILY_REPORT' && alert.messageSent && alert.isActive && ( //Mostrar "disparado" apenas para ABOVE/BELOW ativos e disparados
                    <span style={{ color: 'orange', fontWeight: 'bold' }}>(Disparado)</span>
                )}
                 {alert.alertType !== 'DAILY_REPORT' && !alert.isActive && alert.messageSent && (
                    <span style={{ color: 'gray' }}>(Disparado antes de desativar)</span>
                )}
                {alert.lastReportSentAt && alert.alertType === 'DAILY_REPORT' && (
                  <> <br /> <strong>Último Relatório:</strong> {new Date(alert.lastReportSentAt).toLocaleString('pt-BR')}</>
                )}
              </div>
              <div className="alert-actions">
                <button onClick={() => handleEdit(alert)} className="edit-btn">Editar</button>
                <button
                  onClick={() => handleToggleActive(alert)}
                  className={alert.isActive ? 'deactivate-btn' : 'activate-btn'}
                >
                  {alert.isActive ? 'Desativar' : 'Ativar'}
                </button>
                <button onClick={() => handleDelete(alert.id)} className="delete-btn">Excluir</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div style={{ marginTop: '20px' }}>
        <Link to="/dashboard" className="back-to-dashboard-btn">Voltar ao Dashboard</Link>
      </div>
    </div>
  );
}

export default AlertManager;