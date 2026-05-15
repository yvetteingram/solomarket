import React from 'react';
import { Player } from '@remotion/player';
import { SocialVideoComposition, SocialVideoProps } from './SocialVideoComposition';

interface Props extends SocialVideoProps {}

const DIMS: Record<string, { w: number; h: number }> = {
  'TikTok':          { w: 1080, h: 1920 },
  'Instagram Reel':  { w: 1080, h: 1920 },
  'YouTube Short':   { w: 1080, h: 1920 },
  'YouTube':         { w: 1920, h: 1080 },
};

const DISPLAY = {
  portrait:  { width: 220, height: 391 },
  landscape: { width: 400, height: 225 },
};

export const SocialVideoPlayer: React.FC<Props> = ({ title, body, productName, platform }) => {
  const dims = DIMS[platform] ?? { w: 1080, h: 1920 };
  const isPortrait = dims.h > dims.w;
  const display = isPortrait ? DISPLAY.portrait : DISPLAY.landscape;

  return (
    <div style={{ flexShrink: 0 }}>
      <Player
        component={SocialVideoComposition}
        compositionWidth={dims.w}
        compositionHeight={dims.h}
        fps={30}
        durationInFrames={180}
        controls
        loop
        style={{
          width: display.width,
          height: display.height,
          borderRadius: 12,
          overflow: 'hidden',
        }}
        inputProps={{ title, body, productName, platform }}
      />
    </div>
  );
};
