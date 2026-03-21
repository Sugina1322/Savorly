import { StyleSheet, Text, View } from 'react-native';

type BrandMarkProps = {
  size?: number;
};

export function BrandMark({ size = 132 }: BrandMarkProps) {
  const shellRadius = Math.round(size * 0.3);
  const coreSize = Math.round(size * 0.73);
  const coreRadius = Math.round(shellRadius * 0.75);
  const textSize = Math.round(size * 0.36);

  return (
    <View
      style={[
        styles.logoShell,
        {
          width: size,
          height: size,
          borderRadius: shellRadius,
        },
      ]}>
      <View
        style={[
          styles.logoCore,
          {
            width: coreSize,
            height: coreSize,
            borderRadius: coreRadius,
          },
        ]}>
        <Text style={[styles.logoText, { fontSize: textSize }]}>S</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  logoShell: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5DCC8',
    borderWidth: 1,
    borderColor: '#EBCBB5',
    transform: [{ rotate: '-8deg' }],
  },
  logoCore: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C7512D',
  },
  logoText: {
    color: '#FFF8F2',
    fontWeight: '900',
  },
});
