import React from 'react';

type Props = {
  emotion: 'feliz' | 'confundida' | 'pensativa';
};

export const Lumi: React.FC<Props> = ({ emotion }) => {
  return (
    <img
      src={`/assets/lumi-${emotion}.png`}
      alt={`Lumi ${emotion}`}
      className="lumi"
    />
  );
};
