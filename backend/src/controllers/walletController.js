// backend/src/controllers/walletController.js
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const axios = require('axios'); // Para buscar preços de ativos

// Função auxiliar para garantir que o usuário tem uma carteira
const ensureUserWallet = async (userId) => {
    try {
        console.log(`[ensureUserWallet] Tentando garantir carteira para userId: ${userId}`);
        let wallet = await Wallet.findOne({ where: { userId, type: 'real' } });

        if (!wallet) {
            console.log(`[ensureUserWallet] Carteira NÃO encontrada para userId: ${userId}. Criando nova carteira...`);
            wallet = await Wallet.create({
                userId,
                type: 'real',
                BRL: 10000.00, // <--- CORREÇÃO AQUI: Definir o saldo inicial explicitamente
                assets: {}, // Objeto vazio para ativos cripto
            });
            console.log(`[ensureUserWallet] Nova carteira CRIADA com sucesso para userId: ${userId}. Saldo BRL: ${wallet.BRL}`);
        } else {
            console.log(`[ensureUserWallet] Carteira encontrada para userId: ${userId}. Saldo BRL: ${wallet.BRL}`);
        }
        return wallet;
    } catch (error) {
        console.error(`[ensureUserWallet] Erro ao garantir carteira para userId ${userId}:`, error);
        throw new Error('Erro ao garantir carteira do usuário.');
    }
};

