// // src/navigators/AuthGate.js
// import React from 'react';
// import { useSelector } from 'react-redux';
// import { AuthNavigator } from './AuthNavigator';
// import { SellerMainNavigator } from './seller/SellerMainNavigator';
// import { BuyerMainNavigator } from './buyer/BuyerMainNavigator';
// import { selectAuthToken, selectUserType, UserType } from '../store/user';

// export const AuthGate = () => {
//   const authToken = useSelector(selectAuthToken);
//   const userType = useSelector(selectUserType);

//   if (!authToken) return <AuthNavigator />;
//   if (userType === UserType.SELLER) return <SellerMainNavigator />;
//   if (userType === UserType.BUYER) return <BuyerMainNavigator />;
//   return <AuthNavigator />;
// };