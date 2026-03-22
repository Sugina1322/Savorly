import { PropsWithChildren } from 'react';
import { ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

type ResponsiveScrollScreenProps = PropsWithChildren<{
  backgroundColor?: string;
  contentStyle?: StyleProp<ViewStyle>;
  contentWrapStyle?: StyleProp<ViewStyle>;
}>;

export function ResponsiveScrollScreen({
  children,
  backgroundColor = '#FFF8F2',
  contentStyle,
  contentWrapStyle,
}: ResponsiveScrollScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Math.max(insets.top, 10) + 10,
            paddingBottom: Math.max(insets.bottom, 16) + 20,
          },
          contentStyle,
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.contentWrap, contentWrapStyle]}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 18,
  },
  contentWrap: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
  },
});