// Busca o preço atual de um ativo na Binance (reutilizado do alertMonitor)
const getAssetPrice = async (symbol) => {
    try {
        const response = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol.toUpperCase()}`);
        return parseFloat(response.data.price);
    } catch (error) {
        console.error(`Erro ao buscar preço para ${symbol} na Binance:`, error.message);
        return null;
    }
};

// @desc    Depositar fundos na carteira do usuário
// @route   POST /api/wallet/deposit
// @access  Private
const depositFunds = async (req, res) => {
    const { amount } = req.body;
    const userId = req.user.id; // ID do usuário logado

    if (amount <= 0) {
        return res.status(400).json({ message: 'O valor do depósito deve ser positivo.' });
    }

    try {
        const wallet = await ensureUserWallet(userId);

        // Atualiza o saldo BRL da carteira
        wallet.BRL = parseFloat(wallet.BRL) + parseFloat(amount);
        await wallet.save();

        // Registra a transação
        await Transaction.create({
            userId,
            walletId: wallet.id,
            type: 'DEPOSIT',
            assetSymbol: 'BRL', // O ativo transacionado é BRL
            amount: parseFloat(amount),
            price: null, // Não há preço para depósito de BRL
            BRLAmount: parseFloat(amount),
            status: 'COMPLETED',
        });

        res.status(200).json({
            message: `Depósito de R$ ${parseFloat(amount).toFixed(2)} realizado com sucesso!`,
            newBalance: wallet.BRL,
        });

    } catch (error) {
        console.error('Erro ao depositar fundos:', error);
        res.status(500).json({ message: 'Erro no servidor ao processar depósito.' });
    }
};

// @desc    Sacar fundos da carteira do usuário
// @route   POST /api/wallet/withdraw
// @access  Private
const withdrawFunds = async (req, res) => {
    const { amount } = req.body;
    const userId = req.user.id;

    if (amount <= 0) {
        return res.status(400).json({ message: 'O valor do saque deve ser positivo.' });
    }

    try {
        const wallet = await ensureUserWallet(userId);

        if (parseFloat(wallet.BRL) < parseFloat(amount)) {
            return res.status(400).json({ message: 'Saldo insuficiente para realizar o saque.' });
        }

        // Atualiza o saldo BRL da carteira
        wallet.BRL = parseFloat(wallet.BRL) - parseFloat(amount);
        await wallet.save();

        // Registra a transação
        await Transaction.create({
            userId,
            walletId: wallet.id,
            type: 'WITHDRAW',
            assetSymbol: 'BRL',
            amount: parseFloat(amount),
            price: null,
            BRLAmount: parseFloat(amount),
            status: 'COMPLETED',
        });

        res.status(200).json({
            message: `Saque de R$ ${parseFloat(amount).toFixed(2)} realizado com sucesso!`,
            newBalance: wallet.BRL,
        });

    } catch (error) {
        console.error('Erro ao sacar fundos:', error);
        res.status(500).json({ message: 'Erro no servidor ao processar saque.' });
    }
};

// @desc    Comprar um ativo cripto
// @route   POST /api/wallet/buy
// @access  Private
const buyAsset = async (req, res) => {
    const { assetSymbol, BRLAmount } = req.body; // Valor em BRL que o usuário quer gastar
    const userId = req.user.id;

    if (BRLAmount <= 0 || !assetSymbol) {
        return res.status(400).json({ message: 'Valor e símbolo do ativo são obrigatórios.' });
    }

    try {
        const wallet = await ensureUserWallet(userId);

        if (parseFloat(wallet.BRL) < parseFloat(BRLAmount)) {
            return res.status(400).json({ message: 'Saldo em BRL insuficiente para realizar a compra.' });
        }

        const currentPrice = await getAssetPrice(assetSymbol);
        if (currentPrice === null || currentPrice <= 0) {
            return res.status(400).json({ message: `Não foi possível obter o preço atual para ${assetSymbol}.` });
        }

        const assetAmount = parseFloat(BRLAmount) / currentPrice; // Quantidade de cripto a ser comprada

        // Atualiza o saldo BRL da carteira
        wallet.BRL = parseFloat(wallet.BRL) - parseFloat(BRLAmount);

        // Atualiza a quantidade do ativo na carteira (JSONB)
        const currentAssets = wallet.assets || {};
        currentAssets[assetSymbol.toUpperCase()] = (parseFloat(currentAssets[assetSymbol.toUpperCase()] || 0) + assetAmount).toFixed(8); // Garante 8 casas decimais
        wallet.assets = currentAssets;

        await wallet.save();

        // Registra a transação
        await Transaction.create({
            userId,
            walletId: wallet.id,
            type: 'BUY',
            assetSymbol: assetSymbol.toUpperCase(),
            amount: parseFloat(assetAmount.toFixed(8)), // Quantidade comprada do ativo
            price: currentPrice, // Preço no momento da compra
            BRLAmount: parseFloat(BRLAmount), // Valor em BRL gasto
            status: 'COMPLETED',
        });

        res.status(200).json({
            message: `Compra de ${assetAmount.toFixed(8)} ${assetSymbol.toUpperCase()} por R$ ${parseFloat(BRLAmount).toFixed(2)} realizada com sucesso!`,
            newBRLBalance: wallet.BRL,
            newAssetAmount: wallet.assets[assetSymbol.toUpperCase()],
        });

    } catch (error) {
        console.error('Erro ao comprar ativo:', error);
        res.status(500).json({ message: 'Erro no servidor ao processar compra.' });
    }
};

// @desc    Vender um ativo cripto
// @route   POST /api/wallet/sell
// @access  Private
const sellAsset = async (req, res) => {
    const { assetSymbol, assetAmount } = req.body; // Quantidade do ativo cripto que o usuário quer vender
    const userId = req.user.id;

    if (assetAmount <= 0 || !assetSymbol) {
        return res.status(400).json({ message: 'Quantidade e símbolo do ativo são obrigatórios.' });
    }

    try {
        const wallet = await ensureUserWallet(userId);
        const currentAssets = wallet.assets || {};
        const availableAmount = parseFloat(currentAssets[assetSymbol.toUpperCase()] || 0);

        if (availableAmount < parseFloat(assetAmount)) {
            return res.status(400).json({ message: `Quantidade insuficiente de ${assetSymbol.toUpperCase()} para realizar a venda.` });
        }

        const currentPrice = await getAssetPrice(assetSymbol);
        if (currentPrice === null || currentPrice <= 0) {
            return res.status(400).json({ message: `Não foi possível obter o preço atual para ${assetSymbol}.` });
        }

        const BRLReceived = parseFloat(assetAmount) * currentPrice; // Valor em BRL a ser recebido

        // Atualiza a quantidade do ativo na carteira
        currentAssets[assetSymbol.toUpperCase()] = (availableAmount - parseFloat(assetAmount)).toFixed(8);
        wallet.assets = currentAssets;

        // Atualiza o saldo BRL da carteira
        wallet.BRL = parseFloat(wallet.BRL) + BRLReceived;

        await wallet.save();

        // Registra a transação
        await Transaction.create({
            userId,
            walletId: wallet.id,
            type: 'SELL',
            assetSymbol: assetSymbol.toUpperCase(),
            amount: parseFloat(assetAmount), // Quantidade vendida do ativo
            price: currentPrice, // Preço no momento da venda
            BRLAmount: parseFloat(BRLReceived.toFixed(2)), // Valor em BRL recebido
            status: 'COMPLETED',
        });

        res.status(200).json({
            message: `Venda de ${parseFloat(assetAmount).toFixed(8)} ${assetSymbol.toUpperCase()} por R$ ${parseFloat(BRLReceived).toFixed(2)} realizada com sucesso!`,
            newBRLBalance: wallet.BRL,
            newAssetAmount: wallet.assets[assetSymbol.toUpperCase()],
        });

    } catch (error) {
        console.error('Erro ao vender ativo:', error);
        res.status(500).json({ message: 'Erro no servidor ao processar venda.' });
    }
};

// @desc    Obter histórico de transações do usuário
// @route   GET /api/wallet/transactions
// @access  Private
const getTransactions = async (req, res) => {
    const userId = req.user.id;

    try {
        const transactions = await Transaction.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']], // Ordena pelas mais recentes
        });

        res.status(200).json({
            message: 'Histórico de transações recuperado com sucesso!',
            transactions,
        });
    } catch (error) {
        console.error('Erro ao buscar histórico de transações:', error);
        res.status(500).json({ message: 'Erro no servidor ao buscar transações.' });
    }
};


// @desc    Obter saldo da carteira do usuário
// @route   GET /api/wallet/balance
// @access  Private
const getWalletBalance = async (req, res) => {
    const userId = req.user.id;

    try {
        const wallet = await ensureUserWallet(userId); // Garante que a carteira existe

        res.status(200).json({
            message: 'Saldo da carteira recuperado com sucesso!',
            BRLBalance: wallet.BRL,
            assets: wallet.assets,
        });

    } catch (error) {
        console.error('Erro ao buscar saldo da carteira:', error);
        res.status(500).json({ message: 'Erro no servidor ao buscar saldo da carteira.' });
    }
};


module.exports = {
    depositFunds,
    withdrawFunds,
    buyAsset,
    sellAsset,
    getTransactions,
    getWalletBalance,
};