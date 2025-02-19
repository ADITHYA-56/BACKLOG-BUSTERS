let transactions = [];
let savingsGoal = 0;
let incomeExpenseChart;
let expenseCategoryChart;
let chatVisible = false;

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username && password) {
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('dashboardContainer').style.display = 'block';
        initializeCharts();
    }
}


function initializeCharts() {
    
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
    const userInput = document.getElementById("userInput");
    const message = userInput.value.trim();
    if (!message) return;

    const messagesDiv = document.getElementById("messages");
    messagesDiv.innerHTML += `<p class='user-message'><strong>You:</strong> ${message}</p>`;

    // Get financial analysis
    const analysis = analyzeFinancialData();
    
    // Add financial context to the prompt
    const contextPrompt = `
        Financial Context:
        Total Income: ₹${analysis.totalIncome}
        Total Expenses: ₹${analysis.totalExpenses}
        Net Balance: ₹${analysis.netBalance}
        Savings Goal: ₹${analysis.savingsGoal}
        Savings Progress: ${analysis.savingsProgress.toFixed(1)}%
        
        User Question: ${message}
        
        Please provide financial advice based on this data.
    `;

    try {
        const response = await fetch("https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=AIzaSyBRmtLGKkv0GLut0tvcXTdTy-1BClsHp5g", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                contents: [{ 
                    parts: [{ text: contextPrompt }] 
                }] 
            })
        });

        const data = await response.json();
        const aiResponse = data.candidates[0].content.parts[0].text || "I apologize, but I'm having trouble analyzing your financial data right now.";

        messagesDiv.innerHTML += `<p class='ai-message'><strong>Assistant:</strong> ${aiResponse}</p>`;
        userInput.value = "";
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    } catch (error) {
        console.error('Error:', error);
        messagesDiv.innerHTML += `<p class='ai-message'><strong>Assistant:</strong> I apologize, but I'm having trouble connecting right now. Please try again later.</p>`;
    }
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
    
    
    if (message.includes('income') || message.includes('earn')) {
        return `Your total income is ₹${analysis.totalIncome}. ` +
               `After expenses, your net balance is ₹${analysis.netBalance}.`;
    }
    
    
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
    
    
    return "I can help you analyze your income, expenses, savings goals, or provide financial advice. What would you like to know?";
} 