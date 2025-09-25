# 🚀 Line Crypto - Web3 Gaming & Rewards Platform

[![Version](https://img.shields.io/badge/version-0.2.0-blue.svg)](package.json)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Yellow Network](https://img.shields.io/badge/Yellow-Network-yellow.svg)](https://yellow.com)
[![Nitrolite SDK](https://img.shields.io/badge/Nitrolite-SDK-purple.svg)](https://docs.yellow.org)

A cutting-edge Web3 gaming platform that seamlessly integrates blockchain rewards with an intuitive Web2-like user experience. Built on Yellow Network's state channels for lightning-fast, low-cost transactions.

## 🎯 **Overview**

Line Crypto bridges the gap between traditional gaming and decentralized finance, offering:

- **🎮 Multiple Games**: Unity WebGL and HTML5 games with real crypto rewards
- **⚡ Instant Rewards**: Yellow Network state channels for sub-second transactions
- **📱 Mobile-First**: Optimized for mobile with MetaMask deep linking
- **🔗 Web3 Native**: MetaMask integration with automatic session management
- **🎁 Daily Rewards**: Streak-based reward system with confetti celebrations
- **👥 Social Features**: Referral system and friend leaderboards

---

## 🏗️ **Architecture**

### **Frontend Stack**

- **React 18** - Modern UI with hooks and context
- **Redux Toolkit** - Centralized state management
- **Framer Motion** - Smooth animations and transitions
- **TailwindCSS** - Utility-first styling
- **React Router** - Client-side routing

### **Web3 Integration**

- **Yellow Network** - Layer 2 state channels for scalability
- **Nitrolite SDK** - Official SDK for Yellow Network integration
- **Viem** - TypeScript-first Ethereum library
- **MetaMask** - Wallet connection with mobile deep linking
- **EIP-712** - Structured data signing for security

### **Backend Services**

- **Firebase** - User data, tasks, and progress tracking
- **Yellow ClearNode** - WebSocket connection for real-time state
- **Session Management** - JWT tokens and session keys

---

## 🎮 **Core Features**

### **1. Gaming Hub**

| Game                 | Type        | Description                       |
| -------------------- | ----------- | --------------------------------- |
| **Line Game**        | Unity WebGL | Physics-based line drawing puzzle |
| **Space Game**       | Unity WebGL | Arcade-style space shooter        |
| **Endless Car Game** | HTML5       | Infinite runner racing game       |

**Reward System:**

- ✅ Real USDC rewards with connected wallet
- 🎭 Mock coins for offline play
- 🎫 Ticket-based game access
- 🏆 Performance-based scoring

### **2. Wallet Integration**

**MetaMask Connection:**

```javascript
// Smart mobile detection with deep linking
const connectWallet = async () => {
  if (isMobile() && !isMetaMaskInstalled()) {
    // Redirect to MetaMask mobile browser
    openMetaMaskDeepLink();
  }
  // Desktop wallet connection
  const client = createWalletClient({...});
};
```

**Features:**

- 🔄 Automatic reconnection
- 📱 Mobile MetaMask deep linking
- 🔐 Session key management
- ⚡ Real-time balance updates

### **3. Yellow Network Integration**

**State Channel Management:**

```javascript
// Automatic authentication flow
const useClearNodeConnection = (url, walletClient) => {
  // EIP-712 signature-based auth
  // Session key generation
  // WebSocket connection management
  // Balance synchronization
};
```

**Capabilities:**

- 🔗 Automatic channel creation
- 💸 P2P transfers
- 📊 Real-time balance tracking
- 🔄 Session restoration

---

## 🚀 **Getting Started**

### **Prerequisites**

- Node.js 16+
- npm or yarn
- MetaMask wallet
- Yellow Network account

### **Installation**

1. **Clone the repository:**

```bash
git clone <repository-url>
cd line_crypto
```

2. **Install dependencies:**

```bash
npm install
```

3. **Configure environment:**

```bash
cp env.example .env
```

4. **Update `.env` with your values:**

```env
# Get these from https://apps.yellow.com
REACT_APP_NITROLITE_APP_ADDRESS=your_app_address
REACT_APP_NITROLITE_CHANNEL_ID=your_channel_id

# Network configuration
REACT_APP_CLEARNODE_WS_URL=wss://clearnet.yellow.com/ws

# Firebase configuration
REACT_APP_SECRET_KEY=your_firebase_key
```

5. **Start development server:**

```bash
npm start
```

### **Production Build**

```bash
npm run build
```

---

## 📂 **Project Structure**

```
line_crypto/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── navbar.jsx       # Bottom navigation
│   │   ├── modal.jsx        # Modal system
│   │   └── customButton.jsx # Themed buttons
│   ├── pages/               # Main application pages
│   │   ├── dashboard.jsx    # Home dashboard
│   │   ├── gameCenter.jsx   # Game selection
│   │   ├── wallet.jsx       # Wallet management
│   │   ├── lineGame.jsx     # Unity game wrapper
│   │   ├── spaceGame.jsx    # Unity space game
│   │   ├── endlessCarGame.jsx # HTML5 racing game
│   │   └── modals/          # Modal components
│   ├── hooks/               # Custom React hooks
│   │   ├── useClearNodeConnection.jsx # Yellow Network
│   │   └── useTransfer.js   # P2P transfers
│   ├── lib/                 # Core libraries
│   │   ├── redux/           # State management
│   │   ├── firebase/        # Backend integration
│   │   ├── websocketSimple.js # WebSocket service
│   │   └── sessionUtils.js  # Session management
│   └── constants/           # Static assets & config
├── public/                  # Static assets
└── package.json            # Dependencies & scripts
```

---

## 🔧 **Configuration**

### **Environment Variables**

| Variable                          | Description                           | Required |
| --------------------------------- | ------------------------------------- | -------- |
| `REACT_APP_NITROLITE_APP_ADDRESS` | Your app address from apps.yellow.com | ✅       |
| `REACT_APP_NITROLITE_CHANNEL_ID`  | Your channel ID from Yellow Network   | ✅       |
| `REACT_APP_CLEARNODE_WS_URL`      | WebSocket endpoint for ClearNode      | ✅       |
| `REACT_APP_SECRET_KEY`            | Firebase authentication key           | ✅       |
| `REACT_APP_APP_NAME`              | Application display name              | ✅       |
| `REACT_APP_AUTH_SCOPE`            | Authentication scope identifier       | ✅       |

### **Yellow Network Setup**

1. **Create Application:**

   - Visit [apps.yellow.com](https://apps.yellow.com)
   - Create new application
   - Copy app address and channel ID

2. **Configure Wallet:**

   - Install MetaMask
   - Connect to mainnet
   - Ensure sufficient ETH for gas

3. **Test Connection:**
   - Run the app
   - Connect wallet
   - Verify Yellow Network status

---

## 🎮 **Game Integration**

### **Adding New Games**

1. **Unity WebGL Games:**

```javascript
// Add to gameCenter.jsx
const apps = [
  {
    id: "app_new_game",
    icon: icons.NewGameIcon,
    type: "internal",
    link: "/new_game",
    name: "New Game",
  },
];

// Create game component
const NewGame = () => {
  const { sendMessage, addEventListener } = useUnityContext({
    loaderUrl: "/unity/newgame/Build.loader.js",
    dataUrl: "/unity/newgame/Build.data",
    frameworkUrl: "/unity/newgame/Build.framework.js",
    codeUrl: "/unity/newgame/Build.wasm",
  });

  // Game logic and reward handling
};
```

2. **HTML5 Games:**

```javascript
// Create React component with game logic
const HTML5Game = () => {
  const [gameState, setGameState] = useState({
    score: 0,
    level: 1,
    gameOver: false,
  });

  // Implement game mechanics
  // Handle reward distribution
};
```

---

## 📱 **Mobile Support**

### **MetaMask Deep Linking**

The app automatically detects mobile browsers and provides MetaMask deep linking:

```javascript
const openMetaMaskDeepLink = () => {
  const metamaskUrl = `https://metamask.app.link/dapp/${window.location.host}`;
  window.open(metamaskUrl, "_blank");
};
```

### **Responsive Design**

- Mobile-first TailwindCSS classes
- Touch-optimized controls
- Adaptive layouts for all screen sizes
- Optimized game performance

---

## 🔐 **Security Features**

### **Session Management**

- **EIP-712 Signatures** - Structured data signing for authentication
- **Session Keys** - Temporary keys for secure message signing
- **JWT Tokens** - Secure re-authentication without wallet prompts
- **Automatic Expiry** - Session timeout and renewal

### **State Channels**

- **Off-chain Security** - Cryptographic proofs for all transactions
- **Instant Finality** - No waiting for blockchain confirmation
- **Low Costs** - Minimal gas fees for settlement
- **Dispute Resolution** - On-chain arbitration if needed

---

## 🎨 **UI/UX Features**

### **Animations**

- **Framer Motion** - Smooth page transitions
- **Confetti Effects** - Reward celebrations
- **Loading States** - Visual feedback for all actions
- **Micro-interactions** - Button hovers and clicks

### **Theme System**

- **Purple/Indigo Gradient** - Consistent brand colors
- **Dark Mode** - Eye-friendly design
- **Glassmorphism** - Modern transparent elements
- **Responsive Typography** - Scalable text system

---

## 🧪 **Testing**

### **Running Tests**

```bash
npm test
```

### **Build Verification**

```bash
npm run build
```

### **Manual Testing Checklist**

- [ ] Wallet connection (desktop & mobile)
- [ ] Game launches and reward distribution
- [ ] Daily reward claims
- [ ] Yellow Network integration
- [ ] Responsive design across devices

---

## 🚀 **Deployment**

### **Build for Production**

```bash
npm run build
```

### **Environment Setup**

1. **Production Environment Variables:**

   - Update `REACT_APP_CLEARNODE_WS_URL` to mainnet
   - Configure production Firebase keys
   - Set production app addresses

2. **Static Hosting:**
   - Deploy `build/` folder to any static host
   - Ensure proper routing configuration
   - Set up HTTPS (required for MetaMask)

### **Recommended Platforms**

- **Vercel** - Zero-config deployments
- **Netlify** - Continuous deployment
- **AWS S3 + CloudFront** - Enterprise scale
- **GitHub Pages** - Free hosting

---

## 🆘 **Troubleshooting**

### **Common Issues**

**"Please install MetaMask" on mobile:**

- Use the "Open in MetaMask" button
- Ensure MetaMask mobile app is installed
- Open the app within MetaMask's browser

**"Invalid challenge or signature" error:**

- Verify `.env` configuration
- Check app address and channel ID
- Ensure wallet has ETH for gas fees

**Games not loading:**

- Check Unity build files in `public/unity/`
- Verify game assets are properly deployed
- Check browser console for errors

**WebSocket connection issues:**

- Verify `REACT_APP_CLEARNODE_WS_URL`
- Check firewall settings
- Ensure stable internet connection

---

## 🤝 **Contributing**

### **Development Workflow**

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### **Code Standards**

- **ESLint** - JavaScript linting
- **Prettier** - Code formatting
- **Component Documentation** - PropTypes and JSDoc
- **Commit Messages** - Conventional commits format

---

## 📚 **Documentation**

### **Additional Resources**

- [Yellow Network Documentation](https://docs.yellow.org)
- [Nitrolite SDK Reference](https://github.com/erc7824/nitrolite)
- [React Documentation](https://reactjs.org)
- [Redux Toolkit Guide](https://redux-toolkit.js.org)

### **API References**

- [Yellow Network API](https://docs.yellow.org/api)
- [MetaMask API](https://docs.metamask.io)
- [Firebase API](https://firebase.google.com/docs)

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🎉 **Acknowledgments**

- **Yellow Network** - State channel infrastructure
- **MetaMask** - Wallet integration
- **Unity Technologies** - Game engine
- **Firebase** - Backend services
- **React Team** - Frontend framework

---

## 📞 **Support**

For support and questions:

- 📧 Email: [support@line-crypto.com](mailto:support@line-crypto.com)
- 💬 Discord: [Line Crypto Community](https://discord.gg/line-crypto)
- 📱 Telegram: [@LineCrypto](https://t.me/LineCrypto)
- 🐛 Issues: [GitHub Issues](https://github.com/line-crypto/issues)

---

**Built with ❤️ by the Line Crypto Team**

_Making Web3 as smooth as Web2, one game at a time._ 🚀
