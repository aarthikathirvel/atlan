// Mock data for different SQL queries
export const mockQueries = {
  'SELECT * FROM users': {
    columns: ['id', 'name', 'email', 'age', 'city', 'created_at'],
    rows: Array.from({ length: 10000 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      age: Math.floor(Math.random() * 50) + 18,
      city: ['New York', 'London', 'Tokyo', 'Paris', 'Sydney'][Math.floor(Math.random() * 5)],
      created_at: new Date(Date.now() - Math.random() * 10000000000).toISOString().split('T')[0],
    })),
  },
  'SELECT * FROM orders': {
    columns: ['order_id', 'customer_id', 'product', 'quantity', 'price', 'order_date', 'status'],
    rows: Array.from({ length: 5000 }, (_, i) => ({
      order_id: i + 1,
      customer_id: Math.floor(Math.random() * 1000) + 1,
      product: ['Laptop', 'Phone', 'Tablet', 'Monitor', 'Keyboard'][Math.floor(Math.random() * 5)],
      quantity: Math.floor(Math.random() * 5) + 1,
      price: (Math.random() * 2000 + 100).toFixed(2),
      order_date: new Date(Date.now() - Math.random() * 10000000000).toISOString().split('T')[0],
      status: ['Pending', 'Shipped', 'Delivered', 'Cancelled'][Math.floor(Math.random() * 4)],
    })),
  },
  'SELECT * FROM products': {
    columns: ['product_id', 'name', 'category', 'price', 'stock', 'supplier'],
    rows: Array.from({ length: 2000 }, (_, i) => ({
      product_id: i + 1,
      name: `Product ${i + 1}`,
      category: ['Electronics', 'Clothing', 'Food', 'Books', 'Toys'][Math.floor(Math.random() * 5)],
      price: (Math.random() * 500 + 10).toFixed(2),
      stock: Math.floor(Math.random() * 1000),
      supplier: `Supplier ${Math.floor(Math.random() * 50) + 1}`,
    })),
  },
  'SELECT * FROM employees': {
    columns: ['emp_id', 'first_name', 'last_name', 'department', 'salary', 'hire_date'],
    rows: Array.from({ length: 3000 }, (_, i) => ({
      emp_id: i + 1,
      first_name: ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Emily'][Math.floor(Math.random() * 6)],
      last_name: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia'][Math.floor(Math.random() * 6)],
      department: ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance'][Math.floor(Math.random() * 5)],
      salary: Math.floor(Math.random() * 100000) + 50000,
      hire_date: new Date(Date.now() - Math.random() * 10000000000).toISOString().split('T')[0],
    })),
  },
  'SELECT * FROM transactions': {
    columns: ['transaction_id', 'account_id', 'type', 'amount', 'balance', 'timestamp'],
    rows: Array.from({ length: 15000 }, (_, i) => ({
      transaction_id: i + 1,
      account_id: Math.floor(Math.random() * 500) + 1,
      type: ['Deposit', 'Withdrawal', 'Transfer'][Math.floor(Math.random() * 3)],
      amount: (Math.random() * 10000).toFixed(2),
      balance: (Math.random() * 100000).toFixed(2),
      timestamp: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
    })),
  },
};

// Default query templates
export const queryTemplates = [
  { name: 'Get All Users', query: 'SELECT * FROM users' },
  { name: 'Get All Orders', query: 'SELECT * FROM orders' },
  { name: 'Get All Products', query: 'SELECT * FROM products' },
  { name: 'Get All Employees', query: 'SELECT * FROM employees' },
  { name: 'Get All Transactions', query: 'SELECT * FROM transactions' },
];

// Helper function to get mock data for a query
export const executeQuery = (query) => {
  const normalizedQuery = query.trim().toUpperCase();
  
  // Find matching query
  for (const [key, data] of Object.entries(mockQueries)) {
    if (normalizedQuery.includes(key.toUpperCase())) {
      return {
        success: true,
        data: data,
        executionTime: Math.random() * 500 + 50, // Mock execution time in ms
        rowsAffected: data.rows.length,
      };
    }
  }
  
  // Default response for unmatched queries
  return {
    success: true,
    data: {
      columns: ['message'],
      rows: [{ message: 'Query executed successfully. No data returned.' }],
    },
    executionTime: Math.random() * 100 + 10,
    rowsAffected: 0,
  };
};

