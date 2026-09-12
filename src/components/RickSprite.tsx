import styles from './RickSprite.module.css';

interface Props {
  /** Rendered box size in CSS pixels (the source sprite is 56x56). */
  size?: number;
  label?: string;
  idle?: boolean;
}

// Vendored Gen 1 Bug Catcher trainer sprite (Red/Green, Game Boy monochrome). See README "Credits".
const SPRITE_URL = `${import.meta.env.BASE_URL}sprites/bug-catcher-rg.png`;

export function RickSprite({ size = 96, label = 'Bug Catcher Rick sprite', idle = true }: Props) {
  const className = [styles.sprite, idle ? styles.idle : ''].filter(Boolean).join(' ');
  return (
    <img
      src={SPRITE_URL}
      className={className}
      width={size}
      height={size}
      alt={label}
      draggable={false}
      data-testid="rick-sprite"
    />
  );
}
