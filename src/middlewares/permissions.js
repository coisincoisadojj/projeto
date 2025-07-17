const permissions = {
  admin: ['createBook', 'updateBook', 'deleteBook', 'renewLoan'],
  bibliotecario: ['createBook', 'renewLoan'],
  leitor: ['borrowBook', 'returnBook']
};

module.exports = permissions;
