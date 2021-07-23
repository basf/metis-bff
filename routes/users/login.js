module.exports = {
    post,
    delete: del,
};

const credentials = {
    login: 'basf',
    password: 'fsab'
};
async function post(req, res) {
    const { login, password } = req.body;

    if (login !== credentials.login || password !== credentials.password) {
        return res.status(400).json({ message: 'Bad credentials' });
    }

    req.session.user = {
        email: 'albert-mileva-elsa-einstein-junior@basf.science',
        firstname: 'Albert',
        lastname: 'Einstein',
    };

    return res.status(204).end();
}

async function del(req, res) {
    delete req.session.user;
    return res.status(204).end();
}