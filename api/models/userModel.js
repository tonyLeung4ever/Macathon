let users = [];
let idCounter = 1;

const userModel = {
    getAll: () => users,
    
    getById: (id) => users.find(user => user.id === id),
    
    create: (userData) => {
        const newUser = { id: idCounter++, ...userData };
        users.push(newUser);
        return newUser;
    },
    
    update: (id, userData) => {
        const index = users.findIndex(user => user.id === id);
        if (index === -1) return null;
        
        users[index] = { ...users[index], ...userData };
        return users[index];
    },
    
    delete: (id) => {
        const index = users.findIndex(user => user.id === id);
        if (index === -1) return null;
        
        return users.splice(index, 1)[0];
    }
};

module.exports = userModel; 