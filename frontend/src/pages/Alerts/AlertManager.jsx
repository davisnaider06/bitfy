

import React, { useState, useEffect } from 'react';
import './AlertManager.css';

function AlertManager() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newAlert, setNewAlert] = useState({
    assetSymbol: '',
    triggerPrice: '',
    alertType: 'ABOVE',
    whatsappNumber: '',
  });
  const [editingAlert, setEditingAlert] = useState(null);

    const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // Se não houver token, redireciona
        setError('Você não está autenticado. Por favor, faça login.');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/alerts', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao carregar alertas.');
      }
      setAlerts(data.alerts);
    } catch (err) {
      console.error('Erro ao buscar alertas:', err);
      setError(err.message || 'Falha ao carregar alertas.');
    } finally {
      setLoading(false);
    }
  };

//carregar efeitos etc
  useEffect(() => {
    fetchAlerts();
  }, []);

  //lidar com a criação de uma tarefa
  const handleCreateAlert = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newAlert),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao criar alerta.');
      }

      setNewAlert({
        assetSymbol: '',
        triggerPrice: '',
        alertType: 'ABOVE',
        whatsappNumber: '',
      }); //limpa o formulário
      fetchAlerts(); //recarrega
    } catch (err) {
      console.error('Erro ao criar alerta:', err);
      setError(err.message || 'Falha ao criar alerta.');
    }
  };

  // Função para lidar com a atualização de um alerta
  const handleUpdateAlert = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/alerts/${editingAlert.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(editingAlert),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao atualizar alerta.');
      }

      setEditingAlert(null); // Sai do modo de edição
      fetchAlerts(); // Recarrega a lista
    } catch (err) {
      console.error('Erro ao atualizar alerta:', err);
      setError(err.message || 'Falha ao atualizar alerta.');
    }
  };

  // Função para lidar com a exclusão de um alerta
  const handleDeleteAlert = async (alertId) => {
    if (!window.confirm('Tem certeza que deseja deletar este alerta?')) {
      return;
    }
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erro ao deletar alerta.');
      }

      fetchAlerts(); // Recarrega a lista
    } catch (err) {
      console.error('Erro ao deletar alerta:', err);
      setError(err.message || 'Falha ao deletar alerta.');
    }
  };

  if (loading) {
    return <div className="alert-manager-container">Carregando alertas...</div>;
  }

  if (error) {
    return <div className="alert-manager-container"><p className="error-message">{error}</p></div>;
  }

  return (
    <div className="alert-manager-container">
      <h2>Meus Alertas de Preço</h2>

      {/* Formulário de Criação/Edição */}
      <div className="alert-form-card">
        <h3>{editingAlert ? 'Editar Alerta' : 'Criar Novo Alerta'}</h3>
        <form onSubmit={editingAlert ? handleUpdateAlert : handleCreateAlert} className="alert-form">
          <div className="form-group">
            <label htmlFor="assetSymbol">Símbolo do Ativo (ex: BTCUSDT):</label>
            <input
              type="text"
              id="assetSymbol"
              value={editingAlert ? editingAlert.assetSymbol : newAlert.assetSymbol}
              onChange={(e) => editingAlert ? setEditingAlert({ ...editingAlert, assetSymbol: e.target.value }) : setNewAlert({ ...newAlert, assetSymbol: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="triggerPrice">Preço de Disparo:</label>
            <input
              type="number"
              id="triggerPrice"
              value={editingAlert ? editingAlert.triggerPrice : newAlert.triggerPrice}
              onChange={(e) => editingAlert ? setEditingAlert({ ...editingAlert, triggerPrice: parseFloat(e.target.value) }) : setNewAlert({ ...newAlert, triggerPrice: parseFloat(e.target.value) })}
              step="any"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="alertType">Tipo de Alerta:</label>
            <select
              id="alertType"
              value={editingAlert ? editingAlert.alertType : newAlert.alertType}
              onChange={(e) => editingAlert ? setEditingAlert({ ...editingAlert, alertType: e.target.value }) : setNewAlert({ ...newAlert, alertType: e.target.value })}
              required
            >
              <option value="ABOVE">Acima de</option>
              <option value="BELOW">Abaixo de</option>
              {/* <option value="DAILY_REPORT">Relatório Diário</option> */}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="whatsappNumber">Número de WhatsApp (opcional, padrão do perfil):</label>
            <input
              type="text"
              id="whatsappNumber"
              value={editingAlert ? editingAlert.whatsappNumber : newAlert.whatsappNumber}
              onChange={(e) => editingAlert ? setEditingAlert({ ...editingAlert, whatsappNumber: e.target.value }) : setNewAlert({ ...newAlert, whatsappNumber: e.target.value })}
              placeholder="Ex: 5511999999999"
            />
          </div>
          {editingAlert && ( // Campo de status só aparece ao editar
            <div className="form-group">
              <label htmlFor="status">Status:</label>
              <select
                id="status"
                value={editingAlert.status}
                onChange={(e) => setEditingAlert({ ...editingAlert, status: e.target.value })}
                required
              >
                <option value="ACTIVE">Ativo</option>
                <option value="INACTIVE">Inativo</option>
                <option value="TRIGGERED">Disparado</option>
              </select>
            </div>
          )}
          <button type="submit">
            {editingAlert ? 'Atualizar Alerta' : 'Criar Alerta'}
          </button>
          {editingAlert && (
            <button type="button" onClick={() => setEditingAlert(null)} className="cancel-button">
              Cancelar Edição
            </button>
          )}
        </form>
      </div>

      {/* Lista de Alertas */}
      <div className="alerts-list">
        <h3>Alertas Ativos</h3>
        {alerts.length === 0 ? (
          <p>Nenhum alerta configurado ainda.</p>
        ) : (
          alerts.map((alert) => (
            <div key={alert.id} className="alert-item">
              <p><strong>Ativo:</strong> {alert.assetSymbol}</p>
              <p><strong>Tipo:</strong> {alert.alertType === 'ABOVE' ? 'Acima de' : alert.alertType === 'BELOW' ? 'Abaixo de' : 'Relatório Diário'}</p>
              <p><strong>Preço:</strong> R$ {parseFloat(alert.triggerPrice).toFixed(2)}</p>
              <p><strong>Status:</strong> {alert.status}</p>
              <p><strong>WhatsApp:</strong> {alert.whatsappNumber || 'Usar do perfil'}</p>
              <div className="alert-actions">
                <button onClick={() => setEditingAlert(alert)}>Editar</button>
                <button onClick={() => handleDeleteAlert(alert.id)} className="delete-button">Deletar</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AlertManager;