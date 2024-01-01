import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pin, setPin] = useState("");
  const [withdrawalPin, setWithdrawalPin] = useState("");
  const [amount, setAmount] = useState("");
  const [transactionMessage, setTransactionMessage] = useState("");
  const [currentDateTime, setCurrentDateTime] = useState("");

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(new ethers.providers.Web3Provider(window.ethereum));
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected:", account);
      setAccount(account[0]);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    if (!isLoggedIn) {
      try {
        const isAuthenticated = await authenticateUser(pin);
        if (!isAuthenticated) {
          alert("Authentication failed. Please check your credentials.");
          return;
        }
        setIsLoggedIn(true);
      } catch (error) {
        console.error("Authentication error:", error);
      }
    }

    try {
      const accounts = await ethWallet.send("eth_requestAccounts");
      handleAccount(accounts);
      getATMContract();
      getBalance(); // Update balance when connecting account
    } catch (error) {
      console.error("Error connecting account:", error);
    }
  };

  const authenticateUser = async (enteredPin) => {
    // Replace this with your actual authentication logic (e.g., check username, password, or PIN)
    return enteredPin === "1234";
  };

  const getATMContract = () => {
    const signer = ethWallet.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);
    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      const balance = await atm.getBalance();
      setBalance(parseInt(ethers.utils.formatEther(balance), 10));
    }
  };

  const deposit = async () => {
    if (atm && amount) {
      try {
        const parsedAmount = ethers.utils.parseEther(amount);
        const tx = await atm.deposit(parsedAmount);
        await tx.wait();
        setTransactionMessage(
          `Deposited ${amount} ETH. Transaction Hash: ${tx.hash}`
        );
      } catch (error) {
        console.error("Deposit error:", error);
        setTransactionMessage(`Deposit failed. Error: ${error.message}`);
      }
      // Update balance after a successful deposit
      getBalance();
    }
  };

  const withdraw = async () => {
    if (atm && amount) {
      if (!withdrawalPin) {
        alert("Withdrawal PIN is required");
        return;
      }
      try {
        const isAuthenticated = await authenticateUser(withdrawalPin);
        if (!isAuthenticated) {
          alert(
            "Authentication failed for withdrawal. Please check your credentials."
          );
          return;
        }

        const parsedAmount = ethers.utils.parseEther(amount);
        const tx = await atm.withdraw(parsedAmount);
        await tx.wait();
        setTransactionMessage(
          `Withdrawn ${amount} ETH. Transaction Hash: ${tx.hash}`
        );
      } catch (error) {
        console.error("Withdrawal error:", error);
        setTransactionMessage(`Withdrawal failed. Error: ${error.message}`);
      }
      // Update balance after a successful withdrawal
      getBalance();
    }
  };

  const updateDateTime = () => {
    const now = new Date();
    setCurrentDateTime(now.toLocaleString());
  };

  useEffect(() => {
    getWallet();
    // Set up an interval to update the date and time every second
    const intervalId = setInterval(updateDateTime, 1000);
    return () => clearInterval(intervalId); // Cleanup on component unmount
  }, []);

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install MetaMask to use this ATM.</p>;
    }

    if (!isLoggedIn) {
      return (
        <div>
          <label>
            Enter PIN:
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
            />
          </label>
          <button onClick={connectAccount}>Login</button>
        </div>
      );
    }

    if (!account) {
      return (
        <button onClick={connectAccount}>
          Please connect your MetaMask wallet
        </button>
      );
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <label>
          Enter Amount (ETH):
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </label>
        <button onClick={deposit}>Deposit</button>
        <div>
          <label>
            Withdrawal PIN:
            <input
              type="password"
              value={withdrawalPin}
              onChange={(e) => setWithdrawalPin(e.target.value)}
            />
          </label>
          <button onClick={withdraw}>Withdraw</button>
        </div>
        {transactionMessage && <p>{transactionMessage}</p>}
      </div>
    );
  };

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Metacrafters ATM!</h1>
      </header>
      <div className="dateTime">{currentDateTime}</div>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
          background-color: yellow; /* Yellow background color */
        }
        .dateTime {
          position: absolute;
          top: 10px;
          right: 10px;
        }
      `}</style>
    </main>
  );
}
