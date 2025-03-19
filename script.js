let transactions = [];
let savingsGoal = 0;
let incomeExpenseChart;
let expenseCategoryChart;
let chatVisible = false;
let isDarkMode = false;

// Check for saved theme preference or default to light mode
if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    isDarkMode = true;
    document.getElementById('themeIcon').textContent = '🌜';
}

// Theme toggle function
function toggleTheme() {
    isDarkMode = !isDarkMode;
    const theme = isDarkMode ? 'dark' : 'light';
    const icon = isDarkMode ? '🌜' : '🌞';
    
    document.documentElement.setAttribute('data-theme', theme);
    document.getElementById('themeIcon').textContent = icon;
    localStorage.setItem('theme', theme);
    
    // Update chart colors if they exist
    if (incomeExpenseChart && expenseCategoryChart) {
        updateChartTheme();
    }
}

// Update chart colors based on theme
function updateChartTheme() {
    const textColor = isDarkMode ? '#fff' : '#000';
    
    // Update Income vs Expenses chart
    incomeExpenseChart.options.plugins.legend.labels.color = textColor;
    incomeExpenseChart.options.scales.x.ticks.color = textColor;
    incomeExpenseChart.options.scales.y.ticks.color = textColor;
    incomeExpenseChart.update();
    
    // Update Expense by Category chart
    expenseCategoryChart.options.plugins.legend.labels.color = textColor;
    expenseCategoryChart.update();
}

function login() {
    const email = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Basic email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailPattern.test(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    if (email && password) {
        // Hide login container
        const loginContainer = document.getElementById('loginContainer');
        loginContainer.style.display = 'none';
        
        // Show dashboard container and ensure it's visible
        const dashboardContainer = document.getElementById('dashboardContainer');
        dashboardContainer.style.display = 'block';
        dashboardContainer.style.visibility = 'visible';
        
        // Initialize charts after dashboard is visible
        initializeCharts();
        
        // Reset any form fields
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
    }
}


function initializeCharts() {
    const textColor = isDarkMode ? '#fff' : '#000';
    
    const incomeExpenseCtx = document.getElementById('incomeExpenseChart').getContext('2d');
    incomeExpenseChart = new Chart(incomeExpenseCtx, {
        type: 'bar',
        data: {
            labels: ['Total Income', 'Total Expenses'],
            datasets: [{
                label: 'Amount (₹)',
                data: [0, 0],
                backgroundColor: ['#2ecc71', '#e74c3c']
            }]
        },
        options: {
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: textColor
                    }
                },
                y: {
                    ticks: {
                        color: textColor
                    }
                }
            }
        }
    });

    
    const expenseCategoryCtx = document.getElementById('expenseCategoryChart').getContext('2d');
    expenseCategoryChart = new Chart(expenseCategoryCtx, {
        type: 'pie',
        data: {
            labels: ['Salary', 'Groceries', 'Rent', 'Entertainment', 'Bills', 'Shopping', 'Travel', 'Healthcare', 'Education', 'Others'],
            datasets: [{
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                backgroundColor: [
                    '#f1c40f', 
                    '#3498db', 
                    '#16a085', 
                    '#e74c3c', 
                    '#9b59b6', 
                    '#e67e22', 
                    '#2ecc71', 
                    '#1abc9c',
                    '#34495e', 
                    '#95a5a6'  
                ]
            }]
        },
        options: {
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        padding: 20,
                        boxWidth: 15
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            return `${label}: ₹${value}`;
                        }
                    }
                }
            }
        }
    });
}


function addTransaction() {
    const amount = parseFloat(document.getElementById('amount').value);
    const type = document.getElementById('type').value;
    const category = document.getElementById('category').value;

    if (amount) {
        transactions.push({
            amount,
            type,
            category
        });
        updateDashboard();
    }
}


function setSavingsGoal() {
    savingsGoal = parseFloat(document.getElementById('savingsGoal').value);
    updateDashboard();
}


