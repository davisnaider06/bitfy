const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const { sequelize } = require('../config/database');
const axios = require('axios'); 

const BINANCE_API_BASE_URL = 'https://api.binance.com/api/v3';

const ensureUserWallet = async (userId, transactionContext) => {
    console.log(`[ensureUserWallet] Tentando garantir carteira para userId: ${userId}`); 
    try {
        let wallet = await Wallet.findOne({ where: { userId: userId }, transaction: transactionContext });

        if (!wallet) {
            console.log(`[ensureUserWallet] Carteira NÃO encontrada para userId: ${userId}. Criando nova carteira...`); 
            
            wallet = await Wallet.create({
                userId: userId,
                BRL: '0.00',
                assets: {}
            }, { transaction: transactionContext });
            console.log(`[ensureUserWallet] Nova carteira CRIADA com sucesso para userId: ${userId}. Saldo BRL: ${wallet.BRL}`);
        } else {
            console.log(`[ensureUserWallet] Carteira EXISTENTE encontrada para userId: ${userId}. Saldo BRL: ${wallet.BRL}`); 
        }
        return wallet;
    } catch (error) {
        console.error(`[ensureUserWallet] ERRO ao garantir/criar carteira para userId ${userId}:`, error); // Log de erro detalhado
        throw error;
    }
};

// @desc    Processar uma transação de compra/venda de ativo
// @route   POST /api/transactions/trade
// @access  Private
const processTrade = async (req, res) => {
    const { assetSymbol, amount, type } = req.body; // type: 'buy' ou 'sell'

    if (!req.user) {
        return res.status(401).json({ message: 'Não autorizado, usuário não logado.' });
    }

    if (!assetSymbol || !amount || parseFloat(amount) <= 0 || !['buy', 'sell'].includes(type)) {
        return res.status(400).json({ message: 'Dados da transação inválidos.' });
    }

    const userId = req.user._id;

    const session = await mongoose.startSession();
    session.startTransaction(); // Inicia uma transação de sessão para operações atômicas

    try {
        //0bter preço atual do ativo
        const priceResponse = await axios.get(`${BINANCE_API_BASE_URL}/ticker/price?symbol=${assetSymbol}`);
        const currentPrice = parseFloat(priceResponse.data.price);

        if (isNaN(currentPrice) || currentPrice <= 0) {
            await session.abortTransaction();
            session.endSession();
            return res.status(500).json({ message: `Não foi possível obter o preço atual de ${assetSymbol}.` });
        }

        //Encontrar ou criar a carteira do usuário (dentro da sessão)
        let wallet = await Wallet.findOne({ user: userId }).session(session);
        if (!wallet) {
            wallet = await Wallet.create([{ user: userId, BRL: 10000, assets: new Map() }], { session });
            wallet = wallet[0]; // create retorna um array
        }

        //calcular o valor em BRL da transação
        const fiatAmount = amount * currentPrice; //valor em BRL

        if (type === 'buy') {
            //lgc de Compra
            if (wallet.BRL < fiatAmount) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ message: 'Saldo insuficiente em BRL para esta compra.' });
            }

            //atualizar saldo BRL
            wallet.BRL -= fiatAmount;
            //Atualizar saldo do ativo. Usar um ativo base (ex BTC de BTCUSDT)
            const baseAssetSymbol = assetSymbol.replace('USDT', '');
            wallet.assets.set(baseAssetSymbol, (wallet.assets.get(baseAssetSymbol) || 0) + amount);

        } else { // type === 'sell'
            // Lógica de Venda
            const baseAssetSymbol = assetSymbol.replace('USDT', '');
            const userAssetAmount = wallet.assets.get(baseAssetSymbol) || 0;

            if (userAssetAmount < amount) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ message: `Quantidade insuficiente de ${baseAssetSymbol} para vender.` });
            }

            // Atualizar saldo do ativo
            wallet.assets.set(baseAssetSymbol, userAssetAmount - amount);
            // Atualizar saldo BRL
            wallet.BRL += fiatAmount;
        }

        // Salvar as alterações na carteira dentro da transação
        await wallet.save({ session });

        // Registrar a transação
        const transaction = await Transaction.create([{
            user: userId,
            type,
            assetSymbol,
            amount, // quantidade da cripto
            priceAtExecution: currentPrice,
            fiatAmount, // valor em BRL
            status: 'completed'
        }], { session });

        await session.commitTransaction(); // Confirma todas as operações da transação
        session.endSession();

        res.status(200).json({
            message: `${type === 'buy' ? 'Compra' : 'Venda'} de ${amount} ${assetSymbol.replace('USDT', '')} realizada com sucesso!`,
            transaction: transaction[0],
            currentWallet: wallet // Opcional: retornar o estado atual da carteira
        });

    } catch (error) {
        await session.abortTransaction(); // Desfaz todas as operações em caso de erro
        session.endSession();
        console.error('Erro ao processar transação:', error);
        res.status(500).json({ message: 'Erro no servidor ao processar a transação.', error: error.message });
    }
};

// @desc    Obter histórico de transações do usuário logado
// @route   GET /api/transactions/history
// @access  Private
const getTransactionHistory = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Não autorizado, usuário não logado.' });
    }
    try {
        const history = await Transaction.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(history);
    } catch (error) {
        console.error('Erro ao buscar histórico de transações:', error);
        res.status(500).json({ message: 'Erro no servidor ao obter histórico de transações.', error: error.message });
    }
};

// @desc    Obter saldo da carteira do usuário logado
// @route   GET /api/transactions/wallet
// @access  Private
const getUserWallet = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Não autorizado, usuário não logado.' });
    }
    try {
        const wallet = await ensureUserWallet(req.user._id); // Garante que a carteira existe
        res.status(200).json(wallet);
    } catch (error) {
        console.error('Erro ao buscar carteira do usuário:', error);
        res.status(500).json({ message: 'Erro no servidor ao obter carteira.', error: error.message });
    }
};

const createWalletOnUserRegister = async (userId) => {
    try {
        await Wallet.create({ user: userId, BRL: 0, assets: new Map() });
        console.log(`Carteira criada para o novo usuário: ${userId}`);
    } catch (error) {
        console.error(`Erro ao criar carteira para o usuário ${userId}:`, error);

    }
};

module.exports = {
    processTrade,
    getTransactionHistory,
    getUserWallet,
    createWalletOnUserRegister,
    ensureUserWallet
};