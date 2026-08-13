import { useWalletConnectModal } from "@walletconnect/modal-react-native";
import { ethers } from "ethers"; // For provider wrapping
import PropTypes from "prop-types";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Alert } from "react-native";
import { AuthContext } from "./AuthContext";
import { updateUserProfile } from "../services/apiService";

export const WalletContext = createContext({
  isConnected: false,
  address: null,
  provider: null, // This might be the WalletConnect provider instance
  ethersProvider: null, // Ethers.js wrapped provider
  connectWallet: () => {},
  disconnectWallet: () => {},
});

export const WalletProvider = ({ children }) => {
  const { open, isConnected, address, provider } = useWalletConnectModal();
  const [ethersProvider, setEthersProvider] = useState(null);
  const { isAuthenticated } = useContext(AuthContext);
  const lastSyncedAddressRef = useRef(null);

  // Wrap the WalletConnect provider with ethers.js when connected
  React.useEffect(() => {
    if (isConnected && provider) {
      // Wrap the WalletConnect provider with ethers.js BrowserProvider
      const web3Provider = new ethers.BrowserProvider(provider);
      setEthersProvider(web3Provider);
      console.log("Ethers provider set up for address:", address);
    } else {
      setEthersProvider(null);
    }
  }, [isConnected, provider, address]);

  // Persist the connected wallet to the user's backend profile, so
  // blockchainService.createLoanContract() has an address to attribute
  // this user's loans to on-chain once they later fund or apply. Only
  // runs for logged-in users, and only re-syncs when the address actually
  // changes (not on every re-render).
  useEffect(() => {
    if (!isAuthenticated || !isConnected || !address) {
      return;
    }
    if (lastSyncedAddressRef.current === address) {
      return;
    }
    lastSyncedAddressRef.current = address;
    updateUserProfile({ walletAddress: address }).catch((error) => {
      console.error("Failed to sync connected wallet to profile:", error);
      // Don't block wallet usage on this failing - the address is still
      // usable for the current action (e.g. passed directly when funding a
      // loan); it just won't be remembered for next time.
      lastSyncedAddressRef.current = null;
    });
  }, [isAuthenticated, isConnected, address]);

  const connectWallet = useCallback(async () => {
    try {
      if (!isConnected) {
        await open(); // Opens the WalletConnect modal
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      Alert.alert(
        "Connection Error",
        "Could not connect wallet. Please try again.",
      );
    }
  }, [isConnected, open]);

  const disconnectWallet = useCallback(async () => {
    try {
      if (isConnected && provider) {
        await provider.disconnect();
        setEthersProvider(null); // Clear ethers provider on disconnect
      }
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
      Alert.alert("Disconnection Error", "Could not disconnect wallet.");
    }
  }, [isConnected, provider]);

  const walletContextValue = useMemo(
    () => ({
      isConnected,
      address,
      provider, // Raw WalletConnect provider
      ethersProvider, // Ethers.js provider
      connectWallet,
      disconnectWallet,
    }),
    [
      isConnected,
      address,
      provider,
      ethersProvider,
      connectWallet,
      disconnectWallet,
    ],
  );

  return (
    <WalletContext.Provider value={walletContextValue}>
      {children}
    </WalletContext.Provider>
  );
};

WalletProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Custom hook for easy context usage
export const useWallet = () => useContext(WalletContext);
