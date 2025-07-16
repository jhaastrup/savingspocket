import React, { useState, useEffect } from 'react';
import UseALATPay from 'react-alatpay'; // Import the ALATPay hook

// Main App component
function App() {
  // State for total balance
  const [balance, setBalance] = useState(25000.00); // Initial mock balance

  // State for recent transactions (mock data)
  const [transactions, setTransactions] = useState([
    { id: 1, type: 'Deposit', amount: 5000.00, date: '2024-07-10', status: 'Completed' },
    { id: 2, type: 'Withdrawal', amount: 1200.00, date: '2024-07-08', status: 'Completed' },
    { id: 3, type: 'Deposit', amount: 10000.00, date: '2024-07-05', status: 'Completed' },
    { id: 4, type: 'Fee', amount: 50.00, date: '2024-07-01', status: 'Completed' },
  ]);

  // State to manage the payment initiation status and messages
  const [paymentStatus, setPaymentStatus] = useState(null); // null, 'initiating', 'success', 'failed'
  const [paymentMessage, setPaymentMessage] = useState('');

  // State to control the visibility of the funding amount modal
  const [showFundModal, setShowFundModal] = useState(false);
  // State to store the amount entered by the user in the modal
  const [fundingAmount, setFundingAmount] = useState('');

  // ALATPay SDK configuration using the UseALATPay hook
  // IMPORTANT: Replace 'YOUR_ALATPAY_API_KEY' and 'YOUR_ALATPAY_BUSINESS_ID'
  // with your actual credentials for production.
  // Now fetching keys from .env file using Vite's import.meta.env
  const ALATPAY_API_KEY = import.meta.env.VITE_ALATPAY_API_KEY;
  const ALATPAY_BUSINESS_ID = import.meta.env.VITE_ALATPAY_BUSINESS_ID;


  // Define the ALATPay instance using the hook
  // The 'amount' parameter will now be dynamic, based on 'fundingAmount' state
  const alatpay = UseALATPay({
    amount: parseFloat(fundingAmount) || 0, // Use the dynamic amount, default to 0 if invalid
    apiKey: ALATPAY_API_KEY,
    businessId: ALATPAY_BUSINESS_ID,
    currency: "NGN",
    email: "user@example.com", // Placeholder email - make dynamic
    firstName: "John", // Placeholder first name - make dynamic
    lastName: "Doe",   // Placeholder last name - make dynamic
    color: "#000000", // Custom color for the payment modal
    metadata: { app: "SavingsPocket", purpose: "Funding" }, // Example metadata
    phone: "08012345678", // Placeholder phone number - make dynamic
    onClose: () => {
      // Callback when the ALATPay modal is closed by the user
      console.log("ALATPay modal closed.");
      setPaymentStatus(null); // Clear status if closed
      setPaymentMessage('Payment process cancelled.');
      setShowFundModal(false); // Close modal if open 
      window.location.reload(); // Refresh the page
    },
    onTransaction: (response) => {
      // Callback when a transaction is completed (success or failure)
      console.log("ALATPay Transaction response:", response);
      setShowFundModal(false); // Close modal after transaction attempt
      if (response && response.status === 'success') {
        setPaymentStatus('success');
        setPaymentMessage('Account funded successfully!');
        // Use the amount from the response or the fundingAmount state for consistency
        const depositedAmount = parseFloat(fundingAmount) || 0;
        setBalance(prevBalance => prevBalance + depositedAmount);
        const newTransaction = {
          id: Date.now(),
          type: 'Deposit',
          amount: depositedAmount,
          date: new Date().toISOString().slice(0, 10),
          status: 'Completed',
        };
        setTransactions(prevTransactions => [newTransaction, ...prevTransactions]);
      } else {
        setPaymentStatus('failed');
        setPaymentMessage(`Payment failed: ${response?.message || 'Unknown error'}`);
      }
      setFundingAmount(''); // Clear the input field
    }
  });


  // Function to open the funding amount modal
  const handleFundAccountClick = () => {
    setPaymentStatus(null); // Clear previous payment status
    setPaymentMessage('');
    setFundingAmount(''); // Clear previous amount
    setShowFundModal(true);
  };

  // Function to initiate ALATPay payment after amount is entered
  const initiatePaymentWithAmount = () => {
    const amount = parseFloat(fundingAmount);
    if (isNaN(amount) || amount <= 0) {
      setPaymentStatus('failed');
      setPaymentMessage('Please enter a valid amount.');
      return;
    }

    setPaymentStatus('initiating');
    setPaymentMessage('Initiating payment...');
    setShowFundModal(false); // Close the amount input modal

    try {
      // Trigger the ALATPay payment modal with the dynamic amount
      // The 'alatpay' hook instance already has the updated 'amount' from state
      alatpay.submit();
    } catch (error) {
      console.error("Error initiating ALATPay:", error);
      setPaymentStatus('failed');
      setPaymentMessage('Failed to open payment gateway. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 font-inter text-gray-800 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 sm:p-8 rounded-b-3xl">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-center">Savings Pocket</h1>
          <p className="text-lg sm:text-xl text-center opacity-90">Your financial companion</p>
        </div>

        {/* Balance Section */}
        <div className="p-6 sm:p-8 text-center">
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5 mb-6 shadow-sm">
            <p className="text-lg text-purple-700 font-medium">Total Balance</p>
            <p className="text-4xl sm:text-5xl font-extrabold text-purple-800 mt-2">
              ₦{balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          {/* Fund Account Button */}
          <button
            onClick={handleFundAccountClick} // Now opens the modal
            disabled={paymentStatus === 'initiating'} // Disable button while payment is initiating
            className={`w-full font-semibold py-4 px-6 rounded-2xl shadow-lg transform transition duration-300 ease-in-out focus:outline-none focus:ring-4
              ${paymentStatus === 'initiating'
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-105 focus:ring-indigo-300'
              }`}
          >
            {paymentStatus === 'initiating' ? 'Opening Payment...' : 'Fund Account'}
          </button>

          {/* Payment Status Message */}
          {paymentStatus && paymentStatus !== 'initiating' && (
            <div className={`mt-4 p-3 rounded-lg text-sm font-medium
              ${paymentStatus === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {paymentMessage}
            </div>
          )}
        </div>

        {/* Recent Transactions Section */}
        <div className="bg-gray-50 p-6 sm:p-8 rounded-t-3xl border-t border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-5">Recent Transactions</h2>
          {transactions.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No transactions yet.</p>
          ) : (
            <ul className="space-y-4">
              {transactions.map(transaction => (
                <li
                  key={transaction.id}
                  className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100"
                >
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-4
                      ${transaction.type === 'Deposit' ? 'bg-green-100 text-green-600' :
                         transaction.type === 'Withdrawal' ? 'bg-red-100 text-red-600' :
                         'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {/* Simple icon based on type */}
                      {transaction.type === 'Deposit' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      )}
                      {transaction.type === 'Withdrawal' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                        </svg>
                      )}
                      {transaction.type === 'Fee' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      {/* Placeholder for pending/loading state if needed */}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{transaction.type}</p>
                      <p className="text-sm text-gray-500">{transaction.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-lg
                      ${transaction.type === 'Deposit' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'Deposit' ? '+' : '-'}₦{transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className={`text-sm font-medium
                      ${transaction.status === 'Completed' ? 'text-green-500' : 'text-orange-500'}`}>
                      {transaction.status}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Funding Amount Input Modal */}
        {showFundModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm transform transition-all scale-100 opacity-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Enter Funding Amount</h3>
              <input
                type="number"
                placeholder="e.g., 10000"
                value={fundingAmount}
                onChange={(e) => setFundingAmount(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg mb-4 text-lg focus:ring-indigo-500 focus:border-indigo-500"
                min="1"
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowFundModal(false)}
                  className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition duration-150"
                >
                  Cancel
                </button>
                <button
                  onClick={initiatePaymentWithAmount}
                  className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition duration-150"
                >
                  Fund Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
