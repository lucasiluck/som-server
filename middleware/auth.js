const jwt = require('jsonwebtoken');
const Funcionario = require('../models/Funcionario'); 

const auth = async (req, res, next) => {
    try {
        // Pega o token do cabeçalho da requisição
        const token = req.headers.authorization?.split(" ")[1]; 

        if (!token) {
            return res.status(401).json({ error: 'Token não fornecido. Acesso não autorizado.' });
        }

        // Verifica e decodifica o token usando sua chave secreta
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decodedToken;

        //Verificar se o usuário ainda existe no banco
        const usuario = await Funcionario.findByPk(req.user.id);
        if (!usuario) {
            throw new Error('Usuário não encontrado.');
         }
        next();

    } catch (error) {
        console.error("Erro no middleware de autenticação:", error.message);
        return res.status(401).json({ error: 'Token inválido ou expirado.' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.tipo)) {
            return res.status(403).json({ error: 'Acesso negado. Você não tem a permissão necessária.' });
        }
        next();
    };
};

module.exports = { auth, authorize };