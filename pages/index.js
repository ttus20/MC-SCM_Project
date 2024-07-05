import { useState, useEffect } from "react";
import { ethers } from "ethers";
import donation_abi from "../artifacts/contracts/Assessment.sol/Donation.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [donationContract, setDonationContract] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [donationHistory, setDonationHistory] = useState([]);
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with your contract address
  const donationABI = donation_abi.abi;
  const [amount, setAmount] = useState(undefined);

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts);
    }
  }

  const handleAccount = (accounts) => {
    if (accounts.length > 0) {
      console.log("Account connected: ", accounts[0]);
      setAccount(accounts[0]);
    } else {
      console.log("No account found");
    }
  }

  const connectAccount = async () => {
    if (!ethWallet) {
      alert('MetaMask wallet is required to connect');
      return;
    }

    const accounts = await ethWallet.request({ method: 'eth_requestAccounts' });
    handleAccount(accounts);

    // once wallet is set we can get a reference to our deployed contract
    getDonationContract();
  };

  const getDonationContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const donationContract = new ethers.Contract(contractAddress, donationABI, signer);

    setDonationContract(donationContract);
  }

  const getBalance = async () => {
    if (donationContract) {
      const balance = await donationContract.getBalance();
      setBalance(balance.toNumber());
    }
  }

  const deposit = async () => {
    if (donationContract) {
      const tx = await donationContract.deposit(amount);
      await tx.wait();
      await getBalance();
      await getHistory();
    }
  }

  const getHistory = async () => {
    if (donationContract) {
      const historyArray = await donationContract.getHistory();
      // Convert BigNumber array to string array for display
      const historyStrings = historyArray.map(item => item.toString());
      setDonationHistory(historyStrings);
    }
  }

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this donation site.</p>
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return <button onClick={connectAccount}>Connect your MetaMask Wallet!</button>
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div className="container">
        <p className="text">Your Account: {account}</p>
        <p className="text">Contract Balance: {balance} ETH</p>
        <input
          type="number"
          className="input"
          placeholder="Enter Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button className="button" onClick={deposit}>Donate ETH</button>
        <h2 className="text">Donation History</h2>
        <ul className="list">
          {donationHistory.map((value, index) => (
            <li key={index} className="text">{value} ETH</li>
          ))}
        </ul>
      </div>
    )
  }

  useEffect(() => { getWallet(); }, []);

  return (
    <main className="main">
      <header><h1 className="title">Welcome to the MetaMask Donation!</h1></header>
      {initUser()}
      <style jsx global>{`
        body {
          background-color: #1a1a1a;
          color: #fff;
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
        }

        .main {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }

        .container {
          text-align: center;
          background-color: #333;
          color: #fff;
          padding: 20px;
          border-radius: 10px;
          margin: 20px;
          width: 80%;
          max-width: 600px;
        }

        .text {
          color: #fff;
          margin-bottom: 10px;
        }

        .input {
          padding: 10px;
          margin-bottom: 10px;
          border: 1px solid #ccc;
          border-radius: 5px;
          background-color: #444;
          color: #fff;
          width: 100%;
          box-sizing: border-box;
        }

        .button {
          padding: 10px 20px;
          background-color: #4CAF50;
          color: #fff;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          margin-top: 10px;
        }

        .button:hover {
          background-color: #45a049;
        }

        .list {
          list-style-type: none;
          padding: 0;
        }

        .list li {
          margin-bottom: 5px;
        }

        .title {
          color: #fff;
        }
      `}
      </style>
    </main>
  )
}
