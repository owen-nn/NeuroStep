export type ColorSet = {
  bg:            string;
  surface:       string;
  surfaceRaised: string;
  border:        string;
  separator:     string;
  textPrimary:   string;
  textSecondary: string;
  textMuted:     string;
  sage:          string;
  amber:         string;
  yellow:        string;
  clay:          string;
  lavender:      string;
  teal:          string;
};

export const DARK: ColorSet = {
  bg:            '#0B1120',
  surface:       '#131C2E',
  surfaceRaised: '#1A2640',
  border:        '#1E3050',
  separator:     '#162038',
  textPrimary:   '#E2EAFA',
  textSecondary: '#6E9BC4',
  textMuted:     '#3A5878',
  sage:          '#4A90E2',
  amber:         '#F5A63B',
  yellow:        '#EBC84A',
  clay:          '#E05252',
  lavender:      '#9080D0',
  teal:          '#3AAEAA',
};

export const LIGHT: ColorSet = {
  bg:            '#EFF3FC',
  surface:       '#FFFFFF',
  surfaceRaised: '#F2F6FF',
  border:        '#C4D0E8',
  separator:     '#DAE2F2',
  textPrimary:   '#080F1E',
  textSecondary: '#284070',
  textMuted:     '#6888A8',
  sage:          '#1850B0',
  amber:         '#A05000',
  yellow:        '#857000',
  clay:          '#C01E1E',
  lavender:      '#4C38A0',
  teal:          '#107474',
};

export function batteryColor(pct: number, colors: ColorSet): string {
  if (pct > 50) return colors.sage;
  if (pct > 20) return colors.yellow;
  return colors.clay;
}

// Legacy export — components still importing C directly get dark theme
export const C = DARK;
