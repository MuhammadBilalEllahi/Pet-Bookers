import React, { useState } from 'react';
import { BuyerProfileScreen } from '../buyer/BuyerProfileScreen';
import { SellerProfileScreen } from '../seller/profile/SellerProfileScreen';
import { AuthRestrictedError } from '../../components/auth/AuthRestrictedError';
import { useSelector } from 'react-redux';
import { 
  selectIsBuyerAuthenticated, 
  selectIsSellerAuthenticated 
} from '../../store/user';

export const UnifiedProfileScreen = ({ navigation }) => {
  // Determine initial profile type based on authentication
  const isBuyerAuthenticated = useSelector(selectIsBuyerAuthenticated);
  const isSellerAuthenticated = useSelector(selectIsSellerAuthenticated);
  
  // Default to buyer if both are authenticated, otherwise show the authenticated one
  const getInitialProfileType = () => {
    if (isBuyerAuthenticated && isSellerAuthenticated) {
      return 'buyer'; // Default to buyer when both are available
    } else if (isBuyerAuthenticated) {
      return 'buyer';
    } else if (isSellerAuthenticated) {
      return 'seller';
    }
    return 'buyer'; // Fallback
  };

  const [currentProfileType, setCurrentProfileType] = useState(getInitialProfileType());

  // Update profile type when authentication state changes
  React.useEffect(() => {
    const newProfileType = getInitialProfileType();
    setCurrentProfileType(newProfileType);
  }, [isBuyerAuthenticated, isSellerAuthenticated]);

  const handleProfileSwitch = (newProfileType) => {
    setCurrentProfileType(newProfileType);
  };

  // If neither account is authenticated, show auth screen
  if (!isBuyerAuthenticated && !isSellerAuthenticated) {
    return <AuthRestrictedError 
      subTitle="messages.loginRequired"
    />;
  }

  // Clone the screen component and add our profile switching logic
  if (currentProfileType === 'seller') {
    return <SellerProfileScreen 
      navigation={navigation} 
      onProfileSwitch={handleProfileSwitch}
      currentProfileType={currentProfileType}
    />;
  } else {
    return <BuyerProfileScreen 
      navigation={navigation} 
      onProfileSwitch={handleProfileSwitch}
      currentProfileType={currentProfileType}
    />;
  }
};
