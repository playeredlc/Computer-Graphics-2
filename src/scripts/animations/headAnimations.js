var animation = {
 
  ... animation,
  
  head: {
    extensionFlexion: () => {
      const lowerBound = 0;
      const upperBound = 1.8;
      const stepSize = 0.02;
      
      animation.move(
        lowerBound,
        upperBound,
        stepSize,
        headSettings,
        'extFlexAmount',
        headSettings.extFlexHead,
      );
  
    },
  },
};
