import '@rainbow-me/rainbowkit/styles.css';

import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
  polygonAmoy,
  sepolia,
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from '@tanstack/react-query';

const config = getDefaultConfig({
  appName: 'AutoTrade Procurement dApp',
  projectId: 'YOUR_PROJECT_ID', // Get this from WalletConnect Cloud
  chains: [polygonAmoy, sepolia],
  ssr: false, // If your dApp uses server side rendering (SSR)
});

const queryClient = new QueryClient();

export { config, queryClient, RainbowKitProvider, WagmiProvider, QueryClientProvider };