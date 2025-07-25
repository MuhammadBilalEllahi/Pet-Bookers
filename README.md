# PetBookie

PetBookie is a cross-platform mobile application built with React Native, designed to connect pet buyers and sellers. The app features a modern UI, multi-language support (English & Urdu), robust state management, and a modular architecture for scalability and maintainability.

## Features

- **User Authentication**: Secure login and registration flows.
- **Buyer & Seller Modes**: Distinct navigation and features for buyers and sellers.
- **Product Listings**: Browse, post, and manage pet-related ads and products.
- **Cart & Checkout**: Add items to cart, manage addresses, and complete purchases.
- **Chat**: In-app messaging between buyers and sellers.
- **Wishlist**: Save favorite products for later.
- **Order Management**: Track orders, refunds, and delivery status.
- **Lucky Draws**: Participate in special events and promotions.
- **Notifications**: Stay updated with real-time alerts.
- **Multi-language**: English and Urdu support with RTL layout for Urdu.
- **Custom Theming**: Light/dark mode and brand color customization.

## Tech Stack

- **React Native** (0.70.6)
- **Redux Toolkit** for state management
- **React Navigation** for navigation
- **UI Kitten** for UI components and theming
- **i18next** for localization
- **Axios** for API requests
- **Jest** for testing

## Getting Started

### Prerequisites
- Node.js >= 14.x
- Yarn or npm
- Android Studio / Xcode (for running on devices/emulators)

### Installation

1. Clone the repository:
   ```sh
   git clone <repo-url>
   cd petbookie-main/petbookie-main
   ```
2. Install dependencies:
   ```sh
   npm install
   # or
   yarn install
   ```
3. Run Metro bundler:
   ```sh
   npm start
   # or
   yarn start
   ```
4. Run on Android:
   ```sh
   npm run android
   # or
   yarn android
   ```
   Run on iOS:
   ```sh
   npm run ios
   # or
   yarn ios
   ```

## Folder Structure

```
petbookie-main/
├── App.js                # App entry point
├── custom-theme.js       # Custom theme configuration
├── package.json          # Project metadata and dependencies
├── src/
│   ├── components/       # Reusable UI components
│   ├── locale/           # Localization files (en, ur)
│   ├── navigators/       # Navigation stacks and flows
│   ├── screens/          # App screens (auth, buyer, seller, etc.)
│   ├── services/         # API clients and service logic
│   ├── store/            # Redux store and slices
│   ├── theme/            # Theme context and definitions
│   └── utils/            # Utility functions
├── assets/               # Images, fonts, and static assets
├── android/              # Android native project
├── ios/                  # iOS native project
└── ...
```

## Theming
- Uses [UI Kitten](https://akveo.github.io/react-native-ui-kitten/) for customizable themes.
- Supports light and dark modes.
- Brand colors and font families are defined in `custom-theme.js` and `src/theme/`.
- Urdu font: `NotoNaskhArabic-Regular` (see `assets/fonts/`).

## Localization
- Powered by [i18next](https://www.i18next.com/) and `react-i18next`.
- English (`en`) and Urdu (`ur`) translations in `src/locale/`.
- RTL layout is automatically enabled for Urdu.
- Language preference is stored in async storage and auto-detected.

## State Management
- Centralized Redux store (`src/store/`).
- Slices for user, configs, chat, wishlist, notifications, etc.
- Async thunks for API calls and config loading.

## License

This project is licensed. See the LICENSE file for details.