function updateDashboard() {
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const netBalance = totalIncome - totalExpenses;


    document.getElementById('totalIncome').textContent = totalIncome;
    document.getElementById('totalExpenses').textContent = totalExpenses;
    document.getElementById('netBalance').textContent = netBalance;

    if (savingsGoal > 0) {
        const progress = (netBalance / savingsGoal) * 100;
        document.getElementById('goalProgress').textContent = progress.toFixed(1);
    }


    updateCharts(totalIncome, totalExpenses);
}


function updateCharts(totalIncome, totalExpenses) {

    incomeExpenseChart.data.datasets[0].data = [totalIncome, totalExpenses];
    incomeExpenseChart.update();

    
    const expensesByCategory = {
        salary: 0,
        groceries: 0,
        rent: 0,
        entertainment: 0,
        bills: 0,
        shopping: 0,
        travel: 0,
        healthcare: 0,
        education: 0,
        others: 0
    };

    transactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
            if (t.category in expensesByCategory) {
                expensesByCategory[t.category] += t.amount;
            } else {
                expensesByCategory.others += t.amount;
            }
        });


    expenseCategoryChart.data.datasets[0].data = Object.values(expensesByCategory);
    expenseCategoryChart.update();
}


function toggleChat() {
    const chatWidget = document.getElementById('chatWidget');
    chatVisible = !chatVisible;
    chatWidget.style.display = chatVisible ? 'flex' : 'none';
}


async function sendMessage() {
    const userInput = document.getElementById('userMessage');
    const message = userInput.value.trim();
    
    if (!message) return;
    

    addMessageToChat(message, 'user');
    userInput.value = '';
    
    const analysis = analyzeFinancialData();
    

    const response = generateAIResponse(message, analysis);
    addMessageToChat(response, 'bot');
}


function addMessageToChat(message, sender) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    messageDiv.textContent = message;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}


function analyzeFinancialData() {
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const netBalance = totalIncome - totalExpenses;
    
    
    const expensesByCategory = {};
    transactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
            expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
        });
    
    return {
        totalIncome,
        totalExpenses,
        netBalance,
        expensesByCategory,
        savingsGoal,
        savingsProgress: savingsGoal ? (netBalance / savingsGoal) * 100 : 0
    };
}


function generateAIResponse(message, analysis) {
    message = message.toLowerCase();
    
    
    if (message.includes('savings') || message.includes('goal')) {
        if (analysis.savingsGoal === 0) {
            return "You haven't set a savings goal yet. Would you like to set one?";
        }
        return `You've achieved ${analysis.savingsProgress.toFixed(1)}% of your savings goal. ` +
               `Your current balance is ₹${analysis.netBalance}.`;
    }
    
    
    if (message.includes('spending') || message.includes('expenses')) {
        const highestExpense = Object.entries(analysis.expensesByCategory)
            .sort(([,a], [,b]) => b - a)[0];
        return `Your highest expense category is ${highestExpense[0]} at ₹${highestExpense[1]}. ` +
               `Total expenses are ₹${analysis.totalExpenses}.`;
    }
    
    // Income analysis
    if (message.includes('income') || message.includes('earn')) {
        return `Your total income is ₹${analysis.totalIncome}. ` +
               `After expenses, your net balance is ₹${analysis.netBalance}.`;
    }
    
    // Budget advice
    if (message.includes('advice') || message.includes('help')) {
        const spendingRatio = (analysis.totalExpenses / analysis.totalIncome) * 100;
        if (spendingRatio > 80) {
            return "Your expenses are quite high relative to your income. Consider reducing spending in your highest expense categories.";
        } else if (spendingRatio > 50) {
            return "Your spending is moderate. To increase savings, look for areas where you can cut back on non-essential expenses.";
        } else {
            return "You're doing well at managing your expenses! Consider investing your surplus for long-term growth.";
        }
    }
    
    // Default response
    return "I can help you analyze your income, expenses, savings goals, or provide financial advice. What would you like to know?";
} 