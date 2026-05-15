import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

export interface SocialVideoProps {
  title: string;
  body: string;
  productName: string;
  platform: string;
}

const BRAND = '#10b981';
const BRAND_DIM = 'rgba(16,185,129,0.15)';
const BRAND_BORDER = 'rgba(16,185,129,0.3)';

export const SocialVideoComposition: React.FC<SocialVideoProps> = ({
  title,
  body,
  productName,
  platform,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const ease = Easing.bezier(0.16, 1, 0.3, 1);

  // Badge: fade in 0→0.5s
  const badgeOpacity = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });

  // Title: slide up + fade in 0.3→1s
  const titleOpacity = interpolate(frame, [fps * 0.3, fps * 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });
  const titleY = interpolate(frame, [fps * 0.3, fps * 1], [50, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });

  // Body: fade in 1→2s
  const bodyOpacity = interpolate(frame, [fps * 1, fps * 2], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });
  const bodyY = interpolate(frame, [fps * 1, fps * 2], [30, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });

  // Bottom product: fade in 2→2.5s
  const bottomOpacity = interpolate(frame, [fps * 2, fps * 2.5], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Accent line grows from left: 0→0.8s
  const lineWidth = interpolate(frame, [0, fps * 0.8], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });

  // Show only the hook — first 220 chars of body
  const displayBody = body.length > 220 ? body.slice(0, 217).trimEnd() + '…' : body;

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(145deg, #0a1628 0%, #0f172a 50%, #071a14 100%)',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      {/* Top accent bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: 8,
          width: `${lineWidth}%`,
          backgroundColor: BRAND,
          borderRadius: '0 4px 4px 0',
        }}
      />

      {/* Main content */}
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px 72px',
          gap: 40,
        }}
      >
        {/* Platform badge */}
        <div
          style={{
            opacity: badgeOpacity,
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: BRAND_DIM,
            border: `2px solid ${BRAND_BORDER}`,
            borderRadius: 100,
            padding: '10px 28px',
            width: 'fit-content',
          }}
        >
          <span
            style={{
              color: BRAND,
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: 3,
              textTransform: 'uppercase',
            }}
          >
            {platform}
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            fontSize: 78,
            fontWeight: 800,
            color: '#ffffff',
            lineHeight: 1.15,
            letterSpacing: -1,
          }}
        >
          {title}
        </div>

        {/* Divider */}
        <div
          style={{
            opacity: bodyOpacity,
            height: 2,
            width: 80,
            backgroundColor: BRAND,
            borderRadius: 2,
          }}
        />

        {/* Body preview */}
        <div
          style={{
            opacity: bodyOpacity,
            transform: `translateY(${bodyY}px)`,
            fontSize: 40,
            color: '#94a3b8',
            lineHeight: 1.65,
            whiteSpace: 'pre-line',
          }}
        >
          {displayBody}
        </div>
      </AbsoluteFill>

      {/* Bottom product name */}
      <div
        style={{
          position: 'absolute',
          bottom: 60,
          left: 72,
          right: 72,
          opacity: bottomOpacity,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            backgroundColor: BRAND,
            flexShrink: 0,
          }}
        />
        <span style={{ color: '#475569', fontSize: 30, letterSpacing: 1 }}>
          {productName}
        </span>
      </div>
    </AbsoluteFill>
  );
};
