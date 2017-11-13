class Auth {
    static authenticateUser(token) {
        localStorage.setItem('token', token);
    }

    static isUserAuthenticated() {
        return localStorage.getItem('token') !== null;
    }

    static deauthenticateUser() {
        localStorage.removeItem('token');
    }

    static getToken() {
        return localStorage.getItem('token');
    }

    static getAutherizationHeader() {
        return {
            Authorization: `Basic ${Auth.getToken()}`
        };
    }
}

export default Auth;