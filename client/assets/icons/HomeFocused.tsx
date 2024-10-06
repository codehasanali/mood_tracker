import React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

const HomeFocused: React.FC<SvgProps> = (props) => {
  return (
    <Svg width="28" height="28" viewBox="0 0 24 24" fill="none" {...props}>
      <Path 
        d="M20.75 9C20.75 8.58579 20.4142 8.25 20 8.25C19.5858 8.25 19.25 8.58579 19.25 9H20.75ZM4.75 9C4.75 8.58579 4.41421 8.25 4 8.25C3.58579 8.25 3.25 8.58579 3.25 9H4.75ZM9 21V21.75H9.00007L9 21ZM4.87868 20.1213L4.34835 20.6517L4.34835 20.6517L4.87868 20.1213ZM19.1213 20.1213L19.6517 20.6517L19.6517 20.6517L19.1213 20.1213ZM15 21L14.9999 21.75H15V21ZM14.75 21H14C14 21.4142 14.3357 21.75 14.7499 21.75L14.75 21ZM9.25 21L9.25007 21.75C9.66426 21.75 10 21.4142 10 21H9.25ZM19.25 9V15H20.75V9H19.25ZM4.75 15V9H3.25V15H4.75ZM9 20.25C8.06683 20.25 7.32132 20.2481 6.70021 20.1495C6.09454 20.0533 5.69487 19.8769 5.40901 19.591L4.34835 20.6517C4.94117 21.2445 5.68716 21.5074 6.46498 21.6309C7.22736 21.752 8.10317 21.75 9 21.75V20.25ZM3.25 15C3.25 16.393 3.24841 17.5132 3.36652 18.3918C3.48754 19.2919 3.74643 20.0498 4.34835 20.6517L5.40901 19.591C5.13225 19.3143 4.9518 18.9257 4.85315 18.1919C4.75159 17.4366 4.75 16.4354 4.75 15H3.25ZM19.25 15C19.25 16.4354 19.2484 17.4366 19.1469 18.1919C19.0482 18.9257 18.8678 19.3143 18.591 19.591L19.6517 20.6517C20.2536 20.0498 20.5125 19.2919 20.6335 18.3918C20.7516 17.5132 20.75 16.393 20.75 15H19.25ZM15 21.75C15.8968 21.75 16.7726 21.752 17.535 21.6309C18.3128 21.5074 19.0588 21.2445 19.6517 20.6517L18.591 19.591C18.3051 19.8769 17.9055 20.0533 17.2998 20.1495C16.6787 20.2481 15.9332 20.25 15 20.25V21.75ZM14 16.25V21H15.5V16.25H14ZM10 21V16.25H8.5V21H10ZM12 14.25C13.1046 14.25 14 15.1454 14 16.25H15.5C15.5 14.317 13.933 12.75 12 12.75V14.25ZM12 12.75C10.067 12.75 8.5 14.317 8.5 16.25H10C10 15.1454 10.8954 14.25 12 14.25V12.75ZM9.24993 20.25L8.99993 20.25L9.00007 21.75L9.25007 21.75L9.24993 20.25ZM14.7499 21.75L14.9999 21.75L15.0001 20.25L14.7501 20.25L14.7499 21.75Z" 
        fill="white"
      />
      <Path 
        d="M2 10.009L8.30419 5.07963C10.079 3.69191 10.9664 2.99805 12 2.99805C13.0336 2.99805 13.921 3.69191 15.6958 5.07964L22 10.009" 
        stroke="white" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default HomeFocused;