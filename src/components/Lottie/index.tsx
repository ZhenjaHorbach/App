import React from 'react';
import type BaseLottieProps from './types';
import BaseLottie from './BaseLottie';

function Lottie({...rest}: Omit<BaseLottieProps, 'shouldLoadAfterInteractions'>) {
    return (
        <BaseLottie
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
        />
    );
}

Lottie.displayName = 'Lottie';
export default Lottie;
