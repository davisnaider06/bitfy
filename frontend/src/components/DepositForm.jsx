
import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const DepositForm = ({ onDepositSuccess }) => {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const parsedAmount = parseFloat(amount);

        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            toast.error('Por favor, insira um valor válido para o depósito (maior que zero).');
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token'); // Pega o token do localStorage
            if (!token) {
                toast.error('Você não está autenticado. Faça login novamente.');
                setLoading(false);
                return;
            }

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            };

            // Envia a requisição POST para o endpoint de depósito no backend
            const response = await axios.post(
                'http://localhost:3001/api/transactions/deposit',
                { amount: parsedAmount }, // Envia o valor como número
                config
            );

            // Verifica se a resposta foi bem-sucedida e se contém o novo saldo da carteira
            if (response.status === 200 && response.data && response.data.wallet && response.data.wallet.BRL !== undefined) {
                toast.success(response.data.message || 'Depósito realizado com sucesso!');
                setAmount(''); // Limpa o campo de input

                // Chama a função passada via props para atualizar o saldo no componente pai (Dashboard)
                if (onDepositSuccess) {
                    onDepositSuccess(response.data.wallet.BRL);
                }
            } else {
                toast.error(response.data.message || 'Erro inesperado ao realizar depósito.');
            }

        } catch (error) {
            console.error('Erro ao realizar depósito:', error);
            // Captura e exibe a mensagem de erro do backend se disponível
            toast.error(error.response?.data?.message || 'Erro ao realizar depósito. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="deposit-form-container">
            {/* <h3>Depositar Fundos (BRL)</h3> Removido o h3, o Dashboard já tem um título para a seção */}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="depositAmount">Valor do Depósito (BRL):</label>
                    <input
                        type="number"
                        id="depositAmount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        step="0.01" // Permite valores com centavos
                        min="0.01" // Valor mínimo
                        placeholder="Ex: 1000.00"
                        required
                        disabled={loading} // Desabilita o campo enquanto carrega
                    />
                </div>
                <button type="submit" className="action-button deposit-button" disabled={loading}>
                    {loading ? 'Processando...' : 'Depositar'}
                </button>
            </form>
        </div>
    );
};

export default DepositForm;